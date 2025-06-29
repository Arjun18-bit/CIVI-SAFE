import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Smile, 
  Paperclip, 
  Image, 
  File, 
  X, 
  Check, 
  CheckCheck, 
  Clock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  MoreVertical,
  Download,
  Trash2,
  Copy,
  AlertCircle,
  Shield,
  Lock,
  Timer,
  MessageCircle,
  User,
  Bot
} from 'lucide-react';

// Custom emoji picker data
const EMOJI_CATEGORIES = {
  '😊': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  '👍': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌'],
  '🎉': ['🎉', '🎊', '🎈', '🎂', '🎁', '🎄', '🎃', '🎗️', '🎟️', '🎫', '🎠', '🎡', '🎢', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼'],
  '⚡': ['⚡', '🔥', '💥', '✨', '⭐', '🌟', '💫', '🌙', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '💧', '💦']
};

// Smarter mock auto-responses
const BOT_RESPONSES = [
  {
    keywords: ['track', 'status', 'progress'],
    response: "You can track your complaint using the tracking token provided after submission. Would you like to know how?",
    quickReplies: ["How do I track my complaint?", "Show me an example."]
  },
  {
    keywords: ['evidence', 'attach', 'file', 'photo', 'image'],
    response: "You can attach evidence by clicking the paperclip icon below. Supported formats: images, PDFs, and documents.",
    quickReplies: ["How do I upload evidence?", "What file types are allowed?"]
  },
  {
    keywords: ['anonymous', 'privacy', 'secure'],
    response: "Your privacy is our top priority. All chats are encrypted and your identity is protected.",
    quickReplies: ["How is my data protected?", "Can I stay anonymous?"]
  },
  {
    keywords: ['help', 'support', 'assist'],
    response: "I'm here to support you. You can ask about complaint status, privacy, or how to use this chat.",
    quickReplies: ["How do I submit a complaint?", "What happens after I submit?"]
  },
  {
    keywords: ['thanks', 'thank you', 'appreciate'],
    response: "You're welcome! If you have more questions, feel free to ask.",
    quickReplies: ["How else can you help me?"]
  },
  // Default fallback
  {
    keywords: [],
    response: "Thank you for that information. I'm documenting everything carefully. Is there anything else you'd like to add?",
    quickReplies: ["What happens next?", "How long does it take to resolve?"]
  }
];

// Mock messages data
const MOCK_MESSAGES = [
  {
    id: 1,
    text: "Hello! I'm here to help you with your complaint. How can I assist you today?",
    sender: 'support',
    timestamp: new Date(Date.now() - 300000),
    status: 'read',
    reactions: { '👍': 1 }
  },
  {
    id: 2,
    text: "Hi, I submitted a complaint about harassment in my workplace. I'm feeling really anxious about this.",
    sender: 'user',
    timestamp: new Date(Date.now() - 240000),
    status: 'read',
    reactions: { '❤️': 1 }
  },
  {
    id: 3,
    text: "I understand this is a difficult situation. You've taken the right step by reporting it. Can you tell me more about what happened?",
    sender: 'support',
    timestamp: new Date(Date.now() - 180000),
    status: 'read'
  },
  {
    id: 4,
    text: "It started about 2 weeks ago. A colleague has been making inappropriate comments and following me around the office.",
    sender: 'user',
    timestamp: new Date(Date.now() - 120000),
    status: 'read',
    attachments: [
      { id: 1, name: 'evidence.pdf', type: 'file', size: '2.4 MB' }
    ]
  },
  {
    id: 5,
    text: "Thank you for sharing this information. I can see you've also attached some evidence. This will help us investigate properly.",
    sender: 'support',
    timestamp: new Date(Date.now() - 60000),
    status: 'delivered'
  }
];

const Chat = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [messageTTL, setMessageTTL] = useState(7); // days
  const [quickReplies, setQuickReplies] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Simulate typing indicator and smarter auto-response
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      // Find a relevant bot response
      const userMsg = messages[messages.length - 1].text.toLowerCase();
      let found = BOT_RESPONSES.find(r => r.keywords.some(k => userMsg.includes(k)));
      if (!found) found = BOT_RESPONSES[BOT_RESPONSES.length - 1]; // fallback
      setIsTyping(true);
      // Random delay between 1.2s and 2.5s
      const delay = 1200 + Math.random() * 1300;
      const timer = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: found.response,
            sender: 'support',
            timestamp: new Date(),
            status: 'sent'
          }
        ]);
        setQuickReplies(found.quickReplies || []);
      }, delay);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedFiles([]);
    setShowEmojiPicker(false);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);

    // Simulate message read
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      );
    }, 3000);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addReaction = (messageId, emoji) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      })
    );
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const fileData = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      file: file
    }));
    setSelectedFiles(prev => [...prev, ...fileData]);
  };

  const removeFile = (fileId) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-civisafe-600" />;
      case 'expired': return <Clock className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickReply = (reply) => {
    setNewMessage(reply);
    setQuickReplies([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-civisafe-50 via-blue-50 to-purple-50 py-8">
      <div className="container-responsive max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-r from-civisafe-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Secure{' '}
            <span className="bg-gradient-to-r from-civisafe-600 to-purple-600 bg-clip-text text-transparent">
              Chat Support
            </span>
          </h1>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with our support team securely and anonymously. 
            Your privacy is protected with end-to-end encryption.
          </p>
        </motion.div>

        {/* Privacy Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-civisafe-600" />
              <span className="font-medium text-gray-700">Privacy Mode</span>
            </div>
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacyMode ? 'bg-civisafe-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacyMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Timer className="h-4 w-4" />
            <span>Messages expire in {messageTTL} days</span>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-civisafe-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Support Team</h3>
                  <p className="text-sm text-civisafe-100">
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isTyping && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex space-x-1"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                )}
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`relative p-4 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-civisafe-500 to-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.text && (
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      )}
                      
                      {/* Attachments */}
                      {message.attachments && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg"
                            >
                              {attachment.type === 'image' ? (
                                <Image className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                              <span className="text-xs flex-1 truncate">{attachment.name}</span>
                              <span className="text-xs opacity-75">{attachment.size}</span>
                              <button className="p-1 hover:bg-white/20 rounded">
                                <Download className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reactions */}
                      {message.reactions && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(message.reactions).map(([emoji, count]) => (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addReaction(message.id, emoji)}
                              className="px-2 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                            >
                              {emoji} {count}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      
                      {/* Message Status */}
                      <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'order-1 ml-2' : 'order-2 mr-2'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-5 w-5 text-civisafe-600" />
                    ) : (
                      <Bot className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Quick Replies */}
            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(qr)}
                    className="px-3 py-1 bg-civisafe-100 text-civisafe-700 rounded-full text-xs hover:bg-civisafe-200 transition"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 p-2 bg-civisafe-50 rounded-lg"
                  >
                    {file.type === 'image' ? (
                      <Image className="h-4 w-4 text-civisafe-600" />
                    ) : (
                      <File className="h-4 w-4 text-civisafe-600" />
                    )}
                    <span className="text-sm text-civisafe-700">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-civisafe-100 rounded"
                    >
                      <X className="h-3 w-3 text-civisafe-600" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-3">
              {/* Emoji Picker */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 text-gray-500 hover:text-civisafe-600 hover:bg-civisafe-50 rounded-xl transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </motion.button>
                
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50"
                    >
                      <div className="grid grid-cols-8 gap-2">
                        {Object.values(EMOJI_CATEGORIES).flat().map((emoji, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-lg transition-colors"
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* File Attachment */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-civisafe-600 hover:bg-civisafe-50 rounded-xl transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </motion.button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* Voice Input */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceInput}
                className={`p-3 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'text-gray-500 hover:text-civisafe-600 hover:bg-civisafe-50'
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </motion.button>

              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-civisafe-500 focus:border-transparent transition-all"
                  rows="1"
                />
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!newMessage.trim() && selectedFiles.length === 0}
                className={`p-3 rounded-xl transition-all ${
                  newMessage.trim() || selectedFiles.length > 0
                    ? 'bg-gradient-to-r from-civisafe-500 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Privacy Notice */}
            {privacyMode && (
              <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                <span>Messages will be automatically deleted after {messageTTL} days for your privacy</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 