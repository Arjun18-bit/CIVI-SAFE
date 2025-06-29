import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Copy, 
  RefreshCw, 
  ArrowLeft, 
  Key,
  Image as ImageIcon,
  Lock,
  Database,
  Cpu,
  Wifi,
  Smartphone,
  Download,
  MessageCircle,
  Shield,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Heart,
  Zap,
  Sparkles,
  Globe,
  Target
} from 'lucide-react';

const TrackComplaint = () => {
  const [searchParams] = useSearchParams();
  const [trackingToken, setTrackingToken] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Pre-fill tracking token from URL parameter
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setTrackingToken(tokenFromUrl);
      // Auto-search if token is provided
      setTimeout(() => {
        handleSearch(tokenFromUrl);
      }, 500);
    }
  }, [searchParams]);

  const statusSteps = [
    { id: 'submitted', name: 'Submitted', icon: FileText, color: 'text-blue-500' },
    { id: 'reviewed', name: 'Reviewed', icon: Eye, color: 'text-purple-500' },
    { id: 'investigating', name: 'Investigating', icon: Search, color: 'text-orange-500' },
    { id: 'in_progress', name: 'In Progress', icon: Clock, color: 'text-yellow-500' },
    { id: 'resolved', name: 'Resolved', icon: CheckCircle, color: 'text-green-500' }
  ];

  const securityFeatures = [
    { icon: Lock, label: 'AES-256 Encryption', status: 'Active' },
    { icon: Key, label: 'Secure Access', status: 'Active' },
    { icon: Database, label: 'Encrypted Storage', status: 'Active' },
    { icon: Cpu, label: 'AI Protection', status: 'Active' },
    { icon: Wifi, label: 'Secure Network', status: 'Active' },
    { icon: Smartphone, label: 'Mobile Security', status: 'Active' }
  ];

  const handleSearch = async (token = null) => {
    const searchToken = (token || trackingToken || '').trim();
    if (!searchToken || searchToken === 'undefined') {
      setError('Please enter a valid tracking token');
      return;
    }

    setIsSearching(true);
    setError('');
    try {
      const response = await fetch(`/api/complaints/track/${searchToken}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        setComplaint(data.complaint);
      } else {
        setError(data.message || 'Tracking token not found. Please check and try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const copyToken = () => {
    if (!complaint?.id) return;
    navigator.clipboard.writeText(complaint.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentStepIndex = () => {
    if (!complaint?.status) return -1;
    return statusSteps.findIndex(step => step.id === complaint.status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="container-responsive max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="p-4 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-2xl shadow-lg">
              <Eye className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Track Your{' '}
            <span className="bg-gradient-to-r from-civisafe-600 to-purple-600 bg-clip-text text-transparent">
              Complaint
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your tracking token to monitor the progress of your complaint securely and anonymously.
          </p>
        </motion.div>

        {/* Search Section */}
        {!complaint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Tracking Token</h2>
                <p className="text-gray-600">Use the token you received when submitting your complaint</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Tracking Token</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={trackingToken}
                      onChange={(e) => setTrackingToken(e.target.value)}
                      placeholder="e.g., CS-ABC123XYZ"
                      className="form-input pl-10 text-center font-mono text-lg"
                    />
                  </div>
                </div>
                
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
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Search className="h-5 w-5" />
                      <span>Track Complaint</span>
                    </div>
                  )}
                </motion.button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Don't have a tracking token?{' '}
                    <a href="/submit" className="text-civisafe-600 hover:text-civisafe-700 font-medium">
                      Submit a new complaint
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Complaint Details */}
        <AnimatePresence>
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Status Overview */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Complaint Status</h2>
                    <p className="text-gray-600">Tracking ID: {complaint?.id || 'Unknown'}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToken}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {copied ? 'Copied!' : 'Copy Token'}
                    </span>
                  </motion.button>
                </div>
                
                {/* Progress Steps */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    {statusSteps && statusSteps.map((step, index) => {
                      const isCompleted = index <= getCurrentStepIndex();
                      const isCurrent = index === getCurrentStepIndex();
                      
                      return (
                        <div key={step.id} className="flex items-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                              isCompleted
                                ? 'bg-civisafe-600 border-civisafe-600 text-white'
                                : isCurrent
                                ? 'bg-yellow-500 border-yellow-500 text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                            }`}
                          >
                            <step.icon className="h-6 w-6" />
                            {isCurrent && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"
                              />
                            )}
                          </motion.div>
                          
                          {index < statusSteps.length - 1 && (
                            <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                              isCompleted ? 'bg-civisafe-600' : 'bg-gray-300'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    {statusSteps && statusSteps.map((step) => (
                      <span
                        key={step.id}
                        className={`text-sm font-medium transition-colors duration-300 ${
                          step.id === complaint?.status ? 'text-yellow-600' : 
                          statusSteps.findIndex(s => s.id === step.id) <= getCurrentStepIndex() 
                            ? 'text-civisafe-600' : 'text-gray-400'
                        }`}
                      >
                        {step.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Current Status */}
                <div className="bg-gradient-to-r from-civisafe-50 to-blue-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-civisafe-100 rounded-xl">
                      <Clock className="h-8 w-8 text-civisafe-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Currently {complaint?.status?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN'}
                      </h3>
                      <p className="text-gray-600">
                        Estimated resolution: {complaint?.estimatedResolution ? new Date(complaint.estimatedResolution).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Complaint Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-sm text-gray-500">Category</span>
                        <p className="font-semibold text-gray-900">{complaint?.category || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Priority</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint?.priority)}`}>
                          {complaint?.priority?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Location</span>
                        <p className="font-semibold text-gray-900">{complaint?.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Date of Incident</span>
                        <p className="font-semibold text-gray-900">{complaint?.date ? new Date(complaint.date).toLocaleDateString() : 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <span className="text-sm text-gray-500">Description</span>
                      <div className="mt-2 p-4 bg-gray-50 rounded-xl">
                        <p className="text-gray-700 leading-relaxed">{complaint?.description || 'No description provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Updates Timeline */}
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Updates</h3>
                    
                    <div className="space-y-6">
                      {complaint.updates && complaint.updates.length > 0 ? (
                        complaint.updates.map((update, index) => (
                          <motion.div
                            key={update.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex space-x-4"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 bg-civisafe-500 rounded-full mt-2"></div>
                              {index < complaint.updates.length - 1 && (
                                <div className="w-0.5 h-12 bg-gray-200 mx-auto mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">
                                  {update.status?.replace('_', ' ')?.toUpperCase() || 'UNKNOWN'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {update.date ? new Date(update.date).toLocaleDateString() : 'Unknown date'}
                                </span>
                              </div>
                              <p className="text-gray-600">{update.message}</p>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No updates available yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                  {/* Security Status */}
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Security Status</h3>
                    <div className="space-y-3">
                      {securityFeatures && securityFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <feature.icon className="h-5 w-5 text-civisafe-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {feature.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-600 font-medium">
                              {feature.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Attached Files */}
                  {complaint.files && complaint.files.length > 0 ? (
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Attached Images</h3>
                      <div className="space-y-4">
                        {complaint.files.map((file, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-50 rounded-lg overflow-hidden"
                          >
                            {file.type && file.type.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={`/uploads/${file.filename}`}
                                  alt={`Attached image ${index + 1}`}
                                  className="w-full h-48 object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden absolute inset-0 bg-gray-100 flex items-center justify-center">
                                  <div className="text-center">
                                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Image not available</p>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">{file.originalname || file.name}</p>
                                      <p className="text-xs text-gray-500">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}</p>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => window.open(`/uploads/${file.filename}`, '_blank')}
                                      className="p-2 text-gray-500 hover:text-civisafe-600 transition-colors"
                                      title="View full size"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">{file.originalname || file.name}</p>
                                    <p className="text-xs text-gray-500">{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}</p>
                                  </div>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => window.open(`/uploads/${file.filename}`, '_blank')}
                                  className="p-2 text-gray-500 hover:text-civisafe-600 transition-colors"
                                  title="Download file"
                                >
                                  <Download className="h-4 w-4" />
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Attached Images</h3>
                      <div className="text-center py-4">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No images attached</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Support */}
                  <div className="bg-gradient-to-r from-civisafe-50 to-blue-50 rounded-3xl p-6 border border-civisafe-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
                    <p className="text-gray-600 mb-4">
                      Have questions about your complaint? Contact our support team.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn btn-primary"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </motion.button>
                  </div>

                  {/* Admin Messages */}
                  {complaint.messages && complaint.messages.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">Messages from Admin</h3>
                      <div className="space-y-4">
                        {complaint.messages.map((msg, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <MessageCircle className="h-6 w-6 text-civisafe-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-700 font-semibold mb-1">{msg.sentBy === 'admin' ? 'Admin' : 'You'}</div>
                              <div className="text-gray-800 bg-gray-50 rounded-lg p-3 mb-1">{msg.text}</div>
                              <div className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setComplaint(null);
                    setTrackingToken('');
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Track Another Complaint
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackComplaint; 