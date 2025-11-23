import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, ArrowRight, ScanLine, Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      alert(error.error_description || error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        
        <div className="relative z-20 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/10">
              <ScanLine className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CardVault</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Capture connections, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                unlock opportunities.
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              The intelligent business card manager for modern professionals. Scan, organize, and access your network instantly.
            </p>
          </div>

          <div className="flex gap-4 text-sm text-slate-400">
            <span>© 2024 CardVault Inc.</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                <ScanLine className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Sign in to access your digital rolodex
            </p>
          </div>

          {sent ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                We've sent a magic link to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
              </p>
              <button 
                onClick={() => setSent(false)}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline decoration-slate-300 underline-offset-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="name@company.com"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-blue-700 focus:ring-4 focus:ring-slate-200 dark:focus:ring-blue-900 transition-all shadow-lg shadow-slate-200 dark:shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In with Magic Link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
