# MongoDB Setup Guide for CiviSafe

## Option 1: MongoDB Atlas (Recommended - Cloud Database) 🌟

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select a cloud provider (AWS/Google Cloud/Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Select "Read and write to any database"
5. Click "Add User"

### Step 4: Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### Step 6: Update Environment Variables
1. Create a `.env` file in your project root
2. Add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster.mongodb.net/civisafe?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=civisafe-secret-key-2024
```

## Option 2: Local MongoDB Installation

### Windows Installation
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Install MongoDB Compass (GUI tool) when prompted
5. Start MongoDB service

### Update Environment Variables
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/civisafe
PORT=3001
JWT_SECRET=civisafe-secret-key-2024
```

## Running the Application

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start MongoDB Server
```bash
# For MongoDB Atlas (no local setup needed)
# Just make sure your .env file has the correct connection string

# For Local MongoDB
# Make sure MongoDB service is running
```

### Step 3: Start the Application
```bash
# Use the new MongoDB-enabled server
node server-mongo.js
```

### Step 4: Test the Application
1. Open your browser to `http://localhost:3001`
2. Try logging in with:
   - admin/admin123
   - ngo1/ngo123
   - police/police123

## Troubleshooting

### Connection Issues
- Check your `.env` file has the correct MongoDB URI
- For Atlas: Make sure your IP is whitelisted
- For Local: Make sure MongoDB service is running

### Port Issues
- If port 3001 is in use, change the PORT in your `.env` file

### Database Issues
- The application will automatically create the database and collections
- Default users will be created on first run

## Benefits of MongoDB Atlas
✅ No local installation required
✅ Automatic backups
✅ Scalable
✅ Accessible from anywhere
✅ Free tier available
✅ Built-in security features

## Benefits of Local MongoDB
✅ No internet dependency
✅ Complete control
✅ No data transfer costs
✅ Works offline 