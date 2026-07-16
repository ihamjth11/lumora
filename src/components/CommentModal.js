import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getComments, addComment } from '../services/apiService';
import { IoClose, IoSend } from 'react-icons/io5';

function CommentModal({ postId, onClose, onCommentAdded }) {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const myAvatar = userProfile?.avatar || '🧑‍💻';
  const myPhoto = userProfile?.photoURL || '';

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const res = await getComments(postId);
    if (res.success) {
      setComments(res.comments);
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

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await addComment(postId, text.trim());
    setSending(false);
    if (res.success) {
      setComments(prev => [res.comment, ...prev]);
      setText('');
      onCommentAdded?.();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
      }} />
      <div style={{
        position: 'relative', background: colors.bgCard,
        width: '100%', maxWidth: '480px',
        borderRadius: '24px 24px 0 0',
        maxHeight: '75vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
        }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: colors.textPrimary }}>
            Comments
          </span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: colors.textMuted, fontSize: '20px', padding: 0,
          }}>
            <IoClose />
          </button>
        </div>

        {/* Comments List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: '3px solid rgba(108,99,255,0.2)',
                borderTop: '3px solid #6C63FF',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ fontSize: '13px', color: colors.textMuted }}>
                No comments yet. Be the first! 💬
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const authorPhoto = c.author?.photoURL || '';
              const authorAvatar = c.author?.avatar || '🧑‍💻';
              return (
                <div key={c._id} style={{
                  display: 'flex', gap: '10px', padding: '10px 0',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: authorPhoto ? `url(${authorPhoto})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', flexShrink: 0,
                  }}>
                    {!authorPhoto && authorAvatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: colors.textPrimary }}>
                      <span style={{ fontWeight: '700' }}>{c.author?.username || 'user'}</span>{' '}
                      {c.text}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                      {timeAgo(c.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderTop: `1px solid ${colors.border}`,
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: myPhoto ? `url(${myPhoto})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', flexShrink: 0,
          }}>
            {!myPhoto && myAvatar}
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1, background: colors.inputBg, border: `1px solid ${colors.border}`,
              borderRadius: '20px', padding: '10px 14px',
              outline: 'none', color: colors.textPrimary,
              fontSize: '13px', fontFamily: 'Inter',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              background: 'none', border: 'none',
              color: text.trim() ? '#6C63FF' : colors.textMuted,
              fontSize: '20px', cursor: text.trim() ? 'pointer' : 'default',
              padding: 0, display: 'flex', alignItems: 'center',
            }}>
            <IoSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;