"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  Clock, 
  Calendar, 
  HelpCircle, 
  ArrowUpRight, 
  Check, 
  X, 
  PartyPopper,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { user, isManager } = useAuth();
  
  // Real-time Clock Duration
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [gpsPreset, setGpsPreset] = useState('Office (12.9716, 77.5946)');
  const [duration, setDuration] = useState('00:00:00');
  
  // Metrics & State
  const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, openTickets: 0, openJobs: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [leavesPending, setLeavesPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Department graph pre-processed mock data
  const chartData = [
    { name: 'Technology', count: 4, fill: '#6366f1' },
    { name: 'Sales', count: 3, fill: '#8b5cf6' },
    { name: 'Human Resources', count: 1, fill: '#ec4899' },
    { name: 'Management', count: 1, fill: '#f59e0b' },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch employees to count
      const empRes = await api.employees.getAll();
      const emps = empRes.data || [];
      
      // Fetch leaves pending
      const leaveRequestsRes = await api.leaves.getRequests();
      const leaves = leaveRequestsRes.data || [];

      // Fetch helpdesk tickets
      const ticketRes = await api.tickets.getAll();
      const tkts = ticketRes.data || [];

      // Fetch open jobs
      const jobsRes = await api.hiring.getJobs();
      const openJobs = (jobsRes.data || []).filter(j => j.status === 'OPEN').length;

      setStats({
        employees: emps.length,
        pendingLeaves: leaves.filter(l => l.status === 'PENDING').length,
        openTickets: tkts.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        openJobs: openJobs || 1
      });

      setLeavesPending(leaves.filter(l => l.status === 'PENDING').slice(0, 3));

      // Fetch announcements
      const annRes = await api.announcements.getAll();
      setAnnouncements((annRes.data || []).slice(0, 2));

      // Check current user attendance status
      if (user) {
        const attHistoryRes = await api.attendance.getHistory(user.id);
        const todaySession = (attHistoryRes.data || []).find(s => s.checkOut === null);
        if (todaySession) {
          setIsClockedIn(true);
          setActiveSession(todaySession);
        } else {
          setIsClockedIn(false);
          setActiveSession(null);
        }
      }

    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // Clock-in duration ticking
  useEffect(() => {
    let interval = null;
    if (isClockedIn && activeSession) {
      const checkInTime = new Date(activeSession.checkIn || activeSession.createdAt);
      interval = setInterval(() => {
        const diff = Math.abs(new Date() - checkInTime);
        const hrs = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const secs = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setDuration(`${hrs}:${mins}:${secs}`);
      }, 1000);
    } else {
      setDuration('00:00:00');
    }
    return () => clearInterval(interval);
  }, [isClockedIn, activeSession]);

  const handleClockToggle = async () => {
    try {
      if (isClockedIn) {
        // Clock Out
        await api.attendance.checkOut(user.id, gpsPreset);
        setIsClockedIn(false);
        setActiveSession(null);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.85 } });
      } else {
        // Clock In
        const res = await api.attendance.checkIn(user.id, gpsPreset);
        setIsClockedIn(true);
        setActiveSession(res.data.attendance);
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Clock action failed.');
    }
  };

  const handleApprovalAction = async (leaveId, decision) => {
    try {
      await api.leaves.approve(leaveId, decision);
      
      // Fun milestone celebration if approved!
      if (decision === 'APPROVED') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval request failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Visual greeting card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 p-8 text-white overflow-hidden shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-2 bg-indigo-50/10 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles size={12} />
            <span>Zoho Workspace Sync Complete</span>
          </div>
          <h2 className="text-3xl font-outfit font-extrabold tracking-tight md:text-4xl">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-[14px] text-slate-300 max-w-xl">
            Manage your daily tasks, logs, and approvals right from the dashboard. Your standard shift today begins at 09:00 AM.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Headcount Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm hover-premium">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Headcount</span>
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Users size={20} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-4 font-outfit">{stats.employees}</p>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">Active corporate users</span>
        </div>

        {/* Pending Leaves Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm hover-premium">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Pending Leaves</span>
            <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
              <Calendar size={20} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-4 font-outfit">{stats.pendingLeaves}</p>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">Awaiting approval status</span>
        </div>

        {/* Support Tickets Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm hover-premium">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Help Tickets</span>
            <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <HelpCircle size={20} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-4 font-outfit">{stats.openTickets}</p>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">IT & HR employee queries</span>
        </div>

        {/* Active Open Jobs Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm hover-premium">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-400 dark:text-slate-450 uppercase tracking-widest">Active Jobs</span>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              <ArrowUpRight size={20} />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-white mt-4 font-outfit">{stats.openJobs}</p>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">Open recruitment postings</span>
        </div>

      </div>

      {/* Main Core Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Column: Clocking Widget & Charts */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Zoho Shift Clock-In/Clock-Out Widget */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <div className="border-b border-slate-100 pb-4 mb-6 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Shift Attendance Clock</h3>
                <p className="text-[12px] text-slate-400">Track and submit your daily work timings.</p>
              </div>
              <div className={`h-3 w-3 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-ping' : 'bg-red-400'}`}></div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Counter Display */}
              <div className="text-center md:text-left space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Active Time</span>
                <p className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white font-mono tracking-tight">{duration}</p>
                <p className="text-[12px] text-slate-550">
                  {isClockedIn 
                    ? `Checked-in today at ${new Date(activeSession?.checkIn || activeSession?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                    : 'System idle. Waiting to check-in.'
                  }
                </p>
              </div>

              {/* GPS preset selector */}
              <div className="w-full md:w-auto space-y-3">
                <div className="flex items-center space-x-2 text-[12px] text-slate-400">
                  <MapPin size={14} className="text-indigo-500" />
                  <span>Mock GPS Coordinate Preset</span>
                </div>
                <select
                  value={gpsPreset}
                  onChange={(e) => setGpsPreset(e.target.value)}
                  className="w-full md:w-60 bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[12px] text-slate-700 outline-none dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                >
                  <option value="Office (12.9716, 77.5946)">CloudMojo Bangalore Office</option>
                  <option value="Client Site (18.9750, 72.8258)">Client Site (Mumbai)</option>
                  <option value="Remote WFH (Mock Coordinates)">Home Network (12.9279, 77.6271)</option>
                </select>

                {/* Submit Action */}
                <button
                  onClick={handleClockToggle}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-bold text-[13px] text-white shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                    isClockedIn 
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/15'
                  }`}
                >
                  <Clock size={16} />
                  <span>{isClockedIn ? 'Clock-Out (End Shift)' : 'Clock-In (Start Shift)'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Department Headcount Bar Chart */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-6 font-outfit">Department Headcount Distributions</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    cursor={{ fill: 'rgba(99,102,241,0.03)' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side Column: Approvals Panel & Announcements */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Manager Approvals Pipeline */}
          {isManager && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
                <h3 className="text-[14px] font-bold text-slate-850 dark:text-white font-outfit">Pending Approvals</h3>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {leavesPending.length} requests
                </span>
              </div>

              {leavesPending.length === 0 ? (
                <div className="py-8 text-center text-[12px] text-slate-400">
                  <div className="h-10 w-10 mx-auto rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800 text-indigo-400 mb-2">
                    <PartyPopper size={18} />
                  </div>
                  <p>All leaves approved! Clear pipeline.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leavesPending.map((req) => (
                    <div key={req.id} className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                            {req.user?.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-slate-800 dark:text-white">{req.user?.firstName} {req.user?.lastName}</p>
                            <p className="text-[9px] text-slate-450">{req.type} Leave</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic leading-snug">"{req.reason}"</p>
                      
                      {/* Decision buttons */}
                      <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-750">
                        <button
                          onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          <X size={12} />
                          <span>Deny</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Announcements Feed */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-[14px] font-bold text-slate-850 dark:text-white border-b border-slate-100 pb-4 mb-4 dark:border-slate-800 font-outfit">Company Announcements</h3>
            
            {announcements.length === 0 ? (
              <p className="text-center text-[12px] text-slate-400 py-6">No announcements published yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {ann.type}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {new Date(ann.createdAt || ann.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight hover:text-indigo-500 cursor-pointer">
                      {ann.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                    <div className="flex items-center space-x-2 text-[9px] text-slate-400 mt-1">
                      <span className="font-semibold text-slate-500">{ann.authorName}</span>
                      <span>•</span>
                      <span>{ann.likes?.length || 0} Likes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
