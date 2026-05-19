"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import { Sparkles, ShieldCheck, Mail, Lock, Building, Globe, ArrowRight, Check, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import Logo from '../components/Logo';

const Signup = () => {
  const router = useRouter();

  // Registration states
  const [step, setStep] = useState(1); // 1: Org Info, 2: Choose Plan, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Organization context after step 1
  const [createdOrgId, setCreatedOrgId] = useState(null);
  const [createdOrgSlug, setCreatedOrgSlug] = useState('');

  // Plans details (fetched or hardcoded backup)
  const [plans, setPlans] = useState([
    { id: '1', name: 'Free Tier', price: 0, description: 'Perfect for small teams and startups', maxEmployees: 10, features: ['Basic Core HR & Directory', 'Self Service Attendance Clock-in', '1 Active Review Cycle', '100 MB Document Storage Limit'] },
    { id: '2', name: 'Pro SaaS', price: 49, description: 'Robust advanced HR suite', maxEmployees: 100, features: ['Advanced Performance OKRs', 'Custom Forms Builder Access', 'Standard Developer APIs Access', '5 GB Secure Document Storage'] },
    { id: '3', name: 'Enterprise', price: 199, description: 'High scale customized workspace', maxEmployees: 9999, features: ['SSO & Active Directory Support', 'Priority SLA 24/7 Support Desk', 'Unlimited Employees Scaling', '50 GB Secure Document Vault'] }
  ]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.saas.getPlans();
        if (res.data && res.data.length > 0) {
          setPlans(res.data);
        }
      } catch (err) {
        console.log('Using backup plans configuration:', err.message);
      }
    };
    fetchPlans();
  }, []);

  const handleOrgRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    
    setError('');
    setSubmitting(true);
    try {
      const res = await api.auth.register({
        name: formData.name,
        slug: formData.slug.trim().toLowerCase(),
        email: formData.email,
        password: formData.password
      });

      const orgId = res.data.organization?.id;
      const slugVal = res.data.organization?.slug;

      setCreatedOrgId(orgId);
      setCreatedOrgSlug(slugVal);
      
      // Store slug so Axios adds header
      localStorage.setItem('tenantSlug', slugVal);
      
      confetti({ particleCount: 80, spread: 60 });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register organization. Subdomain may already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPlan = async (planId, planName) => {
    setError('');
    setSubmitting(true);
    try {
      // Simulate upgrade call (bypasses direct payment Gateway checkout in this replica)
      await api.saas.upgrade(planId, false);
      
      confetti({ particleCount: 150, spread: 80 });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to activate ${planName} subscription.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16 overflow-hidden">
      {/* Glow animations */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10 space-y-8">
        
        {/* Progress Header */}
        <div className="max-w-md mx-auto flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-indigo-400 font-extrabold' : ''}`}>
            <span className="h-6 w-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Organization</span>
          </div>
          <div className="h-px bg-slate-850 flex-1 mx-4"></div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-indigo-400 font-extrabold' : ''}`}>
            <span className="h-6 w-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Billing Plan</span>
          </div>
          <div className="h-px bg-slate-850 flex-1 mx-4"></div>
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-indigo-400 font-extrabold' : ''}`}>
            <span className="h-6 w-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Ready</span>
          </div>
        </div>

        {/* STEP 1: ORGANIZATION REGISTRATION */}
        {step === 1 && (
          <div className="w-full max-w-lg mx-auto bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="mb-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-950/40 border border-slate-800 shadow-xl">
                  <Logo size={36} />
                </div>
              </div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Sparkles size={12} />
                <span>Multi-Tenant Enterprise SaaS</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white font-outfit">Create Workspace</h2>
              <p className="text-slate-400 text-xs mt-1.5">Configure your isolated tenant instance on the network.</p>
            </div>

            {error && (
              <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium mb-6">
                <ShieldCheck size={16} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleOrgRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Organization Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Building size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Subdomain (Slug)</label>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">{formData.slug ? `${formData.slug.trim().toLowerCase()}.hr-app.com` : 'unique slug'}</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Globe size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="acme"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Admin Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="admin@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl outline-none text-[13px] text-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer text-[13px] group"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Create & Continue</span>
                    <ArrowRight size={16} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an organization?{' '}
              <button onClick={() => router.push('/login')} className="text-indigo-400 font-bold hover:underline">
                Log In
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SUBSCRIPTION PLAN */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white font-outfit">Choose Your Subscription Plan</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">Activate tenant access. You can simulate instant tier upgrades or failed billing modes at any time.</p>
            </div>

            {error && (
              <div className="max-w-md mx-auto flex items-center space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-medium mb-6">
                <ShieldCheck size={16} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-slate-900/40 border rounded-3xl p-8 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6 hover:scale-[1.02] transition-transform duration-350 ${
                    plan.price === 49 
                      ? 'border-indigo-500 shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-white font-outfit">{plan.name}</h3>
                        <p className="text-slate-400 text-[11px] mt-1">{plan.description}</p>
                      </div>
                      {plan.price === 49 && (
                        <span className="bg-indigo-650 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline space-x-1 py-2">
                      <span className="text-3xl font-black text-white font-mono">${plan.price}</span>
                      <span className="text-xs text-slate-500 font-bold uppercase">/ month</span>
                    </div>

                    <div className="border-t border-slate-850 pt-4 space-y-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enforced Limits</p>
                      <div className="text-[12px] font-semibold text-slate-350">
                        <span>Max {plan.maxEmployees} Employees Capacity</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-4 space-y-2.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Features Included</p>
                      <ul className="space-y-2 text-[12px] text-slate-400">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start space-x-2">
                            <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.name)}
                    disabled={submitting}
                    className={`w-full py-3 rounded-xl text-[12px] font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      plan.price === 49
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/15'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                    }`}
                  >
                    {submitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Zap size={14} />
                        <span>Select Plan & Activate</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: REGISTRATION COMPLETE SUCCESS */}
        {step === 3 && (
          <div className="w-full max-w-md mx-auto bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-950/40 border border-slate-800 shadow-xl">
                <Logo size={44} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white font-outfit">Setup Completed!</h2>
              <p className="text-slate-400 text-xs">Your isolated SaaS tenant is initialized and active.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-850 space-y-2.5 font-mono text-[11px] text-slate-350">
              <div>
                <span className="text-slate-500">Organization:</span> {formData.name}
              </div>
              <div>
                <span className="text-slate-500">Tenant Domain:</span> {createdOrgSlug}.hr-app.com
              </div>
              <div>
                <span className="text-slate-500">Admin Email:</span> {formData.email}
              </div>
            </div>

            <button
              onClick={() => router.push('/login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer text-[13px]"
            >
              Sign In to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Signup;
