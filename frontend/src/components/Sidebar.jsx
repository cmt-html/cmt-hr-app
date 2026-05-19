"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, 
  Users, 
  Clock, 
  Award, 
  Briefcase, 
  MessageSquare, 
  Sliders, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
  CreditCard
} from 'lucide-react';

import Logo from './Logo';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { logout, user, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Core HR & Employee', path: '/employees', icon: Users },
    { name: 'Attendance & Time', path: '/attendance', icon: Clock },
    { name: 'Performance (OKRs)', path: '/performance', icon: Award },
    { name: 'Hiring & Onboard', path: '/hiring', icon: Briefcase },
    { name: 'Employee Experience', path: '/experience', icon: MessageSquare },
  ];

  // Admin exclusive navigation items
  if (isAdmin) {
    navItems.push({ name: 'Billing & Plans', path: '/billing', icon: CreditCard });
    navItems.push({ name: 'System Tools', path: '/system', icon: Sliders });
  }

  return (
    <aside 
      className={`relative flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-350 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Sidebar Toggle Handle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 -right-3 flex items-center justify-center h-6 w-6 rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white shadow-md z-50 cursor-pointer"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex items-center justify-center h-10 w-10 min-w-[40px] rounded-xl bg-slate-950/40 border border-slate-800/80 shadow-lg shadow-indigo-500/10">
            <Logo size={28} />
          </div>
          {isOpen && (
            <span className="font-outfit font-extrabold text-xl bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              CloudMojo HR
            </span>
          )}
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-500/20' 
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon size={20} className={`mr-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {isOpen && <span className="text-[14px] truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          {isOpen && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 font-bold">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-semibold text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className={`flex items-center justify-center p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-450 transition-colors cursor-pointer ${!isOpen && 'w-full'}`}
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
