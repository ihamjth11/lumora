import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getConversations } from '../services/apiService';
import useIsDesktop from '../hooks/useIsDesktop';
import ChatPanel from '../components/ChatPanel';
import { IoArrowBack } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { HiOutlinePencilSquare } from 'react-icons/hi2';

function Messages() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const { username } = useParams(); // present when /chat/:username or /messages/:username
  const isDesktop = useIsDesktop();

  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    const res = await getConversations();
    if (res.success) setConversations(res.conversations);
    setLoading(false);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const filtered = conversations.filter((c) =>
    (c.otherUser?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.otherUser?.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const ListPanel = (
    <div style={{
      width: isDesktop ? '360px' : '100%',
      flexShrink: 0,
      borderRight: isDesktop ? `1px solid ${colors.border}` : 'none',
      display: 'flex', flexDirection: 'column',
      background: colors.bgPrimary, height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        {!isDesktop && (
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: colors.textPrimary,
            fontSize: '22px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
          }}>
            <IoArrowBack />
          </button>
        )}
        <span style={{
          fontSize: '19px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          flex: 1,
        }}>
          Messages
        </span>
        <HiOutlinePencilSquare style={{ color: colors.textSecondary, fontSize: '20px' }} />
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: colors.inputBg || colors.bgCard,
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

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '52px', marginBottom: '14px' }}>💬</div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.textPrimary, marginBottom: '6px' }}>
              No messages yet
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '18px' }}>
              Connect with creators and start learning together! ✨
            </p>
            <button
              onClick={() => navigate('/explore')}
              style={{
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'Inter',
              }}
            >
              Find Creators 🚀
            </button>
          </div>
        ) : (
          <div style={{ padding: '0 8px' }}>
            {filtered.map((conv) => {
              const user = conv.otherUser;
              if (!user) return null;
              const isActive = username === user.username;
              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/messages/${user.username}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', cursor: 'pointer', borderRadius: '14px',
                    background: isActive ? (isDark ? 'rgba(108,99,255,0.12)' : '#f3eeff') : 'transparent',
                  }}
                >
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: user.photoURL ? `url(${user.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0,
                  }}>
                    {!user.photoURL && (user.avatar || '🧑‍💻')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>
                      {user.name}
                    </p>
                    <p style={{
                      fontSize: '12px', color: colors.textMuted, marginTop: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.lastMessage || 'Say hi 👋'}
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', color: colors.textMuted, flexShrink: 0 }}>
                    {timeAgo(conv.lastMessageAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: show either list OR chat, never both
  if (!isDesktop) {
    if (username) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <ChatPanel username={username} onBack={() => navigate('/messages')} showBackButton />
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100vh', paddingBottom: 'var(--bottom-nav-height)' }}>
        {ListPanel}
      </div>
    );
  }

  // Desktop: show list + chat side by side
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {ListPanel}
      <ChatPanel username={username} showBackButton={false} />
    </div>
  );
}

export default Messages;