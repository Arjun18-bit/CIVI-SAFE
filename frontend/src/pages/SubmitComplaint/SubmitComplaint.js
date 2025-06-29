import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Copy,
  Target,
  Users,
  MessageCircle,
  Globe,
  Upload,
  X,
  Image as ImageIcon,
  Eye
} from 'lucide-react';

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
    date: '',
    files: [],
    priority: 'medium',
    anonymous: true,
    contactEmail: '',
    contactPhone: '',
    latitude: '',
    longitude: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState('');
  const [copied, setCopied] = useState(false);

  const steps = [
    { id: 1, title: 'Category', icon: Target },
    { id: 2, title: 'Details', icon: FileText },
    { id: 3, title: 'Review', icon: ImageIcon },
    { id: 4, title: 'Submit', icon: Shield }
  ];

  const categories = [
    { id: 'harassment', name: 'Harassment', icon: AlertCircle, color: 'text-red-500', description: 'Bullying, threats, or unwanted behavior' },
    { id: 'discrimination', name: 'Discrimination', icon: Users, color: 'text-orange-500', description: 'Bias based on race, gender, religion, etc.' },
    { id: 'bullying', name: 'Bullying', icon: MessageCircle, color: 'text-yellow-500', description: 'Repeated harmful behavior or intimidation' },
    { id: 'safety', name: 'Safety Concern', icon: Shield, color: 'text-green-500', description: 'Security issues or dangerous situations' },
    { id: 'academic', name: 'Academic Issue', icon: FileText, color: 'text-blue-500', description: 'Problems with courses, grades, or faculty' },
    { id: 'other', name: 'Other', icon: Globe, color: 'text-purple-500', description: 'Any other concerns not listed above' }
  ];

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + formData.files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...imageFiles]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('User not logged in');
      setIsSubmitting(false);
      return;
    }
    
    console.log('Submitting complaint with token:', token.substring(0, 20) + '...');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('priority', formData.priority);
      if (formData.latitude) formDataToSend.append('latitude', formData.latitude);
      if (formData.longitude) formDataToSend.append('longitude', formData.longitude);
      
      // Add files
      formData.files.forEach((file, index) => {
        formDataToSend.append('files', file);
      });

      console.log('Sending complaint data:', {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        date: formData.date,
        priority: formData.priority,
        filesCount: formData.files.length
      });

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setTrackingToken(data.trackingToken);
        setSubmitted(true);
        console.log('Complaint submitted successfully with token:', data.trackingToken);
      } else {
        console.error('Complaint submission failed:', data.message);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(trackingToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Complaint Submitted Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your complaint has been securely submitted. Use the tracking token below to monitor progress.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your Tracking Token:</p>
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <code className="text-lg font-mono text-civisafe-600">{trackingToken}</code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToken}
                  className="p-2 text-gray-500 hover:text-civisafe-600 transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/track?token=${trackingToken}`)}
                className="w-full bg-civisafe-600 text-white py-3 rounded-xl font-semibold hover:bg-civisafe-700 transition-colors"
              >
                Track Your Complaint
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSubmitted(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Submit Another Complaint
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
      <div className="container-responsive max-w-4xl">
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
              <Shield className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Submit Your{' '}
            <span className="bg-gradient-to-r from-civisafe-600 to-purple-600 bg-clip-text text-transparent">
              Complaint
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your voice matters. Submit your complaint anonymously and securely. 
            We're here to help you.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-civisafe-600 border-civisafe-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                  {currentStep > step.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </motion.div>
                  )}
                </motion.div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-civisafe-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <span
                key={step.id}
                className={`text-sm font-medium transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-civisafe-600' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Category</h2>
                  <p className="text-gray-600">Choose the category that best describes your complaint</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                      className={`
                        relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                        ${formData.category === category.id
                          ? 'border-civisafe-600 bg-civisafe-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-civisafe-300 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          formData.category === category.id ? 'bg-civisafe-600' : 'bg-gray-100'
                        }`}>
                          <category.icon className={`h-6 w-6 ${
                            formData.category === category.id ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold ${
                            formData.category === category.id ? 'text-civisafe-600' : 'text-gray-900'
                          }`}>
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Details</h2>
                  <p className="text-gray-600">Provide detailed information about your complaint</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all"
                      placeholder="Brief title for your complaint"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Incident *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all resize-none"
                      placeholder="Provide detailed description of the issue..."
                    />
                  </div>

                  {/* Image Upload Section - Moved below description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-civisafe-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload images
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG up to 5MB each (max 5 images)
                        </p>
                      </label>
                    </div>

                    {/* Preview Images */}
                    {formData.files.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-600">Uploaded Images ({formData.files.length}/5)</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {formData.files.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all"
                      placeholder="Where did this incident occur?"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Complaint</h2>
                  <p className="text-gray-600">Review and submit your complaint securely</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Complaint Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">
                        {categories.find(c => c.id === formData.category)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-medium text-gray-900">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Incident</p>
                      <p className="font-medium text-gray-900">{formData.date}</p>
                    </div>
                    {formData.location && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-900">{formData.location}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium text-gray-900">{formData.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Images</p>
                      <p className="font-medium text-gray-900">{formData.files.length} image(s) attached</p>
                    </div>
                  </div>

                  {/* Image Preview in Review */}
                  {formData.files.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Attached Images:</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                        {formData.files.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Privacy & Security</p>
                      <p className="text-sm text-blue-700">
                        Your complaint will be submitted anonymously. All data is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="h-5 w-5 inline mr-2" />
              Previous
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentStep === steps.length ? handleSubmit : nextStep}
              disabled={isSubmitting}
              className="px-8 py-3 bg-civisafe-600 text-white rounded-xl font-semibold hover:bg-civisafe-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : currentStep === steps.length ? (
                <>
                  <FileText className="h-5 w-5 inline mr-2" />
                  Submit Complaint
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-5 w-5 inline ml-2" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitComplaint;