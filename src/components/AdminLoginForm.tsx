'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { loginAdminAction, FormState } from '@/app/actions';

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState<FormState | null, FormData>(
    loginAdminAction,
    null
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none"></div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Student Portal</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl md:rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
        
        {/* Subtle top bar glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-650"></div>

        {/* Card Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-950/20">
            <Lock className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Security Gateway
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
            Administrative Control Panel
          </p>
        </div>

        {/* Action Message / Server Errors */}
        {state && !state.success && state.message && (
          <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex gap-3 text-red-300 text-xs animate-shake">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">{state.message}</p>
              {state.errors?.login && <p className="text-slate-400 mt-1 text-[11px]">{state.errors.login[0]}</p>}
            </div>
          </div>
        )}

        {/* Form */}
        <form action={formAction} className="space-y-5">
          
          {/* Email / Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Username or Email
            </label>
            <div className="relative rounded-xl shadow-inner">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="text"
                name="username"
                id="username"
                required
                placeholder="e.g., admin@oppam.gov.in"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
            <div className="relative rounded-xl shadow-inner">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                name="password"
                id="password"
                required
                placeholder="••••••••••••"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-indigo-500/60 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full relative flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-950/50 active:scale-[0.98] disabled:cursor-not-allowed text-xs uppercase tracking-wider"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Subtle security tagline */}
      <p className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase mt-8 text-center">
        AES-256 encrypted sessions • SQLite Secure Storage
      </p>
    </div>
  );
}
