import React, { useState, useEffect, useCallback } from 'react';
import { Scale, ShieldCheck } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'legalai_token';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => /^\+?[\d\s\-()]{7,15}$/.test(v.trim());

export default function Login({ onAuthSuccess }) {
  // ── Form field states 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');

  // =============== UI states ===============
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ============ Feedback states ================
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // On mount: if a token already exists, skip the login page 
  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY)
      || sessionStorage.getItem(TOKEN_KEY);
    if (existingToken && onAuthSuccess) {
      onAuthSuccess(existingToken);
    }
  }, [onAuthSuccess]);

  // ========== Clear feedback whenever the user switches modes =====================
  const switchMode = useCallback(() => {
    setIsSignUpMode((prev) => !prev);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setPhoneNo('');
  }, []);

  // Client-side validation ====================
  const validate = () => {
    if (!email.trim() || !password.trim())
      return 'Email and password are required.';
    if (!isValidEmail(email))
      return 'Please enter a valid email address.';
    if (password.length < 8)
      return 'Password must be at least 8 characters.';
    if (isSignUpMode) {
      if (!name.trim())
        return 'Full name is required.';
      if (!phoneNo.trim())
        return 'Phone number is required.';
      if (!isValidPhone(phoneNo))
        return 'Please enter a valid phone number.';
    }
    return '';
  };

  // ================ Form submission =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    const endpoint = isSignUpMode
      ? `${BASE_URL}/api/v1/auth/signup`
      : `${BASE_URL}/api/v1/auth/login`;

    const payload = isSignUpMode
      ? { name: name.trim(), email: email.trim(), phone_no: phoneNo.trim(), password }
      : { email: email.trim(), password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an unreadable response.');
      }

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map((d) => d.msg).join(' ');
          throw new Error(messages);
        }
        throw new Error(data.detail || `Request failed (${response.status}).`);
      }

      // ============ SUCCESS FLOW ==================
      if (isSignUpMode) {
        setSuccess('Account created! Please sign in.');
        setIsSignUpMode(false);
        setPassword('');
        setName('');
        setPhoneNo('');
      } else {
        const token = data.access_token;

        if (!token) throw new Error('No access token received from server.');

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_name", data.name || '');
        localStorage.setItem("user_email", data.email || '');
        
        if (rememberMe) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          sessionStorage.setItem(TOKEN_KEY, token);
        }

        setSuccess('Signed in successfully.');

        // Redirects instantly to Dashboard view layout
        if (onAuthSuccess) onAuthSuccess(token);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-50 text-gray-800">

      {/* ============= Left Branding Panel =================== */}
      <div className="hidden md:flex w-[45%] bg-[#030d22] flex-col justify-between p-12 text-white shadow-[4px_0_24px_rgba(0,0,0,0.05)]">
        <div className="text-xl font-black tracking-wide select-none">⚖️ Legal<span className="text-blue-500">AI</span></div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            AI-Powered Legal <br />Case Analysis &amp; <br />Review
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
            Analyse statutory sections, surface precedents, and summarise complex judgements — in seconds.
          </p>
        </div>

        <p className="text-slate-600 text-xs font-semibold">© {new Date().getFullYear()} LegalAI Workspace</p>
      </div>

      {/* ======================== Right Form Panel ================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">

          {/* Title Header */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 shadow-sm md:hidden">
              <Scale size={22} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isSignUpMode ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-sm font-medium text-gray-400 mt-1">
              {isSignUpMode ? 'Register to access your legal workspace.' : 'Sign in to access your legal workspace.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-bold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div role="status" className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-xs font-bold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          {/* Main Integrated Form Grid */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {isSignUpMode && (
              <Field label="Full name">
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Advocate Alex"
                  className={inputClass}
                />
              </Field>
            )}

            {isSignUpMode && (
              <Field label="Phone number">
                <input
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  placeholder="+91 99999 99999"
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Email address">
              <input
                type="email"
                autoComplete={isSignUpMode ? 'email' : 'username'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@firm.com"
                className={inputClass}
              />
            </Field>

            <Field label="Security Password">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUpMode ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-black text-gray-400 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </Field>

            {!isSignUpMode && (
              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer accent-slate-900"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-slate-500 hover:text-[#081f4d] hover:underline transition-all"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#030d22] to-[#0d1f3d] text-white py-3.5 font-bold rounded-xl text-sm hover:opacity-95 active:scale-[.99] transition-all duration-150 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={16} /> {isSignUpMode ? 'Create Workspace Account' : 'Authenticate Session'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher Footer */}
          <p className="text-center text-sm text-gray-400 font-medium pt-2">
            {isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-slate-800 font-bold hover:underline ml-0.5"
            >
              {isSignUpMode ? 'Sign in' : 'Sign up'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 bg-slate-50/50 border border-gray-200 rounded-xl text-sm font-medium ' +
  'focus:outline-none focus:bg-white focus:border-slate-800 ' +
  'transition-all placeholder-gray-300';