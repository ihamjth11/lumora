import React from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { BsBookmark } from 'react-icons/bs';

function Saved() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>

      {/* Header */}
      <div style={{ padding: '16px 20px 20px' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: '700',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Saved ✦
        </h1>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px' }}>
          0 reels saved
        </p>
      </div>

      {/* Empty State */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', textAlign: 'center',
      }}>
        <BsBookmark style={{
          fontSize: '64px', color: colors.border,
          marginBottom: '16px',
        }} />
        <h3 style={{
          fontSize: '20px', fontWeight: '800',
          color: colors.textPrimary, marginBottom: '8px',
        }}>
          Nothing saved yet
        </h3>
        <p style={{
          fontSize: '14px', color: colors.textMuted,
          lineHeight: '1.6', marginBottom: '24px',
        }}>
          Tap the bookmark icon on any reel to save it here ✨
        </p>
        <button
          onClick={() => navigate('/explore')}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            border: 'none', borderRadius: '14px',
            color: '#fff', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
            boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
          }}
        >
          Explore Reels 🚀
        </button>
      </div>

    </div>
  );
}

export default Saved;