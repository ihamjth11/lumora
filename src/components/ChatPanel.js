import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getProfileByUsername, getOrCreateConversation, getMessages, sendMessageWithMedia, uploadChatMedia } from '../services/apiService';
import { IoArrowBack, IoSend, IoClose, IoMic, IoStop } from 'react-icons/io5';
import { HiOutlinePhotograph, HiOutlineCamera } from 'react-icons/hi';
import { MdVerified } from 'react-icons/md';
import { FiPlus } from 'react-icons/fi';

function ChatPanel({ username, onBack, showBackButton }) {
  const { colors, isDark } = useTheme();
  const { currentUser } = useAuth();

  const [otherUser, setOtherUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const photoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setOtherUser(null);
    setConversationId(null);
    initChat();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(recordTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChat = async () => {
    if (!username) return;
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
      pollRef.current = setInterval(() => loadMessages(convRes.conversationId), 3000);
    }
    setLoading(false);
  };

  const loadMessages = async (convId) => {
    const res = await getMessages(convId);
    if (res.success) setMessages(res.messages);
  };

  const handlePickFile = (e, kind) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingMedia({ file, preview: URL.createObjectURL(file), kind });
    setShowAttachMenu(false);
    e.target.value = '';
  };

  const cancelPendingMedia = () => setPendingMedia(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
        setPendingMedia({ file, preview: URL.createObjectURL(blob), kind: 'audio' });
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
  };

  const handleSend = async () => {
    if (sending || !conversationId) return;
    if (!text.trim() && !pendingMedia) return;

    setSending(true);

    let mediaUrl = '';
    let mediaType = 'none';

    if (pendingMedia) {
      setUploadingMedia(true);
      const uploadRes = await uploadChatMedia(pendingMedia.file);
      setUploadingMedia(false);
      if (!uploadRes.success) {
        alert(uploadRes.error || 'Upload failed');
        setSending(false);
        return;
      }
      mediaUrl = uploadRes.url;
      mediaType = uploadRes.mediaType;
    }

    const messageText = text.trim();
    setText('');
    setPendingMedia(null);

    const res = await sendMessageWithMedia(conversationId, messageText, mediaUrl, mediaType);
    if (res.success) {
      setMessages((prev) => [...prev, res.message]);
    }
    setSending(false);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatRecordTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const inputBg = colors.inputBg || colors.bgCard;

  if (!username) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: colors.bgPrimary, padding: '24px', textAlign: 'center',
      }}>
        <div style={{
          width: '96px', height: '96px', borderRadius: '28px',
          background: 'linear-gradient(135deg, #6C63FF22, #F7258522)',
          border: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '40px', marginBottom: '16px',
        }}>
          💬
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '6px' }}>
          Your Messages
        </h3>
        <p style={{ fontSize: '13px', color: colors.textMuted, maxWidth: '260px' }}>
          Select a conversation or start a new one from someone's profile ✨
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bgPrimary }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bgPrimary, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: colors.textMuted }}>User not found</p>
      </div>
    );
  }

  const photoURL = otherUser.photoURL || '';
  const avatar = otherUser.avatar || '🧑‍💻';
  const accentColor = '#6C63FF';
  const bubbleColorOther = colors.bgCard;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: colors.bgPrimary, minWidth: 0, height: '100%',
      fontFamily: 'Inter, sans-serif',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: colors.navBg, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center',
        gap: '12px', flexShrink: 0,
      }}>
        {showBackButton && (
          <button onClick={onBack} style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff', border: 'none', width: '36px', height: '36px',
            borderRadius: '12px', color: colors.textPrimary, fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IoArrowBack />
          </button>
        )}
        <div style={{
          width: '40px', height: '40px', borderRadius: '13px',
          background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
        }}>
          {!photoURL && avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>{otherUser.name}</span>
            <MdVerified style={{ color: accentColor, fontSize: '13px' }} />
          </div>
          <span style={{ fontSize: '11px', color: colors.textMuted }}>@{otherUser.username}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>Say hi to {otherUser.name}! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = msg.senderFirebaseUid === currentUser?.uid;
            return (
              <div key={msg._id} style={{
                display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '8px', animation: 'slideUp 0.25s ease',
              }}>
                {!mine && (
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '9px',
                    background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', flexShrink: 0,
                  }}>
                    {!photoURL && avatar}
                  </div>
                )}
                <div style={{ maxWidth: '340px' }}>
                  {msg.mediaType === 'image' && (
                    <img src={msg.mediaUrl} alt="" style={{
                      width: '100%', borderRadius: '16px', display: 'block', marginBottom: msg.text ? '4px' : 0,
                    }} />
                  )}
                  {msg.mediaType === 'video' && (
                    <video src={msg.mediaUrl} controls style={{
                      width: '100%', borderRadius: '16px', display: 'block', marginBottom: msg.text ? '4px' : 0,
                    }} />
                  )}
                  {msg.mediaType === 'audio' && (
                    <div style={{
                      background: mine ? 'linear-gradient(135deg, #6C63FF, #a855f7)' : bubbleColorOther,
                      border: mine ? 'none' : `1px solid ${colors.border}`,
                      borderRadius: '18px', padding: '10px 14px', marginBottom: msg.text ? '4px' : 0,
                    }}>
                      <audio src={msg.mediaUrl} controls style={{ width: '220px', height: '32px' }} />
                    </div>
                  )}
                  {msg.text && (
                    <div style={{
                      background: mine ? 'linear-gradient(135deg, #6C63FF, #a855f7)' : bubbleColorOther,
                      border: mine ? 'none' : `1px solid ${colors.border}`,
                      borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '10px 14px',
                      boxShadow: mine ? '0 2px 12px rgba(108,99,255,0.3)' : 'none',
                    }}>
                      <p style={{ fontSize: '14px', color: mine ? '#fff' : colors.textPrimary, lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                  )}
                  <p style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px', textAlign: mine ? 'right' : 'left' }}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pending media preview */}
      {pendingMedia && (
        <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
          <div style={{
            position: 'relative', display: 'inline-block',
            background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '16px', padding: '8px',
          }}>
            {pendingMedia.kind === 'image' && (
              <img src={pendingMedia.preview} alt="" style={{ height: '80px', borderRadius: '10px', display: 'block' }} />
            )}
            {pendingMedia.kind === 'video' && (
              <video src={pendingMedia.preview} style={{ height: '80px', borderRadius: '10px', display: 'block' }} />
            )}
            {pendingMedia.kind === 'audio' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px' }}>
                <IoMic style={{ color: accentColor, fontSize: '20px' }} />
                <span style={{ color: colors.textPrimary, fontSize: '13px' }}>Voice note ready</span>
              </div>
            )}
            <button onClick={cancelPendingMedia} style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '22px', height: '22px', borderRadius: '50%',
              background: '#F72585', border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', cursor: 'pointer',
            }}>
              <IoClose />
            </button>
          </div>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachMenu && (
        <div style={{
          padding: '12px 16px 0', flexShrink: 0, animation: 'slideUp 0.2s ease',
          display: 'flex', gap: '10px',
        }}>
          <input type="file" accept="image/*" ref={photoInputRef} onChange={(e) => handlePickFile(e, 'image')} style={{ display: 'none' }} />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => handlePickFile(e, 'image')} style={{ display: 'none' }} />

          {[
            { icon: <HiOutlinePhotograph />, label: 'Gallery', onClick: () => photoInputRef.current?.click(), color: '#6C63FF' },
            { icon: <HiOutlineCamera />, label: 'Camera', onClick: () => cameraInputRef.current?.click(), color: '#F72585' },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick} style={{
              flex: 1, maxWidth: '160px', background: colors.bgCard,
              border: `1px solid ${item.color}33`, borderRadius: '16px',
              padding: '14px 8px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px', cursor: 'pointer',
            }}>
              <span style={{ color: item.color, fontSize: '22px' }}>{item.icon}</span>
              <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: '600' }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div style={{
        background: colors.navBg, backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${colors.border}`,
        padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {isRecording ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(247,37,133,0.08)', border: '1px solid rgba(247,37,133,0.3)',
            borderRadius: '24px', padding: '10px 16px',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#F72585',
              animation: 'pulse 1s ease infinite',
            }} />
            <span style={{ color: colors.textPrimary, fontSize: '13px', fontWeight: '600', flex: 1 }}>
              Recording... {formatRecordTime(recordSeconds)}
            </span>
            <button onClick={stopRecording} style={{
              background: 'linear-gradient(135deg, #6C63FF, #F72585)', border: 'none',
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer', fontSize: '15px',
            }}>
              <IoStop />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              style={{
                width: '40px', height: '40px', borderRadius: '14px', flexShrink: 0,
                background: showAttachMenu ? 'linear-gradient(135deg, #6C63FF, #F72585)' : (isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff'),
                border: showAttachMenu ? 'none' : `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: showAttachMenu ? '#fff' : colors.textPrimary, fontSize: '18px', cursor: 'pointer',
                transform: showAttachMenu ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.2s',
              }}>
              <FiPlus />
            </button>

            <div style={{
              flex: 1, display: 'flex', alignItems: 'center',
              background: inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '24px', padding: '10px 16px', gap: '8px',
            }}>
              <input
                type="text"
                placeholder="Message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: colors.textPrimary, fontSize: '14px', fontFamily: 'Inter',
                }}
              />
            </div>

            {text.trim() || pendingMedia ? (
              <button onClick={handleSend} disabled={sending || uploadingMedia} style={{
                width: '42px', height: '42px', borderRadius: '50%', border: 'none', flexShrink: 0,
                background: 'linear-gradient(135deg, #6C63FF, #a855f7, #F72585)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 12px rgba(108,99,255,0.5)',
                opacity: (sending || uploadingMedia) ? 0.6 : 1,
              }}>
                {uploadingMedia ? (
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <IoSend style={{ color: '#fff', fontSize: '16px' }} />
                )}
              </button>
            ) : (
              <button onClick={startRecording} style={{
                width: '42px', height: '42px', borderRadius: '50%', border: `1px solid ${colors.border}`, flexShrink: 0,
                background: isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: colors.textPrimary, fontSize: '18px',
              }}>
                <IoMic />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPanel;