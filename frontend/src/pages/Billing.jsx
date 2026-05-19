"use client";

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  ShieldAlert, 
  CreditCard, 
  Sparkles, 
  Check, 
  UserCheck, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const Billing = () => {
  const { isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState(null);
  const [subDetails, setSubDetails] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activePlan, setActivePlan] = useState(null);
  const [plansList, setPlansList] = useState([
    { id: '1', name: 'Free Tier', price: 0, description: 'Perfect for small teams and startups', maxEmployees: 10, features: ['Basic Core HR & Directory', 'Self Service Attendance Clock-in', '1 Active Review Cycle', '100 MB Document Storage Limit'] },
    { id: '2', name: 'Pro SaaS', price: 49, description: 'Robust advanced HR suite', maxEmployees: 100, features: ['Advanced Performance OKRs', 'Custom Forms Builder Access', 'Standard Developer APIs Access', '5 GB Secure Document Storage'] },
    { id: '3', name: 'Enterprise', price: 199, description: 'High scale customized workspace', maxEmployees: 9999, features: ['SSO & Active Directory Support', 'Priority SLA 24/7 Support Desk', 'Unlimited Employees Scaling', '50 GB Secure Document Vault'] }
  ]);

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const loadBillingDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current subscription status
      const res = await api.saas.getSubscription();
      setOrgData(res.data.organization);
      const sub = res.data.subscription || {};
      setSubDetails(sub);
      
      // Get all employees to calculate usage
      const empRes = await api.employees.getAll();
      setEmployeeCount(empRes.data?.length || 0);

      // Get plans list dynamically
      try {
        const plansRes = await api.saas.getPlans();
        if (plansRes.data?.length > 0) {
          setPlansList(plansRes.data);
        }
      } catch (e) {
        console.log('Using fallback plans configuration');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve billing statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingDetails();
  }, []);

  // Set active plan details helper
  useEffect(() => {
    if (subDetails && plansList.length > 0) {
      const active = plansList.find(p => p.id === String(subDetails.planId));
      setActivePlan(active || plansList[0]);
    }
  }, [subDetails, plansList]);

  const handlePlanChange = async (planId, planName) => {
    if (!isAdmin) {
      alert('Only Organization Admins can perform billing modifications.');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      setSuccessMsg('');
      
      const res = await api.saas.upgrade(planId, simulateFailure);
      
      setSuccessMsg(res.data.message);
      confetti({ particleCount: 100, spread: 70 });
      await loadBillingDetails();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to change plan to ${planName}.`);
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm text-center space-y-4 max-w-md mx-auto mt-12">
        <AlertTriangle size={48} className="text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold font-outfit text-slate-800 dark:text-white">Admin Credentials Required</h3>
        <p className="text-[13px] text-slate-400">Only the tenant Owner or Organization Administrator is authorized to view invoices or modify subscription parameters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Top Banner and Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-outfit">SaaS Billing & Subscriptions</h2>
          <p className="text-[13px] text-slate-400">Manage plan limits, review employee limits, and test billing system states.</p>
        </div>
        <button 
          onClick={loadBillingDetails}
          className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-200 cursor-pointer self-start transition-all"
        >
          <RefreshCw size={12} />
          <span>Refresh Details</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading Billing Stats...</div>
      ) : (
        <div className="space-y-8">
          
          {/* Active Status Header Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Plan Info Card */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Active Subscription</span>
                  {subDetails?.status === 'PAST_DUE' ? (
                    <span className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                      PAST DUE (FROZEN)
                    </span>
                  ) : (
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400">
                      ACTIVE & SECURED
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white font-outfit">
                  {activePlan ? activePlan.name : 'Corporate Free'}
                </h3>
                <p className="text-[12px] text-slate-400">
                  {activePlan ? activePlan.description : 'Standard Starter tier for basic operations.'}
                </p>
                
                {/* Billing Cycle Details */}
                <div className="pt-2 flex items-center space-x-6 text-[11px] text-slate-500 font-medium">
                  <div>
                    <span className="text-slate-400">Renewal Cycle:</span> 30 Days
                  </div>
                  <div>
                    <span className="text-slate-400">Next Invoice:</span> {subDetails?.billingCycleEnd ? new Date(subDetails.billingCycleEnd).toLocaleDateString() : '2026-06-18'}
                  </div>
                </div>
              </div>

              {/* Recovery Option if Frozen */}
              {subDetails?.status === 'PAST_DUE' && (
                <button
                  onClick={() => handlePlanChange(activePlan?.id || '1', activePlan?.name || 'Free')}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-lg shadow-emerald-600/15 cursor-pointer transition-all self-stretch md:self-auto flex items-center justify-center space-x-2"
                >
                  <CreditCard size={14} />
                  <span>Pay Invoice & Restore</span>
                </button>
              )}
            </div>

            {/* Simulated payment toggle switcher */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-indigo-650 dark:text-indigo-400">
                  <AlertTriangle size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">SaaS Simulation Control</span>
                </div>
                <h4 className="font-bold text-slate-850 dark:text-white text-sm">Simulate Payment Failure</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Turn this ON then click any plan upgrade card to simulate failed subscription recurring charge. This triggers account freezing.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] font-bold text-slate-500 uppercase">Failed Payment Sandbox:</span>
                <button
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer outline-none ${
                    simulateFailure ? 'bg-indigo-600' : 'bg-slate-350 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      simulateFailure ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Messages Shelves */}
          {error && (
            <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium max-w-xl">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-xs font-medium max-w-xl">
              <Sparkles size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Usage Gauges */}
          <div className="bg-white border border-slate-100 p-8 rounded-3xl dark:bg-slate-900 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Resource Usage Meters</h3>
              <p className="text-[12px] text-slate-400">Track current limits and active users inside this workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Employee Limit progress bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Active Personnel Limit</span>
                  <span className="text-slate-800 dark:text-white font-mono">
                    {employeeCount} / {activePlan ? activePlan.maxEmployees : 10} Employees
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (employeeCount / (activePlan ? activePlan.maxEmployees : 10)) >= 0.9 
                        ? 'bg-amber-500' 
                        : 'bg-indigo-650'
                    }`}
                    style={{ width: `${Math.min(100, (employeeCount / (activePlan ? activePlan.maxEmployees : 10)) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Free tier restricts users to maximum 10 hires. Downgrades will freeze new hires until limit is respected.
                </p>
              </div>

              {/* Secure Storage limit progress bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span>Document Vault Storage</span>
                  <span className="text-slate-800 dark:text-white font-mono">
                    {activePlan?.id === '1' ? '12 MB / 100 MB' : activePlan?.id === '2' ? '85 MB / 5 GB' : '124 MB / 50 GB'}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-650 rounded-full transition-all duration-500"
                    style={{ width: `${activePlan?.id === '1' ? 12 : activePlan?.id === '2' ? 1.7 : 0.2}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Storage caps are enforced based on subscription size. Check vault profiles under directory for scans uploads.
                </p>
              </div>

            </div>
          </div>

          {/* Plan Options Selector Grid */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-outfit">Available SaaS Pricing Tiers</h3>
              <p className="text-[12px] text-slate-400">Upgrade or downgrade instantly. Limits adjust dynamically in real time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plansList.map((plan) => {
                const isCurrent = String(subDetails?.planId) === String(plan.id);
                return (
                  <div
                    key={plan.id}
                    className={`bg-white border rounded-3xl p-6 dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-6 ${
                      isCurrent 
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/5 ring-1 ring-indigo-600/10' 
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-850 dark:text-white font-outfit text-[15px]">{plan.name}</h4>
                          <span className="text-[10px] text-slate-400">{plan.description}</span>
                        </div>
                        {isCurrent && (
                          <span className="bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline space-x-0.5">
                        <span className="text-2xl font-black text-slate-850 dark:text-white font-mono">${plan.price}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">/ mo</span>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2 text-[11px] text-slate-550 dark:text-slate-400">
                        <div className="flex items-center space-x-2 font-semibold">
                          <UserCheck size={12} className="text-slate-400 shrink-0" />
                          <span>Max {plan.maxEmployees} Employees Limit</span>
                        </div>
                        <ul className="space-y-1.5 pt-1">
                          {plan.features.slice(0, 3).map((f) => (
                            <li key={f} className="flex items-start space-x-2">
                              <Check size={12} className="text-indigo-550 dark:text-indigo-400 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePlanChange(plan.id, plan.name)}
                      disabled={updating || isCurrent}
                      className={`w-full py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                          : plan.price === 49 
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10'
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                      }`}
                    >
                      <span>{isCurrent ? 'Current Billing Active' : 'Switch Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Billing;
