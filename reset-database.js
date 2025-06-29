const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Complaint = require('./models/Complaint');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civisafe';

async function resetDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Complaint.deleteMany({});
        console.log('✅ Cleared existing data');

        // Create default users
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
        console.log('✅ Default users created');

        console.log('\n👥 Available test users:');
        console.log('- admin/admin123 (admin role)');
        console.log('- ngo1/ngo123 (ngo role)');
        console.log('- police/police123 (police role)');
        console.log('- citizen/citizen123 (user role)');
        console.log('- student/student123 (student role)');

        console.log('\n✅ Database reset completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase(); 