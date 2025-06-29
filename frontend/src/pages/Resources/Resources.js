import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Search,
  Filter,
  Globe,
  Shield,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Heart,
  Zap,
  Sparkles,
  Target,
  Lock,
  Scale,
  Gavel,
  Award,
  Flag,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Eye,
  EyeOff,
  Bookmark,
  Share2,
  Copy,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

// Language options with flags
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
];

// Mock data for laws and rights
const LAWS_DATA = {
  en: [
    {
      id: 1,
      title: "Right to Education",
      description: "Every child has the fundamental right to free and compulsory education up to the age of 14.",
      details: "The Right to Education Act, 2009 ensures that every child between 6-14 years has the right to free and compulsory education. Schools cannot deny admission, charge fees, or hold back students.",
      category: "Education",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: 2,
      title: "Protection Against Harassment",
      description: "Laws protecting individuals from sexual harassment in workplaces and educational institutions.",
      details: "The Sexual Harassment of Women at Workplace Act, 2013 provides protection against sexual harassment and creates mechanisms for redressal of complaints.",
      category: "Safety",
      icon: Shield,
      color: "from-red-500 to-red-600"
    },
    {
      id: 3,
      title: "Right to Information",
      description: "Citizens have the right to access information from public authorities.",
      details: "The Right to Information Act, 2005 empowers citizens to seek information from public authorities, promoting transparency and accountability.",
      category: "Rights",
      icon: FileText,
      color: "from-green-500 to-green-600"
    },
    {
      id: 4,
      title: "Protection of Children",
      description: "Comprehensive laws protecting children from abuse, exploitation, and neglect.",
      details: "The Protection of Children from Sexual Offences Act, 2012 provides for protection of children from sexual assault, harassment, and pornography.",
      category: "Safety",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    }
  ],
  ta: [
    {
      id: 1,
      title: "கல்வி உரிமை",
      description: "ஒவ்வொரு குழந்தைக்கும் 14 வயது வரை இலவச மற்றும் கட்டாய கல்வி பெறும் அடிப்படை உரிமை உள்ளது.",
      details: "கல்வி உரிமை சட்டம், 2009 ஆறு முதல் 14 வயது வரையிலான ஒவ்வொரு குழந்தைக்கும் இலவச மற்றும் கட்டாய கல்வி உரிமையை உறுதி செய்கிறது.",
      category: "கல்வி",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600"
    }
  ],
  hi: [
    {
      id: 1,
      title: "शिक्षा का अधिकार",
      description: "प्रत्येक बच्चे को 14 वर्ष की आयु तक मुफ्त और अनिवार्य शिक्षा का मौलिक अधिकार है।",
      details: "शिक्षा का अधिकार अधिनियम, 2009 सुनिश्चित करता है कि 6-14 वर्ष के बीच के प्रत्येक बच्चे को मुफ्त और अनिवार्य शिक्षा का अधिकार हो।",
      category: "शिक्षा",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600"
    }
  ]
};

// Mock data for downloadable guides
const GUIDES_DATA = [
  {
    id: 1,
    title: "How to File a Complaint",
    description: "Step-by-step guide on filing complaints safely and effectively.",
    fileSize: "2.1 MB",
    downloads: 1247,
    category: "Complaints",
    preview: "This comprehensive guide covers everything you need to know about filing complaints, from gathering evidence to following up on your case.",
    icon: FileText
  },
  {
    id: 2,
    title: "Your Rights at Work",
    description: "Understanding your workplace rights and protections.",
    fileSize: "1.8 MB",
    downloads: 892,
    category: "Workplace",
    preview: "Learn about your fundamental rights in the workplace, including protection against harassment, discrimination, and unfair treatment.",
    icon: Shield
  },
  {
    id: 3,
    title: "Student Safety Guide",
    description: "Safety guidelines for students in educational institutions.",
    fileSize: "3.2 MB",
    downloads: 2156,
    category: "Education",
    preview: "Essential safety information for students, including how to recognize and report harassment, bullying, and other safety concerns.",
    icon: Users
  },
  {
    id: 4,
    title: "Legal Resources Directory",
    description: "Directory of legal aid organizations and resources.",
    fileSize: "1.5 MB",
    downloads: 567,
    category: "Legal",
    preview: "A comprehensive directory of legal aid organizations, pro bono services, and resources available to help with various legal issues.",
    icon: Scale
  }
];

