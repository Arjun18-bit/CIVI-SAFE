# 🏗️ CiviSafe Architecture Documentation

## Overview

CiviSafe is a privacy-respecting anonymous complaint and support system designed for educational institutions, NGOs, and law enforcement agencies. The system prioritizes user privacy while providing powerful tools for complaint management and support.

## 🏛️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   WebSocket     │              │
         └──────────────►│   (Socket.IO)   │              │
                        └─────────────────┘              │
                                                         │
                        ┌─────────────────┐              │
                        │   File Storage  │              │
                        │   (Local/S3)    │              │
                        └─────────────────┘              │
```

### Technology Stack

#### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Socket.IO Client** - Real-time communication

#### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Knex.js** - SQL query builder
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Multer** - File upload handling
- **Winston** - Logging
- **Crypto** - Encryption utilities

#### Database
- **PostgreSQL** - Primary database
- **UUID** - Primary keys
- **Full-text search** - Complaint search
- **Triggers** - Audit logging
- **Views** - Statistics

#### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **PM2** - Process management
- **Redis** - Caching (optional)

## 🔐 Security Architecture

### Encryption Strategy

#### Data Encryption
- **AES-256-GCM** for all sensitive data
- **Client-side encryption** (optional)
- **Server-side encryption** (mandatory)
- **File encryption** with unique keys

#### Key Management
```javascript
// Encryption key generation
const encryptionKey = crypto.randomBytes(32);

// Data encryption
const encryptedData = encrypt(data, encryptionKey);

// File encryption
const encryptedFile = encryptFile(fileBuffer, encryptionKey);
```

#### Privacy Protection
- **No PII storage** - Personal information is never stored
- **Token-based tracking** - Anonymous complaint tracking
- **Auto-expiry** - Data automatically expires
- **Audit logging** - Complete audit trail

### Authentication & Authorization

#### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Token verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### Role-Based Access Control
- **Admin** - Full system access
- **NGO** - NGO-specific complaints
- **Police** - Law enforcement access
- **Legal** - Legal team access

## 📊 Database Design

### Core Tables

#### Complaints Table
```sql
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES complaint_categories(id),
    description_encrypted TEXT NOT NULL,
    description_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year')
);
```

#### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL,
    message_encrypted TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);
```

### Database Relationships

```
complaints (1) ──── (N) chat_messages
complaints (1) ──── (N) files
complaints (1) ──── (N) complaint_status_history
complaints (1) ──── (N) complaint_flags
users (1) ──── (N) complaints (assigned_to)
```

## 🔄 API Architecture

### RESTful Endpoints

#### Complaints API
```
POST   /api/complaints/submit          # Submit new complaint
POST   /api/complaints/track           # Track complaint
GET    /api/complaints/categories      # Get categories
GET    /api/complaints/stats           # Get statistics
POST   /api/complaints/verify-contact  # Verify contact
```

#### Chat API
```
GET    /api/chat/:complaintId          # Get chat messages
POST   /api/chat/:complaintId          # Send message
PUT    /api/chat/:messageId/read       # Mark as read
```

#### Admin API
```
GET    /api/admin/complaints           # List complaints
PUT    /api/admin/complaints/:id       # Update complaint
POST   /api/admin/complaints/:id/assign # Assign complaint
```

### WebSocket Events

#### Client to Server
```javascript
// Join complaint room
socket.emit('join-complaint', { token: 'complaint_token' });

// Send message
socket.emit('send-message', {
  token: 'complaint_token',
  message: 'encrypted_message',
  senderType: 'user'
});

// Typing indicator
socket.emit('typing', { token: 'complaint_token', isTyping: true });
```

#### Server to Client
```javascript
// New message
socket.on('new-message', (messageData) => {
  // Handle new message
});

// User typing
socket.on('user-typing', (typingData) => {
  // Show typing indicator
});
```

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.js          # Main layout component
│   │   └── Navigation.js      # Navigation component
│   ├── Forms/
│   │   ├── ComplaintForm.js   # Complaint submission form
│   │   └── TrackingForm.js    # Complaint tracking form
│   ├── Chat/
│   │   ├── ChatWindow.js      # Chat interface
│   │   └── MessageList.js     # Message display
│   └── UI/
│       ├── Button.js          # Reusable button
│       ├── Card.js            # Card component
│       └── Modal.js           # Modal component
├── pages/
│   ├── Home/
│   ├── SubmitComplaint/
│   ├── TrackComplaint/
│   ├── Chat/
│   ├── Admin/
│   └── Resources/
├── context/
│   ├── AuthContext.js         # Authentication state
│   ├── ChatContext.js         # Chat state
│   └── ThemeContext.js        # Theme state
├── services/
│   ├── api.js                 # API client
│   ├── socket.js              # WebSocket client
│   └── encryption.js          # Client-side encryption
└── utils/
    ├── validation.js          # Form validation
    ├── helpers.js             # Utility functions
    └── constants.js           # Application constants
```

### State Management

#### Context API Usage
```javascript
// Authentication Context
const { user, login, logout, isAuthenticated } = useAuth();

