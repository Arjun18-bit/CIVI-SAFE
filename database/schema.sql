-- CiviSafe Database Schema
-- PostgreSQL database for privacy-respecting anonymous complaint system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if not exists (run this separately)
-- CREATE DATABASE civisafe;

-- Connect to the database
-- \c civisafe;

-- Users table (for admin users only)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'ngo', 'police', 'legal')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint categories
CREATE TABLE IF NOT EXISTS complaint_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table (main table)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_token VARCHAR(64) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES complaint_categories(id),
    description_encrypted TEXT NOT NULL,
    description_hash VARCHAR(255) NOT NULL, -- For search without decryption
    location VARCHAR(255),
    incident_date DATE,
    severity_level VARCHAR(20) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed', 'escalated')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP,
    estimated_resolution_date DATE,
    actual_resolution_date DATE,
    resolution_notes TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    contact_email VARCHAR(255), -- Optional for updates
    contact_phone VARCHAR(20), -- Optional for updates
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    verification_otp VARCHAR(10),
    otp_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year'),
    is_deleted BOOLEAN DEFAULT false
);

-- Files table (for attachments)
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    secure_name VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_hash VARCHAR(255) NOT NULL,
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_hash VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year'),
    is_deleted BOOLEAN DEFAULT false
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'ngo', 'police')),
    sender_id UUID REFERENCES users(id), -- NULL for anonymous users
    message_encrypted TEXT NOT NULL,
    message_hash VARCHAR(255) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    file_id UUID REFERENCES files(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    is_deleted BOOLEAN DEFAULT false
);

-- Complaint status history
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint flags (for abuse detection)
CREATE TABLE IF NOT EXISTS complaint_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    flagged_by UUID REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Educational resources
CREATE TABLE IF NOT EXISTS educational_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'pdf', 'link')),
    category VARCHAR(50),
    tags TEXT[],
    language VARCHAR(10) DEFAULT 'en',
    file_path VARCHAR(500),
    external_url VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helplines table
CREATE TABLE IF NOT EXISTS helplines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    category VARCHAR(50),
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_tracking_token ON complaints(tracking_token);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_description_hash ON complaints(description_hash);

CREATE INDEX IF NOT EXISTS idx_files_complaint_id ON files(complaint_id);
CREATE INDEX IF NOT EXISTS idx_files_secure_name ON files(secure_name);
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files(expires_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_complaint_id ON chat_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_expires_at ON chat_messages(expires_at);

CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON complaint_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_flags_complaint_id ON complaint_flags(complaint_id);
CREATE INDEX IF NOT EXISTS idx_flags_status ON complaint_flags(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create full-text search index for complaints
CREATE INDEX IF NOT EXISTS idx_complaints_search ON complaints USING gin(to_tsvector('english', description_hash));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_resources_updated_at BEFORE UPDATE ON educational_resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for complaint status history
CREATE OR REPLACE FUNCTION log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_to);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER complaint_status_change_trigger
    AFTER UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION log_complaint_status_change();

-- Function to generate tracking token
CREATE OR REPLACE FUNCTION generate_tracking_token()
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID AS $$
BEGIN
    -- Delete expired chat messages
    DELETE FROM chat_messages WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Delete expired files
    DELETE FROM files WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Mark expired complaints as closed
    UPDATE complaints 
    SET status = 'closed', updated_at = CURRENT_TIMESTAMP 
    WHERE expires_at < CURRENT_TIMESTAMP AND status NOT IN ('closed', 'resolved');
    
    -- Log cleanup
    INSERT INTO audit_logs (action, table_name, new_values)
    VALUES ('cleanup_expired_data', 'system', 
            jsonb_build_object('timestamp', CURRENT_TIMESTAMP, 'action', 'cleanup'));
END;
$$ LANGUAGE plpgsql;

-- Insert default data
INSERT INTO complaint_categories (name, description, icon, color) VALUES
('Harassment', 'Bullying, stalking, or unwanted attention', 'shield-alert', '#EF4444'),
('Academic', 'Issues related to studies, grades, or faculty', 'book-open', '#3B82F6'),
('Infrastructure', 'Problems with facilities, equipment, or services', 'building', '#10B981'),
('Discrimination', 'Bias based on race, gender, religion, or other factors', 'users', '#F59E0B'),
('Safety', 'Physical safety concerns or threats', 'alert-triangle', '#DC2626'),
('Financial', 'Issues with fees, scholarships, or financial aid', 'dollar-sign', '#8B5CF6'),
('Technology', 'IT-related problems or cyber issues', 'monitor', '#06B6D4'),
('Other', 'Other complaints not covered by above categories', 'help-circle', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, config_type, description, is_public) VALUES
('app_name', 'CiviSafe', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Application version', true),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', true),
('allowed_file_types', '["image/jpeg","image/png","image/gif","application/pdf","text/plain"]', 'json', 'Allowed file types for upload', true),
('chat_message_expiry_days', '7', 'number', 'Number of days before chat messages expire', true),
('complaint_expiry_days', '365', 'number', 'Number of days before complaints expire', true),
('file_expiry_days', '365', 'number', 'Number of days before uploaded files expire', true),
('enable_email_notifications', 'true', 'boolean', 'Enable email notifications', false),
('enable_sms_notifications', 'false', 'boolean', 'Enable SMS notifications', false),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true)
ON CONFLICT (config_key) DO NOTHING;

