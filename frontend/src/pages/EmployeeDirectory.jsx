"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  UserPlus, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  FileText, 
  Trash2,
  GitFork,
  Upload,
  Calendar,
  X,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EmployeeDirectory = () => {
  const { user: currentUser, isAdmin, isManager, isHR } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Tabs: 'DIRECTORY' | 'ORG_CHART' | 'ADD_EMPLOYEE'
  const [activeTab, setActiveTab] = useState('DIRECTORY');
  
  // Data State
  const [employees, setEmployees] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Profile Modal State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalary, setShowSalary] = useState(false);
  const [docsList, setDocsList] = useState([]);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('OFFER_LETTER');

  // Add Employee Form State
  const [formData, setFormData] = useState({
    email: '',
    password: 'password123',
    firstName: '',
    lastName: '',
    designation: '',
    department: 'Technology',
    managerId: '',
    salary: '',
    customValues: {}
  });

  // Invite Employee Form State
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    designation: '',
    department: 'Technology',
    role: 'EMPLOYEE'
  });
  const [invitesList, setInvitesList] = useState([]);
  const [sendingInvite, setSendingInvite] = useState(false);

  const loadInvites = async () => {
    try {
      const res = await api.employees.getInvites();
      setInvitesList(res.data || []);
    } catch (err) {
      console.error('Failed to load invitations', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'INVITATIONS') {
      loadInvites();
    }
  }, [activeTab]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.firstName) {
      alert('Email and First Name are required.');
      return;
    }
    try {
      setSendingInvite(true);
      await api.employees.invite(inviteForm);
      alert('Invitation sent successfully! You can copy the link from the pending list for testing.');
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        designation: '',
        department: 'Technology',
        role: 'EMPLOYEE'
      });
      loadInvites();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.employees.getAll();
      setEmployees(res.data || []);

      // Load dynamic custom fields schema
      const fieldRes = await api.formBuilder.getFields();
      setCustomFields(fieldRes.data || []);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch documents for the modal employee
  useEffect(() => {
    const fetchDocs = async () => {
      if (selectedEmployee) {
        try {
          const res = await api.documents.get(selectedEmployee.id);
          setDocsList(res.data || []);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchDocs();
  }, [selectedEmployee]);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert('Email, First Name and Last Name are required.');
      return;
    }

    try {
      // Package custom values
      const employeePayload = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        customFields: formData.customValues
      };

      await api.employees.create(employeePayload);
      confetti({ particleCount: 120, spread: 80 });
      alert('Employee account created successfully!');
      
      // Reset form
      setFormData({
        email: '',
        password: 'password123',
        firstName: '',
        lastName: '',
        designation: '',
        department: 'Technology',
        managerId: '',
        salary: '',
        customValues: {}
      });

      setActiveTab('DIRECTORY');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create employee.');
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadDocName) return;

    try {
      await api.documents.upload({
        name: uploadDocName,
        type: uploadDocType,
        userId: selectedEmployee.id
      });
      
      // Refresh documents list
      const res = await api.documents.get(selectedEmployee.id);
      setDocsList(res.data || []);
      setUploadDocName('');
      alert('Document vault updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomValueChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      customValues: {
        ...prev.customValues,
        [fieldName]: value
      }
    }));
  };

  // Filter criteria
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || (emp.designation || '').toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header bar and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">Core HR & Employee Directory</h2>
          <p className="text-[13px] text-slate-400">View personnel lists, department structures, and manage digital profiles.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'DIRECTORY' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Directory List
          </button>
          <button
            onClick={() => setActiveTab('ORG_CHART')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ORG_CHART' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <GitFork size={12} className="inline mr-1" />
            Org Hierarchy
          </button>
          {isHR && (
            <>
              <button
                onClick={() => setActiveTab('ADD_EMPLOYEE')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ADD_EMPLOYEE' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus size={12} className="inline mr-1" />
                Onboard Employee
              </button>
              <button
                onClick={() => setActiveTab('INVITATIONS')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'INVITATIONS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Mail size={12} className="inline mr-1" />
                Manage Invites
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==========================================
                    DIRECTORY LIST TAB
         ========================================== */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          
          {/* Filters shelf */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by name, role, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-[13px] placeholder-slate-400 dark:placeholder-slate-500"
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDark ? '#e2e8f0' : '#334155',
                  boxShadow: 'none'
                }}
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <span className="text-[12px] text-slate-450 font-bold uppercase shrink-0">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full p-2.5 rounded-xl text-[12px] outline-none"
                style={{
                  backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  color: isDark ? '#e2e8f0' : '#334155'
                }}
              >
                <option value="ALL">All Departments</option>
                <option value="Technology">Technology</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          {/* Directory Cards Grid */}
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading Directory...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
              No matching employees found in registry.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm hover-premium cursor-pointer space-y-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-750 text-white font-extrabold text-lg">
                      {emp.firstName?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-outfit font-bold text-slate-800 dark:text-white leading-tight">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-[11px] text-slate-450 font-semibold uppercase tracking-wider mt-0.5">
                        {emp.designation || 'Specialist'}
                      </p>
                      <span className="inline-block mt-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded-full dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400">
                        {emp.department}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100/70 pt-4 dark:border-slate-800/80 space-y-2.5 text-[12px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2.5">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck size={14} className="text-slate-400" />
                      <span>Reporting to Manager: <strong className="text-slate-650 dark:text-slate-350">{emp.managerId || 'System Board'}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                    ORG CHART HIERARCHY TAB
         ========================================== */}
      {activeTab === 'ORG_CHART' && (
        <div className="bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
          <div className="border-b border-slate-100 pb-4 mb-8 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Reporting Relationships</h3>
            <p className="text-[12px] text-slate-400">Company org reporting structure.</p>
          </div>

          <div className="space-y-8 max-w-xl mx-auto">
            {/* Top Node */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-amber-500/10 border border-amber-500/35 rounded-2xl text-center w-52 dark:bg-amber-950/20">
                <span className="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Top Org Admin</span>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs mt-2">admin@cloudmojo.tech</h4>
                <p className="text-[10px] text-slate-400">CEO Office</p>
              </div>
              <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* Level 2 Nodes (Managers) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-center w-full dark:bg-indigo-950/20">
                  <span className="text-[9px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Tech Lead Manager</span>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs mt-2">Sarah Connor</h4>
                  <p className="text-[10px] text-slate-400">Technology Dept</p>
                </div>
                <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                
                {/* Level 3 child employee under manager */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center w-full dark:bg-slate-850 dark:border-slate-750">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">John Doe</h5>
                  <p className="text-[9px] text-slate-400">Senior Web Dev</p>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-center w-full dark:bg-purple-950/20">
                  <span className="text-[9px] font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Sales Manager</span>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs mt-2">Robert Downey</h4>
                  <p className="text-[10px] text-slate-400">Sales & Marketing</p>
                </div>
                <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                
                {/* Level 3 child employee under manager */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-center w-full dark:bg-slate-850 dark:border-slate-750">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Emily Watson</h5>
                  <p className="text-[9px] text-slate-400">Sales Specialist</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
                    ADD EMPLOYEE TAB
         ========================================== */}
      {activeTab === 'ADD_EMPLOYEE' && (
        <div className="bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm max-w-3xl">
          <div className="border-b border-slate-100 pb-4 mb-6 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Onboard New Employee Profile</h3>
            <p className="text-[12px] text-slate-400">Create a secure profile credential inside the company network.</p>
          </div>

          <form onSubmit={handleCreateEmployee} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="name@cloudmojo.tech"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Job Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                >
                  <option value="Technology">Technology</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Reports To Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                >
                  <option value="">Select Manager</option>
                  <option value="user_manager1">Sarah Connor (Tech Manager)</option>
                  <option value="user_manager2">Robert Downey (Sales Manager)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Salary ($ Annual)</label>
                <input
                  type="number"
                  placeholder="95000"
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

            </div>

            {/* Dynamic Custom Fields Rendering inside form builder logic */}
            {customFields.length > 0 && (
              <div className="border-t border-slate-100 pt-6 dark:border-slate-850 space-y-4">
                <h4 className="text-[13px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">Custom Metadata Attributes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">{field.fieldLabel}</label>
                      {field.fieldType === 'SELECT' ? (
                        <select
                          onChange={(e) => handleCustomValueChange(field.fieldName, e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                        >
                          <option value="">Select Option</option>
                          {field.options?.split(',').map((opt) => (
                            <option key={opt} value={opt}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                          placeholder={`Enter ${field.fieldLabel}`}
                          onChange={(e) => handleCustomValueChange(field.fieldName, e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-[13px] shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-[0.99] transition-all"
            >
              Finalize System Onboarding
            </button>

          </form>
        </div>
      )}

      {/* ==========================================
                    INVITATIONS TAB
         ========================================== */}
      {activeTab === 'INVITATIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-in">
          {/* Send Invite Form */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Invite via Email</h3>
              <p className="text-[12px] text-slate-400">Send a signup invitation to join the organization network.</p>
            </div>
            
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="candidate@email.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Talent Acquisition"
                  value={inviteForm.designation}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Department</label>
                  <select
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">System Role</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR Manager</option>
                    <option value="MANAGER">Line Manager</option>
                    <option value="ORG_ADMIN">Org Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingInvite}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-[13px] shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                {sendingInvite ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Mail size={16} className="text-white" />
                    <span>Send Invitation Link</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Invites Tracking Table */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Pending Invitations</h3>
              <p className="text-[12px] text-slate-400">Track and copy simulated invite links for testing signup.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Role & Dept</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Invite Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 text-[12px]">
                  {invitesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">No invitations sent yet.</td>
                    </tr>
                  ) : (
                    invitesList.map((inv) => (
                      <tr key={inv.id} className="text-slate-650 dark:text-slate-350">
                        <td className="py-3.5">
                          <span className="font-bold text-slate-850 dark:text-white block">{inv.firstName} {inv.lastName}</span>
                          <span className="text-[10px] text-slate-400">{inv.email}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="block font-medium">{inv.designation || 'Specialist'}</span>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold">{inv.department}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                            inv.status === 'PENDING' ? 'bg-amber-50 border border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400' : 'bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {inv.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                const acceptUrl = `${window.location.origin}/accept-invite/${inv.id}`;
                                navigator.clipboard.writeText(acceptUrl);
                                alert(`Invite link copied to clipboard!\n\nOpen this link in a new browser tab/incognito window to accept the invite:\n${acceptUrl}`);
                              }}
                              className="bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded-xl dark:bg-indigo-950/30 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                            >
                              Copy Link
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
                EMPLOYEE PROFILE SLIDE MODAL
         ========================================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="h-full w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-slide-in">
            
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Personnel Vault File</span>
                <button 
                  onClick={() => { setSelectedEmployee(null); setShowSalary(false); }}
                  className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Detail visual heading */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-2xl">
                  {selectedEmployee.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white font-outfit">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-[12px] text-slate-500">{selectedEmployee.designation || 'HR Specialist'}</p>
                </div>
              </div>

              {/* Grid values */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl dark:bg-slate-850">
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Department</span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-350">{selectedEmployee.department}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Manager</span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-350">{selectedEmployee.managerId || 'Global HR'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Joining Date</span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-350">
                    {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : '2026-01-15'}
                  </span>
                </div>
                
                {/* Sensitive Salary Area */}
                <div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Salary</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {(isAdmin || isManager) ? (
                      <>
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white font-mono">
                          {showSalary ? `$${selectedEmployee.salary || '90,000'}` : '••••••••'}
                        </span>
                        <button
                          onClick={() => setShowSalary(!showSalary)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSalary ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 italic">🔒 Protected Field</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic custom field values */}
              {customFields.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[12px] font-bold text-slate-450 uppercase tracking-widest">Custom Metadata</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {customFields.map((field) => {
                      const empVal = selectedEmployee.customFields ? selectedEmployee.customFields[field.fieldName] : null;
                      return (
                        <div key={field.id}>
                          <span className="text-[10px] font-bold text-slate-450 block">{field.fieldLabel}</span>
                          <span className="text-[12px] text-slate-650 dark:text-slate-350 font-medium">
                            {empVal || 'Not filled'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Document vault vault manager directly inside profile */}
              <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-slate-850 dark:text-white font-outfit">Document Vault</h4>
                  <span className="text-[10px] text-slate-400">{docsList.length} documents stored</span>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUploadDoc} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Document Label (e.g. Passport Proof)"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[12px] text-slate-700 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                  />
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="bg-slate-50 border border-slate-150 p-2 rounded-xl text-[11px] text-slate-600 outline-none dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                  >
                    <option value="OFFER_LETTER">Offer Letter</option>
                    <option value="ID_PROOF">ID Proof</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl cursor-pointer"
                  >
                    <Upload size={14} />
                  </button>
                </form>

                {/* Document Listing */}
                <div className="space-y-2">
                  {docsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No files uploaded. Storing offer letters / ID proof scans.</p>
                  ) : (
                    docsList.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800">
                        <div className="flex items-center space-x-2 text-[11px]">
                          <FileText size={14} className="text-indigo-500" />
                          <span className="font-bold text-slate-700 dark:text-slate-350">{doc.name}</span>
                          <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded dark:bg-indigo-950/20 dark:border-indigo-900">{doc.type}</span>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`Mock downloading ${doc.name} via ${doc.url}`); }}
                          className="text-[10px] text-indigo-650 font-bold hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

            <button
              onClick={() => { setSelectedEmployee(null); setShowSalary(false); }}
              className="w-full mt-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
            >
              Close Profile Vault File
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeDirectory;