// Chat Context
const { messages, sendMessage, joinRoom } = useChat();

// Theme Context
const { theme, toggleTheme } = useTheme();
```

#### React Query Integration
```javascript
// Fetch complaints
const { data: complaints, isLoading } = useQuery(
  ['complaints', filters],
  () => fetchComplaints(filters)
);

// Submit complaint
const mutation = useMutation(submitComplaint, {
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});
```

## 🔧 Middleware Architecture

### Request Pipeline

```
Request → Rate Limiting → CORS → Helmet → Body Parser → Validation → Route Handler → Response
```

#### Middleware Stack
```javascript
// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

### Error Handling

#### Global Error Handler
```javascript
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});
```

## 📈 Performance Optimization

### Database Optimization

#### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_complaints_tracking_token ON complaints(tracking_token);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_chat_messages_complaint_id ON chat_messages(complaint_id);
```

#### Query Optimization
```javascript
// Efficient complaint fetching with joins
const complaints = await db('complaints')
  .select(
    'complaints.*',
    'complaint_categories.name as category_name',
    'users.username as assigned_to_name'
  )
  .leftJoin('complaint_categories', 'complaints.category_id', 'complaint_categories.id')
  .leftJoin('users', 'complaints.assigned_to', 'users.id')
  .where('complaints.is_deleted', false)
  .orderBy('complaints.created_at', 'desc')
  .limit(20);
```

### Frontend Optimization

#### Code Splitting
```javascript
// Lazy loading for routes
const SubmitComplaint = lazy(() => import('./pages/SubmitComplaint/SubmitComplaint'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
```

#### Memoization
```javascript
// Memoized components
const ComplaintCard = memo(({ complaint }) => {
  return (
    <div className="card">
      {/* Complaint content */}
    </div>
  );
});

// Memoized selectors
const selectComplaintsByStatus = useMemo(
  () => createSelector(
    (state) => state.complaints,
    (complaints) => complaints.filter(c => c.status === 'pending')
  ),
  []
);
```

## 🔄 Data Flow

### Complaint Submission Flow

```
1. User fills complaint form
2. Client-side validation
3. Optional client-side encryption
4. Form submission to /api/complaints/submit
5. Server-side validation
6. Server-side encryption
7. Database insertion
8. File upload processing
9. Tracking token generation
10. Response with token
```

### Chat Flow

```
1. User enters tracking token
2. WebSocket connection established
3. Join complaint room
4. Real-time message exchange
5. Message encryption/decryption
6. Database persistence
7. Auto-expiry cleanup
```

## 🚀 Deployment Architecture

### Production Setup

#### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
PORT=5000
DB_HOST=postgres-production
DB_SSL=true
ENCRYPTION_KEY=production_key
JWT_SECRET=production_jwt_secret
FRONTEND_URL=https://civisafe.com
```

### Scaling Strategy

#### Horizontal Scaling
- **Load Balancer** - Nginx with multiple backend instances
- **Database** - Read replicas for reporting
- **File Storage** - CDN for static assets
- **Caching** - Redis for session storage

#### Monitoring
- **Application Metrics** - Winston logging
- **Database Metrics** - Query performance monitoring
- **Infrastructure** - CPU, memory, disk usage
- **Security** - Failed login attempts, suspicious activity

## 🔒 Security Considerations

### Input Validation
```javascript
// Comprehensive validation
const submitComplaintValidation = [
  body('category_id').isInt({ min: 1 }),
  body('description').isLength({ min: 10, max: 5000 }),
  body('contact_email').optional().isEmail(),
  body('contact_phone').optional().isMobilePhone(),
];
```

### SQL Injection Prevention
```javascript
// Parameterized queries with Knex
const complaints = await db('complaints')
  .where('tracking_token', trackingToken)
  .where('is_deleted', false)
  .first();
```

### XSS Prevention
```javascript
// Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
```

## 📋 Testing Strategy

### Backend Testing
```javascript
// Unit tests
describe('Complaint Service', () => {
  it('should create complaint with valid data', async () => {
    const complaintData = {
      category_id: 1,
      description: 'Test complaint',
    };
    
    const result = await createComplaint(complaintData);
    expect(result).toHaveProperty('tracking_token');
  });
});
```

### Frontend Testing
```javascript
// Component tests
describe('ComplaintForm', () => {
  it('should submit form with valid data', async () => {
    render(<ComplaintForm />);
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test complaint description' }
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(screen.getByText('Complaint submitted')).toBeInTheDocument();
    });
  });
});
```

## 🔄 Maintenance & Operations

### Backup Strategy
- **Database** - Daily automated backups
- **Files** - S3 versioning enabled
- **Configuration** - Version controlled
- **Logs** - Centralized logging

### Update Strategy
- **Zero-downtime deployments** - Blue-green deployment
- **Database migrations** - Versioned migrations
- **Feature flags** - Gradual rollout
- **Rollback plan** - Quick rollback capability

This architecture ensures CiviSafe is scalable, secure, and maintainable while providing the privacy and functionality required for anonymous complaint management. 