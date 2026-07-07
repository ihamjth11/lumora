import React, { useState } from 'react';
import { IoArrowBack, IoEye, IoEyeOff } from 'react-icons/io5';

const countryCodes = [
  { code: '+94', flag: '🇱🇰', name: 'LK' },
  { code: '+1', flag: '🇺🇸', name: 'US' },
  { code: '+44', flag: '🇬🇧', name: 'GB' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+971', flag: '🇦🇪', name: 'AE' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
];

function InputField({ icon, placeholder, value, onChange, type = 'text', right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '14px 16px',
      gap: '12px', transition: 'border-color 0.2s',
    }}
      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'}
      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '17px', flexShrink: 0 }}>
        {icon}
      </span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={onChange}
        style={{
          flex: 1, background: 'none', border: 'none',
          outline: 'none', color: '#ffffff',
          fontSize: '14px', fontFamily: 'Inter',
        }}
      />
      {right}
    </div>
  );
}

function SocialButton({ icon, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, padding: '12px 8px',
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: hovered ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '12px', fontWeight: '600', fontFamily: 'Inter',
      }}
    >
      {icon}
      <span style={{ display: window.innerWidth > 400 ? 'inline' : 'none' }}>
        {label}
      </span>
    </button>
  );
}

function LoginPage({ onBack, onSuccess, onSignup }) {
  const [loginType, setLoginType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleLogin = () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (attempts >= 5) {
      setError('Account locked. Too many failed attempts.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (password.length >= 6) {
        onSuccess();
      } else {
        setAttempts(prev => prev + 1);
        setError(`Invalid credentials. ${4 - attempts} attempts remaining.`);
      }
    }, 1500);
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
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.22) !important; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)',
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,37,133,0.1) 0%, transparent 65%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Back */}
      <button onClick={onBack} style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', width: '40px', height: '40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', fontSize: '20px',
        marginBottom: '32px', flexShrink: 0,
        transition: 'all 0.2s',
      }}>
        <IoArrowBack />
      </button>

      {/* Title */}
      <div style={{ marginBottom: '28px', animation: 'fadeUp 0.5s ease forwards' }}>
        <h1 style={{
          fontSize: '30px', fontWeight: '900',
          color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px',
        }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
          Sign in to continue your learning journey
        </p>
      </div>

      {/* Tab Toggle */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '20px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '4px',
      }}>
        {[
          { key: 'email', label: 'Email', icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          )},
          { key: 'phone', label: 'Phone', icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          )},
        ].map(tab => (
          <button key={tab.key} onClick={() => { setLoginType(tab.key); setIdentifier(''); setError(''); }}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: '9px', border: 'none',
              background: loginType === tab.key
                ? 'linear-gradient(135deg, #6C63FF, #a855f7)'
                : 'transparent',
              color: loginType === tab.key ? '#fff' : 'rgba(255,255,255,0.35)',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Inter', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: loginType === tab.key ? '0 2px 12px rgba(108,99,255,0.4)' : 'none',
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>

        {loginType === 'email' ? (
          <InputField
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            }
            placeholder="Enter your email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            type="email"
          />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            {/* Country Code */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowCountryPicker(!showCountryPicker)} style={{
                background: 'none', border: 'none',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                padding: '14px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600',
                fontFamily: 'Inter',
              }}>
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showCountryPicker && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, zIndex: 100,
                  background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '6px',
                  maxHeight: '200px', overflowY: 'auto', minWidth: '140px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  {countryCodes.map((c, i) => (
                    <div key={i} onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                      style={{
                        padding: '8px 10px', cursor: 'pointer', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        color: selectedCountry.code === c.code ? '#6C63FF' : 'rgba(255,255,255,0.7)',
                        background: selectedCountry.code === c.code ? 'rgba(108,99,255,0.15)' : 'transparent',
                        fontSize: '13px', fontWeight: '500',
                        transition: 'all 0.15s',
                      }}>
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 'auto' }}>{c.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel" placeholder="Phone number"
              value={identifier} onChange={(e) => setIdentifier(e.target.value)}
              style={{
                flex: 1, background: 'none', border: 'none',
                outline: 'none', color: '#fff',
                fontSize: '14px', fontFamily: 'Inter', padding: '14px 16px',
              }}
            />
          </div>
        )}

        {/* Password */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '14px 16px', gap: '12px',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              flex: 1, background: 'none', border: 'none',
              outline: 'none', color: '#fff',
              fontSize: '14px', fontFamily: 'Inter',
            }}
          />
          <button onClick={() => setShowPassword(!showPassword)} style={{
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: '18px',
            cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
          }}>
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <span style={{
          fontSize: '13px',
          background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          cursor: 'pointer', fontWeight: '600',
        }}>
          Forgot password?
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px', padding: '11px 14px', marginBottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '13px', color: '#f87171', fontWeight: '500' }}>{error}</p>
        </div>
      )}

      {/* Login Button */}
      <button onClick={handleLogin} disabled={loading || attempts >= 5} style={{
        width: '100%', padding: '15px',
        background: loading ? 'rgba(108,99,255,0.4)' : 'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
        border: 'none', borderRadius: '14px',
        color: '#fff', fontSize: '15px', fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
        boxShadow: '0 4px 24px rgba(108,99,255,0.4)',
        marginBottom: '16px', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        {loading ? (
          <>
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid #fff',
              animation: 'spin 0.8s linear infinite',
            }} />
            Signing in...
          </>
        ) : 'Sign In'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', fontWeight: '600' }}>
          OR
        </span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Social */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        <SocialButton icon={
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        } label="Google" />
        <SocialButton icon={
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        } label="Facebook" />
        <SocialButton icon={
          <svg width="17" height="17" viewBox="0 0 814 1000">
            <path fill="white" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 71 0 130.5 46.4 174.9 46.4 42.7 0 109.2-49.1 189.2-49.1 30.4 0 110.4 2.6 173.4 66.5zm-194.3-99.5c31.7-37.5 54.3-89.7 54.3-141.9 0-7.1-.6-14.3-1.9-20.1-51.6 1.9-112.3 34.4-149.2 75.8-28.5 32.4-55.1 84.7-55.1 139.5 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 46.4 0 102.9-30.5 136.4-73.8z"/>
          </svg>
        } label="Apple" />
      </div>

      {/* Signup Link */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
        Don't have an account?{' '}
        <span onClick={onSignup} style={{
          background: 'linear-gradient(135deg, #6C63FF, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontWeight: '700', cursor: 'pointer',
        }}>
          Sign up free
        </span>
      </p>
    </div>
  );
}

export default LoginPage;