// Mock data for helplines
const HELPLINES_DATA = [
  {
    id: 1,
    name: "National Commission for Women",
    phone: "7827170170",
    email: "ncw@nic.in",
    description: "Support for women facing harassment, discrimination, and violence.",
    category: "Women's Rights",
    available: "24/7",
    icon: Users
  },
  {
    id: 2,
    name: "Child Helpline",
    phone: "1098",
    email: "childline@childlineindia.org.in",
    description: "Emergency support for children in distress or danger.",
    category: "Child Protection",
    available: "24/7",
    icon: Shield
  },
  {
    id: 3,
    name: "National Human Rights Commission",
    phone: "011-23385368",
    email: "covdnhrc@nic.in",
    description: "Addressing human rights violations and providing legal support.",
    category: "Human Rights",
    available: "Mon-Fri, 9AM-6PM",
    icon: Scale
  },
  {
    id: 4,
    name: "Police Control Room",
    phone: "100",
    email: "",
    description: "Emergency police assistance and crime reporting.",
    category: "Emergency",
    available: "24/7",
    icon: Shield
  }
];

// Statistics data for infographics
const STATS_DATA = [
  { label: "Complaints Resolved", value: "2,847", icon: CheckCircle, color: "text-green-600" },
  { label: "Active Cases", value: "156", icon: Clock, color: "text-yellow-600" },
  { label: "Support Provided", value: "5,234", icon: Users, color: "text-blue-600" },
  { label: "Success Rate", value: "94%", icon: Star, color: "text-purple-600" }
];

