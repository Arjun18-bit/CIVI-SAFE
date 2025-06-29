const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

// Import MongoDB models
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'civisafe-secret-key-2024';

// Connect to MongoDB
connectDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image, PDF and document files are allowed!'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Generate tracking token
function generateTrackingToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'CIVI-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Initialize default users if they don't exist
async function initializeDefaultUsers() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const defaultUsers = [
                {
                    username: 'admin',
                    password: 'admin123',
                    email: 'admin@civisafe.com',
                    role: 'admin'
                },
                {
                    username: 'ngo1',
                    password: 'ngo123',
                    email: 'ngo@civisafe.com',
                    role: 'ngo'
                },
                {
                    username: 'police',
                    password: 'police123',
                    email: 'police@civisafe.com',
                    role: 'police'
                }
            ];

            for (const userData of defaultUsers) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword
                });
            }
            console.log('✅ Default users created');
        }
    } catch (error) {
        console.error('Error creating default users:', error);
    }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }
        
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                role: user.role 
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, email, role } = req.body;
        
        if (!username || !password || !email || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            role
        });
        
        res.json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/complaints (user submits complaint with file upload)
app.post('/api/complaints', upload.array('files', 5), async (req, res) => {
    try {
        const { category, description, location, priority, latitude, longitude } = req.body;
        
        if (!category || !description) {
            return res.status(400).json({ 
                success: false, 
                message: 'Category and description are required' 
            });
        }
        
        // Generate tracking token
        let trackingToken;
        let isUnique = false;
        while (!isUnique) {
            trackingToken = generateTrackingToken();
            const existingComplaint = await Complaint.findOne({ trackingToken });
            if (!existingComplaint) {
                isUnique = true;
            }
        }
        
        // Process uploaded files
        const files = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size
        })) : [];
        
        // Determine auto-route based on category
        let autoRoute = 'general';
        if (['harassment', 'safety'].includes(category)) {
            autoRoute = 'police';
        } else if (['discrimination', 'bullying'].includes(category)) {
            autoRoute = 'ngo';
        }
        
        // Create complaint
        const complaint = await Complaint.create({
            category,
            description,
            location: location || 'Not specified',
            priority: priority || 'medium',
            files,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            autoRoute,
            trackingToken
        });
        
        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            trackingToken: complaint.trackingToken
        });
    } catch (error) {
        console.error('Complaint submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting complaint'
        });
    }
});

// GET /api/complaints (admin gets all complaints)
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .sort({ createdAt: -1 })
            .populate('assignedTo', 'username role');
        
        res.json({
            success: true,
            complaints: complaints.map(complaint => ({
                id: complaint._id,
                category: complaint.category,
                description: complaint.description,
                location: complaint.location,
                priority: complaint.priority,
                status: complaint.status,
                files: complaint.files,
                latitude: complaint.latitude,
                longitude: complaint.longitude,
                autoRoute: complaint.autoRoute,
                trackingToken: complaint.trackingToken,
                assignedTo: complaint.assignedTo,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints'
        });
    }
});

