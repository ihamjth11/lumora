import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stories from '../components/Stories';
import LumoraLogo from '../components/LumoraLogo';
import Notifications from '../components/Notifications';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiSend, FiBell } from 'react-icons/fi';

function Home() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = 3;

  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';

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
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LumoraLogo size={36} />
          <span style={{
            fontSize: '22px', fontWeight: '900',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            lumora
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
              position: 'relative',
              display: 'flex', alignItems: 'center',
              color: colors.textSecondary, fontSize: '22px',
            }}
          >
            <FiBell />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#F72585',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${colors.navBg}`,
              }}>
                <span style={{ fontSize: '9px', color: '#fff', fontWeight: '800' }}>
                  {unreadCount}
                </span>
              </div>
            )}
          </button>

          {/* Messages */}
          <button
            onClick={() => navigate('/messages')}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: colors.textSecondary,
              fontSize: '22px', display: 'flex', alignItems: 'center', padding: 0,
            }}
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div
            onClick={() => setShowNotifications(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 9998,
            }}
          />
          <Notifications onClose={() => setShowNotifications(false)} />
        </>
      )}

      {/* Stories */}
      <Stories />

      {/* Create Post Button */}
      <div style={{ padding: '12px 16px 0' }}>
        <button
          onClick={() => navigate('/create')}
          style={{
            width: '100%', background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            cursor: 'pointer', boxShadow: colors.shadow,
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
            flexShrink: 0,
          }}>
            {!photoURL && userAvatar}
          </div>
          <span style={{ color: colors.textMuted, fontSize: '14px', flex: 1, textAlign: 'left' }}>
            Share something you learned...
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#6C63FF', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '18px',
          }}>
            <AiOutlinePlus />
          </div>
        </button>
      </div>

      {/* Empty Feed */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
        <h3 style={{
          fontSize: '20px', fontWeight: '800',
          color: colors.textPrimary, marginBottom: '8px',
        }}>
          Your feed is empty
        </h3>
        <p style={{
          fontSize: '14px', color: colors.textMuted,
          lineHeight: '1.6', marginBottom: '24px',
        }}>
          Follow creators to see their posts here. Start exploring! ✨
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
          Explore Content 🚀
        </button>
      </div>

    </div>
  );
}

export default Home;