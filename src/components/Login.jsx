import React, { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'legalai_token'; 

 
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v) => /^\+?[\d\s\-()]{7,15}$/.test(v.trim());

// ============ Component =================
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
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // On mount: if a token already exists, skip the login page 
  // This prevents a logged-in user from seeing the login form again.
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

  //  Client-side validation ====================
  // Returns an error string if invalid, or '' if everything is fine.
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

    // 1. Validate BEFORE setting isLoading so the button isn't briefly
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned an unreadable response.');
      }

      if (!response.ok) {
        // FastAPI validation errors come as { detail: [...] } arrays
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map((d) => d.msg).join(' ');
          throw new Error(messages);
        }
        throw new Error(data.detail || `Request failed (${response.status}).`);
      }

      // ============ SUCCESS ==================
      if (isSignUpMode) {
        setSuccess('Account created! Please sign in.');
        setIsSignUpMode(false);
        setPassword('');
        setName('');
        setPhoneNo('');
      } else {
        const token = data.access_token;
        if (!token) throw new Error('No access token received from server.');

        // remember me -> localStorage(permanent)otherwise, sessionstorage(temp.)
        if (rememberMe) {
          localStorage.setItem(TOKEN_KEY, token);
        } else {
          sessionStorage.setItem(TOKEN_KEY, token);
        }

        setSuccess('Signed in successfully.');

        if (onAuthSuccess) onAuthSuccess(token);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false); // this will always run
    }
  };

  // ================== Render ===================
  return (
    <div className="flex min-h-screen w-full font-sans bg-gray-50">

      {/* ============= Left panel =================== */}
      <div
        className="hidden md:flex w-[45%] bg-[#030d22] flex-col justify-between p-12 text-white"
        aria-hidden="true"
      >
        <div className="text-lg font-bold tracking-wide select-none">⚖️ LegalAI</div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            AI-Powered Legal <br />Case Analysis &amp; <br />Review
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Analyse IPC sections, surface precedents, and summarise judgements —
            in seconds.
          </p>
        </div>

        <p className="text-slate-600 text-xs">© {new Date().getFullYear()} LegalAI</p>
      </div>

      {/* ======================== Right panel ================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-5">

          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isSignUpMode ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSignUpMode
                ? 'Register to access your legal workspace.'
                : 'Sign in to access your legal workspace.'}
            </p>
          </div>

          {/* =================== Error banner =============================== */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs font-medium"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ===================== Success banner ====================== */}
          {success && (
            <div
              role="status"
              className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700 text-xs font-medium"
            >
              <span aria-hidden="true">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* ======================= Form ============================= */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name — for signup only */}
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

            {/* Phone — signup only */}
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

            {/* Email */}
            <Field label="Email">
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

            {/* Password */}
            <Field label="Password">
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
                  onClick={() => setShowPassword((v) => !v)} // v represents the current value right at the exact ms the user clicks
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </Field>

            {/* Remember me + Forgot password — login only */}
            {!isSignUpMode && (
              <div className="flex items-center justify-between text-xs font-semibold">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-slate-900 cursor-pointer"
                  />
                  Remember me
                </label>
        
                <button
                  type="button"
                  onClick={() => {/* TODO: navigate to /forgot-password */}}
                  className="text-slate-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

  
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#030d22] text-white p-3 font-semibold rounded-lg text-sm
                         hover:bg-slate-800 active:scale-[.98] transition-all mt-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? (isSignUpMode ? 'Creating account…' : 'Signing in…')
                : (isSignUpMode ? 'Create account'    : 'Sign in →')
              }
            </button>
          </form>

          {/* Mode switcher */}
          <p className="text-center text-sm text-gray-600 pt-2">
            {isSignUpMode ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-slate-900 font-bold hover:underline"
            >
              {isSignUpMode ? 'Sign in' : 'Sign up'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}

//  Field wrapper(label -> the heading, childeren -> whatever html elt) 
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

// ============= Common input className string =======================
const inputClass =
  'w-full p-2.5 border border-gray-300 rounded-lg text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ' +
  'transition-shadow placeholder-gray-400';