import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoSend } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';

const chatsData = {
  1: { name: 'TechWithAli', avatar: '🤖', color: '#6C63FF', online: true },
  2: { name: 'ChefNadia', avatar: '🍳', color: '#FB8500', online: true },
  3: { name: 'DesignByMaya', avatar: '🎨', color: '#F72585', online: false },
  4: { name: 'CodeWithRaj', avatar: '💻', color: '#00B4D8', online: false },
  5: { name: 'DevWithSam', avatar: '⚡', color: '#10b981', online: true },
  6: { name: 'MLWithRiya', avatar: '🔬', color: '#f59e0b', online: false },
};

const initialMessages = {
  1: [
    { id: 1, text: 'Hey! Loved your latest reel 🔥', mine: false, time: '10:30 AM' },
    { id: 2, text: 'Thank you so much! 😊', mine: true, time: '10:31 AM' },
    { id: 3, text: 'When is your next AI reel dropping?', mine: false, time: '10:32 AM' },
  ],
  2: [
    { id: 1, text: 'Your biryani reel was 🔥', mine: false, time: '9:00 AM' },
    { id: 2, text: 'Try adding saffron next time!', mine: false, time: '9:01 AM' },
    { id: 3, text: 'Will try it tonight!', mine: true, time: '9:05 AM' },
  ],
};

function ChatPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const chat = chatsData[id];
  const [messages, setMessages] = useState(initialMessages[id] || []);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      text: text.trim(),
      mine: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMsg]);
    setText('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: '👍 Got it!',
        mine: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  if (!chat) return null;

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
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${chat.color}, #a855f7)`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px',
          }}>
            {chat.avatar}
          </div>
          {chat.online && (
            <div style={{
              position: 'absolute', bottom: '2px', right: '2px',
              width: '11px', height: '11px', borderRadius: '50%',
              background: '#22c55e',
              border: `2px solid ${colors.bgPrimary}`,
            }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: colors.textPrimary }}>
              {chat.name}
            </span>
            <MdVerified style={{ color: chat.color, fontSize: '14px' }} />
          </div>
          <span style={{
            fontSize: '12px',
            color: chat.online ? '#22c55e' : colors.textMuted,
            fontWeight: '500',
          }}>
            {chat.online ? '● Online' : 'Offline'}
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
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.mine ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: '8px',
          }}>
            {!msg.mine && (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${chat.color}, #a855f7)`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px',
                flexShrink: 0,
              }}>
                {chat.avatar}
              </div>
            )}
            <div>
              <div style={{
                maxWidth: '260px',
                background: msg.mine
                  ? 'linear-gradient(135deg, #6C63FF, #a855f7)'
                  : colors.bgCard,
                border: msg.mine ? 'none' : `1px solid ${colors.border}`,
                borderRadius: msg.mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px',
                boxShadow: msg.mine ? '0 2px 8px rgba(108,99,255,0.3)' : colors.shadow,
              }}>
                <p style={{
                  fontSize: '14px',
                  color: msg.mine ? '#ffffff' : colors.textPrimary,
                  lineHeight: '1.4',
                }}>
                  {msg.text}
                </p>
              </div>
              <p style={{
                fontSize: '10px', color: colors.textMuted,
                marginTop: '4px',
                textAlign: msg.mine ? 'right' : 'left',
              }}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar — Fixed at bottom */}
      <div style={{
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${colors.border}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center',
        gap: '10px', flexShrink: 0,
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
      }}>
        <BsEmojiSmile style={{
          color: colors.textMuted, fontSize: '22px',
          cursor: 'pointer', flexShrink: 0,
        }} />
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            style={{
              flex: 1, background: 'none',
              border: 'none', outline: 'none',
              color: colors.textPrimary,
              fontSize: '14px', fontFamily: 'Inter',
            }}
          />
        </div>
        <button onClick={sendMessage} style={{
          width: '42px', height: '42px',
          borderRadius: '50%', border: 'none',
          background: text.trim()
            ? 'linear-gradient(135deg, #6C63FF, #a855f7)'
            : colors.inputBg,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
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