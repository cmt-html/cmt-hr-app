"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Megaphone, 
  MessageSquare, 
  Bot, 
  ThumbsUp, 
  Send, 
  Plus, 
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EmployeeExperience = () => {
  const { user, isAdmin, isHR } = useAuth();
  
  // Tabs: 'ANNOUNCEMENTS' | 'TICKETS' | 'AI_CHATBOT'
  const [activeTab, setActiveTab] = useState('ANNOUNCEMENTS');

  // Common State
  const [announcements, setAnnouncements] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Form State
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    type: 'GENERAL'
  });

  // Announcement comment state
  const [annCommentInput, setAnnCommentInput] = useState({});

  // Help Desk Ticket Form State
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'IT',
    priority: 'LOW'
  });

  // Ticket comment input state
  const [ticketCommentText, setTicketCommentText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // AI Chatbot State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', text: "Hello! I am your **CloudMojo HR Assistant**. I can help you with:\n\n1. 🩺 **Leave Balances**: type *'How many sick leaves do I have?'*\n2. 📅 **Holiday Calendar**: type *'Show company holidays'*\n3. 🕒 **Working Hours**: type *'What are standard office timings?'*\n4. 📄 **HR Policy Documents**: type *'Show travel policy'*\n5. ⏱️ **Log Timesheets**: type *'log 8 hours on Project Name'*\n\nAsk me any of these questions or click one of the quick chips below!" }
  ]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'AI_CHATBOT') {
      scrollToBottom();
    }
  }, [chatMessages, botTyping, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const annRes = await api.announcements.getAll();
      setAnnouncements(annRes.data || []);

      const ticketRes = await api.tickets.getAll();
      setTickets(ticketRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;

    try {
      await api.announcements.create({
        ...annForm,
        authorName: `${user.firstName} ${user.lastName}`,
        authorId: user.id
      });
      confetti({ particleCount: 50 });
      alert('Announcement published successfully!');
      setShowAnnForm(false);
      setAnnForm({ title: '', content: '', type: 'GENERAL' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeAnnouncement = async (annId) => {
    try {
      await api.announcements.like(annId, user.id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentAnnouncement = async (e, annId) => {
    e.preventDefault();
    const comment = annCommentInput[annId];
    if (!comment) return;

    try {
      await api.announcements.comment(annId, {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        comment
      });
      setAnnCommentInput(prev => ({ ...prev, [annId]: '' }));
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description) return;

    try {
      await api.tickets.create({
        ...ticketForm,
        userId: user.id
      });
      confetti({ particleCount: 50 });
      alert('Support case opened! IT & HR representatives notified.');
      setShowTicketForm(false);
      setTicketForm({ title: '', description: '', category: 'IT', priority: 'LOW' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTicketComment = async (e) => {
    e.preventDefault();
    if (!ticketCommentText || !selectedTicket) return;

    try {
      await api.tickets.addComment(selectedTicket.id, {
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        text: ticketCommentText
      });
      setTicketCommentText('');
      
      // Refresh tickets
      const res = await api.tickets.getAll();
      setTickets(res.data || []);
      
      // Update selected ticket in view
      const updated = res.data.find(t => t.id === selectedTicket.id);
      setSelectedTicket(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await api.tickets.updateStatus(ticketId, 'RESOLVED');
      confetti({ particleCount: 80, spread: 60 });
      alert('Ticket marked as RESOLVED!');
      
      // Close detail view
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const submitChatQuery = async (queryText) => {
    if (!queryText.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'USER', text: queryText }]);
    setBotTyping(true);

    try {
      const res = await api.chatbot.ask(queryText, user.id);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'AI', text: res.data.reply }]);
        setBotTyping(false);
        if (res.data.reply && res.data.reply.includes('⏱️')) {
          confetti({ particleCount: 80, spread: 60 });
          loadData();
        }
      }, 600);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'AI', text: "Sorry, I'm experiencing some policy processing fatigue." }]);
      setBotTyping(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatbotInput.trim()) return;
    const inputVal = chatbotInput;
    setChatbotInput('');
    await submitChatQuery(inputVal);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">Employee Experience Suite</h2>
          <p className="text-[13px] text-slate-400">Share announcements, raise help desk cases, or consult our dynamic FAQ AI Assistant.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ANNOUNCEMENTS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Megaphone size={12} className="inline mr-1" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('TICKETS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TICKETS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare size={12} className="inline mr-1" />
            Help Tickets
          </button>
          <button
            onClick={() => setActiveTab('AI_CHATBOT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'AI_CHATBOT' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bot size={12} className="inline mr-1 text-indigo-600 dark:text-indigo-400" />
            AI FAQ Bot
          </button>
        </div>
      </div>

      {/* ==========================================
                  ANNOUNCEMENTS TAB
         ========================================== */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-6 max-w-4xl">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Company Notice Feed</h3>
            {(isAdmin || isHR) && (
              <button
                onClick={() => setShowAnnForm(true)}
                className="flex items-center space-x-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>Publish Notice</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading notice board...</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
              Notice board is empty. Hit "Publish Notice" to share team updates.
            </div>
          ) : (
            <div className="space-y-6">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                        <Megaphone size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[14px] text-slate-800 dark:text-white leading-tight">{ann.title}</h4>
                        <span className="text-[10px] text-slate-400">Published by {ann.authorName} • {new Date(ann.createdAt || ann.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-750 px-2 py-0.5 rounded dark:bg-indigo-950/20 dark:text-indigo-400">
                      {ann.type}
                    </span>
                  </div>

                  <p className="text-[13px] text-slate-600 dark:text-slate-350 leading-relaxed font-outfit">
                    {ann.content}
                  </p>

                  {/* Likes and Comment counter line */}
                  <div className="flex items-center space-x-4 border-t border-b border-slate-100 py-3 dark:border-slate-850">
                    <button
                      onClick={() => handleLikeAnnouncement(ann.id)}
                      className={`flex items-center space-x-1.5 text-[11px] font-bold ${
                        ann.likes?.includes(user.id) ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <ThumbsUp size={14} />
                      <span>{ann.likes?.length || 0} Likes</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-bold">
                      💬 {ann.comments?.length || 0} Comments
                    </span>
                  </div>

                  {/* Comments lists */}
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                    {ann.comments?.map((c, i) => (
                      <div key={i} className="text-[11px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{c.userName}</span>
                        <span className="text-slate-400 ml-2">{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <p className="text-slate-500 mt-0.5">"{c.comment}"</p>
                      </div>
                    ))}

                    {/* Comment Form */}
                    <form onSubmit={(e) => handleCommentAnnouncement(e, ann.id)} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        required
                        placeholder="Write a comment..."
                        value={annCommentInput[ann.id] || ''}
                        onChange={(e) => setAnnCommentInput(prev => ({ ...prev, [ann.id]: e.target.value }))}
                        className="flex-1 p-2 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[11px] text-slate-700 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 rounded-xl cursor-pointer"
                      >
                        <Send size={12} />
                      </button>
                    </form>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                  HELP TICKETS TAB
         ========================================== */}
      {activeTab === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Tickets list */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Support Case Tickets</h3>
                <p className="text-[12px] text-slate-400">Open cases for IT hardware, HR issues, or facilities access.</p>
              </div>
              <button
                onClick={() => setShowTicketForm(true)}
                className="flex items-center space-x-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>Raise Ticket</span>
              </button>
            </div>

            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic text-center py-12">No active ticket logs registered.</p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 cursor-pointer space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase">{t.category} Department</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        t.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600' :
                        t.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600' :
                        'bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-[13px] text-slate-800 dark:text-white leading-tight">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">"{t.description}"</p>
                    
                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-200/40">
                      <span>By: {t.user?.firstName || 'System Employee'}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Right Column: Ticket details and resolution commenting thread */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white border-b border-slate-100 pb-4 mb-4 dark:border-slate-800 font-outfit">Ticket Resolution Thread</h3>
            
            {!selectedTicket ? (
              <div className="py-24 text-center text-slate-400 text-[12px] italic">
                <AlertCircle size={24} className="mx-auto text-indigo-400 mb-2" />
                <p>Select a ticket case from the list on the left to view resolution logs and post comments.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Details card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400">{selectedTicket.category} • {selectedTicket.priority} PRIORITY</span>
                    {selectedTicket.status !== 'RESOLVED' && (isAdmin || isHR) && (
                      <button
                        onClick={() => handleResolveTicket(selectedTicket.id)}
                        className="py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg cursor-pointer"
                      >
                        Resolve Case
                      </button>
                    )}
                  </div>
                  <h4 className="font-outfit font-extrabold text-[14px] text-slate-800 dark:text-white leading-tight">{selectedTicket.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl dark:bg-slate-850">"{selectedTicket.description}"</p>
                </div>

                {/* Comment history list */}
                <div className="border-t border-slate-100 pt-4 dark:border-slate-850 space-y-4">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block">Comment Logs Thread</span>
                  
                  <div className="space-y-3.5 max-h-52 overflow-y-auto pr-2">
                    {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                      <p className="text-[10px] text-slate-450 italic">No notes posted yet. Post updates below.</p>
                    ) : (
                      selectedTicket.comments.map((c, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                            <span>{c.authorName}</span>
                            <span>{new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">"{c.text}"</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment Form */}
                  {selectedTicket.status !== 'RESOLVED' ? (
                    <form onSubmit={handleAddTicketComment} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        required
                        placeholder="Add updates / reply..."
                        value={ticketCommentText}
                        onChange={(e) => setTicketCommentText(e.target.value)}
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[12px] text-slate-700 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  ) : (
                    <p className="text-center text-[10px] text-emerald-650 bg-emerald-500/10 py-2 rounded-xl font-bold dark:bg-emerald-950/20">🔒 Ticket closed. Resolution successfully completed.</p>
                  )}

                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* ==========================================
                  AI FAQ CHATBOT TAB
         ========================================== */}
      {activeTab === 'AI_CHATBOT' && (() => {
        const QUICK_CHIPS = [
          { label: '🩺 Leave Balance', query: 'How many sick leaves do I have?' },
          { label: '📅 Official Holidays', query: 'Show company holidays calendar' },
          { label: '🕒 Shift Timings', query: 'What are standard office shift timings?' },
          { label: '📄 HR Policy Docs', query: 'Show travel policy handbook' },
          { label: '⏱️ Log 8 Hrs', query: 'log 8 hours on CMT HR Premium Replica Suite' }
        ];

        return (
          <div className="glass-panel rounded-3xl p-6 shadow-xl max-w-2xl mx-auto space-y-6 animate-slide-in relative overflow-hidden border border-white/20 dark:border-slate-800/80">
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-650 to-purple-600 text-white shadow-md shadow-indigo-600/20">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit flex items-center gap-1.5">
                    FAQ AI Assistant <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  </h3>
                  <p className="text-[12px] text-slate-400">Ask about leaves balance, shift details, and company policy handbook links.</p>
                </div>
              </div>
            </div>

            {/* Scrolling message logs */}
            <div className="h-[350px] overflow-y-auto p-4 bg-slate-50/50 border border-slate-150 rounded-2xl dark:bg-slate-850/40 dark:border-slate-750/60 space-y-4 flex flex-col shadow-inner">
              {chatMessages.map((msg, i) => {
                const isAI = msg.sender === 'AI';
                return (
                  <div 
                    key={i} 
                    className={`flex ${isAI ? 'justify-start' : 'justify-end'} message-appear`}
                  >
                    <div className={`p-4 max-w-[85%] rounded-2xl text-[12.5px] leading-relaxed shadow-sm font-outfit whitespace-pre-line ${
                      isAI 
                        ? 'bg-white border border-slate-200/50 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200' 
                        : 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {botTyping && (
                <div className="flex justify-start message-appear">
                  <div className="bg-white border border-slate-200/50 p-4 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                    <div className="flex space-x-1.5 items-center py-1">
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick-reply chips */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center font-outfit">
                <Sparkles size={12} className="text-indigo-500 mr-1.5 animate-pulse" /> Interactive Quick Chips
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => submitChatQuery(chip.query)}
                    className="px-3.5 py-2 text-[12px] bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/40 text-slate-650 hover:text-indigo-650 rounded-full font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer dark:bg-slate-800/50 dark:border-slate-750 dark:text-slate-300 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 flex items-center gap-1.5 shadow-sm font-outfit"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                placeholder="Ask me: 'How many leaves do I have?' or 'Show company holidays'..."
                value={chatbotInput}
                onChange={(e) => setChatbotInput(e.target.value)}
                className="flex-1 p-3.5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100 transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl cursor-pointer flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shadow-indigo-600/10"
              >
                <Send size={16} />
              </button>
            </form>

          </div>
        );
      })()}

      {/* ==========================================
                ANNOUNCEMENT PUBLISH MODAL
         ========================================== */}
      {showAnnForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Publish Notice / Announcement</h3>
              <button onClick={() => setShowAnnForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Retreat Details"
                  value={annForm.title}
                  onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Category Type</label>
                <select
                  value={annForm.type}
                  onChange={(e) => setAnnForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                >
                  <option value="GENERAL">General News</option>
                  <option value="EVENT">Corporate Event</option>
                  <option value="POLICY">Policy Update</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Notice Content Details</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Enter notice content here..."
                  value={annForm.content}
                  onChange={(e) => setAnnForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Post to Notice Board
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
                RAISE HELP DESK TICKET MODAL
         ========================================== */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Raise Help Desk Ticket Case</h3>
              <button onClick={() => setShowTicketForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleOpenTicket} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Case / Ticket Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken screen on office laptop"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Category Department</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="IT">IT Hardware/SaaS</option>
                    <option value="HR">HR Policies/Payroll</option>
                    <option value="FINANCE">Finance Reimbursement</option>
                    <option value="FACILITIES">Office Desk/Security Card</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Priority Importance</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="LOW">Low priority</option>
                    <option value="MEDIUM">Medium importance</option>
                    <option value="HIGH">High (Urgent Blockers)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Description of Problem Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain exactly what problem is being faced..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Submit Ticket Case
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeExperience;
