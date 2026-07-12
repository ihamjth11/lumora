import React, { useState } from 'react';
import { IoArrowBack, IoEye, IoEyeOff, IoCheckmarkCircle } from 'react-icons/io5';
import { sendOTP, verifyOTP, linkEmailPassword, loginWithGoogle, loginWithFacebook } from '../firebase/authService';

const countryCodes = [
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
];

function SignupPage({ onBack, onSuccess, onLogin }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthData = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#10b981' },
    { label: 'Strong', color: '#6C63FF' },
  ];

  const validate = () => {
    if (!name.trim()) return 'Full name is required';
    if (!email.includes('@')) return 'Valid email is required';
    if (!phone || phone.length < 7) return 'Valid phone number is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (strength < 2) return 'Password is too weak';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  // ---------- STEP 1: Send real OTP ----------
  const handleStep1 = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    const fullPhone = `${selectedCountry.code}${phone.replace(/^0+/, '')}`;
    const res = await sendOTP(fullPhone);
    setLoading(false);
    if (res.success) {
      setStep(2);
    } else {
      setError(res.error || 'Failed to send OTP. Check phone number.');
    }
  };

  const handleOTPInput = (val, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  // ---------- STEP 2: Verify OTP + Link Email/Password ----------
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter complete 6-digit OTP'); return; }
    setLoading(true); setError('');

    const res = await verifyOTP(code);
    if (!res.success) {
      setLoading(false);
      setError(res.error || 'Invalid OTP');
      return;
    }

    const linkRes = await linkEmailPassword(res.user, email, password, name);
    setLoading(false);

    if (linkRes.success) {
      setStep(3);
      setTimeout(() => onSuccess(), 2200);
    } else {
      setError(linkRes.error || 'Failed to complete signup');
    }
  };

  // ---------- GOOGLE / FACEBOOK SIGNUP ----------
  const handleGoogleSignup = async () => {
    setSocialLoading('google'); setError('');
    const res = await loginWithGoogle();
    setSocialLoading('');
    if (res.success) onSuccess();
    else setError(res.error);
  };

  const handleFacebookSignup = async () => {
    setSocialLoading('facebook'); setError('');
    const res = await loginWithFacebook();
    setSocialLoading('');
    if (res.success) onSuccess();
    else setError(res.error);
  };

  const filteredCountries = countryCodes.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  const inputBase = {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px', padding: '13px 16px', gap: '12px',
  };

  const inputField = {
    flex: 1, background: 'none', border: 'none',
    outline: 'none', color: '#fff',
    fontSize: '14px', fontFamily: 'Inter',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020208 0%, #0c0618 30%, #080d20 60%, #020208 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '24px', fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { transform:scale(0.5); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Recaptcha (invisible, needed for Phone OTP) */}
      <div id="recaptcha-container"></div>

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)',
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,37,133,0.1) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Back */}
      {step < 3 && (
        <button onClick={step === 1 ? onBack : () => { setStep(1); setOtp(['','','','','','']); }} style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#fff', fontSize: '20px',
          marginBottom: '20px', flexShrink: 0,
        }}>
          <IoArrowBack />
        </button>
      )}

      {/* Progress */}
      {step < 3 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '600' }}>
              Step {step} of 2
            </span>
            <span style={{ fontSize: '11px', color: '#6C63FF', fontWeight: '700' }}>
              {step === 1 ? 'Account Details' : 'Verify Phone'}
            </span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: step === 1 ? '50%' : '100%',
              background: 'linear-gradient(90deg, #6C63FF, #a855f7, #F72585)',
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px rgba(108,99,255,0.5)',
            }} />
          </div>
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ animation: 'fadeUp 0.5s ease forwards', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '28px', fontWeight: '900',
              color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px',
            }}>
              Create account ✨
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)' }}>
              Join Lumora — start learning today
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

            {/* Name */}
            <div style={inputBase}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" placeholder="Full name" value={name}
                onChange={(e) => setName(e.target.value)} style={inputField} />
            </div>

            {/* Email */}
            <div style={inputBase}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="email" placeholder="Email address" value={email}
                onChange={(e) => setEmail(e.target.value)} style={inputField} />
            </div>

            {/* Phone with country picker */}
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', overflow: 'visible',
              position: 'relative',
            }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowCountryPicker(!showCountryPicker)} style={{
                  background: 'none', border: 'none',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                  padding: '13px 10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600',
                  fontFamily: 'Inter', whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '16px' }}>{selectedCountry.flag}</span>
                  <span>{selectedCountry.code}</span>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {showCountryPicker && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, zIndex: 1000,
                    background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', width: '220px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                  }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <input
                        type="text" placeholder="Search country..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        style={{
                          width: '100%', background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px', padding: '7px 10px',
                          color: '#fff', fontSize: '12px', fontFamily: 'Inter',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '6px' }}>
                      {filteredCountries.map((c, i) => (
                        <div key={i} onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); setCountrySearch(''); }}
                          style={{
                            padding: '8px 10px', cursor: 'pointer', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: selectedCountry.code === c.code ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                            background: selectedCountry.code === c.code ? 'rgba(108,99,255,0.12)' : 'transparent',
                            fontSize: '12px', fontWeight: '500', transition: 'all 0.15s',
                          }}>
                          <span style={{ fontSize: '15px' }}>{c.flag}</span>
                          <span style={{ flex: 1 }}>{c.name}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{c.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input type="tel" placeholder="Phone number" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ ...inputField, padding: '13px 14px' }} />
            </div>

            {/* Password */}
            <div style={inputBase}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type={showPassword ? 'text' : 'password'} placeholder="Create password"
                value={password} onChange={(e) => setPassword(e.target.value)} style={inputField} />
              <button onClick={() => setShowPassword(!showPassword)} style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.25)', fontSize: '17px',
                cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
              }}>
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>

            {/* Strength */}
            {password.length > 0 && (
              <div style={{ padding: '0 4px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '3px',
                      background: i <= strength ? strengthData[strength].color : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.3s',
                      boxShadow: i <= strength ? `0 0 6px ${strengthData[strength].color}60` : 'none',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: strengthData[strength].color, fontWeight: '600' }}>
                    {strengthData[strength].label}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { check: password.length >= 8, text: '8+ chars' },
                      { check: /[A-Z]/.test(password), text: 'A-Z' },
                      { check: /[0-9]/.test(password), text: '0-9' },
                      { check: /[^A-Za-z0-9]/.test(password), text: '!@#' },
                    ].map((req, i) => (
                      <span key={i} style={{
                        fontSize: '10px', fontWeight: '600',
                        color: req.check ? '#10b981' : 'rgba(255,255,255,0.2)',
                        transition: 'color 0.2s',
                      }}>
                        {req.check ? '✓' : '○'} {req.text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div style={{
              ...inputBase,
              borderColor: confirmPassword && password !== confirmPassword
                ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={confirmPassword && password !== confirmPassword ? '#f87171' : 'rgba(255,255,255,0.25)'}
                strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputField} />
              <button onClick={() => setShowConfirm(!showConfirm)} style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.25)', fontSize: '17px',
                cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
              }}>
                {showConfirm ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '10px 14px', marginTop: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '500' }}>{error}</p>
            </div>
          )}

          <button onClick={handleStep1} disabled={loading} style={{
            width: '100%', padding: '15px', marginTop: '16px',
            background: 'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
            border: 'none', borderRadius: '14px',
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
            boxShadow: '0 4px 24px rgba(108,99,255,0.4)',
            marginBottom: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
          }}>
            {loading ? (
              <>
                <div style={{
                  width: '15px', height: '15px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Sending OTP...
              </>
            ) : 'Continue →'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', fontWeight: '600' }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Social Signup */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={handleGoogleSignup} disabled={socialLoading !== ''} style={{
              flex: 1, padding: '12px 8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', cursor: socialLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter',
              opacity: socialLoading && socialLoading !== 'google' ? 0.5 : 1,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {socialLoading === 'google' ? 'Signing up...' : 'Google'}
            </button>
            <button onClick={handleFacebookSignup} disabled={socialLoading !== ''} style={{
              flex: 1, padding: '12px 8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', cursor: socialLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', fontFamily: 'Inter',
              opacity: socialLoading && socialLoading !== 'facebook' ? 0.5 : 1,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {socialLoading === 'facebook' ? 'Signing up...' : 'Facebook'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>
            Already have an account?{' '}
            <span onClick={onLogin} style={{
              background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: '700', cursor: 'pointer',
            }}>Sign in</span>
          </p>
        </div>
      )}

      {/* STEP 2 — OTP */}
      {step === 2 && (
        <div style={{ animation: 'fadeUp 0.5s ease forwards', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #6C63FF22, #F7258522)',
              border: '1px solid rgba(108,99,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: '26px', fontWeight: '900',
              color: '#ffffff', marginBottom: '6px',
            }}>
              Verify your phone
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)', lineHeight: '1.6' }}>
              We sent a 6-digit code to{' '}
              <span style={{ color: '#a78bfa', fontWeight: '600' }}>
                {selectedCountry.code} {phone}
              </span>
            </p>
          </div>

          {/* OTP Boxes */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="number"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPInput(e.target.value, idx)}
                onKeyDown={(e) => handleOTPKeyDown(e, idx)}
                style={{
                  width: '46px', height: '54px',
                  background: digit ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                  border: digit ? '1px solid rgba(108,99,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', color: '#fff',
                  fontSize: '20px', fontWeight: '800', fontFamily: 'Inter',
                  textAlign: 'center', outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: digit ? '0 0 12px rgba(108,99,255,0.3)' : 'none',
                }}
              />
            ))}
          </div>

          <p style={{
            textAlign: 'center', fontSize: '13px',
            color: 'rgba(255,255,255,0.28)', marginBottom: '20px',
          }}>
            Didn't receive the code?{' '}
            <span onClick={handleStep1} style={{
              background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: '700', cursor: 'pointer',
            }}>
              Resend OTP
            </span>
          </p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '10px 14px', marginBottom: '14px',
              display: 'flex', gap: '8px', alignItems: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>
            </div>
          )}

          <button onClick={handleVerify} disabled={loading} style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
            border: 'none', borderRadius: '14px',
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
            boxShadow: '0 4px 24px rgba(108,99,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {loading ? (
              <>
                <div style={{
                  width: '15px', height: '15px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Verifying...
              </>
            ) : 'Verify & Create Account'}
          </button>
        </div>
      )}

      {/* STEP 3 — Success */}
      {step === 3 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px', animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, pulse 2s ease 0.5s infinite',
            boxShadow: '0 0 0 0 rgba(108,99,255,0.4), 0 0 40px rgba(108,99,255,0.4)',
          }}>
            <IoCheckmarkCircle style={{ color: '#fff', fontSize: '60px' }} />
          </div>
          <h2 style={{
            fontSize: '26px', fontWeight: '900', color: '#ffffff', marginBottom: '8px',
          }}>
            Welcome to Lumora! 🎉
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>
            Account created successfully
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#6C63FF',
              animation: 'pulse 1s ease infinite',
            }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
              Setting up your experience...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;