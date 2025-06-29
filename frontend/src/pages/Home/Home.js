import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
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
  Award,
  Zap,
  Heart,
  Star,
  Sparkles,
  Globe,
  Target,
  Fingerprint,
  Key,
  Database,
  Cpu,
  Wifi,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

// Particle component for animated background
const Particle = ({ x, y, size, color, delay }) => (
  <motion.div
    className="absolute rounded-full opacity-20"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      background: color,
    }}
    animate={{
      y: [0, -100, 0],
      opacity: [0.2, 0.8, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// Floating card component
const FloatingCard = ({ children, delay = 0, direction = "up" }) => (
  <motion.div
    initial={{ opacity: 0, y: direction === "up" ? 50 : -50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ 
      y: -10,
      scale: 1.02,
      transition: { duration: 0.3 }
    }}
    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl"
  >
    {children}
  </motion.div>
);

// Animated gradient text
const GradientText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-civisafe-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient ${className}`}>
    {children}
  </span>
);

// Interactive feature card
const FeatureCard = ({ icon: Icon, title, description, color, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{
          x: isHovered ? ["0%", "100%"] : "0%",
        }}
        transition={{ duration: 0.8 }}
      />
      
      <div className="relative z-10">
        <motion.div
          className={`${color} mb-6`}
          animate={{
            rotate: isHovered ? 360 : 0,
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="h-14 w-14" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-civisafe-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
          {description}
        </p>
        
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-civisafe-400 to-purple-500"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

// Animated statistics card
const StatCard = ({ icon: Icon, value, label, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05, rotateY: 5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-civisafe-400/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
    <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className={`${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-8 w-8" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  </motion.div>
);

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
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
      description: 'Submit complaints without revealing your identity. Your privacy is our top priority with military-grade encryption.',
      color: 'text-red-500'
    },
    {
      icon: MessageCircle,
      title: 'Secure Chat Support',
      description: 'Communicate directly with support staff through encrypted chat channels with real-time messaging.',
      color: 'text-blue-500'
    },
    {
      icon: FileText,
      title: 'Document Vault',
      description: 'Safely upload and store evidence with AES-256 encryption and secure file management.',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Connect with admins, NGOs, and legal teams based on your specific needs and case type.',
      color: 'text-purple-500'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All data is encrypted using AES-256 encryption for maximum security and privacy protection.',
      color: 'text-orange-500'
    },
    {
      icon: Eye,
      title: 'Token-Based Tracking',
      description: 'Track your complaint progress using secure, anonymous tokens without revealing personal information.',
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

  const securityFeatures = [
    { icon: Fingerprint, label: 'Biometric Security', status: 'Active' },
    { icon: Key, label: '256-bit Encryption', status: 'Active' },
    { icon: Database, label: 'Secure Database', status: 'Active' },
    { icon: Cpu, label: 'AI Protection', status: 'Active' },
    { icon: Wifi, label: 'Secure Network', status: 'Active' },
    { icon: Smartphone, label: 'Mobile Security', status: 'Active' }
  ];

  // Generate particles for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`,
    delay: Math.random() * 2
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden" ref={containerRef}>
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle, index) => (
          <Particle key={index} {...particle} />
        ))}
      </div>

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-civisafe-400/30 to-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/30 to-red-500/30 rounded-full blur-2xl"
        />
        <motion.div
          style={{ y: y3 }}
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"
        />

        <div className="relative z-10 container-responsive text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Sparkles className="h-16 w-16 text-civisafe-500 mx-auto" />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Voice,{' '}
              <GradientText className="text-6xl md:text-8xl">
                Protected
              </GradientText>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Submit complaints anonymously with military-grade encryption. 
              Connect with support teams through secure channels. 
              Your privacy is our commitment.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/submit"
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-civisafe-500 to-purple-600 text-white font-semibold rounded-full text-lg shadow-2xl hover:shadow-civisafe-500/25 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Submit Complaint
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/track"
                className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-md text-civisafe-600 font-semibold rounded-full text-lg border-2 border-civisafe-200 hover:border-civisafe-300 hover:bg-white transition-all duration-300 shadow-xl"
              >
                Track Complaint
                <Eye className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8"
          >
            <FloatingCard delay={0.7}>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-green-500" />
                <span className="text-sm font-medium text-gray-700">100% Anonymous</span>
              </div>
            </FloatingCard>
            
            <FloatingCard delay={0.8}>
              <div className="flex items-center space-x-2">
                <Lock className="h-6 w-6 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">AES-256 Encrypted</span>
              </div>
            </FloatingCard>
            
            <FloatingCard delay={0.9}>
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">24/7 Available</span>
              </div>
            </FloatingCard>
          </motion.div>
        </div>
      </section>

      {/* Interactive Statistics Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Making a{' '}
              <GradientText>Difference</GradientText>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See how CiviSafe is helping communities report issues safely and effectively
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl animate-pulse"
                >
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </motion.div>
              ))
            ) : (
              <>
                <StatCard
                  icon={FileText}
                  value={stats?.total_complaints || 0}
                  label="Total Complaints"
                  color="text-civisafe-500"
                  delay={0.1}
                />
                <StatCard
                  icon={CheckCircle}
                  value={stats?.resolved_complaints || 0}
                  label="Resolved"
                  color="text-green-500"
                  delay={0.2}
                />
                <StatCard
                  icon={TrendingUp}
                  value={stats?.complaints_last_30_days || 0}
                  label="This Month"
                  color="text-blue-500"
                  delay={0.3}
                />
                <StatCard
                  icon={Clock}
                  value={stats?.pending_complaints || 0}
                  label="In Progress"
                  color="text-orange-500"
                  delay={0.4}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose{' '}
              <GradientText>CiviSafe?</GradientText>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Built with privacy, security, and user experience in mind. 
              Every feature is designed to protect your identity while ensuring your voice is heard.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Security Showcase */}
      <section className="py-24 bg-white/50 backdrop-blur-sm relative">
        <div className="container-responsive">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Complete{' '}
                <GradientText>Privacy Protection</GradientText>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                CiviSafe ensures your complete anonymity while providing powerful tools 
                for reporting and tracking complaints. No personal information is ever 
                required or stored.
              </p>
              
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-4 group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="h-7 w-7 text-green-500 mt-1 flex-shrink-0" />
                    </motion.div>
                    <span className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-civisafe-50 to-blue-50 rounded-3xl p-8 border border-civisafe-200 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-civisafe-400/10 to-purple-500/10 rounded-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-4 bg-civisafe-100 rounded-2xl mr-6"
                    >
                      <Shield className="h-10 w-10 text-civisafe-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Security First
                      </h3>
                      <p className="text-gray-600">Military-grade protection</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {securityFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
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
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-civisafe-600 via-purple-600 to-civisafe-800 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-full opacity-10"
        >
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/20 rounded-full" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/20 rounded-full" />
          <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/20 rounded-full" />
        </motion.div>

        <div className="container-responsive text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <Heart className="h-16 w-16 text-white mx-auto" />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Make Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Voice Heard?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-civisafe-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of others who trust CiviSafe to report issues safely and anonymously. 
              Your privacy is guaranteed with military-grade protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/submit"
                  className="group inline-flex items-center px-10 py-5 bg-white text-civisafe-600 font-bold rounded-full text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300"
                >
                  <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Submit Your First Complaint
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/resources"
                  className="group inline-flex items-center px-10 py-5 bg-transparent text-white font-bold rounded-full text-lg border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  <Globe className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Learn More
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Trust Indicators */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-slate-100 relative">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by{' '}
              <GradientText>Communities</GradientText>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with the highest standards of security and privacy
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Award, value: "100%", label: "Anonymous", color: "text-civisafe-600" },
              { icon: Lock, value: "AES-256", label: "Encryption", color: "text-green-600" },
              { icon: Clock, value: "24/7", label: "Available", color: "text-blue-600" },
              { icon: TrendingUp, value: "99.9%", label: "Uptime", color: "text-purple-600" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="h-16 w-16 mx-auto" />
                </motion.div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-civisafe-600 transition-colors">
                  {item.value}
                </div>
                <div className="text-gray-600 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 