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
                    role: 'admin',
                    firstName: 'System',
                    lastName: 'Administrator'
                },
                {
                    username: 'ngo1',
                    password: 'ngo123',
                    email: 'ngo@civisafe.com',
                    role: 'ngo',
                    firstName: 'NGO',
                    lastName: 'Representative'
                },
                {
                    username: 'police',
                    password: 'police123',
                    email: 'police@civisafe.com',
                    role: 'police',
                    firstName: 'Police',
                    lastName: 'Officer'
                },
                {
                    username: 'citizen',
                    password: 'citizen123',
                    email: 'citizen@civisafe.com',
                    role: 'user',
                    firstName: 'Citizen',
                    lastName: 'User'
                },
                {
                    username: 'student',
                    password: 'student123',
                    email: 'student@civisafe.com',
                    role: 'student',
                    firstName: 'Student',
                    lastName: 'User'
                }
            ];

            for (const userData of defaultUsers) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                await User.create({
                    ...userData,
                    password: hashedPassword
                });
            }
            console.log('✅ Default users created in MongoDB');
        }
    } catch (error) {
        console.error('Error creating default users:', error);
    }
}

// Initialize default users
initializeDefaultUsers();

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

// Load users from JSON file
function loadUsers() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'database', 'users.json'), 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

// Save users to JSON file
function saveUsers(users) {
    try {
        const data = { users };
        fs.writeFileSync(path.join(__dirname, 'database', 'users.json'), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// Load complaints from JSON file
const complaintsFile = path.join(__dirname, 'database', 'complaints.json');

function loadComplaints() {
    try {
        if (!fs.existsSync(complaintsFile)) return [];
        const data = fs.readFileSync(complaintsFile, 'utf8');
        return JSON.parse(data).complaints || [];
    } catch (error) {
        console.error('Error loading complaints:', error);
        return [];
    }
}

function saveComplaints(complaints) {
    try {
        fs.writeFileSync(complaintsFile, JSON.stringify({ complaints }, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving complaints:', error);
        return false;
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
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
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
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName
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
        const { username, password, email, role, firstName, lastName, phone } = req.body;
        
        if (!username || !password || !email || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username, password, email, and role are required' 
            });
        }
        
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
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
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            role,
            firstName,
            lastName,
            phone
        });
        
        res.json({
            success: true,
            message: 'User registered successfully',
            user: newUser.getPublicProfile()
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/complaints (user submits complaint with file upload)
app.post('/api/complaints', upload.array('files', 5), async (req, res) => {
    // Check for user authentication
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    
    const token = auth.split(' ')[1];
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
    
    const { category, description, location, priority, latitude, longitude, date } = req.body;
    
    if (!category || !description) {
        return res.status(400).json({ 
            success: false, 
            message: 'Category and description are required' 
        });
    }
    
    try {
        const files = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size
        })) : [];
        
        // Keyword-based routing logic
        const descriptionLower = description.toLowerCase();
        let autoRoute = 'general';
        
        if (descriptionLower.includes('ragging') || descriptionLower.includes('hazing')) {
            autoRoute = 'college_admin';
        } else if (descriptionLower.includes('harassment') || descriptionLower.includes('stalking')) {
            autoRoute = 'ngo';
        } else if (descriptionLower.includes('cyberbullying') || descriptionLower.includes('online harassment')) {
            autoRoute = 'legal';
        } else if (descriptionLower.includes('assault') || descriptionLower.includes('violence')) {
            autoRoute = 'police';
        } else if (descriptionLower.includes('discrimination') || descriptionLower.includes('bias')) {
            autoRoute = 'hr';
        }
        
        // Generate tracking token
        const trackingToken = 'CIVI-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Create new complaint in MongoDB
        const newComplaint = await Complaint.create({
            userId: decoded.userId,
            category,
            description,
            location: location || '',
            date: date || null,
            priority: priority || 'medium',
            status: 'pending',
            files,
            latitude: latitude || null,
            longitude: longitude || null,
            autoRoute,
            trackingToken
        });
        
        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            trackingToken: newComplaint.trackingToken,
            autoRoute: newComplaint.autoRoute
        });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving complaint'
        });
    }
});

// GET /api/complaints (admin reviews complaints)
app.get('/api/complaints', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'admin') {
            // Admin can see all complaints
            const complaints = await Complaint.find().populate('userId', 'username firstName lastName');
            res.json({ 
                success: true, 
                complaints: complaints.map(complaint => ({
                    _id: complaint._id,
                    userId: complaint.userId && complaint.userId._id ? complaint.userId._id : null,
                    username: complaint.userId && complaint.userId.username ? complaint.userId.username : 'Anonymous User',
                    category: complaint.category,
                    description: complaint.description,
                    location: complaint.location,
                    date: complaint.date,
                    priority: complaint.priority || 'medium',
                    status: complaint.status,
                    files: complaint.files || [],
                    trackingToken: complaint.trackingToken,
                    messages: complaint.messages || [],
                    adminNotes: complaint.adminNotes || '',
                    createdAt: complaint.createdAt,
                    updatedAt: complaint.updatedAt
                }))
            });
        } else {
            // Regular users can only see their own complaints
            const userComplaints = await Complaint.find({ userId: decoded.userId });
            res.json({ 
                success: true, 
                complaints: userComplaints.map(complaint => ({
                    _id: complaint._id,
                    category: complaint.category,
                    description: complaint.description,
                    location: complaint.location,
                    date: complaint.date,
                    priority: complaint.priority || 'medium',
                    status: complaint.status,
                    files: complaint.files || [],
                    latitude: complaint.latitude,
                    longitude: complaint.longitude,
                    autoRoute: complaint.autoRoute,
                    trackingToken: complaint.trackingToken,
                    assignedTo: complaint.assignedTo,
                    messages: complaint.messages || [],
                    createdAt: complaint.createdAt,
                    updatedAt: complaint.updatedAt
                }))
            });
        }
    } catch (error) {
        console.error('Error fetching complaints:', error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ success: false, message: 'Invalid token' });
        } else {
            res.status(500).json({ success: false, message: 'Error fetching complaints' });
        }
    }
});

