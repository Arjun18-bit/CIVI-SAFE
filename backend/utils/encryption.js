const crypto = require('crypto');
const { promisify } = require('util');

// Configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Generate a random encryption key
const generateKey = () => {
  return crypto.randomBytes(KEY_LENGTH);
};

// Generate a random IV
const generateIV = () => {
  return crypto.randomBytes(IV_LENGTH);
};

// Generate a random salt
const generateSalt = () => {
  return crypto.randomBytes(SALT_LENGTH);
};

// Derive key from password using PBKDF2
const deriveKey = async (password, salt) => {
  const pbkdf2 = promisify(crypto.pbkdf2);
  return await pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
};

// Encrypt data with AES-256-GCM
const encrypt = (data, key) => {
  try {
    const iv = generateIV();
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('civisafe', 'utf8')); // Additional authenticated data
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Return IV + Tag + Encrypted data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

// Decrypt data with AES-256-GCM
const decrypt = (encryptedData, key) => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from('civisafe', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

// Encrypt file data
const encryptFile = (fileBuffer, key) => {
  try {
    const iv = generateIV();
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('civisafe-file', 'utf8'));
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    // Return IV + Tag + Encrypted data as buffer
    return Buffer.concat([iv, tag, encrypted]);
  } catch (error) {
    throw new Error(`File encryption failed: ${error.message}`);
  }
};

// Decrypt file data
const decryptFile = (encryptedBuffer, key) => {
  try {
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const tag = encryptedBuffer.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(Buffer.from('civisafe-file', 'utf8'));
    decipher.setAuthTag(tag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    throw new Error(`File decryption failed: ${error.message}`);
  }
};

// Generate secure token for complaint tracking
const generateTrackingToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate secure OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Hash sensitive data for storage
const hashData = (data, salt = null) => {
  const useSalt = salt || generateSalt();
  const hash = crypto.pbkdf2Sync(data, useSalt, ITERATIONS, KEY_LENGTH, 'sha512');
  return {
    hash: hash.toString('hex'),
    salt: useSalt.toString('hex')
  };
};

// Verify hashed data
const verifyHash = (data, hash, salt) => {
  const saltBuffer = Buffer.from(salt, 'hex');
  const verifyHash = crypto.pbkdf2Sync(data, saltBuffer, ITERATIONS, KEY_LENGTH, 'sha512');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), verifyHash);
};

// Generate secure random string
const generateSecureString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Encrypt object to JSON string
const encryptObject = (obj, key) => {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString, key);
};

// Decrypt JSON string to object
const decryptObject = (encryptedData, key) => {
  const jsonString = decrypt(encryptedData, key);
  return JSON.parse(jsonString);
};

// Generate a secure session token
const generateSessionToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Hash password for storage
const hashPassword = (password) => {
  const salt = generateSalt();
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  return {
    hash: hash.toString('hex'),
    salt: salt.toString('hex')
  };
};

// Verify password
const verifyPassword = (password, hash, salt) => {
  const saltBuffer = Buffer.from(salt, 'hex');
  const verifyHash = crypto.pbkdf2Sync(password, saltBuffer, ITERATIONS, KEY_LENGTH, 'sha512');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), verifyHash);
};

// Generate a secure file name
const generateSecureFileName = (originalName) => {
  const extension = originalName.split('.').pop();
  const secureName = crypto.randomBytes(16).toString('hex');
  return `${secureName}.${extension}`;
};

// Encrypt sensitive fields in an object
const encryptSensitiveFields = (obj, fields, key) => {
  const encrypted = { ...obj };
  fields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field], key);
    }
  });
  return encrypted;
};

// Decrypt sensitive fields in an object
const decryptSensitiveFields = (obj, fields, key) => {
  const decrypted = { ...obj };
  fields.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decrypt(decrypted[field], key);
      } catch (error) {
        // If decryption fails, keep the encrypted value
        console.warn(`Failed to decrypt field ${field}:`, error.message);
      }
    }
  });
  return decrypted;
};

module.exports = {
  generateKey,
  generateIV,
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  generateTrackingToken,
  generateOTP,
  hashData,
  verifyHash,
  generateSecureString,
  encryptObject,
  decryptObject,
  generateSessionToken,
  hashPassword,
  verifyPassword,
  generateSecureFileName,
  encryptSensitiveFields,
  decryptSensitiveFields,
  ALGORITHM,
  IV_LENGTH,
  SALT_LENGTH,
  TAG_LENGTH,
  KEY_LENGTH,
  ITERATIONS
}; 