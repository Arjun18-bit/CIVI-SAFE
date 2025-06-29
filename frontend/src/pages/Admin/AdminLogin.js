import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight,
  AlertCircle,
  Info,
  Copy,
  CheckCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestCredentials, setShowTestCredentials] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'ngo1', password: 'ngo123', role: 'ngo' },
    { username: 'police', password: 'police123', role: 'police' },
  ];
  const [autofilledUser, setAutofilledUser] = useState({ username: '', password: '' });
  const handleAutofill = (username, password) => {
    setAutofilledUser({ username, password });
    setUsername(username);
    setPassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        // Use AuthContext to login
        login(data.user, data.token);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <div className="p-4 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-2xl shadow-lg">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">Access admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error"
              >
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </motion.div>
            )}
            
            <div>
              <label className="form-label flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Username</span>
              </label>
              <input
                className="form-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Enter admin username"
              />
            </div>
            
            <div>
              <label className="form-label flex items-center space-x-2">
                <Lock className="h-4 w-4 text-gray-500" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  className="form-input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Admin Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Test Credentials Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowTestCredentials(!showTestCredentials)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Test Admin Credentials</span>
            </button>
            
            {showTestCredentials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <p className="text-xs text-gray-500 mb-3">
                  Click on any account to auto-fill credentials:
                </p>
                {/* testAdmins.map((user, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fillTestCredentials(user)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-600">{user.description}</div>
                      </div>
                      <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {user.role}
                      </div>
                    </div>
                  </motion.button>
                )) */}
              </motion.div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 border border-gray-200 rounded-xl p-5 text-sm text-gray-700 shadow-lg transition-all duration-300">
            <div className="font-semibold mb-3 flex items-center gap-2 text-base text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/><circle cx="12" cy="16" r="1"/></svg>
              Test Login Credentials <span className="ml-2 text-xs text-blue-400 font-normal">(Tap to autofill)</span>
            </div>
            <table className="w-full text-left text-xs mt-2">
              <thead>
                <tr className="text-gray-500">
                  <th className="pr-2 py-1 font-medium">Role</th>
                  <th className="pr-2 py-1 font-medium">Username</th>
                  <th className="py-1 font-medium">Password</th>
                </tr>
              </thead>
              <tbody>
                {testUsers.map((user, idx) => (
                  <tr
                    key={user.role}
                    className={`cursor-pointer transition-all duration-150 hover:bg-blue-50 hover:scale-[1.01] rounded-lg ${autofilledUser === user.username ? 'bg-green-50' : ''}`}
                    onClick={() => handleAutofill(user.username, user.password)}
                    title="Click to autofill"
                  >
                    <td className="pr-2 py-1 font-semibold text-gray-700">{user.role}</td>
                    <td className="pr-2 py-1"><code className="bg-gray-200 rounded px-1 text-blue-700">{user.username}</code></td>
                    <td className="py-1"><code className="bg-gray-200 rounded px-1 text-pink-700">{user.password}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {autofilledUser && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Autofilled <span className="font-semibold">{autofilledUser.username}</span>!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 