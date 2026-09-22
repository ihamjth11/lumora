import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/apiService';
import { IoArrowBack, IoCheckmarkDone, IoTrash } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import { MdVerified } from 'react-icons/md';

function Notifications() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff';
  const chipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const res = await getNotifications();
    if (res.success) {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  };

  const handleDelete = async (id) => {
    const notif = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (notif && !notif.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    await deleteNotification(id);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getNotifMeta = (type) => {
    switch (type) {
      case 'like':
        return { emoji: '❤️', color: '#F72585', bg: 'rgba(247,37,133,0.12)', text: 'liked your post' };
      case 'comment':
        return { emoji: '💬', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', text: 'commented on your post' };
      case 'follow':
        return { emoji: '👤', color: '#10b981', bg: 'rgba(16,185,129,0.12)', text: 'started following you' };
      case 'mention':
        return { emoji: '📣', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: 'mentioned you' };
      case 'reply':
        return { emoji: '↩️', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', text: 'replied to your comment' };
      default:
        return { emoji: '🔔', color: '#6C63FF', bg: 'rgba(108,99,255,0.12)', text: 'sent a notification' };
    }
  };

  const grouped = () => {
    const today = [];
    const thisWeek = [];
    const older = [];
    const now = new Date();

    notifications.forEach((n) => {
      const diff = (now - new Date(n.createdAt)) / 1000;
      if (diff < 86400) today.push(n);
      else if (diff < 604800) thisWeek.push(n);
      else older.push(n);
    });

    return { today, thisWeek, older };
  };

  const { today, thisWeek, older } = grouped();

  const renderNotif = (n) => {
    const meta = getNotifMeta(n.type);
    const sender = n.senderInfo || {};
    const isUnread = !n.read;

    return (
      <div
        key={n._id}
        onClick={() => { if (isUnread) handleMarkRead(n._id); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '13px 16px', cursor: 'pointer',
          background: isUnread
            ? (isDark ? 'rgba(108,99,255,0.07)' : 'rgba(108,99,255,0.04)')
            : 'transparent',
          borderRadius: '16px', marginBottom: '2px',
          border: isUnread
            ? `1px solid ${isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.1)'}`
            : '1px solid transparent',
          transition: 'background 0.15s',
          position: 'relative',
        }}
      >
        {/* Unread dot */}
        {isUnread && (
          <div style={{
            position: 'absolute', top: '13px', left: '6px',
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#6C63FF',
          }} />
        )}

        {/* Avatar + type badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '15px',
            background: sender.photoURL ? `url(${sender.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            {!sender.photoURL && (sender.avatar || '🧑‍💻')}
          </div>
          <div style={{
            position: 'absolute', bottom: '-4px', right: '-4px',
            width: '22px', height: '22px', borderRadius: '50%',
            background: meta.bg, border: `2px solid ${colors.bgPrimary || colors.bgCard}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px',
          }}>
            {meta.emoji}
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13.5px', color: colors.textPrimary, lineHeight: '1.4' }}>
            <span style={{ fontWeight: '800', color: meta.color }}>
              @{sender.username || 'someone'}
            </span>
            {' '}{meta.text}
            {n.commentText && (
              <span style={{ color: colors.textMuted, fontWeight: '500' }}>
                {': "'}{n.commentText}{'"'}
              </span>
            )}
          </p>
          <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '3px', fontWeight: '600' }}>
            {timeAgo(n.createdAt)}
          </p>
        </div>

        {/* Post thumbnail */}
        {n.postMediaUrl && (
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: `url(${n.postMediaUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
            flexShrink: 0, border: `1px solid ${colors.border}`,
          }} />
        )}

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
          style={{
            background: 'none', border: 'none', color: colors.textMuted,
            cursor: 'pointer', fontSize: '15px', padding: '4px', flexShrink: 0,
            opacity: 0.5, display: 'flex', alignItems: 'center',
          }}
        >
          <IoTrash />
        </button>
      </div>
    );
  };

  const renderSection = (label, items) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: '10px' }}>
        <p style={{
          fontSize: '11px', fontWeight: '800', color: colors.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.8px',
          padding: '8px 16px 6px',
        }}>
          {label}
        </p>
        <div style={{ padding: '0 8px' }}>
          {items.map(renderNotif)}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: isDark
        ? 'linear-gradient(180deg, #0a0a12 0%, #0d0a1a 40%, #0a0a12 100%)'
        : 'linear-gradient(180deg, #fafaff 0%, #f5f3ff 40%, #fafaff 100%)',
      minHeight: '100vh', fontFamily: 'Inter, sans-serif',
      paddingBottom: 'var(--bottom-nav-height)',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: '-10%', width: '300px', height: '300px',
        borderRadius: '50%', background: `radial-gradient(circle, rgba(108,99,255,${isDark ? 0.1 : 0.05}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: isDark ? 'rgba(10,10,18,0.8)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${chipBorder}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: chipBg, border: 'none', width: '36px', height: '36px',
          borderRadius: '12px', color: colors.textPrimary, fontSize: '18px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IoArrowBack />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HiSparkles style={{ color: '#6C63FF', fontSize: '15px' }} />
          <span style={{
            fontSize: '17px', fontWeight: '800',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              borderRadius: '20px', padding: '2px 8px', marginLeft: '2px',
            }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800' }}>
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        {unreadCount > 0 ? (
          <button onClick={handleMarkAllRead} style={{
            background: chipBg, border: `1px solid ${chipBorder}`,
            borderRadius: '10px', padding: '7px 12px',
            display: 'flex', alignItems: 'center', gap: '5px',
            cursor: 'pointer', color: '#6C63FF', fontSize: '12px', fontWeight: '700',
          }}>
            <IoCheckmarkDone /> All read
          </button>
        ) : (
          <div style={{ width: '36px' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 0', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px', textAlign: 'center',
          }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '28px',
              background: 'linear-gradient(135deg, #6C63FF15, #F7258510)',
              border: `1px dashed ${chipBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', marginBottom: '20px',
            }}>
              🔔
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              All caught up!
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', maxWidth: '260px' }}>
              When someone likes, comments, or follows you — it'll show up here ✨
            </p>
          </div>
        ) : (
          <>
            {renderSection('Today', today)}
            {renderSection('This Week', thisWeek)}
            {renderSection('Older', older)}
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;