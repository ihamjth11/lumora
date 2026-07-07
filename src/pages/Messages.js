import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';

function Messages() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none',
          color: colors.textPrimary, fontSize: '22px',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center',
        }}>
          <IoArrowBack />
        </button>
        <span style={{
          fontSize: '18px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          flex: 1,
        }}>
          Messages
        </span>
        <FiEdit style={{ color: colors.textSecondary, fontSize: '20px', cursor: 'pointer' }} />
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: colors.inputBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '14px', padding: '10px 14px', gap: '10px',
        }}>
          <BiSearch style={{ color: colors.textMuted, fontSize: '18px' }} />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none',
              outline: 'none', color: colors.textPrimary,
              fontSize: '14px', fontFamily: 'Inter',
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
        <h3 style={{
          fontSize: '20px', fontWeight: '800',
          color: colors.textPrimary, marginBottom: '8px',
        }}>
          No messages yet
        </h3>
        <p style={{
          fontSize: '14px', color: colors.textMuted,
          lineHeight: '1.6', marginBottom: '24px',
        }}>
          Connect with creators and start learning together! ✨
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
          Find Creators 🚀
        </button>
      </div>

    </div>
  );
}

export default Messages;