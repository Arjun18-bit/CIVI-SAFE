# CiviSafe

**CiviSafe** is a modern, privacy-first web application for anonymous complaint submission, tracking, and support. Built with React, Node.js/Express, and MongoDB, it empowers users and organizations to handle sensitive issues securely and efficiently.

## Features

- **Anonymous Complaint Submission:** Users can submit complaints or requests without revealing their identity.
- **Complaint Tracking:** Track the status of complaints using a unique token.
- **Role-Based Dashboards:** Separate interfaces for Admin, NGO, Police, User, Student, and Faculty.
- **Admin Tools:** View, filter, update complaints, set priorities, add notes, and manage statuses.
- **Modern UI/UX:** Responsive, accessible, and user-friendly design.
- **Integrated Chatbot:** Context-aware support for users.
- **Secure Authentication:** JWT-based login and role management.
- **MongoDB Backend:** Scalable, document-based data storage.

## Quick Start

1. **Clone the repository:**
   ```sh
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   cd CIVI-SAFE
   ```

2. **Install dependencies:**
   ```sh
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables:**
   - Copy `backend/env.example` to `backend/.env` and fill in your MongoDB URI and JWT secret.

4. **Start the backend:**
   ```sh
   npm start
   ```

5. **Start the frontend:**
   ```sh
   cd frontend
   npm start
   ```

6. **Access the app:**
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - Frontend: [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal)

## License

MIT

---
