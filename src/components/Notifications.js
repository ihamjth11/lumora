import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { AiFillHeart } from 'react-icons/ai';
import { BsBookmarkFill, BsPersonPlusFill } from 'react-icons/bs';
import { FiMessageCircle } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';

const notificationsData = [
  { id: 1, type: 'like', user: 'TechWithAli', avatar: '🤖', color: '#6C63FF', text: 'liked your post', time: '2m', read: false },
  { id: 2, type: 'follow', user: 'ChefNadia', avatar: '🍳', color: '#FB8500', text: 'started following you', time: '15m', read: false },
  { id: 3, type: 'comment', user: 'DesignByMaya', avatar: '🎨', color: '#F72585', text: 'commented on your post', time: '1h', read: false },
  { id: 4, type: 'save', user: 'CodeWithRaj', avatar: '💻', color: '#00B4D8', text: 'saved your reel', time: '2h', read: true },
  { id: 5, type: 'like', user: 'MLWithRiya', avatar: '🔬', color: '#10b981', text: 'liked your comment', time: '3h', read: true },
];

function NotificationIcon({ type }) {
  if (type === 'like') return <AiFillHeart style={{ color: '#ef4444', fontSize: '14px' }} />;
  if (type === 'follow') return <BsPersonPlusFill style={{ color: '#6C63FF', fontSize: '14px' }} />;
  if (type === 'comment') return <FiMessageCircle style={{ color: '#F72585', fontSize: '14px' }} />;
  if (type === 'save') return <BsBookmarkFill style={{ color: '#00B4D8', fontSize: '14px' }} />;
  return null;
}

function Notifications({ onClose }) {
  const { colors } = useTheme();
  const [notifs, setNotifs] = useState(notificationsData);

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0,
      width: '320px',
      height: '100vh',
      background: colors.bgCard,
      borderLeft: `1px solid ${colors.border}`,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{
            fontSize: '18px', fontWeight: '800',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
              {unreadCount} unread
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              background: 'none', border: 'none',
              color: '#6C63FF', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer',
              fontFamily: 'Inter',
            }}>
              Mark all read
            </button>
          )}
          <IoClose
            onClick={onClose}
            style={{
              color: colors.textSecondary, fontSize: '22px',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {notifs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
            <h3 style={{
              fontSize: '16px', fontWeight: '700',
              color: colors.textPrimary, marginBottom: '8px',
            }}>
              No notifications yet
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>
              We'll notify you when something happens ✨
            </p>
          </div>
        ) : (
          notifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => setNotifs(notifs.map(n => n.id === notif.id ? { ...n, read: true } : n))}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '12px', padding: '12px 20px',
                background: notif.read ? 'transparent' : `${colors.accentSoft}`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${notif.color}, #a855f7)`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '20px',
                }}>
                  {notif.avatar}
                </div>
                <div style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: colors.bgCard,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${colors.border}`,
                }}>
                  <NotificationIcon type={notif.type} />
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.4' }}>
                  <strong>{notif.user}</strong> {notif.text}
                </p>
                <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '3px' }}>
                  {notif.time} ago
                </p>
              </div>

              {/* Unread dot */}
              {!notif.read && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#6C63FF', flexShrink: 0,
                }} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;