import React, { useEffect, useState } from 'react';

function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => onComplete(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #F72585 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '20px',
    }}>
      {/* Logo Box */}
      <div style={{
        width: '100px', height: '100px',
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.15)',
        border: '2px solid rgba(255,255,255,0.3)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 6C12 6 8 4 4 4V18C8 18 12 20 12 20C12 20 16 18 20 18V4C16 4 12 6 12 6Z"
            fill="white" opacity="0.9"
          />
          <line x1="12" y1="6" x2="12" y2="20"
            stroke="rgba(108,99,255,0.6)" strokeWidth="1.5"/>
          <path d="M7 9L10 11.5L7 14V9Z" fill="rgba(108,99,255,0.8)"/>
          <path d="M14 9L17 11.5L14 14V9Z" fill="rgba(247,37,133,0.8)"/>
        </svg>
      </div>

      {/* App Name */}
      <div style={{
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'all 0.5s ease',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '42px', fontWeight: '900',
          color: '#ffffff', letterSpacing: '-1px',
          fontFamily: 'Inter, sans-serif',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)',
        }}>
          lumora
        </h1>
        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.75)',
          fontFamily: 'Inter, sans-serif', fontWeight: '500',
          marginTop: '4px', letterSpacing: '0.5px',
        }}>
          Learn in moments ✦
        </p>
      </div>

      {/* Loading dots */}
      <div style={{
        display: 'flex', gap: '8px', marginTop: '20px',
        opacity: phase >= 3 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.8)',
            animation: `bounce 0.6s ease ${i * 0.15}s infinite alternate`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.5; }
          to { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SplashScreen;