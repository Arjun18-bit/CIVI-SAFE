import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Shield, 
  Home, 
  FileText, 
  Eye, 
  MessageCircle, 
  BookOpen, 
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Submit Complaint', href: '/submit', icon: FileText },
    { name: 'Track Complaint', href: '/track', icon: Eye },
    { name: 'Chat Support', href: '/chat', icon: MessageCircle },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Admin', href: '/admin', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-civisafe-400/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            y: [0, -30, 0]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-red-500/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            rotate: 180,
            x: [0, 20, 0]
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            x: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/15 to-cyan-500/15 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
            : 'bg-transparent'
        }`}
      >
        <nav className="container-responsive">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <Link to="/" className="flex items-center space-x-3 group">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="p-2 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-xl shadow-lg"
                >
                  <Shield className="h-8 w-8 text-white" />
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-civisafe-600 to-purple-600 bg-clip-text text-transparent">
                    CiviSafe
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Secure • Anonymous • Trusted</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 group ${
                      isActive(item.href)
                        ? 'bg-civisafe-100 text-civisafe-700 shadow-md'
                        : 'text-gray-600 hover:text-civisafe-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-300 ${
                      isActive(item.href) ? 'text-civisafe-600' : 'group-hover:scale-110'
                    }`} />
                    <span>{item.name}</span>
                    {isActive(item.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-civisafe-100 rounded-lg -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-civisafe-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 hover:text-civisafe-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                />
              </motion.button>

              {/* Dark mode toggle */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 hover:text-civisafe-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>

              {/* User menu or Auth buttons */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-civisafe-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <User className="h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-gradient-to-r from-civisafe-500 to-purple-600 text-white rounded-lg hover:from-civisafe-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                    >
                      Login
                    </motion.button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-civisafe-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50"
            >
              <div className="container-responsive py-4">
                <div className="space-y-2">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                          isActive(item.href)
                            ? 'bg-civisafe-100 text-civisafe-700'
                            : 'text-gray-600 hover:text-civisafe-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile auth buttons */}
                  {!user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      className="pt-4 border-t border-gray-200"
                    >
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-civisafe-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-300"
                      >
                        <User className="h-5 w-5" />
                        <span>Login</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        {children}
      </main>

      {/* Creative Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-gray-900 via-civisafe-900 to-purple-900 text-white overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 30, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-10 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              y: [0, -20, 0]
            }}
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute bottom-10 right-10 w-16 h-16 bg-white/5 rounded-full blur-lg"
          />
        </div>

        <div className="container-responsive relative z-10">
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 mb-6"
                >
                  <div className="p-3 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">CiviSafe</h3>
                    <p className="text-civisafe-200">Secure • Anonymous • Trusted</p>
                  </div>
                </motion.div>
                <p className="text-gray-300 mb-6 max-w-md">
                  Empowering communities through secure, anonymous reporting and support systems. 
                  Your privacy is our commitment.
                </p>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                  >
                    <Zap className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
                  >
                    <Heart className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  {['Submit Complaint', 'Track Complaint', 'Chat Support', 'Resources'].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/${item.toLowerCase().replace(' ', '')}`}
                        className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2 group"
                      >
                        <div className="w-1 h-1 bg-civisafe-400 rounded-full group-hover:scale-150 transition-transform duration-300" />
                        <span>{item}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-3">
                  {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link
                        to="#"
                        className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center space-x-2 group"
                      >
                        <div className="w-1 h-1 bg-civisafe-400 rounded-full group-hover:scale-150 transition-transform duration-300" />
                        <span>{item}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
            >
              <p className="text-gray-400 text-sm">
                © 2024 CiviSafe. All rights reserved. Built with ❤️ for social impact.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">Security Level:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <motion.div
                      key={level}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: level * 0.1 }}
                      className="w-2 h-2 bg-civisafe-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Layout; 