"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { Sparkles, ShieldCheck, ShieldAlert, Lock, Mail, Building, User, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const AcceptInvite = ({ inviteId: propInviteId }) => {
  const router = useRouter();
  const params = useParams();
  
  // Support both page-level param or router prop
  const inviteId = propInviteId || params?.inviteId;

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [invite, setInvite] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInviteDetails = async () => {
      if (!inviteId) return;
      try {
        setLoadingDetails(true);
        setError('');
        const res = await axios.get(`/api/auth/invite/${inviteId}`);
        setInvite(res.data.invite);
        setOrganizationName(res.data.organizationName);
      } catch (err) {
        setError(err.response?.data?.message || 'This invitation link is invalid or has already been accepted.');
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchInviteDetails();
  }, [inviteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await axios.post('/api/auth/accept-invite', {
        inviteId,
        password
      });

      confetti({ particleCount: 120, spread: 80 });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 py-16 overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        
        {loadingDetails ? (
          <div className="text-center text-white space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="text-sm font-medium text-slate-400">Loading Secure invitation details...</p>
          </div>
        ) : error && !success ? (
          <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="h-12 w-12 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-400">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-outfit">Invitation Error</h2>
            <p className="text-slate-400 text-xs leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer text-xs"
            >
              Back to Login
            </button>
          </div>
        ) : success ? (
          <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center space-y-6">
            <div className="h-16 w-16 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Check size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white font-outfit">Account Active!</h2>
              <p className="text-slate-400 text-xs">You have successfully accepted the invitation and joined the team.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl text-left border border-slate-850 space-y-1.5 font-mono text-[11px] text-slate-350">
              <div><span className="text-slate-500">Organization:</span> {organizationName}</div>
              <div><span className="text-slate-500">Corporate Email:</span> {invite?.email}</div>
              <div><span className="text-slate-500">Assigned Role:</span> {invite?.role}</div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] cursor-pointer text-[13px]"
            >
              Sign In to Corporate Portal
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Sparkles size={12} />
                <span>Join Team Workspace</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white font-outfit">Accept Invite</h2>
              <p className="text-slate-400 text-xs mt-1.5">Configure your password to complete setup.</p>
            </div>

            {/* Visual Org Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-[12px]">
              <div className="flex items-center space-x-2.5 text-slate-350">
                <Building size={16} className="text-indigo-450 shrink-0" />
                <span>Organization: <strong className="text-white">{organizationName}</strong></span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-350">
                <User size={16} className="text-indigo-450 shrink-0" />
                <span>Invited as: <strong className="text-white">{invite?.firstName} {invite?.lastName}</strong></span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-350">
                <Mail size={16} className="text-indigo-450 shrink-0" />
                <span>Assigned Email: <strong className="text-white">{invite?.email}</strong></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-widest">Choose Secure Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <span>Complete Corporate Signup</span>
                    <ArrowRight size={16} className="ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AcceptInvite;
