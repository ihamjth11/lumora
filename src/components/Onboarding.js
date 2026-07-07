import React, { useState } from 'react';

const interests = [
  { id: 1, name: 'Artificial Intelligence', emoji: '🤖', color: '#6C63FF' },
  { id: 2, name: 'Coding', emoji: '💻', color: '#00B4D8' },
  { id: 3, name: 'Cooking', emoji: '🍳', color: '#FB8500' },
  { id: 4, name: 'UI/UX Design', emoji: '🎨', color: '#F72585' },
  { id: 5, name: 'Science', emoji: '🔬', color: '#f59e0b' },
  { id: 6, name: 'Business', emoji: '📈', color: '#6366f1' },
  { id: 7, name: 'Language', emoji: '🌍', color: '#14b8a6' },
  { id: 8, name: 'Mathematics', emoji: '➗', color: '#ef4444' },
  { id: 9, name: 'Photography', emoji: '📸', color: '#8b5cf6' },
  { id: 10, name: 'Skills', emoji: '⚡', color: '#10b981' },
];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');

  const toggleInterest = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#fafafa',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '480px', margin: '0 auto',
    }}>

      {/* Progress bar */}
      <div style={{
        height: '3px', background: '#e5e7eb',
        position: 'absolute', top: 0, left: 0, right: 0,
      }}>
        <div style={{
          height: '100%', background: 'linear-gradient(90deg, #6C63FF, #F72585)',
          width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step 1 — Welcome */}
      {step === 1 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '28px',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '28px',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }}>
            <svg width="58" height="58" viewBox="0 0 24 24" fill="none">
              <path d="M12 6C12 6 8 4 4 4V18C8 18 12 20 12 20C12 20 16 18 20 18V4C16 4 12 6 12 6Z"
                fill="white" opacity="0.9"/>
              <line x1="12" y1="6" x2="12" y2="20"
                stroke="rgba(108,99,255,0.6)" strokeWidth="1.5"/>
              <path d="M7 9L10 11.5L7 14V9Z" fill="rgba(108,99,255,0.8)"/>
              <path d="M14 9L17 11.5L14 14V9Z" fill="rgba(247,37,133,0.8)"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '32px', fontWeight: '900', color: '#0a0a0a',
            letterSpacing: '-0.5px', marginBottom: '12px',
          }}>
            Welcome to<br />
            <span style={{
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>lumora</span>
          </h1>
          <p style={{
            fontSize: '15px', color: '#6b7280', lineHeight: '1.6',
            marginBottom: '40px',
          }}>
            The only place where every scroll makes you smarter. Learn in moments. ✨
          </p>
          <button
            onClick={() => setStep(2)}
            style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              border: 'none', borderRadius: '16px',
              color: '#fff', fontSize: '16px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter',
              boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
            }}
          >
            Get Started 🚀
          </button>
        </div>
      )}

      {/* Step 2 — Name */}
      {step === 2 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '60px 24px 40px',
        }}>
          <h2 style={{
            fontSize: '28px', fontWeight: '900', color: '#0a0a0a',
            marginBottom: '8px',
          }}>
            What's your name? 👋
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            Let us personalize your experience
          </p>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: '16px 20px',
              fontSize: '16px', fontFamily: 'Inter',
              border: '2px solid #e5e7eb', borderRadius: '16px',
              outline: 'none', color: '#0a0a0a',
              background: '#f9fafb',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => name.trim() && setStep(3)}
              style={{
                width: '100%', padding: '16px',
                background: name.trim()
                  ? 'linear-gradient(135deg, #6C63FF, #F72585)'
                  : '#e5e7eb',
                border: 'none', borderRadius: '16px',
                color: name.trim() ? '#fff' : '#9ca3af',
                fontSize: '16px', fontWeight: '700',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'Inter', transition: 'all 0.2s',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Interests */}
      {step === 3 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '60px 24px 40px', overflow: 'hidden',
        }}>
          <h2 style={{
            fontSize: '26px', fontWeight: '900', color: '#0a0a0a',
            marginBottom: '6px',
          }}>
            What do you love? 🎯
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
            Pick at least 3 topics — we'll build your feed around them
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '10px', overflowY: 'auto', flex: 1,
            paddingBottom: '16px',
          }}>
            {interests.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${item.color}22, ${item.color}11)`
                      : '#ffffff',
                    border: `2px solid ${isSelected ? item.color : '#e5e7eb'}`,
                    borderRadius: '16px', padding: '16px 14px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isSelected
                      ? `0 4px 12px ${item.color}30` : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                    {item.emoji}
                  </div>
                  <p style={{
                    fontSize: '13px', fontWeight: '700',
                    color: isSelected ? item.color : '#374151',
                  }}>
                    {item.name}
                  </p>
                  {isSelected && (
                    <div style={{
                      marginTop: '6px', fontSize: '11px',
                      color: item.color, fontWeight: '600',
                    }}>
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => selected.length >= 3 && onComplete({ name, interests: selected })}
            style={{
              width: '100%', padding: '16px', marginTop: '12px',
              background: selected.length >= 3
                ? 'linear-gradient(135deg, #6C63FF, #F72585)'
                : '#e5e7eb',
              border: 'none', borderRadius: '16px',
              color: selected.length >= 3 ? '#fff' : '#9ca3af',
              fontSize: '16px', fontWeight: '700',
              cursor: selected.length >= 3 ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter', transition: 'all 0.2s',
              boxShadow: selected.length >= 3
                ? '0 4px 20px rgba(108,99,255,0.4)' : 'none',
            }}
          >
            {selected.length >= 3
              ? `Start Learning 🚀`
              : `Select ${3 - selected.length} more`}
          </button>
        </div>
      )}
    </div>
  );
}

export default Onboarding;