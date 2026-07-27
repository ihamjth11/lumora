import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getConversations } from '../services/apiService';
import useIsDesktop from '../hooks/useIsDesktop';
import ChatPanel from '../components/ChatPanel';
import { IoArrowBack } from 'react-icons/io5';
import { BiSearch } from 'react-icons/bi';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import { HiSparkles } from 'react-icons/hi';

function Messages() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const { username } = useParams();
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

  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff';
  const chipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';

  const ListPanel = (
    <div style={{
      width: isDesktop ? '380px' : '100%',
      flexShrink: 0,
      borderRight: isDesktop ? `1px solid ${colors.border}` : 'none',
      display: 'flex', flexDirection: 'column',
      background: colors.bgPrimary, height: '100%',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%', width: '260px', height: '260px',
        borderRadius: '50%', background: `radial-gradient(circle, rgba(108,99,255,${isDark ? 0.12 : 0.06}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: '12px',
        borderBottom: `1px solid ${colors.border}`, position: 'relative', zIndex: 1,
      }}>
        {!isDesktop && (
          <button onClick={() => navigate('/')} style={{
            background: chipBg, border: `1px solid ${chipBorder}`, width: '36px', height: '36px',
            borderRadius: '12px', color: colors.textPrimary,
            fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IoArrowBack />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiSparkles style={{ color: '#6C63FF', fontSize: '15px' }} />
            <span style={{
              fontSize: '20px', fontWeight: '800',
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Messages
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: colors.textMuted, marginTop: '2px', fontWeight: '600' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button style={{
          width: '38px', height: '38px', borderRadius: '13px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6C63FF, #F72585)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
        }}>
          <HiOutlinePencilSquare style={{ color: '#fff', fontSize: '17px' }} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '14px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: colors.inputBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px', padding: '11px 16px', gap: '10px',
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
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
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
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: 'linear-gradient(135deg, #6C63FF18, #F7258512)',
              border: `1px dashed ${chipBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '34px', marginBottom: '16px',
            }}>
              💬
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.textPrimary, marginBottom: '6px' }}>
              No messages yet
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '18px' }}>
              Connect with creators and start learning together! ✨
            </p>
            <button
              onClick={() => navigate('/explore')}
              style={{
                padding: '11px 24px',
                background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                border: 'none', borderRadius: '14px',
                color: '#fff', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'Inter',
                boxShadow: '0 4px 14px rgba(108,99,255,0.35)',
              }}
            >
              Find Creators 🚀
            </button>
          </div>
        ) : (
          <div style={{ padding: '4px 12px' }}>
            {filtered.map((conv) => {
              const user = conv.otherUser;
              if (!user) return null;
              const isActive = username === user.username;
              return (
                <div
                  key={conv._id}
                  onClick={() => navigate(`/messages/${user.username}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '13px',
                    padding: '12px', cursor: 'pointer', borderRadius: '16px',
                    marginBottom: '2px',
                    background: isActive
                      ? (isDark ? 'linear-gradient(135deg, rgba(108,99,255,0.16), rgba(247,37,133,0.08))' : 'linear-gradient(135deg, #f0eeff, #fdf0f8)')
                      : 'transparent',
                    border: isActive ? `1px solid ${chipBorder}` : '1px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '17px',
                    background: user.photoURL ? `url(${user.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '21px', flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(108,99,255,0.2)',
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
                  <span style={{
                    fontSize: '10.5px', color: colors.textMuted, flexShrink: 0,
                    background: chipBg, padding: '3px 8px', borderRadius: '8px', fontWeight: '600',
                  }}>
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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {ListPanel}
      <ChatPanel username={username} showBackButton={false} />
    </div>
  );
}

export default Messages;