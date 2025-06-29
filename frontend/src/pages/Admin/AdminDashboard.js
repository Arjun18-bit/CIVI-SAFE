import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Eye, LogOut, Calendar, MapPin, Shield, Copy, RefreshCw, Clock, AlertTriangle, CheckCircle, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [filters, setFilters] = useState({ 
    category: 'all', 
    status: 'all', 
    priority: 'all',
    search: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
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
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }

      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchComplaints(), fetchStats()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchComplaints, fetchStats]);

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    fetchComplaints();
    fetchStats();
  }, [user, navigate]);

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, refreshData]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const updateComplaintStatus = async (complaintId, newStatus, message, priority, adminNotes) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, message, priority, adminNotes })
      });
      const data = await response.json();
      if (data.success) {
        setAdminMessage('');
        if (selectedComplaint && selectedComplaint._id === complaintId) {
          setSelectedComplaint(prev => ({
            ...prev,
            status: newStatus,
            priority: priority,
            adminNotes: adminNotes,
            messages: message && message.trim() ? [
              ...(prev.messages || []),
              {
                text: message,
                sentBy: 'admin',
                timestamp: new Date()
              }
            ] : prev.messages
          }));
        }
        await fetchComplaints();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  };

  const updateAdminNotes = async (complaintId, adminNotes) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: selectedComplaint.status, 
          adminNotes: adminNotes,
          priority: selectedComplaint.priority
        })
      });
      const data = await response.json();
      if (data.success) {
        setSelectedComplaint(prev => ({
          ...prev,
          adminNotes: adminNotes
        }));
        await fetchComplaints();
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
    }
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 2000);
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
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
      case 'in-progress': return AlertTriangle;
      case 'resolved': return CheckCircle;
      case 'rejected': return AlertTriangle;
      default: return Clock;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         complaint.category.toLowerCase().includes(filters.search.toLowerCase()) ||
                         complaint.trackingToken.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || complaint.status === filters.status;
    const matchesCategory = filters.category === 'all' || complaint.category === filters.category;
    const matchesPriority = filters.priority === 'all' || complaint.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-civisafe-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={refreshing}
                className="btn btn-primary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
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
                <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
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
                  {stats.pending || 0}
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
                  {stats.inProgress || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-blue-600" />
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
                  {stats.resolved || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>
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
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="form-input pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="form-input"
              >
                <option value="all">All Categories</option>
                <option value="harassment">Harassment</option>
                <option value="discrimination">Discrimination</option>
                <option value="bullying">Bullying</option>
                <option value="cyberbullying">Cyberbullying</option>
                <option value="sexual_harassment">Sexual Harassment</option>
                <option value="safety">Safety</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {complaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No complaints yet
              </h3>
              <p className="text-gray-600">
                Complaints will appear here once users submit them
              </p>
            </motion.div>
          ) : filteredComplaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No complaints found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          ) : (
            filteredComplaints.map((complaint, index) => {
              const StatusIcon = getStatusIcon(complaint.status);
              return (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openComplaintModal(complaint)}
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
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={complaint.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateComplaintStatus(complaint._id, e.target.value, adminMessage, complaint.priority, complaint.adminNotes);
                          }}
                          className="form-input form-input-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); openComplaintModal(complaint); }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
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
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6">
                  {/* Urgent Priority Alert */}
                  {selectedComplaint.priority === 'urgent' && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-red-100 border border-red-300 shadow animate-pulse"
                    >
                      <AlertTriangle className="text-red-500 h-6 w-6 animate-bounce" />
                      <span className="text-red-700 font-semibold text-base">This complaint is marked as <span className="uppercase">URGENT</span>! Immediate attention required.</span>
                    </motion.div>
                  )}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-700">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      Token: {selectedComplaint.trackingToken}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border bg-blue-100 text-blue-700">
                      <Shield className="h-4 w-4 mr-1 text-blue-400" />
                      {selectedComplaint.category?.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedComplaint.status)}`}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {selectedComplaint.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${selectedComplaint.priority === 'urgent' ? 'bg-red-200 text-red-800 border-red-400 animate-pulse' : selectedComplaint.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' : selectedComplaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-green-100 text-green-800 border-green-300'}`}>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {selectedComplaint.priority}
                    </span>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" /> Description
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm">
                        {selectedComplaint.description}
                      </p>
                    </div>
                    {selectedComplaint.location && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-gray-400" /> Location
                        </h4>
                        <p className="text-sm text-gray-600">{selectedComplaint.location}</p>
                      </div>
                    )}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-400" /> Created
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedComplaint.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-gray-400" /> Last Updated
                        </h4>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedComplaint.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Update Status & Message</h4>
                    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                      <select
                        value={selectedComplaint.status}
                        onChange={e => updateComplaintStatus(selectedComplaint._id, e.target.value, adminMessage, selectedComplaint.priority, selectedComplaint.adminNotes)}
                        className="form-input form-input-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Message to user (optional)"
                        value={adminMessage}
                        onChange={e => setAdminMessage(e.target.value)}
                        className="form-input form-input-sm flex-1"
                        maxLength={300}
                      />
                      <button
                        onClick={() => updateComplaintStatus(selectedComplaint._id, selectedComplaint.status, adminMessage, selectedComplaint.priority, selectedComplaint.adminNotes)}
                        className="btn btn-primary btn-sm"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Update Priority</h4>
                    <select
                      value={selectedComplaint.priority}
                      onChange={e => updateComplaintStatus(selectedComplaint._id, selectedComplaint.status, adminMessage, e.target.value, selectedComplaint.adminNotes)}
                      className="form-input form-input-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                    <textarea
                      value={selectedComplaint.adminNotes || ''}
                      onChange={e => {
                        const newNotes = e.target.value;
                        setSelectedComplaint(prev => ({
                          ...prev,
                          adminNotes: newNotes
                        }));
                        updateAdminNotes(selectedComplaint._id, newNotes);
                      }}
                      className="form-input form-input-sm w-full"
                      rows={2}
                      placeholder="Add internal notes (not visible to user)"
                    />
                  </div>
                  {selectedComplaint.messages && selectedComplaint.messages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Messages</h4>
                      <ul className="space-y-2">
                        {selectedComplaint.messages.map((msg, idx) => (
                          <li key={idx} className="bg-gray-50 p-2 rounded-lg text-sm">
                            <span className="font-semibold mr-2">{msg.sentBy === 'admin' ? 'Admin' : 'User'}:</span>
                            {msg.text}
                            <span className="ml-2 text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Attached Images */}
                  {selectedComplaint.files && selectedComplaint.files.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Attached Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedComplaint.files.map((file, index) => (
                          <div key={index} className="relative group">
                            {file.type && file.type.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={`/uploads/${file.filename}`}
                                  alt={`Attached image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                                  <div className="text-center">
                                    <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">Image not available</p>
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => window.open(`/uploads/${file.filename}`, '_blank')}
                                    className="opacity-0 group-hover:opacity-100 bg-white rounded-full p-2 shadow-lg transition-opacity"
                                    title="View full size"
                                  >
                                    <Eye className="h-4 w-4 text-gray-700" />
                                  </motion.button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <FileText className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                  <p className="text-xs text-gray-500">{file.originalname || file.name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {selectedComplaint.files.length} image(s) attached
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;