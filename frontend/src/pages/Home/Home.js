import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  MessageCircle, 
  FileText, 
  Users, 
  Lock, 
  Eye,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/complaints/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Anonymous Reporting',
      description: 'Submit complaints without revealing your identity. Your privacy is our top priority.',
      color: 'text-red-500'
    },
    {
      icon: MessageCircle,
      title: 'Secure Chat Support',
      description: 'Communicate directly with support staff through encrypted chat channels.',
      color: 'text-blue-500'
    },
    {
      icon: FileText,
      title: 'Document Vault',
      description: 'Safely upload and store evidence with military-grade encryption.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Connect with admins, NGOs, and legal teams based on your needs.',
      color: 'text-purple-500'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption for maximum security.',
      color: 'text-orange-500'
    },
    {
      icon: Eye,
      title: 'Token-Based Tracking',
      description: 'Track your complaint progress using secure, anonymous tokens.',
      color: 'text-indigo-500'
    }
  ];

  const benefits = [
    '100% Anonymous - No personal information required',
    'Military-grade AES-256 encryption',
    'Real-time chat with support staff',
    'Document upload with secure storage',
    'Token-based complaint tracking',
    'Role-based support system',
    'Educational resources and legal guidance',
    '24/7 system availability'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-civisafe-600 to-civisafe-800 opacity-10"></div>
        <div className="relative container-responsive py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Voice,{' '}
              <span className="civisafe-gradient-text">Protected</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Submit complaints anonymously with military-grade encryption. 
              Connect with support teams through secure channels. 
              Your privacy is our commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit"
                className="btn btn-primary btn-lg group"
              >
                Submit Complaint
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/track"
                className="btn btn-outline btn-lg"
              >
                Track Complaint
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Making a Difference
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how CiviSafe is helping communities report issues safely and effectively
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-6 rounded-lg bg-gray-50 animate-pulse"
                >
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </motion.div>
              ))
            ) : (
              <>
                <motion.div variants={itemVariants} className="text-center p-6">
                  <div className="text-3xl font-bold civisafe-gradient-text mb-2">
                    {stats?.total_complaints || 0}
                  </div>
                  <div className="text-gray-600">Total Complaints</div>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats?.resolved_complaints || 0}
                  </div>
                  <div className="text-gray-600">Resolved</div>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats?.complaints_last_30_days || 0}
                  </div>
                  <div className="text-gray-600">This Month</div>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center p-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {stats?.pending_complaints || 0}
                  </div>
                  <div className="text-gray-600">In Progress</div>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CiviSafe?
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Built with privacy, security, and user experience in mind. 
              Every feature is designed to protect your identity while ensuring your voice is heard.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card p-6 hover:shadow-medium transition-all duration-300 group"
              >
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Complete Privacy Protection
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                CiviSafe ensures your complete anonymity while providing powerful tools 
                for reporting and tracking complaints. No personal information is ever 
                required or stored.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="card p-8 bg-gradient-to-br from-civisafe-50 to-blue-50 border-civisafe-200">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-civisafe-100 rounded-lg mr-4">
                    <Shield className="h-8 w-8 text-civisafe-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Security First
                    </h3>
                    <p className="text-gray-600">Military-grade protection</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">AES-256 Encryption</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Anonymous Tracking</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">Secure Chat</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-gray-700">File Protection</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-civisafe-600 to-civisafe-800">
        <div className="container-responsive text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl text-civisafe-100 mb-8 max-w-2xl mx-auto">
              Join thousands of others who trust CiviSafe to report issues safely and anonymously. 
              Your privacy is guaranteed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit"
                className="btn bg-white text-civisafe-600 hover:bg-gray-100 btn-lg group"
              >
                Submit Your First Complaint
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/resources"
                className="btn btn-outline border-white text-white hover:bg-white hover:text-civisafe-600 btn-lg"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">
              Trusted by Communities
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <Award className="h-12 w-12 text-civisafe-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-gray-600">Anonymous</div>
              </div>
              <div className="flex flex-col items-center">
                <Lock className="h-12 w-12 text-civisafe-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">AES-256</div>
                <div className="text-gray-600">Encryption</div>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-12 w-12 text-civisafe-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="h-12 w-12 text-civisafe-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 