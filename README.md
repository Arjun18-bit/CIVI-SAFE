# 🛡️ CiviSafe - Anonymous Complaint & Support Platform

**CiviSafe** is a secure, privacy-respecting complaint and support web platform designed for students, citizens, and institutions to report sensitive issues like harassment, abuse, and discrimination—**anonymously** and **safely**.

> Empowering voices through anonymity, support, and digital trust.

---

## 📌 Features

### 🎯 For Users
- ✅ Anonymous complaint submission (no login required)
- 🔐 AES-encrypted complaints and file uploads
- 🧾 Token-based status tracking
- 💬 Optional real-time chat with authorities/NGOs
- 📁 Upload supporting evidence (images, PDFs)
- 📚 Educational resources: rights, laws, helplines

### 👩‍💼 For Admins/NGOs
- 🔐 Secure admin login with JWT authentication
- 📊 Admin dashboard with real-time analytics
- 📬 Complaint assignment, response, and status updates
- 🚩 Misuse flagging and moderation
- 💬 Chat with anonymous users
- 📂 Access encrypted evidence files

---

## 🛠️ Tech Stack

| Layer       | Tools/Frameworks                          |
|-------------|-------------------------------------------|
| Frontend    | React.js, Tailwind CSS, Framer Motion, Recharts |
| Backend     | Node.js, Express.js, JWT, Multer          |
| Database    | PostgreSQL with Sequelize ORM             |
| Security    | AES encryption, JWT auth, file hashing    |
| Deployment  | Vercel (frontend), Render/Fly.io (backend), Supabase/Neon (DB) |

---

## 🧱 Project Structure

```

CIVI-SAFE/
├── frontend/         # React client
│   ├── pages/        # Page components (Home, Submit, Track, Chat, Admin)
│   ├── components/   # Reusable UI components
│   ├── services/     # Axios API handlers
│   └── context/      # Auth and chat context
│
├── backend/          # Node.js server
│   ├── routes/       # API routes (auth, complaints, chat, admin, files)
│   ├── controllers/  # Request handlers
│   ├── models/       # Sequelize models
│   ├── middleware/   # JWT, error handling
│   ├── utils/        # Encryption, token, logger
│   └── server.js
│
├── database/
│   └── schema.sql    # PostgreSQL schema
│
├── docs/
│   ├── ER-diagram.png
│   ├── architecture.png
│   └── IEEE-paper-draft.docx
└── README.md

````

---

## 🚀 Setup Instructions

### 🔧 Prerequisites
- Node.js & npm
- PostgreSQL

### 📦 Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with DB credentials and JWT secret
npm run dev
````

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 🗄️ Database Setup

```bash
# Create database manually first (e.g., 'civisafe')
psql -U postgres -d civisafe -f database/schema.sql
```

---

## 🔒 Security Features

| Area          | Protection Used                      |
| ------------- | ------------------------------------ |
| Identity      | Anonymous token-based system         |
| Storage       | AES-encrypted complaint text & files |
| Sessions      | JWT-based authentication             |
| Abuse Control | Flagging + moderation + audit logs   |
| Data Expiry   | Auto-deletion of chat/files (TTL)    |

---

## 🧠 Future Enhancements

* 📱 Mobile App (React Native)
* 🌐 Multi-language UI support
* 🧾 Decentralized storage or blockchain integration
* 🤖 AI-based spam detection (toggleable)
* 🧑‍⚖️ Legal escalation with chain of custody


---

**Let’s build a society where every voice can be safely heard.**
