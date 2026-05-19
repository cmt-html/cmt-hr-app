"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell, 
  Search, 
  HelpCircle,
  Menu,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const isDark = theme === 'dark';

  const { subscriptionStatus } = useAuth();

  return (
    <div className="flex flex-col shrink-0">
      {subscriptionStatus === 'PAST_DUE' && (
        <div className="bg-red-650 text-white text-[12px] font-bold px-8 py-3 flex items-center justify-between shadow-md animate-slide-in">
          <div className="flex items-center space-x-2.5">
            <span className="bg-red-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
              Workspace Frozen
            </span>
            <span>Your SaaS subscription is currently Past Due. All write actions are locked. Please process invoice in the Billing Portal to resume.</span>
          </div>
          <a href="/billing" className="underline hover:text-red-100 transition-colors shrink-0 font-extrabold ml-4">
            Open Billing Panel →
          </a>
        </div>
      )}
      <header className="flex items-center justify-between h-20 px-8 bg-white border-b border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0 transition-colors duration-300">
      
      {/* Mobile Toggle & Search Bar */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-150 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors md:hidden cursor-pointer"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center space-x-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 w-80 dark:bg-slate-800 dark:border-slate-700">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search employees, goals, tickets..." 
            className="bg-transparent border-none text-[13px] outline-none text-slate-700 w-full dark:text-slate-200"
          />
        </div>
      </div>

      {/* Global Real-Time Clock Widget & Status Badge */}
      <div className="flex items-center space-x-3">
        
        {/* Elite Running Clock */}
        <div className="hidden lg:flex items-center space-x-3 bg-indigo-50/70 border border-indigo-100 rounded-xl px-4 py-1.5 dark:bg-indigo-950/20 dark:border-indigo-900/35">
          <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div className="text-right">
            <span className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300 font-mono tracking-wide">{formattedTime}</span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium ml-2 block sm:inline">{formattedDate}</span>
          </div>
        </div>

        {/* Notifications Tray */}
        <button className="relative p-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* Help Center */}
        <button className="hidden sm:block p-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors cursor-pointer" title="HR Handbook FAQ">
          <HelpCircle size={18} />
        </button>

        {/* ── Dark / Light Mode Toggle ── */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="relative p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer overflow-hidden group"
        >
          {/* Animated glow ring on hover */}
          <span className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? 'bg-amber-400/10' : 'bg-indigo-500/10'}`} />
          
          {/* Sun icon (shown in dark mode — click to go light) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
            }`}
          >
            <Sun size={18} className="text-amber-400" />
          </span>

          {/* Moon icon (shown in light mode — click to go dark) */}
          <span
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              !isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
            }`}
          >
            <Moon size={18} className="text-indigo-500" />
          </span>

          {/* Spacer to maintain button dimensions */}
          <span className="opacity-0"><Sun size={18} /></span>
        </button>

        {/* Quick User Summary */}
        <div className="flex items-center space-x-3 border-l border-slate-100 pl-4 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold shadow-md shadow-indigo-500/20">
            {user?.firstName?.charAt(0)}
          </div>
        </div>

      </div>
    </header>
    </div>
  );
};

export default Header;

