# 🛡️ CiviSafe - Privacy-Respecting Anonymous Complaint & Support System

A modern, secure, and user-friendly platform for anonymous complaint submission and support management with MongoDB integration.

## 📋 Project Overview

CiviSafe is a comprehensive, privacy-first complaint and support system designed for educational institutions, NGOs, and law enforcement agencies. The system enables anonymous complaint submission while maintaining secure communication channels and role-based access control.

### 🎯 Core Features

- **🔐 Anonymous Complaint Submission**: Submit complaints without revealing identity
- **🎫 Token-based Status Tracking**: Track progress using secure tokens
- **💬 Encrypted Chat System**: Secure communication with support personnel
- **👥 Role-based Admin Panel**: Different interfaces for admins, NGOs, and legal teams
- **📚 Educational Resources**: Digital rights information and legal guidance
- **🛡️ End-to-End Encryption**: Military-grade AES-256 encryption for all data

## 🧱 Technology Stack

### Frontend
- **React.js** - Modern, responsive web interface
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Beautiful, accessible components
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **WebSocket** - Real-time chat functionality

### Backend
- **Node.js (Express)** - RESTful API server
- **JWT** - Secure authentication and authorization
- **Multer** - File upload handling
- **WebSocket** - Real-time chat support
- **Sequelize/Knex** - Database ORM

### Database & Storage
- **PostgreSQL** - Reliable, scalable database
- **Local Encrypted Storage** - AES-256 encrypted file storage
- **Cloud S3** - Optional cloud storage (AES encrypted)

### Deployment
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Fly.io/Render
- **Database**: Supabase/Neon (PostgreSQL)

## 🌐 User Flow

### 1. **Homepage Access**
- User visits CiviSafe homepage
- Navigation: [Submit Complaint] [Track Complaint] [Resources] [Admin]

### 2. **Submit Complaint**
- User fills complaint form (category, description, attachments)
- Client-side AES encryption (optional)
- Backend stores encrypted data & generates tracking token
- Token displayed with copy functionality
- Optional email/OTP for updates

### 3. **Track Complaint**
- User enters tracking token
- View current status, updates, and timestamps
- Access to encrypted chat if available

### 4. **Chat Interface**
- WebSocket or REST-based chat
- Auto-expiry messages (7 days)
- Encrypted message storage
- Anonymous communication

### 5. **Admin/NGO Panel**
- Role-based login (JWT authentication)
- Dashboard with routed complaints
- Chat response capabilities
- Status management and escalation

### 6. **Resources Portal**
- Educational content on rights and laws
- Helpline directories
- Downloadable resources

## 📁 Directory Structure

```
CIVI-SAFE/
├── frontend/                 # React.js frontend application
│   ├── public/              # Static files
│   │   ├── pages/           # Page components
│   │   │   ├── Home/
│   │   │   ├── SubmitComplaint/
│   │   │   ├── TrackComplaint/
│   │   │   ├── Chat/
│   │   │   ├── Admin/
│   │   │   └── Resources/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API handlers
│   │   ├── context/         # Global state management
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json
│
├── backend/                  # Node.js/Express API server
│   ├── routes/              # API route handlers
│   │   ├── complaints.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── admin.js
│   │   ├── files.js
│   │   └── resources.js
│   ├── controllers/         # Business logic
│   ├── models/              # Database models
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── server.js            # Server entry point
│   └── package.json
│
├── database/                 # Database schemas and migrations
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
│
├── docs/                     # Documentation
│   ├── use-cases.md
│   ├── architecture.md
│   ├── api-documentation.md
│   └── deployment.md
│
├── scripts/                  # Utility scripts
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Anonymous Complaints** | Token-based tracking, no PII stored |
| **Encrypted Storage** | AES-256 + hashed filenames |
| **Secure Chat** | JWT auth + encrypted messages |
| **Role Separation** | JWT & RBAC (Admin, NGO, Police) |
| **Abuse Detection** | Flag & moderation queue |
| **Data Expiry** | Chat TTL, file expiry cron jobs |

## 🗄️ Database Schema

### Core Tables

```sql
-- Complaints table
complaints (
  id, category, description_encrypted, 
  file_path, tracking_token, status, 
  created_at, expires_at
)

-- Chat messages
chats (
  id, complaint_id, sender_type, 
  message_encrypted, timestamp, expires_at
)

-- Admin users
admins (
  id, username, password_hash, role, 
  is_active, created_at
)

-- Complaint flags
flags (
  id, complaint_id, reason, 
  flagged_by, created_at
)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CIVI-SAFE
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

4. **Database Setup**
```bash
# Run the schema file
psql -U postgres -d civisafe -f database/schema.sql
```

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

