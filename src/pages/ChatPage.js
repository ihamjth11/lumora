import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileByUsername, getOrCreateConversation, getMessages, sendMessage } from '../services/apiService';
import { IoArrowBack, IoSend } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';

function ChatPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id: username } = useParams();
  const { currentUser } = useAuth();

  const [otherUser, setOtherUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    initChat();
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    setLoading(true);
    const profileRes = await getProfileByUsername(username);
    if (!profileRes.success) {
      setLoading(false);
      return;
    }
    setOtherUser(profileRes.data);

    const convRes = await getOrCreateConversation(profileRes.data.firebaseUid);
    if (convRes.success) {
      setConversationId(convRes.conversationId);
      await loadMessages(convRes.conversationId);

      pollRef.current = setInterval(() => {
        loadMessages(convRes.conversationId, true);
      }, 3000);
    }
    setLoading(false);
  };

  const loadMessages = async (convId, silent = false) => {
    const res = await getMessages(convId);
    if (res.success) {
      setMessages(res.messages);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || sending || !conversationId) return;
    setSending(true);
    const messageText = text.trim();
    setText('');

    const res = await sendMessage(conversationId, messageText);
    if (res.success) {
      setMessages((prev) => [...prev, res.message]);
    }
    setSending(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: colors.bgPrimary,
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '3px solid rgba(108,99,255,0.2)',
          borderTop: '3px solid #6C63FF',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: colors.bgPrimary, padding: '24px', textAlign: 'center',
      }}>
        <p style={{ fontSize: '15px', color: colors.textMuted, marginBottom: '16px' }}>
          User not found
        </p>
        <button onClick={() => navigate('/messages')} style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          border: 'none', borderRadius: '12px', color: '#fff',
          fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
        }}>
          Back to Messages
        </button>
      </div>
    );
  }

  const photoURL = otherUser.photoURL || '';
  const avatar = otherUser.avatar || '🧑‍💻';

  return (
    <div style={{
      background: colors.bgPrimary,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 100,
        flexShrink: 0,
      }}>
        <button onClick={() => navigate('/messages')} style={{
          background: 'none', border: 'none',
          color: colors.textPrimary, fontSize: '22px',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center',
        }}>
          <IoArrowBack />
        </button>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%',
          background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #a855f7)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px',
        }}>
          {!photoURL && avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>
              {otherUser.name}
            </span>
            <MdVerified style={{ color: '#6C63FF', fontSize: '14px' }} />
          </div>
          <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
            @{otherUser.username}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>
              Say hi to {otherUser.name}! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderFirebaseUid === currentUser?.uid;
            return (
              <div key={msg._id} style={{
                display: 'flex',
                justifyContent: mine ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '8px',
              }}>
                {!mine && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #a855f7)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    {!photoURL && avatar}
                  </div>
                )}
                <div>
                  <div style={{
                    maxWidth: '260px',
                    background: mine
                      ? 'linear-gradient(135deg, #6C63FF, #a855f7)'
                      : colors.bgCard,
                    border: mine ? 'none' : `1px solid ${colors.border}`,
                    borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    boxShadow: mine ? '0 2px 8px rgba(108,99,255,0.3)' : colors.shadow,
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: mine ? '#ffffff' : colors.textPrimary,
                      lineHeight: '1.4', wordBreak: 'break-word',
                    }}>
                      {msg.text}
                    </p>
                  </div>
                  <p style={{
                    fontSize: '10px', color: colors.textMuted,
                    marginTop: '4px',
                    textAlign: mine ? 'right' : 'left',
                  }}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${colors.border}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center',
        gap: '10px', flexShrink: 0,
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: colors.inputBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '22px', padding: '10px 14px',
          gap: '8px',
        }}>
          <input
            type="text"
            placeholder="Message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1, background: 'none',
              border: 'none', outline: 'none',
              color: colors.textPrimary,
              fontSize: '14px', fontFamily: 'Inter',
            }}
          />
        </div>
        <button onClick={handleSend} disabled={sending} style={{
          width: '42px', height: '42px',
          borderRadius: '50%', border: 'none',
          background: text.trim()
            ? 'linear-gradient(135deg, #6C63FF, #a855f7)'
            : colors.inputBg,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'default',
          transition: 'all 0.2s', flexShrink: 0,
          boxShadow: text.trim() ? '0 2px 8px rgba(108,99,255,0.4)' : 'none',
        }}>
          <IoSend style={{
            color: text.trim() ? '#fff' : colors.textMuted,
            fontSize: '16px',
          }} />
        </button>
      </div>
    </div>
  );
}

export default ChatPage;