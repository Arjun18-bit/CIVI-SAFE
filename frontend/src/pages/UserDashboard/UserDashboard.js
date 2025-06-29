import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Calendar,
  MapPin,
  Shield,
  Copy,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedToken, setCopiedToken] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserComplaints();
  }, [user, navigate]);

  const fetchUserComplaints = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setComplaints(data.complaints);
      } else {
        setError(data.message || 'Failed to fetch complaints');
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in-progress': return AlertCircle;
      case 'resolved': return CheckCircle;
      case 'rejected': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.trackingToken.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const refreshComplaints = () => {
    fetchUserComplaints();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-civisafe-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="container-responsive max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="p-3 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/submit')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <div className="p-3 bg-civisafe-100 rounded-xl">
                <FileText className="h-8 w-8 text-civisafe-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">
                  {complaints.filter(c => c.status === 'in-progress').length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshComplaints}
            className="btn btn-secondary"
          >
            Refresh
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          {filteredComplaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {complaints.length === 0 ? 'No complaints yet' : 'No complaints found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {complaints.length === 0 
                  ? 'Submit your first complaint to get started'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {complaints.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/submit')}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit First Complaint
                </motion.button>
              )}
            </motion.div>
          ) : (
            filteredComplaints.map((complaint, index) => {
              const StatusIcon = getStatusIcon(complaint.status);
              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => { setSelectedComplaint(complaint); setShowComplaintModal(true); }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
                          <StatusIcon className="h-4 w-4 mr-2" />
                          {complaint.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {complaint.category.replace('_', ' ').toUpperCase()}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {complaint.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        {complaint.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{complaint.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Tracking Token</p>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono text-civisafe-600">
                            {complaint.trackingToken}
                          </code>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); copyToken(complaint.trackingToken); }}
                            className="p-1 text-gray-500 hover:text-civisafe-600 transition-colors"
                          >
                            {copiedToken === complaint.trackingToken ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/track?token=${complaint.trackingToken}`); }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Complaint Detail Modal */}
      <AnimatePresence>
        {showComplaintModal && selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowComplaintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Complaint Details</h3>
                <button
                  onClick={() => setShowComplaintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tracking Token</h4>
                  <p className="text-sm text-gray-600">{selectedComplaint.trackingToken}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-700">
                    {selectedComplaint.category?.replace('_', ' ')}
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-700">
                    {selectedComplaint.status}
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Priority</h4>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-700">
                    {selectedComplaint.priority}
                  </span>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>
                {selectedComplaint.location && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                    <p className="text-sm text-gray-600">{selectedComplaint.location}</p>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedComplaint.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-sm text-gray-700 shadow-sm">
          <div className="font-semibold mb-2">Test Login Credentials</div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="pr-2">Role</th>
                <th className="pr-2">Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Admin</td><td><code>admin</code></td><td><code>admin123</code></td></tr>
              <tr><td>NGO</td><td><code>ngo1</code></td><td><code>ngo123</code></td></tr>
              <tr><td>Police</td><td><code>police</code></td><td><code>police123</code></td></tr>
              <tr><td>User</td><td><code>citizen</code></td><td><code>citizen123</code></td></tr>
              <tr><td>Student</td><td><code>student</code></td><td><code>student123</code></td></tr>
              <tr><td>User</td><td><code>john_doe</code></td><td><code>password123</code></td></tr>
              <tr><td>Student</td><td><code>jane_smith</code></td><td><code>password123</code></td></tr>
              <tr><td>Faculty</td><td><code>mike_wilson</code></td><td><code>password123</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 