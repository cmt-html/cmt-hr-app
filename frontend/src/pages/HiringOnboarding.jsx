"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Briefcase, 
  UserCheck, 
  LogOut, 
  Plus, 
  MapPin, 
  Layers, 
  ArrowRight,
  ShieldCheck, 
  Info,
  Calendar,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

const HiringOnboarding = () => {
  const { user, isAdmin, isHR } = useAuth();
  
  // Tabs: 'JOBS_RECRUIT' | 'ONBOARDING' | 'OFFBOARDING'
  const [activeTab, setActiveTab] = useState('JOBS_RECRUIT');

  // Common State
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [separations, setSeparations] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Job Opening State
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    department: 'Technology',
    requirements: '',
    salaryRange: '$90,000 - $120,050'
  });

  // Apply Job State
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyForm, setApplyForm] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '/mock/resumes/resume.pdf'
  });

  // Resignation Separation Form State
  const [separationForm, setSeparationForm] = useState({
    reason: 'Moving to a new career opportunity.',
    lastWorkingDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days notice
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.hiring.getJobs();
      setJobs(jobsRes.data || []);

      const applicantsRes = await api.hiring.getApplicants();
      setApplicants(applicantsRes.data || []);

      const exitRes = await api.offboarding.getSeparations();
      setSeparations(exitRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) return;

    try {
      await api.hiring.createJob(newJob);
      confetti({ particleCount: 50 });
      alert('New job opening posted successfully!');
      setShowJobForm(false);
      setNewJob({
        title: '',
        description: '',
        department: 'Technology',
        requirements: '',
        salaryRange: '$90,000 - $120,050'
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email) return;

    try {
      await api.hiring.applyJob({
        jobId: selectedJob.id,
        ...applyForm
      });
      confetti({ particleCount: 80, spread: 60 });
      alert('Application submitted successfully!');
      setSelectedJob(null);
      setApplyForm({ name: '', email: '', phone: '', resumeUrl: '/mock/resumes/resume.pdf' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (applicantId, status) => {
    try {
      await api.hiring.updateApplicantStatus(applicantId, status);
      if (status === 'HIRED') {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      }
      alert(`Applicant status upgraded to ${status}!`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOnboardingTask = async (applicantId, taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';
      await api.hiring.updateOnboardingTask(applicantId, taskId, nextStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyResignation = async (e) => {
    e.preventDefault();
    try {
      await api.offboarding.requestSeparation({
        userId: user.id,
        ...separationForm
      });
      confetti({ particleCount: 50 });
      alert('Resignation request raised. Clearance tracking checklist initialized.');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleExitTask = async (exitId, taskId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';
      await api.offboarding.updateExitTask(exitId, taskId, nextStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExitDecision = async (exitId, decision) => {
    try {
      await api.offboarding.updateExitStatus(exitId, decision);
      alert(`Exit separation state changed to ${decision}.`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">Recruitment & Employee Lifecycle</h2>
          <p className="text-[13px] text-slate-400">Track candidates, onboard hired employees, and manage exit separation workflows.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('JOBS_RECRUIT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'JOBS_RECRUIT' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Briefcase size={12} className="inline mr-1" />
            Recruitment Board
          </button>
          <button
            onClick={() => setActiveTab('ONBOARDING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ONBOARDING' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck size={12} className="inline mr-1" />
            Onboarding Checklist
          </button>
          <button
            onClick={() => setActiveTab('OFFBOARDING')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OFFBOARDING' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LogOut size={12} className="inline mr-1" />
            Separation Clearances
          </button>
        </div>
      </div>

      {/* ==========================================
                  RECRUITMENT BOARD TAB
         ========================================== */}
      {activeTab === 'JOBS_RECRUIT' && (
        <div className="space-y-8">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Open Career Opportunities</h3>
            {(isAdmin || isHR) && (
              <button
                onClick={() => setShowJobForm(true)}
                className="flex items-center space-x-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>Post Job Opening</span>
              </button>
            )}
          </div>

          {/* Jobs Listing grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded dark:bg-indigo-950/20 dark:text-indigo-400">{job.department}</span>
                  <span className="text-[10px] text-slate-450 font-bold">{job.salaryRange}</span>
                </div>
                <h4 className="font-outfit font-extrabold text-[15px] text-slate-800 dark:text-white leading-tight">{job.title}</h4>
                <p className="text-[12px] text-slate-500 line-clamp-3 leading-relaxed">"{job.description}"</p>
                
                <div className="border-t border-slate-100/70 pt-3 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-450">Requirements: {job.requirements || 'Experience in SaaS development'}</span>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Kanban Applicant Pipeline Visualizer (For Admins / HR) */}
          {(isAdmin || isHR) && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Recruitment Applicant Pipeline</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pipeline Category 1: NEW APPLICATIONS */}
                <div className="bg-slate-50 p-4 rounded-2xl dark:bg-slate-850 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">New (Awaiting Review)</span>
                  <div className="space-y-3">
                    {applicants.filter(a => a.status === 'NEW').map((app) => (
                      <div key={app.id} className="bg-white border border-slate-150 p-3 rounded-xl dark:bg-slate-900 dark:border-slate-800 space-y-2">
                        <h5 className="font-bold text-[11px] text-slate-800 dark:text-white">{app.name}</h5>
                        <p className="text-[9px] text-slate-400">{app.job?.title || 'General Application'}</p>
                        
                        <div className="flex gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'INTERVIEWED')}
                            className="flex-1 py-1 bg-indigo-600 text-white text-[8px] font-black rounded cursor-pointer"
                          >
                            Interview
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Category 2: INTERVIEWED */}
                <div className="bg-slate-50 p-4 rounded-2xl dark:bg-slate-850 space-y-3">
                  <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider dark:text-indigo-400">Interview Scheduled</span>
                  <div className="space-y-3">
                    {applicants.filter(a => a.status === 'INTERVIEWED').map((app) => (
                      <div key={app.id} className="bg-white border border-slate-150 p-3 rounded-xl dark:bg-slate-900 dark:border-slate-800 space-y-2">
                        <h5 className="font-bold text-[11px] text-slate-800 dark:text-white">{app.name}</h5>
                        <p className="text-[9px] text-slate-400">{app.job?.title}</p>
                        
                        <div className="flex gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'HIRED')}
                            className="flex-1 py-1 bg-emerald-500 text-white text-[8px] font-black rounded cursor-pointer"
                          >
                            Hire Candidate 🎉
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            className="flex-1 py-1 bg-rose-500 text-white text-[8px] font-black rounded cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pipeline Category 3: HIRED (TRIGGER ONBOARDING) */}
                <div className="bg-slate-50 p-4 rounded-2xl dark:bg-slate-850 space-y-3">
                  <span className="text-[10px] font-bold text-emerald-650 block uppercase tracking-wider">Hired & Onboarding</span>
                  <div className="space-y-3">
                    {applicants.filter(a => a.status === 'HIRED').map((app) => (
                      <div key={app.id} className="bg-white border border-slate-150 p-3 rounded-xl dark:bg-slate-900 dark:border-slate-800 space-y-1.5">
                        <h5 className="font-bold text-[11px] text-slate-800 dark:text-white">{app.name}</h5>
                        <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black dark:bg-emerald-950/20 dark:text-emerald-400">HIRED</span>
                        <p className="text-[9px] text-slate-450 italic mt-1">Onboarding checklist triggered.</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                  ONBOARDING CHECKLIST TAB
         ========================================== */}
      {activeTab === 'ONBOARDING' && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Hired Employee Onboarding Checklists</h3>
              <p className="text-[12px] text-slate-400">Allocate SaaS accounts, provisions hardware and office desk keys.</p>
            </div>
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/30">
              <UserCheck size={20} />
            </span>
          </div>

          {applicants.filter(a => a.status === 'HIRED').length === 0 ? (
            <p className="text-center py-12 text-[12px] text-slate-400 italic">No onboarded employees currently in checklist flow.</p>
          ) : (
            <div className="space-y-8">
              {applicants.filter(a => a.status === 'HIRED').map((emp) => {
                const tasks = emp.onboardingTasks || [];
                const completedCount = tasks.filter(t => t.status === 'DONE').length;
                return (
                  <div key={emp.id} className="p-6 bg-slate-50 rounded-2xl dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[14px] text-slate-850 dark:text-white">{emp.name}</h4>
                        <p className="text-[10px] text-slate-400">Position: {emp.job?.title || 'Engineer'}</p>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-650 dark:text-indigo-400 font-mono">
                        {completedCount} / {tasks.length} Checklist Cleared
                      </span>
                    </div>

                    {/* Checkbox Listing */}
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 text-[12px]">
                          <input
                            type="checkbox"
                            checked={task.status === 'DONE'}
                            onChange={() => handleToggleOnboardingTask(emp.id, task.id, task.status)}
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 outline-none cursor-pointer"
                          />
                          <span className={`flex-1 ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-650 dark:text-slate-300'}`}>
                            {task.task}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.assignee === 'IT' ? 'bg-blue-50 text-blue-600' :
                            task.assignee === 'HR' ? 'bg-pink-50 text-pink-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {task.assignee} Department
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                  OFFBOARDING CLEARANCES TAB
         ========================================== */}
      {activeTab === 'OFFBOARDING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Employee Resignation Request Form */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-6 font-outfit">Raise Resignation Request</h3>
            
            <form onSubmit={handleApplyResignation} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Resignation Reason</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide career alignment or exit feedback context..."
                  value={separationForm.reason}
                  onChange={(e) => setSeparationForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Requested Last Working Day</label>
                <input
                  type="date"
                  required
                  value={separationForm.lastWorkingDay}
                  onChange={(e) => setSeparationForm(prev => ({ ...prev, lastWorkingDay: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-rose-500/10 cursor-pointer"
              >
                Submit Resignation
              </button>

            </form>
          </div>

          {/* Offboarding checklists clearances (Visible for Managers / HR/Admin) */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-6 font-outfit">Exit Clearances Checklists</h3>
            
            <div className="space-y-6">
              {separations.length === 0 ? (
                <p className="text-center py-12 text-[12px] text-slate-400 italic">No exit files raised currently.</p>
              ) : (
                separations.map((exit) => {
                  const tasks = exit.offboardingTasks || [];
                  return (
                    <div key={exit.id} className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-[12px] text-slate-800 dark:text-white">{exit.user?.firstName} {exit.user?.lastName}</h4>
                          <span className="text-[9px] text-slate-400">Exit Reason: "{exit.reason}"</span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                          exit.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {exit.status}
                        </span>
                      </div>

                      {/* clearances Checklist */}
                      <div className="space-y-3.5 pt-2 border-t border-slate-200/40 dark:border-slate-750">
                        <span className="text-[9px] font-bold text-slate-450 uppercase block">Clearance status</span>
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-2 text-[11px]">
                            <input
                              type="checkbox"
                              checked={task.status === 'DONE'}
                              onChange={() => handleToggleExitTask(exit.id, task.id, task.status)}
                              className="h-3.5 w-3.5 text-indigo-650 cursor-pointer"
                            />
                            <span className={`flex-1 ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-650 dark:text-slate-350'}`}>
                              {task.task}
                            </span>
                            <span className="text-[8px] bg-slate-200 text-slate-650 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-450">{task.assignee}</span>
                          </div>
                        ))}
                      </div>

                      {/* Approval triggers */}
                      {exit.status === 'PENDING' && (isAdmin || isHR) && (
                        <div className="flex gap-2 pt-2 border-t border-slate-200/40">
                          <button
                            onClick={() => handleExitDecision(exit.id, 'APPROVED')}
                            className="flex-1 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Approve Separation
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

      {/* ==========================================
                APPLY JOB DIALOG MODAL
         ========================================== */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Apply for {selectedJob.title}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleApplyJob} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={applyForm.name}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={applyForm.email}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={applyForm.phone}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Submit Application
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
                POST JOB OPENING MODAL
         ========================================== */}
      {showJobForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Post New Job Opening</h3>
              <button onClick={() => setShowJobForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Job Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe standard responsibilities..."
                  value={newJob.description}
                  onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Salary Range</label>
                  <input
                    type="text"
                    value={newJob.salaryRange}
                    onChange={(e) => setNewJob(prev => ({ ...prev, salaryRange: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Requirements</label>
                  <input
                    type="text"
                    placeholder="e.g. 5+ Years React Native"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Post Opening Now
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HiringOnboarding;