// GET /api/stats (admin gets statistics)
app.get('/api/stats', async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
        const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
        
        res.json({
            success: true,
            stats: {
                total: totalComplaints,
                pending: pendingComplaints,
                resolved: resolvedComplaints,
                inProgress: inProgressComplaints
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// GET /api/complaints/stats (for landing page)
app.get('/api/complaints/stats', async (req, res) => {
    try {
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
        
        res.json({
            success: true,
            stats: {
                total: totalComplaints,
                pending: pendingComplaints,
                resolved: resolvedComplaints,
                avgResponseTime: '24h',
                satisfactionRate: '98%'
            }
        });
    } catch (error) {
        console.error('Complaints stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// GET /api/complaints/heatmap (get location data for heatmap)
app.get('/api/complaints/heatmap', async (req, res) => {
    try {
        const complaints = await Complaint.find({
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        }).select('latitude longitude category status');
        
        const locations = complaints.map(complaint => ({
            lat: complaint.latitude,
            lng: complaint.longitude,
            category: complaint.category,
            status: complaint.status
        }));
        
        res.json({
            success: true,
            locations
        });
    } catch (error) {
        console.error('Heatmap error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching heatmap data'
        });
    }
});

// GET /api/complaints/flagged (get flagged complaints)
app.get('/api/complaints/flagged', async (req, res) => {
    try {
        // In a real implementation, you would have a flagCount field
        // For now, we'll simulate flagged complaints
        const complaints = await Complaint.find().limit(5);
        
        const flaggedComplaints = complaints.map(complaint => ({
            _id: complaint._id,
            trackingToken: complaint.trackingToken,
            category: complaint.category,
            description: complaint.description,
            flagCount: Math.floor(Math.random() * 3) + 1, // Simulated flag count
            flagReason: ['Suspicious content', 'Multiple reports', 'Spam keywords'][Math.floor(Math.random() * 3)]
        }));
        
        res.json({
            success: true,
            complaints: flaggedComplaints
        });
    } catch (error) {
        console.error('Flagged complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching flagged complaints'
        });
    }
});

// GET /api/admin/analytics (get analytics data)
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const categoryStats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const total = await Complaint.countDocuments();
        
        res.json({
            success: true,
            categoryStats: {
                total,
                categories: categoryStats
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

// GET /api/admin/activity (get admin activity)
app.get('/api/admin/activity', async (req, res) => {
    try {
        // Simulated admin activity data
        const activities = [
            {
                admin: 'admin',
                action: 'Updated complaint status to resolved',
                timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                admin: 'ngo1',
                action: 'Responded to complaint chat',
                timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
            },
            {
                admin: 'police',
                action: 'Assigned complaint to investigation team',
                timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
            }
        ];
        
        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Admin activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin activity'
        });
    }
});

// GET /api/admin/active-chats (get active chats)
app.get('/api/admin/active-chats', async (req, res) => {
    try {
        // Simulated active chats data
        const chats = [
            {
                complaintId: '1',
                complaintToken: 'CIVI-ABC123',
                lastMessage: 'I need immediate assistance with this issue',
                unresponded: true
            },
            {
                complaintId: '2',
                complaintToken: 'CIVI-DEF456',
                lastMessage: 'Thank you for your response',
                unresponded: false
            }
        ];
        
        res.json({
            success: true,
            chats
        });
    } catch (error) {
        console.error('Active chats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching active chats'
        });
    }
});

// GET /api/admin/templates (get response templates)
app.get('/api/admin/templates', async (req, res) => {
    try {
        // Simulated templates data
        const templates = [
            {
                _id: '1',
                name: 'Initial Response',
                message: 'Thank you for submitting your complaint. We have received your report and are investigating the matter. We will keep you updated on the progress.',
                category: 'general'
            },
            {
                _id: '2',
                name: 'Investigation Update',
                message: 'We are actively investigating your complaint. Our team is working to gather all necessary information and will provide you with updates as soon as possible.',
                category: 'investigation'
            },
            {
                _id: '3',
                name: 'Resolution Notice',
                message: 'Your complaint has been resolved. We have taken appropriate action based on our investigation. Thank you for bringing this matter to our attention.',
                category: 'resolution'
            }
        ];
        
        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('Templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching templates'
        });
    }
});

// GET /api/resources (get educational resources)
app.get('/api/resources', async (req, res) => {
    try {
        const resources = [
            {
                id: '1',
                title: 'Emergency Response Guide',
                category: 'Safety',
                description: 'Comprehensive guide on how to respond to various emergency situations',
                language: 'English, Hindi, Tamil',
                icon: 'fa-exclamation-triangle'
            },
            {
                id: '2',
                title: 'Your Legal Rights',
                category: 'Legal',
                description: 'Essential information about your legal rights and protections',
                language: 'English, Hindi',
                icon: 'fa-balance-scale'
            }
        ];
        
        res.json({
            success: true,
            resources
        });
    } catch (error) {
        console.error('Resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources'
        });
    }
});

// PUT /api/complaints/:id/status (admin updates complaint status)
app.put('/api/complaints/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const complaint = await Complaint.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Status updated successfully',
            complaint
        });
    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating status'
        });
    }
});

// GET /api/complaints/track/:token (user tracks complaint)
app.get('/api/complaints/track/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const complaint = await Complaint.findOne({ trackingToken: token });
        
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        
        res.json({
            success: true,
            complaint: {
                id: complaint._id,
                category: complaint.category,
                description: complaint.description,
                location: complaint.location,
                priority: complaint.priority,
                status: complaint.status,
                files: complaint.files,
                autoRoute: complaint.autoRoute,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt
            }
        });
    } catch (error) {
        console.error('Track complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking complaint'
        });
    }
});

// GET /api/helplines
app.get('/api/helplines', (req, res) => {
    const helplines = [
        { name: 'National Commission for Women', number: '1091', description: 'Women helpline' },
        { name: 'Child Helpline', number: '1098', description: 'Child protection services' },
        { name: 'Police Emergency', number: '100', description: 'Emergency police assistance' },
        { name: 'Ambulance', number: '108', description: 'Emergency medical services' },
        { name: 'Domestic Violence Helpline', number: '181', description: 'Domestic violence support' }
    ];
    
    res.json({
        success: true,
        helplines
    });
});

// POST /api/support/contact
app.post('/api/support/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    
    // In a real application, you would send an email here
    console.log('Support contact:', { name, email, subject, message });
    
    res.json({
        success: true,
        message: 'Message sent successfully. We will get back to you soon.'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'CiviSafe server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
    // Initialize default users
    await initializeDefaultUsers();
    
    console.log('Available users for testing:');
    console.log('- admin/admin123 (admin role)');
    console.log('- ngo1/ngo123 (ngo role)');
    console.log('- police/police123 (police role)');
    console.log('\n📊 MongoDB connected successfully!');
}); 