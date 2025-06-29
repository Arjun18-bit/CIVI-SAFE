# 🛡️ CiviSafe: Privacy-Respecting Anonymous Complaint & Support System

> **Empowering communities through secure, anonymous reporting and support systems**

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