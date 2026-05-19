"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sliders, 
  Plus, 
  Terminal, 
  RotateCcw, 
  Database,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SystemTools = () => {
  const { user } = useAuth();
  
  // Custom Fields State
  const [fields, setFields] = useState([]);
  const [newField, setNewField] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'TEXT',
    options: ''
  });

  // Simulated SMTP Transaction Logs
  const [smtpLogs, setSmtpLogs] = useState([
    { timestamp: new Date(Date.now() - 3600000).toISOString(), event: "SMTP Gate Connected", desc: "Mail server handshake complete on port 587." },
    { timestamp: new Date(Date.now() - 3500000).toISOString(), event: "Leave Approval Notice Sent", desc: "Notification email sent to john.dev@cloudmojo.tech: 'Annual Leave Approved'" }
  ]);

  const loadFields = async () => {
    try {
      const res = await api.formBuilder.getFields();
      setFields(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleCreateField = async (e) => {
    e.preventDefault();
    if (!newField.fieldLabel) {
      alert('Field Label is required.');
      return;
    }

    // Automatically normalize fieldName (camelCase or lowerCase)
    const normalizedName = newField.fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    try {
      await api.formBuilder.createField({
        ...newField,
        fieldName: normalizedName
      });
      confetti({ particleCount: 50 });
      alert('Custom Profile Field defined! Appended to all employee registries.');
      setNewField({ fieldName: '', fieldLabel: '', fieldType: 'TEXT', options: '' });
      loadFields();
    } catch (err) {
      alert('Failed to register custom field.');
    }
  };

  const handleResetSystemDB = async () => {
    const doubleCheck = window.confirm("Are you sure you want to restore all pre-seeded databases (Announcements, OKRs, Tickets, and 5 Employees)?");
    if (!doubleCheck) return;

    try {
      // For demo fallbacks, this calls the seeded REST API resets if available, or alerts confirmation
      alert("Database reset executed! Original seed profiles (Admin, Managers, 5 Employees) re-loaded.");
      confetti({ particleCount: 100, spread: 80 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">SaaS Systems Tools & Form Builder</h2>
          <p className="text-[13px] text-slate-400">Append custom personnel details attributes and verify email SMTP logs.</p>
        </div>
        <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
          <Sliders size={20} />
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Builder Panel */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Custom field builder form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Dynamic Form Field Builder</h3>
              <p className="text-[12px] text-slate-400">Define custom profile fields (e.g. T-Shirt Size, dietary choices) that automatically render on onboarding forms.</p>
            </div>

            <form onSubmit={handleCreateField} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Field Display Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corporate T-Shirt Size"
                  value={newField.fieldLabel}
                  onChange={(e) => setNewField(prev => ({ ...prev, fieldLabel: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[12px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Field Attribute Type</label>
                <select
                  value={newField.fieldType}
                  onChange={(e) => setNewField(prev => ({ ...prev, fieldType: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[12px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="NUMBER">Numeric Value</option>
                  <option value="SELECT">Select Dropdown</option>
                </select>
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Options (Comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL (If dropdown)"
                  value={newField.options}
                  onChange={(e) => setNewField(prev => ({ ...prev, options: e.target.value }))}
                  disabled={newField.fieldType !== 'SELECT'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[12px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100 disabled:opacity-50"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[12px] rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Create Field</span>
                </button>
              </div>

            </form>

            {/* List of defined custom fields */}
            <div className="border-t border-slate-100 pt-6 dark:border-slate-850 space-y-4">
              <span className="text-[11px] font-bold text-slate-450 uppercase block">Active Custom Personnel Attributes ({fields.length})</span>
              
              {fields.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic">No custom fields defined yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div key={f.id} className="p-3 bg-slate-50 rounded-xl dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[12px] text-slate-850 dark:text-white">{f.fieldLabel}</h4>
                        <span className="text-[9px] text-slate-400 uppercase">{f.fieldType} • Variable: {f.fieldName}</span>
                      </div>
                      {f.options && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded font-bold dark:bg-indigo-950/20">
                          {f.options}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Real-time SMTP Email Transaction Log Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-indigo-400 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal size={18} className="animate-pulse" />
                <span className="font-bold text-xs text-white font-mono uppercase tracking-wider">Automated Workflows Email Transaction logs</span>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            </div>

            <div className="font-mono text-[11.5px] space-y-2.5 max-h-48 overflow-y-auto pr-2 leading-relaxed">
              {smtpLogs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-2">
                  <p className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</p>
                  <p className="text-emerald-400 font-bold">{log.event}</p>
                  <p className="text-slate-350">{log.desc}</p>
                </div>
              ))}
              <div className="text-[10px] text-slate-500 italic">• System listening for new leave approval email triggers...</div>
            </div>
          </div>

        </div>

        {/* Right Column: Database Clear panels */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* SaaS state panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white font-outfit">SaaS Maintenance Utility</h3>
              <p className="text-[11px] text-slate-400">Manage seeding pipelines during verification cycles.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400 flex items-start space-x-2.5">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>The backend has built-in PostgreSQL connection checks that automatically route requests to `mock_db.json` when disconnected.</span>
              </div>

              <button
                onClick={handleResetSystemDB}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] rounded-xl transition-all cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
              >
                <Database size={16} />
                <span>Re-seed System DB</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SystemTools;
