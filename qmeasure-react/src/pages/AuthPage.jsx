import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../utils/measureConstants';
import './AuthPage.css';

export default function AuthPage() {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [tab,      setTab]      = useState('login');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [msg,      setMsg]      = useState(null);

  const googleBtnRef1 = useRef(null); // login tab button container
  const googleBtnRef2 = useRef(null); // signup tab button container

  // Already logged in → go home
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // ── Google callback (called by Google after user picks account) ──
  const handleGoogleCallback = useCallback(async (response) => {
    if (!response?.credential) return;
    setGLoading(true);
    setMsg(null);
    try {
      await loginWithGoogle(response.credential);
    } catch (e) {
      const text = e.response?.data?.message || 'Google sign-in failed. Please try again.';
      setMsg({ text, type: 'error' });
    } finally {
      setGLoading(false);
    }
  }, [loginWithGoogle]);

  // ── Render the real Google button into a div ──────────────────────
  const renderGoogleButton = useCallback((container) => {
    if (!container) return;
    if (typeof window.google === 'undefined') return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCallback,
      ux_mode:   'popup',
    });

    window.google.accounts.id.renderButton(container, {
      theme:     'filled_blue',
      size:      'large',
      width:     container.offsetWidth || 340,
      text:      tab === 'login' ? 'signin_with' : 'signup_with',
      shape:     'rectangular',
      logo_alignment: 'left',
    });
  }, [handleGoogleCallback, tab]);

  // Re-render Google buttons whenever tab changes or GSI script loads
  useEffect(() => {
    const tryRender = () => {
      if (typeof window.google !== 'undefined') {
        if (googleBtnRef1.current) renderGoogleButton(googleBtnRef1.current);
        if (googleBtnRef2.current) renderGoogleButton(googleBtnRef2.current);
      }
    };

    // Try immediately
    tryRender();

    // Also try after a short delay (in case GSI script is still loading)
    const timer = setTimeout(tryRender, 500);
    return () => clearTimeout(timer);
  }, [tab, renderGoogleButton]);

  // ── Email/password login ──────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setMsg({ text: 'Please fill in all fields.', type: 'error' }); return;
    }
    setLoading(true); setMsg(null);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      const text = err.response?.data?.message || 'Invalid email or password.';
      setMsg({ text, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Register ──────────────────────────────────────────────────────
  const [regForm, setRegForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [pwdStrength, setPwdStrength] = useState(0);
  const [showPwd, setShowPwd] = useState(false);

  const checkPwd = (val) => {
    let s = 0;
    if (val.length >= 8)      s++;
    if (/[A-Z]/.test(val))    s++;
    if (/[a-z]/.test(val))    s++;
    if (/[0-9]/.test(val))    s++;
    if (/[\W_]/.test(val))    s++;
    setPwdStrength(s);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = regForm;
    if (!fullName || !email || !password) {
      setMsg({ text: 'All fields are required.', type: 'error' }); return;
    }
    if (password !== confirmPassword) {
      setMsg({ text: 'Passwords do not match.', type: 'error' }); return;
    }
    if (pwdStrength < 5) {
      setMsg({ text: 'Password needs 8+ chars, uppercase, lowercase, number and special character.', type: 'error' });
      return;
    }
    setLoading(true); setMsg(null);
    try {
      await register({ fullName, email, password, confirmPassword });
      setMsg({ text: 'Account created! Signing you in...', type: 'success' });
      await login(email, password);
    } catch (err) {
      const d = err.response?.data;
      const text = d?.message || d?.title
        || (d?.errors ? Object.values(d.errors).flat().join(' ') : null)
        || 'Registration failed. Please try again.';
      setMsg({ text, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setMsg(null); };

  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#10b981', '#10b981'];
  const strengthLabels = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

  return (
    <div className="auth-bg">
      <div className="auth-container">

        {/* ── Left panel ── */}
        <div className="auth-left">
          <div className="auth-left-inner">
            <div className="auth-logo">
              <div className="auth-logo-icon"><i className="fas fa-ruler-combined" /></div>
              <span className="auth-logo-txt">QMeasure</span>
            </div>
            <div className="auth-hero">
              <h1>Quantity<br /><span>Measurement</span><br />Platform</h1>
              <p>Convert, compare and calculate across length, weight, volume and temperature with real-time accuracy.</p>
            </div>
            <div className="auth-pills">
              {[
                ['fa-ruler-horizontal', 'Length'],
                ['fa-weight-hanging',   'Weight'],
                ['fa-flask',            'Volume'],
                ['fa-thermometer-half', 'Temp'],
              ].map(([icon, label]) => (
                <div className="auth-pill" key={label}>
                  <i className={`fas ${icon}`} /> {label}
                </div>
              ))}
            </div>
            <button className="skip-link" onClick={() => navigate('/')}>
              <i className="fas fa-arrow-left" /> Use without signing in
            </button>
          </div>
          <div className="left-shape" /><div className="left-shape2" />
        </div>

        {/* ── Right panel ── */}
        <div className="auth-right">

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login'  ? 'active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
          </div>

          {/* Message */}
          {msg && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-head">
                <h2>Welcome back</h2>
                <p>Sign in to your account to continue</p>
              </div>

              <div className="field">
                <label>Email address</label>
                <div className="field-wrap">
                  <i className="fas fa-envelope fi" />
                  <input
                    type="email" placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="field-wrap">
                  <i className="fas fa-lock fi" />
                  <input
                    type="password" placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spin-dark" /> Signing in...</>
                  : <><span>Sign In</span><i className="fas fa-arrow-right" /></>}
              </button>

              <div className="auth-divider"><span>or continue with</span></div>

              {/* ✅ Real Google button rendered by GSI SDK */}
              {gLoading ? (
                <div className="btn-google-loading">
                  <span className="spin-dark" /> Connecting to Google...
                </div>
              ) : (
                <div
                  ref={googleBtnRef1}
                  className="google-btn-container"
                />
              )}

              <p className="auth-switch">
                No account?{' '}
                <a href="#signup" onClick={e => { e.preventDefault(); switchTab('signup'); }}>Sign up free</a>
              </p>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {tab === 'signup' && (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-head">
                <h2>Create account</h2>
                <p>Join and start measuring today</p>
              </div>

              <div className="field">
                <label>Full name</label>
                <div className="field-wrap">
                  <i className="fas fa-user fi" />
                  <input
                    type="text" placeholder="Your full name"
                    value={regForm.fullName}
                    onChange={e => setRegForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Email address</label>
                <div className="field-wrap">
                  <i className="fas fa-envelope fi" />
                  <input
                    type="email" placeholder="you@example.com"
                    value={regForm.email}
                    onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="field-wrap">
                  <i className="fas fa-lock fi" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={regForm.password}
                    onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); checkPwd(e.target.value); }}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPwd(v => !v)}>
                    <i className={`fas fa-eye${showPwd ? '' : '-slash'}`} />
                  </button>
                </div>
                {regForm.password.length > 0 && (
                  <div className="pwd-strength">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: `${pwdStrength * 20}%`, background: strengthColors[pwdStrength] }} />
                    </div>
                    <span className="strength-label" style={{ color: strengthColors[pwdStrength] }}>
                      {strengthLabels[pwdStrength]}
                    </span>
                  </div>
                )}
                {regForm.password.length > 0 && pwdStrength < 5 && (
                  <div className="pwd-rules">
                    {[
                      [regForm.password.length >= 8,    '8+ characters'],
                      [/[A-Z]/.test(regForm.password),  'Uppercase letter'],
                      [/[a-z]/.test(regForm.password),  'Lowercase letter'],
                      [/[0-9]/.test(regForm.password),  'Number (0-9)'],
                      [/[\W_]/.test(regForm.password),  'Special character (@#$!)'],
                    ].map(([ok, label]) => (
                      <div key={label} className={`rule ${ok ? 'ok' : 'fail'}`}>
                        <i className={`fas fa-${ok ? 'check' : 'times'}-circle`} /> {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div className="field-wrap">
                  <i className="fas fa-lock fi" />
                  <input
                    type="password" placeholder="Repeat your password"
                    value={regForm.confirmPassword}
                    onChange={e => setRegForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading
                  ? <><span className="spin-dark" /> Creating account...</>
                  : <><span>Create Account</span><i className="fas fa-arrow-right" /></>}
              </button>

              <div className="auth-divider"><span>or sign up with</span></div>

              {/* ✅ Real Google button rendered by GSI SDK */}
              {gLoading ? (
                <div className="btn-google-loading">
                  <span className="spin-dark" /> Connecting to Google...
                </div>
              ) : (
                <div
                  ref={googleBtnRef2}
                  className="google-btn-container"
                />
              )}

              <p className="auth-switch">
                Have an account?{' '}
                <a href="#login" onClick={e => { e.preventDefault(); switchTab('login'); }}>Sign in</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
