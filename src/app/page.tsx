'use client';

import React, { useState, useActionState, useEffect, useRef } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Copy, 
  Check, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { submitLetterAction, FormState } from './actions';

export default function StudentPortal() {
  const [state, formAction, isPending] = useActionState<FormState | null, FormData>(
    submitLetterAction,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reset character count and show modal on success
  useEffect(() => {
    if (state?.success) {
      setCharCount(0);
      setShowSuccessModal(true);
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state]);

  const handleCopyReference = () => {
    if (state?.referenceId) {
      navigator.clipboard.writeText(state.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/20 to-emerald-50/20 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">


      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center">
        {/* Portal Greeting Banner */}
        <div className="w-full text-center mb-8 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Oppam <span className="text-indigo-650">—</span> Will be with you
          </h2>
          <p className="text-sm md:text-base text-slate-550 mt-2 font-medium tracking-wide">
            SSF Pulikkal Division Sahityotsav 2026
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white/80 backdrop-blur-lg border border-slate-200/80 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-100/50 p-6 md:p-10 relative overflow-hidden transition-all duration-300">
          
          {/* Subtle accent border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500"></div>

          {/* Form State Error Banner */}
          {state && !state.success && state.message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-800 text-sm animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold">{state.message}</p>
                {state.errors?.login && <p className="text-xs mt-1">{state.errors.login[0]}</p>}
              </div>
            </div>
          )}

          <form ref={formRef} action={formAction} className="space-y-6 md:space-y-8">
            
            {/* Form Section 1: Student Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="e.g., Rahul Dev"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${state?.errors?.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-600'} rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm`}
                    />
                  </div>
                  {state?.errors?.name && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label htmlFor="mobile" className="text-sm font-medium text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      name="mobile"
                      id="mobile"
                      required
                      placeholder="e.g., 9876543210"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${state?.errors?.mobile ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-600'} rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm`}
                    />
                  </div>
                  {state?.errors?.mobile && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.mobile[0]}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="location" className="text-sm font-medium text-slate-700">
                    Location / Place <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      required
                      placeholder="e.g., North Paravoor, Ernakulam"
                      className={`block w-full pl-10 pr-4 py-3 bg-slate-50/50 border ${state?.errors?.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-600'} rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm`}
                    />
                  </div>
                  {state?.errors?.location && (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.location[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Section 2: Letter Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Type Your Letter
                  </h3>
                </div>
                <div className="text-xs font-semibold text-indigo-600/80 bg-indigo-50 px-2.5 py-1 rounded-full">
                  {charCount} Characters
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="letter_content" className="text-sm font-medium text-slate-700">
                  Letter Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="letter_content"
                  id="letter_content"
                  required
                  rows={8}
                  onChange={(e) => setCharCount(e.target.value.length)}
                  placeholder="Type your letter details here... Begin with a formal salutation, describe your request, and end with your signature details."
                  className={`block w-full p-4 bg-slate-50/50 border ${state?.errors?.letter_content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-600'} rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-200 text-sm`}
                ></textarea>
                {state?.errors?.letter_content && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.letter_content[0]}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Please draft a clear and formal explanation. Minimum 10 characters required.
                </p>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-[0.98] disabled:cursor-not-allowed text-sm uppercase tracking-wider"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting Letter...</span>
                  </>
                ) : (
                  <span>Submit Letter</span>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-400">
        <p>© 2026 SSF Pulikkal Division. All Rights Reserved.</p>
      </footer>

      {/* Success Modal */}
      {showSuccessModal && state?.success && state?.referenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300"></div>
          
          {/* Card */}
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative z-10 border border-slate-100 flex flex-col items-center text-center animate-bounce-in">
            {/* Decorative Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl"></div>

            {/* Animated Check icon */}
            <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-inner animate-pulse">
              <CheckCircle className="h-10 w-10" />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Submission Successful!
            </h3>
            <p className="text-sm text-slate-500 mt-2 px-2">
              Your letter has been recorded in the portal securely. You can use the Reference ID below to follow up on your request.
            </p>

            {/* Reference ID display box */}
            <div className="w-full mt-6 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center relative group">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                Reference ID
              </span>
              <span className="text-lg font-mono font-bold text-slate-900 tracking-wider">
                {state.referenceId}
              </span>
              
              {/* Copy button */}
              <button
                onClick={handleCopyReference}
                className="mt-2.5 flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-600 rounded-lg shadow-sm border border-slate-200 transition-all duration-200"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={closeSuccessModal}
              className="w-full mt-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Submit Another Letter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
