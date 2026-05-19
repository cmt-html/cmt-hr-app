"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Award, 
  CheckSquare, 
  ArrowUpRight, 
  TrendingUp, 
  Star, 
  FileDown, 
  Plus, 
  Sliders,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Performance = () => {
  const { user, isAdmin, isManager } = useAuth();
  
  // Tabs: 'OKRS' | 'REVIEWS'
  const [activeTab, setActiveTab] = useState('OKRS');

  // Common State
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Goal Form State
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: '100',
    currentValue: '0',
    unit: '%',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days out
  });

  // Goal Progress Update Modal State
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [updateValue, setUpdateValue] = useState('0');

  // Review Evaluation Modal State
  const [selectedReview, setSelectedReview] = useState(null);
  const [selfEvalComment, setSelfEvalComment] = useState('');
  const [managerRating, setManagerRating] = useState('5');
  const [managerComment, setManagerComment] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const goalsRes = await api.performance.getGoals(user.id);
      setGoals(goalsRes.data || []);

      const reviewsRes = await api.performance.getReviews(user.id);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title) return;

    try {
      await api.performance.createGoal({
        userId: user.id,
        ...newGoal
      });
      confetti({ particleCount: 75, spread: 60 });
      alert('Goal created and submitted for manager approval!');
      setShowGoalForm(false);
      setNewGoal({
        title: '',
        description: '',
        targetValue: '100',
        currentValue: '0',
        unit: '%',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      alert('Goal creation failed.');
    }
  };

  const handleUpdateGoalProgress = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      const val = parseInt(updateValue);
      const isComplete = val >= selectedGoal.targetValue;
      const status = isComplete ? 'COMPLETED' : selectedGoal.status;

      await api.performance.updateGoalProgress(selectedGoal.id, val, status);
      
      if (isComplete) {
        confetti({ particleCount: 100, spread: 80 });
      }

      alert('OKR Goal progress updated!');
      setSelectedGoal(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveGoal = async (goalId) => {
    try {
      await api.performance.approveGoal(goalId);
      confetti({ particleCount: 50 });
      alert('Goal OKR officially APPROVED by Manager!');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSelfReview = async (e) => {
    e.preventDefault();
    if (!selfEvalComment) return;

    try {
      await api.performance.submitSelfReview(selectedReview.id, selfEvalComment);
      confetti({ particleCount: 50 });
      alert('Self appraisal evaluation submitted to manager!');
      setSelectedReview(null);
      setSelfEvalComment('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitManagerReview = async (e) => {
    e.preventDefault();
    if (!managerComment) return;

    try {
      await api.performance.submitManagerReview(selectedReview.id, parseInt(managerRating), managerComment);
      confetti({ particleCount: 150, spread: 90 });
      alert('Manager appraisal final scorecard saved successfully!');
      setSelectedReview(null);
      setManagerComment('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadAppraisalPDF = (review) => {
    // Confetti celebration
    confetti({ particleCount: 80, spread: 60 });
    
    // Create mock download link
    const fileContent = `
    ======================================================
                  CLOUDMILL CORPORATION
              PERFORMANCE APPRAISAL SCORECARD
    ======================================================
    Cycle Name: ${review.cycleName}
    Employee:   ${review.reviewee?.firstName} ${review.reviewee?.lastName}
    Evaluator:  ${review.reviewer?.firstName} ${review.reviewer?.lastName}
    ------------------------------------------------------
    SELF EVALUATION:
    "${review.selfReview || 'No self-comments recorded.'}"
    
    MANAGER RATING:  ${'★'.repeat(review.rating)} (${review.rating} / 5)
    MANAGER FEEDBACK:
    "${review.comments || 'No manager comments recorded.'}"
    ------------------------------------------------------
    Generated via Zoho HRMS engine. Security verified.
    ======================================================
    `;

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appraisal_${review.reviewee?.firstName}_${review.cycleName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Header and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">Performance (OKRs & Appraisals)</h2>
          <p className="text-[13px] text-slate-400">Track key OKR targets and complete annual performance review cycles.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setActiveTab('OKRS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'OKRS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders size={12} className="inline mr-1" />
            OKR Goals Progress
          </button>
          <button
            onClick={() => setActiveTab('REVIEWS')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'REVIEWS' ? 'bg-white text-indigo-650 shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Star size={12} className="inline mr-1" />
            Performance Reviews
          </button>
        </div>
      </div>

      {/* ==========================================
                    OKR GOALS LIST TAB
         ========================================== */}
      {activeTab === 'OKRS' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Active Objectives & Key Results (OKRs)</h3>
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center space-x-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-xl cursor-pointer shadow-md shadow-indigo-600/10"
            >
              <Plus size={14} />
              <span>Create OKR Goal</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading OKRs...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
              No objective goals submitted yet. Hit "Create OKR Goal" to add yours.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => {
                const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[14px] text-slate-850 dark:text-white leading-snug">{goal.title}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{goal.description}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        goal.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' :
                        goal.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' :
                        'bg-amber-500/10 text-amber-600'
                      }`}>
                        {goal.status}
                      </span>
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Progress Tracker</span>
                        <span className="text-indigo-650 dark:text-indigo-400 font-mono">{goal.currentValue} / {goal.targetValue} {goal.unit} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden dark:bg-slate-800">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[10px] border-t border-slate-100/70 dark:border-slate-800">
                      <span className="text-slate-400">Ends: {new Date(goal.endDate).toLocaleDateString()}</span>
                      
                      {/* Action buttons */}
                      <div className="flex items-center space-x-2">
                        {goal.status === 'PENDING' && isManager && (
                          <button
                            onClick={() => handleApproveGoal(goal.id)}
                            className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                          >
                            <Check size={10} />
                            <span>Approve</span>
                          </button>
                        )}
                        {goal.status !== 'COMPLETED' && (
                          <button
                            onClick={() => { setSelectedGoal(goal); setUpdateValue(goal.currentValue.toString()); }}
                            className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                          >
                            Update Progress
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                    APPRAISALS & REVIEWS TAB
         ========================================== */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          
          <h3 className="text-lg font-bold text-slate-850 dark:text-white font-outfit">Appraisal Scorecards & Feedback</h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading appraisals...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
              No active performance review cycles allocated on file.
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-850 dark:text-white font-outfit">{rev.cycleName}</h4>
                      <p className="text-[10px] text-slate-400">
                        Employee: <strong className="text-slate-600 dark:text-slate-300">{rev.reviewee?.firstName} {rev.reviewee?.lastName}</strong> • Reviewer: <strong className="text-slate-650">{rev.reviewer?.firstName || 'Org Manager'}</strong>
                      </p>
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                      rev.status === 'FINISHED' ? 'bg-emerald-500/10 text-emerald-600' :
                      rev.status === 'SELF_COMPLETED' ? 'bg-purple-500/10 text-purple-600' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {rev.status === 'SELF_COMPLETED' ? 'AWAITING MANAGER FEEDBACK' : rev.status}
                    </span>
                  </div>

                  {/* Comments row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                    <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850">
                      <span className="text-[9px] font-bold text-slate-450 uppercase block mb-1">Employee Self Appraisal Evaluation</span>
                      <p className="text-slate-650 dark:text-slate-350 italic">
                        {rev.selfReview ? `"${rev.selfReview}"` : 'Awaiting self submission...'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl dark:bg-slate-850">
                      <span className="text-[9px] font-bold text-slate-450 uppercase block mb-1">Manager Scorecard Rating & Comments</span>
                      {rev.status === 'FINISHED' ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center text-amber-500 mb-1">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={14} fill="currentColor" />
                            ))}
                            {Array.from({ length: 5 - rev.rating }).map((_, i) => (
                              <Star key={i} size={14} className="text-slate-300" />
                            ))}
                            <span className="text-slate-700 dark:text-slate-300 font-bold ml-2 text-[11px]">({rev.rating}/5)</span>
                          </div>
                          <p className="text-slate-650 dark:text-slate-350 italic">"{rev.comments}"</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Awaiting manager scorecard finalization.</p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-100/70 pt-4 flex items-center justify-between dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Info size={12} className="mr-1" />
                      Appraisals align with salary adjustment pipelines.
                    </span>

                    <div className="flex items-center space-x-2">
                      {rev.status === 'PENDING' && rev.revieweeId === user.id && (
                        <button
                          onClick={() => { setSelectedReview(rev); setSelfEvalComment(''); }}
                          className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Complete Self Review
                        </button>
                      )}
                      {rev.status === 'SELF_COMPLETED' && isManager && rev.reviewerId === user.id && (
                        <button
                          onClick={() => { setSelectedReview(rev); setManagerRating('5'); setManagerComment(''); }}
                          className="py-1.5 px-4 bg-purple-650 hover:bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Submit Manager Rating
                        </button>
                      )}
                      {rev.status === 'FINISHED' && (
                        <button
                          onClick={() => handleDownloadAppraisalPDF(rev)}
                          className="py-1.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750"
                        >
                          <FileDown size={14} />
                          <span>Appraisal Summary</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ==========================================
                CREATE OKR GOAL DIALOG MODAL
         ========================================== */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Create Objective Goal OKR</h3>
              <button onClick={() => setShowGoalForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Increase App Performance"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Key Metric Description</label>
                <input
                  type="text"
                  placeholder="e.g. Reduce startup duration metrics"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Target Value</label>
                  <input
                    type="number"
                    required
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Unit</label>
                  <input
                    type="text"
                    required
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Submit Objective
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
                GOAL PROGRESS UPDATE MODAL
         ========================================== */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">Update Goal Progress</h3>
              <button onClick={() => setSelectedGoal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleUpdateGoalProgress} className="space-y-4">
              
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Goal: {selectedGoal.title}</span>
                <span className="text-xs text-slate-500 block leading-snug">Target: {selectedGoal.targetValue} {selectedGoal.unit}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">New Current Value</label>
                <input
                  type="number"
                  required
                  value={updateValue}
                  onChange={(e) => setUpdateValue(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-800 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Save Progress
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
            EVALUATION SUBMISSION MODAL
         ========================================== */}
      {selectedReview && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl max-w-lg w-full space-y-6 animate-slide-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-lg font-outfit text-slate-800 dark:text-white">
                {selectedReview.status === 'PENDING' ? 'Self Appraisal Scorecard' : 'Manager Evaluation Card'}
              </h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>

            {/* Scenario A: Employee Complete Self Review */}
            {selectedReview.status === 'PENDING' && (
              <form onSubmit={handleSubmitSelfReview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Self Evaluation Narrative</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Summarize your key goals achieved, difficulties faced and projects supported this year..."
                    value={selfEvalComment}
                    onChange={(e) => setSelfEvalComment(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-indigo-600/15 cursor-pointer"
                >
                  Save Self Appraisal
                </button>
              </form>
            )}

            {/* Scenario B: Manager Rating & Comments */}
            {selectedReview.status === 'SELF_COMPLETED' && (
              <form onSubmit={handleSubmitManagerReview} className="space-y-4">
                
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[12px] text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900">
                  <span className="font-bold block mb-1">Employee Self Appraisal Comments:</span>
                  <span className="italic">"{selectedReview.selfReview}"</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Performance Rating Score</label>
                  <select
                    value={managerRating}
                    onChange={(e) => setManagerRating(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ Outstanding (5 / 5)</option>
                    <option value="4">⭐⭐⭐⭐ Great Achievement (4 / 5)</option>
                    <option value="3">⭐⭐⭐ Meets Standard (3 / 5)</option>
                    <option value="2">⭐⭐ Needs Focus (2 / 5)</option>
                    <option value="1">⭐ Unacceptable (1 / 5)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Qualitative Manager Feedback</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Summarize rating context, specific actions to improve, and overall contributions..."
                    value={managerComment}
                    onChange={(e) => setManagerComment(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-xl outline-none text-[13px] text-slate-850 dark:bg-slate-850 dark:border-slate-750 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-650 hover:bg-purple-600 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-purple-600/15 cursor-pointer"
                >
                  Finalize Manager Scorecard
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Performance;