// Update complaint status (admin only)
app.put('/api/complaints/:id/status', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const { id } = req.params;
        const { status, adminNotes, message, priority } = req.body;
        
        const update = {
            status, 
            adminNotes,
            priority,
            updatedAt: new Date()
        };
        
        let complaint;
        if (message && message.trim()) {
            complaint = await Complaint.findByIdAndUpdate(
                id,
                {
                    $set: update,
                    $push: {
                        messages: {
                            text: message,
                            sentBy: 'admin',
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );
        } else {
            complaint = await Complaint.findByIdAndUpdate(
                id,
                update,
                { new: true }
            );
        }
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ success: false, message: 'Error updating complaint' });
    }
});

// Track complaint by token
app.get('/api/complaints/track/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const complaint = await Complaint.findOne({ trackingToken: token });
        
        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }
        
        res.json({
            success: true,
            complaint: {
                id: complaint._id,
                category: complaint.category,
                description: complaint.description,
                location: complaint.location,
                date: complaint.date,
                status: complaint.status,
                files: complaint.files,
                createdAt: complaint.createdAt,
                updatedAt: complaint.updatedAt,
                adminNotes: complaint.adminNotes,
                messages: complaint.messages
            }
        });
    } catch (error) {
        console.error('Error tracking complaint:', error);
        res.status(500).json({ success: false, message: 'Error tracking complaint' });
    }
});

// Get complaint statistics
app.get('/api/stats', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const token = auth.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: 'pending' });
        const inProgress = await Complaint.countDocuments({ status: 'in-progress' });
        const resolved = await Complaint.countDocuments({ status: 'resolved' });
        const rejected = await Complaint.countDocuments({ status: 'rejected' });
        
        // Get category statistics
        const categoryStats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const byCategory = {};
        categoryStats.forEach(stat => {
            byCategory[stat._id] = stat.count;
        });
        
        const stats = {
            total,
            pending,
            inProgress,
            resolved,
            rejected,
            byCategory
        };
        
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Error fetching statistics' });
    }
});

// Verify token endpoint
app.post('/api/verify-token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token is required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Support contact endpoint
app.post('/api/support/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    
    if (!subject || !message) {
        return res.status(400).json({ 
            success: false, 
            message: 'Subject and message are required' 
        });
    }
    
    const supportFile = path.join(__dirname, 'database', 'support_messages.json');
    let messages = [];
    
    try {
        if (fs.existsSync(supportFile)) {
            const data = fs.readFileSync(supportFile, 'utf8');
            messages = JSON.parse(data).messages || [];
        }
    } catch (error) {
        console.error('Error loading support messages:', error);
    }
    
    const newMessage = {
        id: messages.length + 1,
        name: name || 'Anonymous',
        email: email || '',
        phone: phone || '',
        subject,
        message,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    messages.push(newMessage);
    
    try {
        fs.writeFileSync(supportFile, JSON.stringify({ messages }, null, 2));
        res.json({
            success: true,
            message: 'Support message sent successfully'
        });
    } catch (error) {
        console.error('Error saving support message:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving message'
        });
    }
});

// Get helpline directory
app.get('/api/helplines', (req, res) => {
    const helplines = [
        {
            id: 1,
            category: "Women's Safety",
            name: "Women Helpline",
            number: "1091",
            description: "24/7 women's safety helpline",
            region: "All India"
        },
        {
            id: 2,
            category: "Child Protection",
            name: "Child Helpline",
            number: "1098",
            description: "Child protection services",
            region: "All India"
        },
        {
            id: 3,
            category: "Police Emergency",
            name: "Police Emergency",
            number: "100",
            description: "Immediate police assistance",
            region: "All India"
        },
        {
            id: 4,
            category: "Cyber Crime",
            name: "Cyber Crime Helpline",
            number: "1930",
            description: "Report cyber crimes and fraud",
            region: "All India"
        },
        {
            id: 5,
            category: "Mental Health",
            name: "Mental Health Helpline",
            number: "1800-599-0019",
            description: "24/7 mental health support",
            region: "All India"
        },
        {
            id: 6,
            category: "Domestic Violence",
            name: "Domestic Violence Helpline",
            number: "181",
            description: "Domestic violence support",
            region: "All India"
        }
    ];
    
    res.json({
        success: true,
        helplines
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📊 MongoDB Integration: ✅ Active');
    console.log('🔐 Authentication: ✅ JWT-based');
    console.log('📝 User Registration: ✅ MongoDB Storage');
    console.log('\n👥 Available test users:');
    console.log('- admin/admin123 (admin role)');
    console.log('- ngo1/ngo123 (ngo role)');
    console.log('- police/police123 (police role)');
    console.log('- citizen/citizen123 (user role)');
    console.log('- student/student123 (student role)');
    console.log('\n🌐 Frontend: http://localhost:3005');
    console.log('📚 API Documentation: Available at /api endpoints');
}); 