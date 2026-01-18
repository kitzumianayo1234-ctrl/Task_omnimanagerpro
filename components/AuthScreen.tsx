import React, { useState } from 'react';
import { Eye, EyeOff, LayoutDashboard, Chrome, Apple, Smartphone, Mail, User as UserIcon, Lock, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+1', country: 'US' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+61', country: 'AU' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+86', country: 'CN' },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate API Call
    setTimeout(() => {
      onLogin({
        id: 'google-user-123',
        name: 'Google User',
        email: 'user@gmail.com',
        avatar: 'G'
      });
    }, 1500);
  };

  const handleAppleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin({
        id: 'apple-user-123',
        name: 'Apple User',
        email: 'user@icloud.com',
        avatar: 'A'
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      onLogin({
        id: crypto.randomUUID(),
        name: isSignUp ? username : (email.split('@')[0] || 'User'),
        email: !usePhone ? email : undefined,
        phone: usePhone ? `${countryCode} ${phone}` : undefined,
        avatar: isSignUp ? username[0].toUpperCase() : 'U'
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden min-h-[600px] animate-in fade-in zoom-in duration-300 border border-slate-200 dark:border-slate-800">
        
        {/* Left Side - Hero / Branding */}
        <div className="hidden md:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden text-white">
           {/* Animated Gradient Background */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 animate-pulse"></div>
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           
           {/* Animated Blobs */}
           <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
           <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-32 left-12 w-64 h-64 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 text-2xl font-bold mb-4">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <LayoutDashboard size={32} />
              </div>
              <span className="tracking-tight">OmniTask</span>
            </div>
            <p className="text-blue-100/80 font-medium tracking-wide text-sm uppercase">Productivity Reinvented</p>
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-bold leading-tight tracking-tight">
              {isSignUp ? "Join the future of work." : "Welcome back, Achiever."}
            </h2>
            <p className="text-blue-100/90 text-lg leading-relaxed">
              Experience a task manager that adapts to your flow. Dark mode, analytics, and brain games included.
            </p>
          </div>

          <div className="relative z-10 text-xs text-blue-200/60 font-medium">
            &copy; 2024 OmniTask Inc.
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isSignUp ? "Start your productivity journey today." : "Enter your details to access your dashboard."}
            </p>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 font-medium"
            >
              <Chrome size={20} className="text-red-500" /> Google
            </button>
            <button 
              onClick={handleAppleLogin}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 font-medium"
            >
              <Apple size={20} className="dark:text-white" /> iOS
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username (SignUp Only) */}
            {isSignUp && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Username</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="Choose a username"
                  />
                </div>
              </div>
            )}

            {/* Email / Phone Toggle */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {usePhone ? "Phone Number" : "Email Address"}
                </label>
                <button 
                  type="button"
                  onClick={() => setUsePhone(!usePhone)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                >
                  Use {usePhone ? "Email" : "Phone"} instead
                </button>
              </div>
              
              {usePhone ? (
                <div className="flex gap-2 animate-in fade-in">
                  <div className="relative w-28">
                    <select 
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full pl-3 pr-2 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer dark:text-white"
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>{c.country} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Smartphone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-slate-400"
                      placeholder="555-0123"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative animate-in fade-in">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-slate-400"
                    placeholder="name@example.com"
                  />
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white outline-none transition-all placeholder:text-slate-400"
                  placeholder="Create a secure password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-8 text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setUsername('');
                setEmail('');
                setPhone('');
                setPassword('');
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-colors"
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};