const Resources = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [flippedCard, setFlippedCard] = useState(null);
  const [speaking, setSpeaking] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [downloadedGuides, setDownloadedGuides] = useState([]);

  const laws = LAWS_DATA[currentLanguage] || LAWS_DATA.en;
  const categories = [...new Set(laws.map(law => law.category))];

  // Filter data based on search and category
  const filteredLaws = laws.filter(law =>
    (law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     law.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedCategory || law.category === selectedCategory)
  );

  const filteredGuides = GUIDES_DATA.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHelplines = HELPLINES_DATA.filter(helpline =>
    helpline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    helpline.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Speech synthesis for voice-over
  const speak = (text, id) => {
    if ('speechSynthesis' in window) {
      if (speaking === id) {
        window.speechSynthesis.cancel();
        setSpeaking(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.9;
        utterance.onend = () => setSpeaking(null);
        window.speechSynthesis.speak(utterance);
        setSpeaking(id);
      }
    }
  };

  // Download guide simulation
  const downloadGuide = (guideId) => {
    setDownloadedGuides(prev => [...prev, guideId]);
    // Simulate download
    setTimeout(() => {
      alert('Guide downloaded successfully!');
    }, 1000);
  };

  // Copy contact info
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-civisafe-50 via-blue-50 to-purple-50 py-12">
      <div className="container-responsive max-w-7xl">
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
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Educational{' '}
            <span className="bg-gradient-to-r from-civisafe-600 to-purple-600 bg-clip-text text-transparent">
              Resources
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Access comprehensive information about your rights, laws, and available support. 
            Knowledge is your first line of defense.
          </p>

          {/* Language Selector */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className="text-gray-700 font-medium">Language:</span>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all"
              >
                <span className="text-2xl">{LANGUAGES.find(l => l.code === currentLanguage)?.flag}</span>
                <span className="font-medium text-civisafe-700">
                  {LANGUAGES.find(l => l.code === currentLanguage)?.name}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 min-w-full"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setCurrentLanguage(lang.code); setShowLanguageMenu(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-civisafe-50 text-civisafe-700 font-medium rounded-xl transition-all"
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search laws, guides, or helplines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full font-medium transition-all border ${
                  !selectedCategory 
                    ? 'bg-civisafe-600 text-white border-civisafe-600' 
                    : 'bg-white/80 text-civisafe-700 border-civisafe-200 hover:bg-civisafe-50'
                }`}
              >
                All Categories
              </motion.button>
              {categories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all border ${
                    selectedCategory === category 
                      ? 'bg-civisafe-600 text-white border-civisafe-600' 
                      : 'bg-white/80 text-civisafe-700 border-civisafe-200 hover:bg-civisafe-50'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Statistics Infographics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {STATS_DATA.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="glass p-6 rounded-2xl shadow-xl text-center"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Laws and Rights - Flip Cards */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Laws & Rights
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLaws.map((law, index) => (
              <motion.div
                key={law.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative h-80 perspective-1000"
              >
                <motion.div
                  animate={{ rotateY: flippedCard === law.id ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full h-full preserve-3d"
                >
                  {/* Front of card */}
                  <div
                    className={`absolute w-full h-full backface-hidden cursor-pointer rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br ${law.color} text-white p-6 flex flex-col justify-between`}
                    onClick={() => setFlippedCard(flippedCard === law.id ? null : law.id)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <law.icon className="h-8 w-8" />
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          {law.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{law.title}</h3>
                      <p className="text-sm opacity-90 leading-relaxed">{law.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm opacity-75">Click to learn more</span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); speak(law.title + '. ' + law.description, `law-${law.id}`); }}
                        className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                      >
                        {speaking === `law-${law.id}` ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Back of card */}
                  <div
                    className={`absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{law.title}</h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFlippedCard(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{law.details}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); speak(law.details, `law-detail-${law.id}`); }}
                        className="flex items-center space-x-2 px-4 py-2 bg-civisafe-100 text-civisafe-700 rounded-lg hover:bg-civisafe-200 transition-colors"
                      >
                        {speaking === `law-detail-${law.id}` ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        <span className="text-sm font-medium">Listen</span>
                      </motion.button>
                      
                      <span className="text-sm text-gray-500">Tap to flip back</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Downloadable Guides */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Downloadable Guides
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredGuides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass p-6 rounded-2xl shadow-xl border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-civisafe-100 rounded-xl">
                    <guide.icon className="h-8 w-8 text-civisafe-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
                      <span className="text-sm text-gray-500">{guide.category}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{guide.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{guide.preview}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{guide.fileSize}</span>
                        <span>{guide.downloads} downloads</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => downloadGuide(guide.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-civisafe-600 text-white rounded-lg hover:bg-civisafe-700 transition-colors"
                      >
                        {downloadedGuides.includes(guide.id) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {downloadedGuides.includes(guide.id) ? 'Downloaded' : 'Download'}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Helpline Directory */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
          >
            Helpline Directory
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHelplines.map((helpline, index) => (
              <motion.div
                key={helpline.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass p-6 rounded-2xl shadow-xl border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-civisafe-100 rounded-xl">
                    <helpline.icon className="h-8 w-8 text-civisafe-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{helpline.name}</h3>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {helpline.available}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{helpline.description}</p>
                    
                    <div className="space-y-2">
                      {helpline.phone && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-civisafe-600" />
                            <span className="font-medium">{helpline.phone}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(helpline.phone)}
                            className="p-1 text-gray-500 hover:text-civisafe-600"
                          >
                            <Copy className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}
                      
                      {helpline.email && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-civisafe-600" />
                            <span className="font-medium">{helpline.email}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(helpline.email)}
                            className="p-1 text-gray-500 hover:text-civisafe-600"
                          >
                            <Copy className="h-4 w-4" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="glass p-8 rounded-3xl shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Immediate Help?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you're in immediate danger or need urgent assistance, 
              don't hesitate to contact emergency services or use our chat support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Emergency: 100
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-civisafe-600 text-white rounded-xl font-semibold hover:bg-civisafe-700 transition-colors"
              >
                Chat Support
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources; 