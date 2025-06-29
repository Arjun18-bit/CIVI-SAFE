const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import utilities and middleware
const logger = require('../utils/logger');
const { encrypt, generateTrackingToken, hashData } = require('../utils/encryption');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Validation schemas
const submitComplaintValidation = [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category is required'),
  body('description').isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('location').optional().isLength({ max: 255 }).withMessage('Location must be less than 255 characters'),
  body('incident_date').optional().isISO8601().withMessage('Invalid incident date format'),
  body('severity_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('contact_email').optional().isEmail().withMessage('Invalid email format'),
  body('contact_phone').optional().isMobilePhone().withMessage('Invalid phone number format'),
];

const trackComplaintValidation = [
  body('tracking_token').isLength({ min: 32, max: 64 }).withMessage('Invalid tracking token'),
];

// Submit a new complaint
router.post('/submit', upload.array('attachments', 5), submitComplaintValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      category_id,
      description,
      location,
      incident_date,
      severity_level = 'medium',
      contact_email,
      contact_phone
    } = req.body;

    // Generate tracking token
    const trackingToken = generateTrackingToken();

    // Encrypt the description
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptedDescription = encrypt(description, encryptionKey);
    const descriptionHash = hashData(description).hash;

    // Start database transaction
    const trx = await db.transaction();

    try {
      // Insert complaint
      const [complaint] = await trx('complaints').insert({
        tracking_token: trackingToken,
        category_id: parseInt(category_id),
        description_encrypted: encryptedDescription,
        description_hash: descriptionHash,
        location: location || null,
        incident_date: incident_date || null,
        severity_level,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        status: 'pending',
        priority: severity_level === 'critical' ? 'urgent' : 
                 severity_level === 'high' ? 'high' : 'normal'
      }).returning(['id', 'tracking_token', 'created_at']);

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        const filePromises = req.files.map(async (file) => {
          const fileHash = hashData(file.buffer.toString()).hash;
          const secureFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
          
          return trx('files').insert({
            complaint_id: complaint.id,
            original_name: file.originalname,
            secure_name: secureFileName,
            file_path: file.path,
            file_size: file.size,
            mime_type: file.mimetype,
            file_hash: fileHash,
            is_encrypted: true
          });
        });

        await Promise.all(filePromises);
      }

      // Log the complaint submission
      await trx('audit_logs').insert({
        action: 'complaint_submitted',
        table_name: 'complaints',
        record_id: complaint.id,
        new_values: {
          category_id,
          severity_level,
          has_attachments: req.files ? req.files.length > 0 : false,
          is_anonymous: !contact_email && !contact_phone
        }
      });

      await trx.commit();

      logger.logComplaint('submitted', complaint.id, {
        category_id,
        severity_level,
        has_attachments: req.files ? req.files.length : 0
      });

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        data: {
          tracking_token: complaint.tracking_token,
          complaint_id: complaint.id,
          submitted_at: complaint.created_at,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        }
      });

    } catch (error) {
      await trx.rollback();
      throw error;
    }

  } catch (error) {
    logger.logError(error, { action: 'submit_complaint' });
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Track complaint by token
router.post('/track', trackComplaintValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { tracking_token } = req.body;

    // Find complaint with category and status history
    const complaint = await db('complaints')
      .select(
        'complaints.*',
        'complaint_categories.name as category_name',
        'complaint_categories.color as category_color',
        'users.username as assigned_to_name'
      )
      .leftJoin('complaint_categories', 'complaints.category_id', 'complaint_categories.id')
      .leftJoin('users', 'complaints.assigned_to', 'users.id')
      .where('complaints.tracking_token', tracking_token)
      .where('complaints.is_deleted', false)
      .first();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or token is invalid'
      });
    }

    // Get status history
    const statusHistory = await db('complaint_status_history')
      .select('*')
      .where('complaint_id', complaint.id)
      .orderBy('created_at', 'desc');

    // Get recent chat messages (last 10)
    const chatMessages = await db('chat_messages')
      .select('id', 'sender_type', 'message_type', 'created_at', 'is_read')
      .where('complaint_id', complaint.id)
      .where('is_deleted', false)
      .orderBy('created_at', 'desc')
      .limit(10);

    // Get file count
    const fileCount = await db('files')
      .count('* as count')
      .where('complaint_id', complaint.id)
      .where('is_deleted', false)
      .first();

    // Prepare response data (without sensitive information)
    const responseData = {
      complaint_id: complaint.id,
      category: {
        name: complaint.category_name,
        color: complaint.category_color
      },
      status: complaint.status,
      priority: complaint.priority,
      severity_level: complaint.severity_level,
      location: complaint.location,
      incident_date: complaint.incident_date,
      assigned_to: complaint.assigned_to_name,
      estimated_resolution_date: complaint.estimated_resolution_date,
      created_at: complaint.created_at,
      updated_at: complaint.updated_at,
      expires_at: complaint.expires_at,
      status_history: statusHistory.map(h => ({
        old_status: h.old_status,
        new_status: h.new_status,
        changed_at: h.created_at,
        notes: h.notes
      })),
      chat_summary: {
        total_messages: chatMessages.length,
        unread_messages: chatMessages.filter(m => !m.is_read && m.sender_type !== 'user').length,
        last_message_at: chatMessages.length > 0 ? chatMessages[0].created_at : null
      },
      attachments: {
        count: parseInt(fileCount.count)
      }
    };

    logger.logComplaint('tracked', complaint.id, { tracking_token });

    res.json({
      success: true,
      message: 'Complaint found',
      data: responseData
    });

  } catch (error) {
    logger.logError(error, { action: 'track_complaint' });
    res.status(500).json({
      success: false,
      message: 'Failed to track complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get complaint categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db('complaint_categories')
      .select('id', 'name', 'description', 'icon', 'color')
      .where('is_active', true)
      .orderBy('name');

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    logger.logError(error, { action: 'get_categories' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get complaint statistics (public)
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.raw('SELECT * FROM complaint_stats');
    
    res.json({
      success: true,
      data: stats.rows[0]
    });

  } catch (error) {
    logger.logError(error, { action: 'get_stats' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Verify contact information (email/phone)
router.post('/verify-contact', [
  body('tracking_token').isLength({ min: 32, max: 64 }).withMessage('Invalid tracking token'),
  body('contact_type').isIn(['email', 'phone']).withMessage('Contact type must be email or phone'),
  body('otp').isLength({ min: 4, max: 10 }).withMessage('Invalid OTP format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { tracking_token, contact_type, otp } = req.body;

    const complaint = await db('complaints')
      .where('tracking_token', tracking_token)
      .where('is_deleted', false)
      .first();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if OTP is valid and not expired
    if (complaint.verification_otp !== otp || 
        new Date() > new Date(complaint.otp_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update verification status
    const updateField = contact_type === 'email' ? 'email_verified' : 'phone_verified';
    await db('complaints')
      .where('id', complaint.id)
      .update({
        [updateField]: true,
        verification_otp: null,
        otp_expires_at: null,
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: `${contact_type} verified successfully`
    });

  } catch (error) {
    logger.logError(error, { action: 'verify_contact' });
    res.status(500).json({
      success: false,
      message: 'Failed to verify contact',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Request contact verification OTP
router.post('/request-verification', [
  body('tracking_token').isLength({ min: 32, max: 64 }).withMessage('Invalid tracking token'),
  body('contact_type').isIn(['email', 'phone']).withMessage('Contact type must be email or phone')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { tracking_token, contact_type } = req.body;

    const complaint = await db('complaints')
      .where('tracking_token', tracking_token)
      .where('is_deleted', false)
      .first();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const contactField = contact_type === 'email' ? 'contact_email' : 'contact_phone';
    if (!complaint[contactField]) {
      return res.status(400).json({
        success: false,
        message: `No ${contact_type} associated with this complaint`
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db('complaints')
      .where('id', complaint.id)
      .update({
        verification_otp: otp,
        otp_expires_at: otpExpiresAt,
        updated_at: new Date()
      });

    // TODO: Send OTP via email/SMS
    // For now, just return the OTP in development
    if (process.env.NODE_ENV === 'development') {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        data: { otp } // Remove this in production
      });
    } else {
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    }

  } catch (error) {
    logger.logError(error, { action: 'request_verification' });
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 