import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import { loginWithGoogle, loginWithFacebook } from '../firebase/authService';

const floatingCards = [
  { label: 'Artificial Intelligence', color: '#6C63FF', x: '6%', y: '15%', delay: '0s', dur: '3.2s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="3"/></svg> },
  { label: 'Coding & Dev', color: '#00B4D8', x: '66%', y: '10%', delay: '0.4s', dur: '3.8s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  { label: 'Cooking', color: '#FB8500', x: '72%', y: '42%', delay: '0.8s', dur: '3.5s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FB8500" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
  { label: 'UI/UX Design', color: '#F72585', x: '4%', y: '52%', delay: '1.2s', dur: '4.1s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F72585" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg> },
  { label: 'Science', color: '#10b981', x: '62%', y: '68%', delay: '0.6s', dur: '3.6s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 4h16l-5-4V3"/></svg> },
  { label: 'Business', color: '#f59e0b', x: '12%', y: '72%', delay: '1s', dur: '3.9s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg> },
  { label: 'Mathematics', color: '#a855f7', x: '35%', y: '8%', delay: '1.4s', dur: '4.2s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
  { label: 'Language', color: '#14b8a6', x: '42%', y: '80%', delay: '0.2s', dur: '3.4s',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
];

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(star => (
        <div key={star.id} style={{
          position: 'absolute',
          left: `${star.x}%`, top: `${star.y}%`,
          width: `${star.size}px`, height: `${star.size}px`,
          borderRadius: '50%',
          background: '#ffffff',
          opacity: star.opacity,
          animation: `twinkle ${star.duration}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

function WelcomePage({ onAuthComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [mounted, setMounted] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [socialLoading, setSocialLoading] = useState('');
  const [socialError, setSocialError] = useState('');

  useEffect(() => {
    setTimeout(() => setMounted(true), 150);
  }, []);

  const handleGoogleClick = async () => {
    setSocialLoading('google');
    setSocialError('');
    const res = await loginWithGoogle();
    setSocialLoading('');
    if (res.success) {
      onAuthComplete();
    } else {
      setSocialError(res.error);
    }
  };

  const handleFacebookClick = async () => {
    setSocialLoading('facebook');
    setSocialError('');
    const res = await loginWithFacebook();
    setSocialLoading('');
    if (res.success) {
      onAuthComplete();
    } else {
      setSocialError(res.error);
    }
  };

  if (screen === 'login') return <LoginPage onBack={() => setScreen('welcome')} onSuccess={onAuthComplete} onSignup={() => setScreen('signup')} />;
  if (screen === 'signup') return <SignupPage onBack={() => setScreen('welcome')} onSuccess={onAuthComplete} onLogin={() => setScreen('login')} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #020208 0%, #0c0618 30%, #080d20 60%, #020208 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes twinkle { from { opacity: 0.1; } to { opacity: 0.6; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes orb1 { 0%,100% { transform: scale(1) translate(0,0); opacity:0.4; } 50% { transform: scale(1.15) translate(20px,-20px); opacity:0.7; } }
        @keyframes orb2 { 0%,100% { transform: scale(1) translate(0,0); opacity:0.3; } 50% { transform: scale(1.1) translate(-15px,25px); opacity:0.6; } }
        @keyframes orb3 { 0%,100% { transform: scale(1); opacity:0.25; } 50% { transform: scale(1.2); opacity:0.5; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes logoGlow { 0%,100% { box-shadow: 0 0 0 1px rgba(108,99,255,0.3), 0 0 40px rgba(108,99,255,0.4), 0 0 80px rgba(108,99,255,0.1); } 50% { box-shadow: 0 0 0 1px rgba(247,37,133,0.3), 0 0 50px rgba(247,37,133,0.4), 0 0 100px rgba(247,37,133,0.15); } }
        @keyframes cardPop { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
      `}</style>

      <StarField />

      <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'600px', height:'600px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 65%)',
        filter:'blur(80px)', pointerEvents:'none', animation:'orb1 6s ease infinite' }} />
      <div style={{ position:'absolute', bottom:'-10%', right:'-8%', width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(247,37,133,0.14) 0%, transparent 65%)',
        filter:'blur(70px)', pointerEvents:'none', animation:'orb2 7s ease infinite 1s' }} />
      <div style={{ position:'absolute', top:'40%', left:'35%', width:'350px', height:'350px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 65%)',
        filter:'blur(60px)', pointerEvents:'none', animation:'orb3 5s ease infinite 2s' }} />

      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(108,99,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.025) 1px, transparent 1px)',
        backgroundSize:'50px 50px' }} />

      {floatingCards.map((card, i) => (
        <div key={i} style={{
          position:'absolute', left:card.x, top:card.y,
          opacity: mounted ? 1 : 0,
          animation: mounted
            ? `cardPop 0.5s ease ${parseFloat(card.delay) + 0.3}s both, float ${card.dur} ease-in-out ${parseFloat(card.delay)}s infinite`
            : 'none',
          zIndex: 1,
        }}>
          <div style={{
            background:'rgba(255,255,255,0.03)',
            backdropFilter:'blur(24px) saturate(180%)',
            WebkitBackdropFilter:'blur(24px) saturate(180%)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:'14px',
            padding:'9px 13px',
            display:'flex', alignItems:'center', gap:'8px',
            boxShadow:`0 4px 32px ${card.color}15, 0 1px 0 rgba(255,255,255,0.04) inset`,
            whiteSpace:'nowrap',
          }}>
            <div style={{
              width:'26px', height:'26px', borderRadius:'7px',
              background:`linear-gradient(135deg, ${card.color}30, ${card.color}10)`,
              border:`1px solid ${card.color}40`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {card.icon}
            </div>
            <span style={{ fontSize:'11px', fontWeight:'600', color:'rgba(255,255,255,0.6)', letterSpacing:'0.2px' }}>
              {card.label}
            </span>
          </div>
        </div>
      ))}

      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'24px 24px 32px', position:'relative', zIndex:2,
        minHeight:'100vh',
      }}>

        <div style={{
          display:'flex', flexDirection:'column', alignItems:'center',
          marginBottom:'36px',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp 0.7s ease forwards' : 'none',
        }}>
          <div style={{
            width:'80px', height:'80px', borderRadius:'24px',
            background:'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            marginBottom:'18px',
            animation: mounted ? 'logoGlow 3s ease infinite' : 'none',
            position:'relative',
          }}>
            <div style={{
              position:'absolute', top:'4px', left:'4px', right:'4px',
              height:'40%', borderRadius:'16px 16px 0 0',
              background:'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
              pointerEvents:'none',
            }} />
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
              <path d="M12 6C12 6 8 4 4 4V18C8 18 12 20 12 20C12 20 16 18 20 18V4C16 4 12 6 12 6Z"
                fill="white" opacity="0.95"/>
              <line x1="12" y1="6" x2="12" y2="20" stroke="rgba(108,99,255,0.4)" strokeWidth="1.5"/>
              <path d="M7 9L10 11.5L7 14V9Z" fill="rgba(80,70,255,0.9)"/>
              <path d="M14 9L17 11.5L14 14V9Z" fill="rgba(247,37,133,0.9)"/>
            </svg>
          </div>

          <div style={{ position:'relative' }}>
            <h1 style={{
              fontSize:'48px', fontWeight:'900',
              background:'linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #ffffff 70%, #f9a8d4 100%)',
              backgroundSize:'200% auto',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              letterSpacing:'-2.5px', marginBottom:'8px', lineHeight:1,
              animation:'shimmer 4s linear infinite',
            }}>
              lumora
            </h1>
            <div style={{
              position:'absolute', bottom:'-8px', left:'50%',
              transform:'translateX(-50%)',
              width:'80%', height:'1px',
              background:'linear-gradient(90deg, transparent, rgba(108,99,255,0.6), rgba(247,37,133,0.6), transparent)',
            }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'16px' }}>
            <div style={{ width:'24px', height:'1px', background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.15))' }} />
            <p style={{
              fontSize:'11px', color:'rgba(255,255,255,0.3)',
              letterSpacing:'3px', textTransform:'uppercase', fontWeight:'600',
            }}>
              Learn in moments
            </p>
            <div style={{ width:'24px', height:'1px', background:'linear-gradient(90deg, rgba(255,255,255,0.15), transparent)' }} />
          </div>
        </div>

        <div style={{
          textAlign:'center', marginBottom:'44px', maxWidth:'320px',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp 0.7s ease 0.15s both' : 'none',
        }}>
          <h2 style={{
            fontSize:'26px', fontWeight:'800',
            color:'#ffffff', lineHeight:'1.3',
            marginBottom:'12px', letterSpacing:'-0.5px',
          }}>
            The future of learning{' '}
            <span style={{
              background:'linear-gradient(135deg, #6C63FF, #F72585)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>
              is social
            </span>
          </h2>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.32)', lineHeight:'1.7' }}>
            Join millions who learn through short, powerful educational content every day
          </p>
        </div>

        <div style={{
          width:'100%', maxWidth:'320px',
          display:'flex', flexDirection:'column', gap:'10px',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp 0.7s ease 0.25s both' : 'none',
        }}>

          <button
            onClick={() => setScreen('signup')}
            onMouseEnter={() => setHoveredBtn('create')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              width:'100%', padding:'15px',
              background:'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
              border:'none', borderRadius:'14px',
              color:'#fff', fontSize:'15px', fontWeight:'700',
              cursor:'pointer', fontFamily:'Inter',
              boxShadow: hoveredBtn === 'create'
                ? '0 8px 32px rgba(108,99,255,0.65)'
                : '0 4px 24px rgba(108,99,255,0.45)',
              transition:'all 0.2s ease',
              transform: hoveredBtn === 'create' ? 'translateY(-2px)' : 'translateY(0)',
              letterSpacing:'0.2px', position:'relative', overflow:'hidden',
            }}
          >
            <div style={{
              position:'absolute', inset:0,
              background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
              transform: hoveredBtn === 'create' ? 'translateX(100%)' : 'translateX(-100%)',
              transition:'transform 0.5s ease',
            }} />
            Create Free Account
          </button>

          <button
            onClick={() => setScreen('login')}
            onMouseEnter={() => setHoveredBtn('signin')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              width:'100%', padding:'15px',
              background: hoveredBtn === 'signin' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'14px',
              color:'#ffffff', fontSize:'15px', fontWeight:'600',
              cursor:'pointer', fontFamily:'Inter',
              backdropFilter:'blur(10px)',
              transition:'all 0.2s ease',
              transform: hoveredBtn === 'signin' ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            Sign In
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'2px 0' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.2)', letterSpacing:'1.5px', fontWeight:'600' }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
          </div>

          {socialError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <p style={{ fontSize: '12px', color: '#f87171', fontWeight: '500' }}>{socialError}</p>
            </div>
          )}

          <div style={{ display:'flex', gap:'8px' }}>
            <button
              onClick={handleGoogleClick}
              disabled={socialLoading !== ''}
              onMouseEnter={() => setHoveredBtn('social0')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex:1, padding:'12px',
                background: hoveredBtn === 'social0' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: hoveredBtn === 'social0' ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:'12px',
                cursor: socialLoading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s ease',
                transform: hoveredBtn === 'social0' ? 'translateY(-1px)' : 'translateY(0)',
                opacity: socialLoading && socialLoading !== 'google' ? 0.5 : 1,
              }}
            >
              {socialLoading === 'google' ? (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </button>

            <button
              onClick={handleFacebookClick}
              disabled={socialLoading !== ''}
              onMouseEnter={() => setHoveredBtn('social1')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex:1, padding:'12px',
                background: hoveredBtn === 'social1' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: hoveredBtn === 'social1' ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:'12px',
                cursor: socialLoading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s ease',
                transform: hoveredBtn === 'social1' ? 'translateY(-1px)' : 'translateY(0)',
                opacity: socialLoading && socialLoading !== 'facebook' ? 0.5 : 1,
              }}
            >
              {socialLoading === 'facebook' ? (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
            </button>

            <button
              onMouseEnter={() => setHoveredBtn('social2')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                flex:1, padding:'12px',
                background: hoveredBtn === 'social2' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: hoveredBtn === 'social2' ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:'12px',
                cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s ease',
                transform: hoveredBtn === 'social2' ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 814 1000">
                <path fill="white" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 71 0 130.5 46.4 174.9 46.4 42.7 0 109.2-49.1 189.2-49.1 30.4 0 110.4 2.6 173.4 66.5zm-194.3-99.5c31.7-37.5 54.3-89.7 54.3-141.9 0-7.1-.6-14.3-1.9-20.1-51.6 1.9-112.3 34.4-149.2 75.8-28.5 32.4-55.1 84.7-55.1 139.5 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.4 1.3 13.6 1.3 46.4 0 102.9-30.5 136.4-73.8z"/>
              </svg>
            </button>
          </div>
        </div>

        <div style={{
          display:'flex', gap:'24px', marginTop:'36px',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp 0.7s ease 0.35s both' : 'none',
        }}>
          {[
            { value:'10M+', label:'Learners' },
            { value:'50K+', label:'Creators' },
            { value:'200+', label:'Topics' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <p style={{
                fontSize:'16px', fontWeight:'800',
                background:'linear-gradient(135deg, #6C63FF, #F72585)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>
                {stat.value}
              </p>
              <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', marginTop:'2px', fontWeight:'500' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop:'24px', textAlign:'center',
          opacity: mounted ? 1 : 0,
          animation: mounted ? 'fadeUp 0.7s ease 0.4s both' : 'none',
        }}>
          <p style={{
            fontSize:'11px', color:'rgba(255,255,255,0.18)',
            lineHeight:'1.6', maxWidth:'280px', margin:'0 auto',
          }}>
            By continuing, you agree to our{' '}
            <span style={{ color:'rgba(255,255,255,0.35)', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.15)' }}>Terms</span>
            {' '}and{' '}
            <span style={{ color:'rgba(255,255,255,0.35)', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.15)' }}>Privacy Policy</span>
          </p>

          <div style={{
            display:'flex', alignItems:'center', justifyContent:'center',
            gap:'6px', marginTop:'14px', cursor:'pointer', opacity:'0.5',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', fontWeight:'500' }}>
              English (US)
            </span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;