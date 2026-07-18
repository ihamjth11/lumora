import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../services/apiService';
import { IoArrowBack } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';

function Messages() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    const res = await getConversations();
    if (res.success) {
      setConversations(res.conversations);
    }
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

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
    }}>

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
      </div>

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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid rgba(108,99,255,0.2)',
            borderTop: '3px solid #6C63FF',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
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
      ) : (
        <div style={{ padding: '0 8px' }}>
          {filtered.map((conv) => {
            const user = conv.otherUser;
            if (!user) return null;
            return (
              <div
                key={conv._id}
                onClick={() => navigate(`/chat/${user.username}`, { state: { targetUid: null } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', cursor: 'pointer', borderRadius: '14px',
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: user.photoURL ? `url(${user.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
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
                <span style={{ fontSize: '11px', color: colors.textMuted }}>
                  {timeAgo(conv.lastMessageAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Messages;