-- Insert sample helplines
INSERT INTO helplines (name, description, phone, email, website, category, region) VALUES
('National Emergency', 'Emergency services', '100', NULL, NULL, 'emergency', 'India'),
('Women Helpline', '24/7 women safety helpline', '1091', 'women-helpline@gov.in', 'https://wcd.nic.in', 'women-safety', 'India'),
('Child Helpline', 'Child protection and welfare', '1098', 'childline@childlineindia.org.in', 'https://childlineindia.org', 'child-protection', 'India'),
('Cyber Crime', 'Cyber crime reporting', '1930', 'cybercrime@ncrb.gov.in', 'https://cybercrime.gov.in', 'cyber-crime', 'India'),
('Student Grievance', 'Academic and student issues', NULL, 'grievance@education.gov.in', 'https://education.gov.in', 'academic', 'India')
ON CONFLICT DO NOTHING;

-- Create a default admin user (password: admin123)
-- In production, this should be changed immediately
INSERT INTO users (username, email, password_hash, password_salt, role) VALUES
('admin', 'admin@civisafe.com', 
 '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- SHA256 of 'admin123'
 'default_salt_change_in_production',
 'admin')
ON CONFLICT (username) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO civisafe_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO civisafe_user;

-- Create a view for complaint statistics
CREATE OR REPLACE VIEW complaint_stats AS
SELECT 
    COUNT(*) as total_complaints,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_complaints,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_complaints,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_complaints,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as complaints_last_7_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as complaints_last_30_days
FROM complaints 
WHERE is_deleted = false;

-- Create a view for category statistics
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    cc.name as category_name,
    cc.color as category_color,
    COUNT(c.id) as total_complaints,
    COUNT(CASE WHEN c.status = 'pending' THEN 1 END) as pending,
    COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as in_progress,
    COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved,
    COUNT(CASE WHEN c.status = 'closed' THEN 1 END) as closed
FROM complaint_categories cc
LEFT JOIN complaints c ON cc.id = c.category_id AND c.is_deleted = false
WHERE cc.is_active = true
GROUP BY cc.id, cc.name, cc.color
ORDER BY total_complaints DESC;

-- Comments for documentation
COMMENT ON TABLE complaints IS 'Main complaints table storing anonymous complaint data';
COMMENT ON TABLE files IS 'File attachments for complaints with encryption support';
COMMENT ON TABLE chat_messages IS 'Encrypted chat messages between users and support staff';
COMMENT ON TABLE users IS 'Admin users with role-based access control';
COMMENT ON TABLE complaint_categories IS 'Categories for organizing complaints';
COMMENT ON TABLE educational_resources IS 'Educational content and resources for users';
COMMENT ON TABLE helplines IS 'Emergency and support helpline information';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and compliance';

COMMENT ON COLUMN complaints.tracking_token IS 'Unique token for anonymous complaint tracking';
COMMENT ON COLUMN complaints.description_encrypted IS 'AES-256 encrypted complaint description';
COMMENT ON COLUMN complaints.description_hash IS 'Hash of description for search without decryption';
COMMENT ON COLUMN files.file_hash IS 'SHA-256 hash of file for integrity verification';
COMMENT ON COLUMN chat_messages.message_encrypted IS 'AES-256 encrypted chat message content'; 