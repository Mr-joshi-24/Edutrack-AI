import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity } from 'lucide-react';

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:8000/auth/login/github";
  };

  return (
    <div className="min-h-screen w-full bg-[#050914] flex items-center justify-center p-4 relative overflow-hidden text-slate-200">
      
      {/* 🌟 Dynamic Glassmorphism Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/[0.04] border border-white/[0.12] rounded-3xl p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] space-y-8 relative z-10"
      >
        
        {/* LOGO & HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-1 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
            <Activity size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md" style={{ fontFamily: "'Fraunces', serif" }}>
            EduTrack AI
          </h1>
          <p className="text-xs text-slate-400">
            Academic Command Center & Predictive Analytics
          </p>
        </div>

        {/* FROSTED GLASS VALUE PROPOSITION BADGE */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 space-y-2 backdrop-blur-md shadow-inner">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <ShieldCheck size={16} /> Secure Faculty Portal
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sign in with your verified institutional account to access real-time student telemetry and machine learning risk assessments.
          </p>
        </div>

        {/* OAUTH BUTTONS CONTAINER */}
        <div className="space-y-3.5 pt-1">
          
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/90 hover:bg-white text-slate-900 font-medium text-xs py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.99] backdrop-blur-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.17 21.36 7.23 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.6H1.18C.43 8.13 0 9.87 0 12s.43 3.87 1.18 5.4l4.09-3.16z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.17 2.64 1.18 6.6l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Continue with Google
          </button>

          {/* GitHub Login Button */}
          <button
            onClick={handleGithubLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white font-medium text-xs py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg active:scale-[0.99] backdrop-blur-md"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

        </div>

        {/* FOOTER NOTE */}
        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-500 font-mono tracking-wide">
            Protected by secure OAuth2 & JWT session management.
          </p>
        </div>

      </motion.div>
    </div>
  );
}