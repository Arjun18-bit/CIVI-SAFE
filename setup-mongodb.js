#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 CiviSafe MongoDB Setup\n');

console.log('This script will help you set up MongoDB for CiviSafe.\n');

console.log('📋 Options:');
console.log('1. MongoDB Atlas (Cloud - Recommended)');
console.log('2. Local MongoDB Installation');
console.log('3. Skip setup (use existing configuration)\n');

rl.question('Choose an option (1-3): ', (choice) => {
    switch(choice) {
        case '1':
            setupMongoDBAtlas();
            break;
        case '2':
            setupLocalMongoDB();
            break;
        case '3':
            console.log('✅ Setup skipped. Using existing configuration.');
            rl.close();
            break;
        default:
            console.log('❌ Invalid choice. Please run the script again.');
            rl.close();
    }
});

function setupMongoDBAtlas() {
    console.log('\n🌐 MongoDB Atlas Setup\n');
    console.log('1. Go to https://www.mongodb.com/atlas');
    console.log('2. Create a free account');
    console.log('3. Create a new cluster (FREE tier)');
    console.log('4. Set up database access (create username/password)');
    console.log('5. Set up network access (Allow access from anywhere)');
    console.log('6. Get your connection string\n');
    
    rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
        if (connectionString && connectionString.includes('mongodb+srv://')) {
            createEnvFile(connectionString);
        } else {
            console.log('❌ Invalid connection string. Please check your MongoDB Atlas setup.');
            rl.close();
        }
    });
}

function setupLocalMongoDB() {
    console.log('\n💻 Local MongoDB Setup\n');
    console.log('1. Download MongoDB Community Server from:');
    console.log('   https://www.mongodb.com/try/download/community');
    console.log('2. Install MongoDB');
    console.log('3. Start MongoDB service\n');
    
    const localConnectionString = 'mongodb://localhost:27017/civisafe';
    console.log(`Using local connection string: ${localConnectionString}\n`);
    
    rl.question('Press Enter to continue with local MongoDB...', () => {
        createEnvFile(localConnectionString);
    });
}

function createEnvFile(connectionString) {
    const envContent = `# MongoDB Configuration
MONGODB_URI=${connectionString}

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=civisafe-secret-key-2024

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

    const envPath = path.join(__dirname, '.env');
    
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ .env file created successfully!');
        console.log('📁 Location:', envPath);
        console.log('\n🚀 Next steps:');
        console.log('1. Install dependencies: npm install');
        console.log('2. Start the server: npm run dev');
        console.log('3. Open http://localhost:3005 in your browser');
        console.log('\n🎉 Setup complete!');
    } catch (error) {
        console.log('❌ Error creating .env file:', error.message);
    }
    
    rl.close();
} 