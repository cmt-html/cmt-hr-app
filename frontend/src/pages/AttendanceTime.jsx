"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Clock, 
  Calendar, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  HelpCircle, 
  Plus, 
  Activity, 
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AttendanceTime = () => {
  const { user } = useAuth();
  
  // Tabs: 'ATTENDANCE' | 'LEAVES' | 'TIMESHEETS'
  const [activeTab, setActiveTab] = useState('ATTENDANCE');

  // Common State
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveStats, setLeaveStats] = useState({ taken: { total: 0 }, available: { SICK: 10, ANNUAL: 15 } });
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [timesheetHistory, setTimesheetHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    type: 'SICK',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Timesheet Form State
  const [timesheetForm, setTimesheetForm] = useState({
    project: 'CloudMojo Corporate Portal',
    date: new Date().toISOString().split('T')[0],
    hoursLogged: '8',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch Attendance history
      const attRes = await api.attendance.getHistory(user.id);
      setAttendanceHistory(attRes.data || []);

      // Fetch Leaves stats
      const statsRes = await api.leaves.getStats(user.id);
      setLeaveStats(statsRes.data || { taken: { total: 0 }, available: { SICK: 10, ANNUAL: 15 } });

      // Fetch Leaves history
      const leavesRes = await api.leaves.getHistory(user.id);
      setLeaveHistory(leavesRes.data || []);

      // Fetch Timesheets
      const timesheetsRes = await api.timesheets.get(user.id);
      setTimesheetHistory(timesheetsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill out all fields of the leave request form.');
      return;
    }

    try {
      await api.leaves.apply({
        userId: user.id,
        ...leaveForm
      });
      confetti({ particleCount: 70, spread: 60 });
      alert('Leave application submitted! Sequential approval sequence initialized.');
      setLeaveForm({ type: 'SICK', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave.');
    }
  };

  const handleLogTimesheet = async (e) => {
    e.preventDefault();
    if (!timesheetForm.description || !timesheetForm.hoursLogged) {
      alert('Please fill in timesheet description and log hours.');
      return;
    }

    try {
      await api.timesheets.log({
        userId: user.id,
        ...timesheetForm
      });
      alert('Timesheet hours logged successfully!');
      setTimesheetForm({
        project: 'CloudMojo Corporate Portal',
        date: new Date().toISOString().split('T')[0],
        hoursLogged: '8',
        description: ''
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Timesheet logging failed.');
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">Time, Attendance & Leaves</h2>
          <p className="text-[13px] text-slate-400">Apply for leaves, log hours, and check monthly attendance charts.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ATTENDANCE' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={12} className="inline mr-1" />
            Attendance Records
          </button>
          <button
            onClick={() => setActiveTab('LEAVES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'LEAVES' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar size={12} className="inline mr-1" />
            Leave Manager
          </button>
          <button
            onClick={() => setActiveTab('TIMESHEETS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'TIMESHEETS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText size={12} className="inline mr-1" />
            Project Timesheets
          </button>
        </div>
      </div>

      {/* ==========================================
                  ATTENDANCE RECORD TAB
         ========================================== */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick configuration shift limits card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h4 className="text-[13px] font-bold text-slate-450 uppercase tracking-widest mb-4">Shift Details</h4>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Shift Schedule</span>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white">09:00 AM - 06:00 PM</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Required Daily Limit</span>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white">9 Hours / day</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Weekly Off</span>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white">Saturday, Sunday</span>
                </div>
              </div>
            </div>

            {/* Attendance Analytics Grid */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm md:col-span-2">
              <h4 className="text-[13px] font-bold text-slate-450 uppercase tracking-widest mb-4">Timings Breakdown (This Month)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850">
                  <span className="text-[10px] text-slate-400 block font-bold">Present Days</span>
                  <p className="text-2xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-2 font-outfit">{attendanceHistory.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850">
                  <span className="text-[10px] text-slate-400 block font-bold">Late Arrivals</span>
                  <p className="text-2xl font-extrabold text-amber-500 mt-2 font-outfit">0</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850">
                  <span className="text-[10px] text-slate-400 block font-bold">Leaves Taken</span>
                  <p className="text-2xl font-extrabold text-purple-500 mt-2 font-outfit">{leaveStats.taken?.total || 0}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Historical Logs List */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-outfit">Attendance History Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider font-bold">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Clock-In Time</th>
                    <th className="pb-3">GPS Location</th>
                    <th className="pb-3">Clock-Out Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/80">
                  {attendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400 italic">No attendance sessions registered this month.</td>
                    </tr>
                  ) : (
                    attendanceHistory.map((s) => (
                      <tr key={s.id} className="text-slate-650 dark:text-slate-350">
                        <td className="py-3.5 font-semibold">
                          {new Date(s.checkIn || s.createdAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3.5 font-mono">
                          {new Date(s.checkIn || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 flex items-center space-x-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{s.checkInLocation || 'CloudMojo HQ'}</span>
                        </td>
                        <td className="py-3.5 font-mono">
                          {s.checkOut 
                            ? new Date(s.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : <span className="text-amber-500 font-semibold italic">On Shift (Running)</span>
                          }
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] ${
                            s.checkOut ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {s.checkOut ? 'COMPLETED' : 'ONGOING'}
                          </span>
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
                    LEAVE MANAGER TAB
         ========================================== */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-6">
          
          {/* Recalculated balance quota dials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Sick leave dial */}
            <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100/50 border border-indigo-150 rounded-3xl p-6 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="text-[10px] font-bold text-indigo-550 uppercase tracking-wider dark:text-indigo-400">🩺 Sick Balance</span>
              <p className="text-4xl font-extrabold text-indigo-800 mt-4 dark:text-white font-outfit">
                {leaveStats.available?.SICK !== undefined ? leaveStats.available.SICK : 10} <span className="text-xs text-indigo-400">/ 10 days</span>
              </p>
              <div className="h-1 bg-indigo-250 w-full rounded-full mt-6 overflow-hidden dark:bg-slate-800">
                <div 
                  className="h-full bg-indigo-650"
                  style={{ width: `${((leaveStats.available?.SICK || 10) / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Annual leave dial */}
            <div className="bg-gradient-to-tr from-purple-50 to-purple-100/50 border border-purple-150 rounded-3xl p-6 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="text-[10px] font-bold text-purple-550 uppercase tracking-wider dark:text-purple-400">✈️ Annual/Vacation</span>
              <p className="text-4xl font-extrabold text-purple-800 mt-4 dark:text-white font-outfit">
                {leaveStats.available?.ANNUAL !== undefined ? leaveStats.available.ANNUAL : 15} <span className="text-xs text-purple-400">/ 15 days</span>
              </p>
              <div className="h-1 bg-purple-250 w-full rounded-full mt-6 overflow-hidden dark:bg-slate-800">
                <div 
                  className="h-full bg-purple-650"
                  style={{ width: `${((leaveStats.available?.ANNUAL || 15) / 15) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* General info alert */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex items-start space-x-3.5">
              <AlertCircle className="text-amber-500 shrink-0" size={20} />
              <div className="space-y-1.5">
                <h5 className="font-bold text-[12px] text-amber-800 dark:text-amber-400">HR Leave Rules</h5>
                <p className="text-[10.5px] text-amber-600 leading-relaxed dark:text-amber-500">
                  Sick leaves require medical certificates if extending beyond 3 days. All applications run through a sequential approval flow: **Manager ➔ HR ➔ recess auto balance deduction**.
                </p>
              </div>
            </div>

          </div>

          {/* Form and History columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-outfit">Apply For Leave</h3>
              
              <form onSubmit={handleApplyLeave} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Leave Category</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="SICK">Sick Leave (Recovers/Illness)</option>
                    <option value="CASUAL">Casual Leave (General Off)</option>
                    <option value="ANNUAL">Annual/Vacation Trip</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Reason / Description</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Provide details for manager validation..."
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
                >
                  Apply & Route Approvals
                </button>

              </form>
            </div>

            {/* Leave History List and sequential tracking checklist */}
            <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-outfit">Leave Application Status Trails</h3>
              
              <div className="space-y-5">
                {leaveHistory.length === 0 ? (
                  <p className="text-[12px] text-slate-400 italic text-center py-12">No leave applications found on file.</p>
                ) : (
                  leaveHistory.map((leave) => (
                    <div key={leave.id} className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded dark:bg-indigo-950/20 dark:text-indigo-400">{leave.type}</span>
                          <span className="text-[10.5px] text-slate-400 ml-3">
                            {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                          leave.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          leave.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 italic">Reason: "{leave.reason}"</p>

                      {/* Sequential Pipeline visual checklist */}
                      <div className="border-t border-slate-200/50 dark:border-slate-750 pt-3">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-2">Sequential Approval Trace</span>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center text-emerald-650"><CheckCircle2 size={12} className="mr-1" /> Employee Applied</span>
                          <ArrowRight size={10} className="text-slate-400" />
                          <span className={`flex items-center ${leave.status === 'APPROVED' ? 'text-emerald-650' : 'text-slate-400'}`}>
                            <CheckCircle2 size={12} className="mr-1" /> Manager Approve
                          </span>
                          <ArrowRight size={10} className="text-slate-400" />
                          <span className={`flex items-center ${leave.status === 'APPROVED' ? 'text-emerald-650' : 'text-slate-400'}`}>
                            <CheckCircle2 size={12} className="mr-1" /> Deduct Recalculation
                          </span>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==========================================
                    PROJECT TIMESHEETS TAB
         ========================================== */}
      {activeTab === 'TIMESHEETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form column */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-outfit">Log Project Work Hours</h3>
            
            <form onSubmit={handleLogTimesheet} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Select Project</label>
                <select
                  value={timesheetForm.project}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                >
                  <option value="CloudMojo Corporate Portal">CloudMojo Corporate Portal (Internal)</option>
                  <option value="Zoho HR Premium Replica Suite">Zoho HR Premium Replica Suite</option>
                  <option value="Mobile Application Upgrade">Mobile Application Upgrade (React Native)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Activity Date</label>
                <input
                  type="date"
                  required
                  value={timesheetForm.date}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Hours Logged</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={timesheetForm.hoursLogged}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, hoursLogged: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Description of Activities</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Summarize tasks completed during these logged hours..."
                  value={timesheetForm.description}
                  onChange={(e) => setTimesheetForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Log Timesheet Session
              </button>

            </form>
          </div>

          {/* Historical Timesheets List */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 font-outfit">Logged Hours History</h3>
            
            <div className="space-y-4">
              {timesheetHistory.length === 0 ? (
                <p className="text-[12px] text-slate-400 italic text-center py-12">No hours logged yet.</p>
              ) : (
                timesheetHistory.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[12px] text-slate-800 dark:text-white">{t.project}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(t.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-xl">
                        ⏱️ {t.hoursLogged} hrs
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">"{t.description}"</p>
                    <span className="inline-block text-[9px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                      {t.status || 'SUBMITTED'}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AttendanceTime;