```env
# Backend .env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=civisafe
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

## 📝 IEEE Paper Structure

### Abstract
Summary of CiviSafe problem & solution

### Introduction
Real-world issues and gap analysis

### Related Work
Existing systems (helplines, police portals)

### Methodology
System architecture, flow diagrams

### Implementation
Tech stack, modules, privacy model

### Results
Mock case studies, screenshots

### Conclusion
Impact, future enhancements

## 🔮 Future Features

- **Multi-language Support** (Tamil, Hindi, etc.)
- **QR-based Quick Reporting**
- **Mobile App** (React Native)
- **AI-based Spam Detection**
- **Blockchain Integration**
- **Advanced Analytics Dashboard**

---

## 11. ✅ Setup Instructions & Getting Started

### 1. Install Node.js and npm
- Download and install from [https://nodejs.org/](https://nodejs.org/)
- After installation, verify:
  ```sh
  node -v
  npm -v
  ```
  Both should print version numbers.

### 2. Backend Setup
```sh
cd backend
npm install
cp env.example .env
# Edit .env with your DB credentials and secrets
npm run dev
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
npm start
```

### 4. PostgreSQL Database Setup
- Ensure PostgreSQL is running.
- Create a database named `civisafe`.
- Import the schema:
  ```sh
  psql -U postgres -d civisafe -f ../database/schema.sql
  ```

### 5. Environment Variables
- Edit `.env` files in both `backend/` and `frontend/` as needed.
- Example for backend:
  ```env
  NODE_ENV=development
  PORT=5000
  DB_HOST=localhost
  DB_USER=postgres
  DB_PASSWORD=your_password
  DB_NAME=civisafe
  JWT_SECRET=your_jwt_secret
  ENCRYPTION_KEY=your_encryption_key
  ```

### 6. Common Errors & Troubleshooting
- **npm : The term 'npm' is not recognized...**
  - Node.js/npm is not installed or not in PATH. Install Node.js and restart your terminal.
- **Database connection errors**
  - Check your `.env` DB credentials and that PostgreSQL is running.
- **Port already in use**
  - Change the `PORT` in `.env` or stop the process using that port.
- **Schema import errors**
  - Ensure the database exists and you have permissions. Use `psql` as a superuser if needed.

### 7. Running the App
- Backend: [http://localhost:5000/health](http://localhost:5000/health)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**CiviSafe** - Empowering communities through secure, anonymous reporting and support systems.

*Built with ❤️ for social impact and digital rights.* 

## ✨ Features

### 🔐 **User Authentication & Registration**
- **Secure User Registration** with MongoDB storage
- **JWT-based Authentication** with role-based access
- **Multiple User Roles**: admin, ngo, police, user, student, faculty, staff
- **Password Hashing** with bcrypt
- **Email Validation** and duplicate prevention
- **User Profiles** with firstName, lastName, phone

### 📝 **Complaint Management**
- **Anonymous Complaint Submission** with file uploads
- **Individual User Dashboards** - users see only their own complaints
- **Real-time Tracking** with unique tracking tokens
- **Status Updates** and progress tracking
- **File Attachments** support (images, PDFs, documents)

### 🎨 **Modern UI/UX**
- **Responsive Design** with Tailwind CSS
- **Smooth Animations** using Framer Motion
- **Dark/Light Mode** toggle
- **Interactive Components** with hover effects
- **Mobile-First** approach

### 🔒 **Security Features**
- **End-to-End Encryption** for sensitive data
- **Anonymous Reporting** with privacy protection
- **Secure File Uploads** with validation
- **JWT Token Management**
- **Role-Based Access Control**

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CIVI-SAFE
```

### 2. Setup MongoDB
```bash
# Run the interactive setup script
npm run setup

# Or manually create a .env file with your MongoDB connection
```

### 3. Install Dependencies
```bash
npm install
cd frontend && npm install
```

### 4. Start the Application
```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start frontend (in frontend directory)
cd frontend && npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3005
- **Backend API**: http://localhost:3001

## 📊 MongoDB Integration

### Database Setup
The application uses MongoDB for storing users and complaints. You can choose between:

1. **MongoDB Atlas (Recommended)** - Cloud database
2. **Local MongoDB** - Self-hosted database

### Automatic Setup
Run the setup script for guided MongoDB configuration:
```bash
npm run setup
```

### Manual Setup
Create a `.env` file in the root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/civisafe
# OR for Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civisafe

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 👥 User Management

### Default Test Users
The system automatically creates these test accounts:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| ngo1 | ngo123 | NGO |
| police | police123 | Police |
| john_doe | password123 | User |
| jane_smith | password123 | Student |
| mike_wilson | password123 | Faculty |

### User Registration
Users can register with:
- **Username** (3-30 characters)
- **Email** (validated format)
- **Password** (minimum 6 characters)
- **First Name** & **Last Name** (optional)
- **Phone Number** (optional)
- **Account Type** (user, student, faculty, staff)

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/verify-token` - Token verification

### Complaints
- `POST /api/complaints` - Submit complaint (authenticated)
- `GET /api/complaints` - Get user's complaints (authenticated)
- `GET /api/complaints/track/:token` - Track complaint by token
- `PUT /api/complaints/:id/status` - Update complaint status (admin)

### Admin
- `GET /api/stats` - Get complaint statistics (admin)

## 🎯 Key Features

### ✅ **User Registration & Authentication**
- Secure MongoDB-based user storage
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control

### ✅ **Individual Complaint Storage**
- Each user sees only their own complaints
- Secure user-specific dashboards
- Privacy-protected complaint management

### ✅ **"Code Copied" Notifications**
- Visual feedback when copying tracking tokens
- Animated copy confirmation
- User-friendly interaction feedback

### ✅ **Enhanced User Experience**
- Beautiful registration form with additional fields
- Real-time validation and error handling
- Smooth animations and transitions
- Mobile-responsive design

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads

### Frontend
- **React.js** with hooks
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Database
- **MongoDB** (local or Atlas)
- **Mongoose** for data modeling
- **Indexes** for performance optimization

## 📁 Project Structure

```
CIVI-SAFE/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── index.js        # App entry point
│   └── package.json
├── models/                  # MongoDB models
│   ├── User.js             # User model
│   └── Complaint.js        # Complaint model
├── config/                  # Configuration files
│   └── database.js         # MongoDB connection
├── server.js               # Main server file
├── setup-mongodb.js        # MongoDB setup script
└── package.json
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure session management
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Restricted file types and sizes
- **CORS Protection**: Cross-origin request protection
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
Make sure to set up your `.env` file with:
- MongoDB connection string
- JWT secret key
- Server port
- File upload settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the MongoDB setup guide
- Open an issue on GitHub

---

**CiviSafe** - Empowering communities through secure, anonymous reporting and support systems. 🛡️ 