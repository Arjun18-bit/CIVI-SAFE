const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Use MongoDB Atlas connection string or local MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civisafe';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB connected successfully');
        
        // Create indexes for better performance
        const User = require('../models/User');
        const Complaint = require('../models/Complaint');
        
        await User.createIndexes();
        await Complaint.createIndexes();
        
        console.log('✅ Database indexes created');
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB; 