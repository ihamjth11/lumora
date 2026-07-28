import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getProfileByUsername, getOrCreateConversation, getMessages, sendMessageWithMedia, uploadChatMedia,
  toggleBlockUser, deleteMessage, clearChat, reportUserOrMessage, reactToMessage, setTypingState, getTypingState
} from '../services/apiService';
import { IoArrowBack, IoSend, IoClose, IoMic, IoStop, IoEllipsisVertical, IoTrash, IoFlag, IoBan, IoCheckmarkDone, IoCheckmark, IoArrowUndo } from 'react-icons/io5';
import { HiOutlinePhotograph, HiOutlineCamera, HiOutlineFilm, HiSparkles } from 'react-icons/hi';
import { MdVerified } from 'react-icons/md';
import { FiPlus, FiMoreHorizontal } from 'react-icons/fi';
import PostModal from './PostModal';

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

function ChatPanel({ username, onBack, showBackButton }) {
  const { colors, isDark } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

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
  const [viewingPostId, setViewingPostId] = useState(null);

  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeMsgMenu, setActiveMsgMenu] = useState(null);
  const [reactionPickerFor, setReactionPickerFor] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const bottomRef = useRef(null);
  const pollRef = useRef(null);
  const typingPollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);
  const headerMenuRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setOtherUser(null);
    setConversationId(null);
    setReplyingTo(null);
    initChat();
    return () => {
      clearInterval(pollRef.current);
      clearInterval(typingPollRef.current);
      clearInterval(recordTimerRef.current);
      clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setShowHeaderMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initChat = async () => {
    if (!username) return;
    setLoading(true);
    const profileRes = await getProfileByUsername(username);
    if (!profileRes.success) {
      setLoading(false);
      return;
    }
    setOtherUser(profileRes.data);
    setIsBlocked(userProfile?.blockedUsers?.includes(profileRes.data.firebaseUid) || false);

    const convRes = await getOrCreateConversation(profileRes.data.firebaseUid);
    if (convRes.success) {
      setConversationId(convRes.conversationId);
      await loadMessages(convRes.conversationId);
      pollRef.current = setInterval(() => loadMessages(convRes.conversationId), 3000);
      typingPollRef.current = setInterval(() => pollTyping(convRes.conversationId), 2000);
    }
    setLoading(false);
  };

  const loadMessages = async (convId) => {
    const res = await getMessages(convId);
    if (res.success) setMessages(res.messages);
  };

  const pollTyping = async (convId) => {
    const res = await getTypingState(convId);
    if (res.success) setOtherTyping(res.typing);
  };

  const handleTextChange = (val) => {
    setText(val);
    if (conversationId) {
      setTypingState(conversationId);
    }
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
    if (sending || !conversationId || isBlocked) return;
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
    const replyId = replyingTo?._id || null;
    setText('');
    setPendingMedia(null);
    setReplyingTo(null);

    const res = await sendMessageWithMedia(conversationId, messageText, mediaUrl, mediaType, replyId);
    if (res.success) {
      setMessages((prev) => [...prev, res.message]);
    }
    setSending(false);
  };

  const handleToggleBlock = async () => {
    setShowHeaderMenu(false);
    const res = await toggleBlockUser(otherUser.firebaseUid);
    if (res.success) setIsBlocked(res.blocked);
  };

  const handleClearChat = async () => {
    if (!conversationId) return;
    await clearChat(conversationId);
    setShowClearConfirm(false);
    setMessages([]);
    if (onBack) onBack();
    else navigate('/messages');
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !otherUser) return;
    setReportSubmitting(true);
    const res = await reportUserOrMessage(otherUser.firebaseUid, 'user', '', reportReason.trim());
    setReportSubmitting(false);
    if (res.success) {
      setReportSent(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSent(false);
        setReportReason('');
      }, 1500);
    }
  };

  const handleDeleteMessage = async (messageId, forEveryone) => {
    setActiveMsgMenu(null);
    const res = await deleteMessage(messageId, forEveryone);
    if (res.success) {
      if (forEveryone) {
        setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, deletedForEveryone: true, text: '', mediaUrl: '', mediaType: 'none', sharedPost: null, reactions: [] } : m));
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    }
  };

  const handleReact = async (messageId, emoji) => {
    setReactionPickerFor(null);
    const res = await reactToMessage(messageId, emoji);
    if (res.success) {
      setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, reactions: res.reactions } : m));
    }
  };

  const handleReply = (msg) => {
    setActiveMsgMenu(null);
    setReplyingTo(msg);
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatRecordTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const replyPreviewLabel = (msg) => {
    if (!msg) return '';
    if (msg.deletedForEveryone) return 'This message was deleted';
    if (msg.mediaType === 'image') return '📷 Photo';
    if (msg.mediaType === 'video') return '🎬 Video';
    if (msg.mediaType === 'audio') return '🎤 Voice message';
    if (msg.mediaType === 'post') return '📤 Shared post';
    return msg.text || '';
  };

  const accentColor = '#6C63FF';
  const inputBg = colors.inputBg || colors.bgCard;

  const glassBg = isDark ? 'rgba(20,16,42,0.7)' : 'rgba(255,255,255,0.75)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(108,99,255,0.12)';
  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : '#f0efff';
  const chipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';
  const otherBubbleBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3f2ff';
  const otherBubbleBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.1)';
  const otherBubbleText = colors.textPrimary;
  const menuBg = isDark ? 'rgba(28,22,50,0.92)' : 'rgba(255,255,255,0.92)';
  const menuBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';

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

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: isDark
        ? 'linear-gradient(165deg, #0b0b18 0%, #14102a 45%, #0b0b18 100%)'
        : 'linear-gradient(165deg, #fafaff 0%, #f3f0ff 45%, #fafaff 100%)',
      minWidth: 0, height: '100%',
      fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px',
        borderRadius: '50%', background: `radial-gradient(circle, rgba(108,99,255,${isDark ? 0.15 : 0.08}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '-8%', width: '250px', height: '250px',
        borderRadius: '50%', background: `radial-gradient(circle, rgba(247,37,133,${isDark ? 0.12 : 0.06}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes typingDot { 0%,60%,100% { transform: translateY(0); opacity:0.4; } 30% { transform: translateY(-4px); opacity:1; } }
        @keyframes popIn { from { transform: scale(0.5); opacity:0; } to { transform: scale(1); opacity:1; } }
      `}</style>

      {/* Header */}
      <div style={{
        background: glassBg, backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${glassBorder}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center',
        gap: '12px', flexShrink: 0, position: 'relative', zIndex: 3,
      }}>
        {showBackButton && (
          <button onClick={onBack} style={{
            background: chipBg, border: 'none', width: '36px', height: '36px',
            borderRadius: '12px', color: colors.textPrimary, fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IoArrowBack />
          </button>
        )}
        <div
          onClick={() => navigate('/u/' + otherUser.username)}
          style={{
            width: '40px', height: '40px', borderRadius: '13px', cursor: 'pointer',
            background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
          }}>
          {!photoURL && avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate('/u/' + otherUser.username)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>{otherUser.name}</span>
            <MdVerified style={{ color: accentColor, fontSize: '13px' }} />
          </div>
          <span style={{ fontSize: '11px', color: otherTyping ? accentColor : colors.textMuted, fontWeight: otherTyping ? '700' : '400' }}>
            {isBlocked ? 'Blocked' : otherTyping ? 'typing...' : `@${otherUser.username}`}
          </span>
        </div>

        <div ref={headerMenuRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} style={{
            background: chipBg, border: `1px solid ${chipBorder}`, width: '36px', height: '36px',
            borderRadius: '12px', color: colors.textPrimary, fontSize: '17px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IoEllipsisVertical />
          </button>
          {showHeaderMenu && (
            <div style={{
              position: 'absolute', top: '46px', right: 0, zIndex: 30,
              background: menuBg, backdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid ${menuBorder}`,
              borderRadius: '20px', overflow: 'hidden', minWidth: '210px', padding: '6px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)', animation: 'popIn 0.15s ease',
            }}>
              {[
                { icon: <IoBan />, label: `${isBlocked ? 'Unblock' : 'Block'} ${otherUser.name}`, color: '#6C63FF', onClick: handleToggleBlock },
                { icon: <IoFlag />, label: 'Report', color: '#F72585', onClick: () => { setShowHeaderMenu(false); setShowReportModal(true); } },
                { icon: <IoTrash />, label: 'Delete Chat', color: '#ef4444', onClick: () => { setShowHeaderMenu(false); setShowClearConfirm(true); } },
              ].map((item, i) => (
                <button key={i} onClick={item.onClick} style={{
                  width: '100%', padding: '10px 12px', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: '11px', cursor: 'pointer',
                  color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter', fontWeight: '600',
                  borderRadius: '13px', transition: 'background 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = item.color + '12'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
                    background: item.color + '18', color: item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ color: item.color }}>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 2 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>Say hi to {otherUser.name}! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const mine = msg.senderFirebaseUid === currentUser?.uid;
            const isDeleted = msg.deletedForEveryone;
            const isLastMine = mine && idx === messages.length - 1;
            return (
              <div key={msg._id} style={{
                display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '6px', animation: 'slideUp 0.25s ease',
                position: 'relative',
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

                {mine && !isDeleted && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setActiveMsgMenu(activeMsgMenu === msg._id ? null : msg._id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                        color: colors.textMuted, fontSize: '14px', display: 'flex', alignItems: 'center',
                      }}>
                      <FiMoreHorizontal />
                    </button>
                    {activeMsgMenu === msg._id && (
                      <div style={{
                        position: 'absolute', bottom: '32px', right: 0, zIndex: 20,
                        background: menuBg, backdropFilter: 'blur(24px) saturate(180%)',
                        border: `1px solid ${menuBorder}`,
                        borderRadius: '18px', overflow: 'hidden', minWidth: '180px', padding: '6px',
                        boxShadow: '0 14px 36px rgba(0,0,0,0.3)', animation: 'popIn 0.15s ease',
                      }}>
                        {[
                          { icon: <IoArrowUndo />, label: 'Reply', color: '#6C63FF', onClick: () => handleReply(msg) },
                          { icon: <span style={{ fontSize: '13px' }}>😀</span>, label: 'React', color: '#ffb020', onClick: () => { setActiveMsgMenu(null); setReactionPickerFor(msg._id); } },
                          { icon: <IoTrash />, label: 'Delete for me', color: colors.textPrimary, onClick: () => handleDeleteMessage(msg._id, false) },
                          { icon: <IoTrash />, label: 'Delete for everyone', color: '#ef4444', onClick: () => handleDeleteMessage(msg._id, true) },
                        ].map((item, i) => (
                          <button key={i} onClick={item.onClick} style={{
                            width: '100%', padding: '9px 11px', background: 'none', border: 'none',
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            fontSize: '12.5px', fontFamily: 'Inter', fontWeight: '600', borderRadius: '11px',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = item.color + '14'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: '26px', height: '26px', borderRadius: '9px', flexShrink: 0,
                              background: item.color + '18', color: item.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                            }}>
                              {item.icon}
                            </div>
                            <span style={{ color: item.color }}>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {!mine && !isDeleted && (
                  <div style={{ position: 'relative', order: 2 }}>
                    <button
                      onClick={() => setActiveMsgMenu(activeMsgMenu === msg._id ? null : msg._id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                        color: colors.textMuted, fontSize: '14px', display: 'flex', alignItems: 'center',
                      }}>
                      <FiMoreHorizontal />
                    </button>
                    {activeMsgMenu === msg._id && (
                      <div style={{
                        position: 'absolute', bottom: '32px', left: 0, zIndex: 20,
                        background: menuBg, backdropFilter: 'blur(24px) saturate(180%)',
                        border: `1px solid ${menuBorder}`,
                        borderRadius: '18px', overflow: 'hidden', minWidth: '170px', padding: '6px',
                        boxShadow: '0 14px 36px rgba(0,0,0,0.3)', animation: 'popIn 0.15s ease',
                      }}>
                        {[
                          { icon: <IoArrowUndo />, label: 'Reply', color: '#6C63FF', onClick: () => handleReply(msg) },
                          { icon: <span style={{ fontSize: '13px' }}>😀</span>, label: 'React', color: '#ffb020', onClick: () => { setActiveMsgMenu(null); setReactionPickerFor(msg._id); } },
                          { icon: <IoTrash />, label: 'Delete for me', color: colors.textPrimary, onClick: () => handleDeleteMessage(msg._id, false) },
                        ].map((item, i) => (
                          <button key={i} onClick={item.onClick} style={{
                            width: '100%', padding: '9px 11px', background: 'none', border: 'none',
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            fontSize: '12.5px', fontFamily: 'Inter', fontWeight: '600', borderRadius: '11px',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = item.color + '14'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{
                              width: '26px', height: '26px', borderRadius: '9px', flexShrink: 0,
                              background: item.color + '18', color: item.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
                            }}>
                              {item.icon}
                            </div>
                            <span style={{ color: item.color }}>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ maxWidth: '340px', position: 'relative' }}>
                  {reactionPickerFor === msg._id && (
                    <div style={{
                      position: 'absolute', bottom: '100%', marginBottom: '10px',
                      left: mine ? 'auto' : 0, right: mine ? 0 : 'auto',
                      background: isDark ? 'rgba(28,22,50,0.95)' : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(24px) saturate(180%)',
                      border: `1px solid ${menuBorder}`,
                      borderRadius: '28px', padding: '8px 12px', display: 'flex', gap: '4px', alignItems: 'center',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.3)', zIndex: 25, animation: 'popIn 0.15s ease',
                    }}>
                      {QUICK_REACTIONS.map((emoji) => (
                        <button key={emoji} onClick={() => handleReact(msg._id, emoji)} style={{
                          background: 'none', border: 'none', fontSize: '21px', cursor: 'pointer',
                          padding: '4px', borderRadius: '50%', transition: 'transform 0.15s',
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </button>
                      ))}
                      <div style={{ width: '1px', height: '20px', background: colors.border, margin: '0 2px' }} />
                      <button onClick={() => setReactionPickerFor(null)} style={{
                        background: chipBg, border: 'none', color: colors.textMuted, cursor: 'pointer',
                        fontSize: '13px', width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IoClose />
                      </button>
                    </div>
                  )}

                  {msg.replyTo && (
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      borderLeft: `3px solid ${accentColor}`, paddingLeft: '8px',
                      marginBottom: '4px', opacity: 0.75,
                    }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: accentColor }}>
                        {msg.replyTo.senderFirebaseUid === currentUser?.uid ? 'You' : otherUser.name}
                      </span>
                      <span style={{
                        fontSize: '11.5px', color: colors.textMuted,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px',
                      }}>
                        {replyPreviewLabel(msg.replyTo)}
                      </span>
                    </div>
                  )}

                  {isDeleted ? (
                    <div style={{
                      background: 'none', border: `1px dashed ${otherBubbleBorder}`,
                      borderRadius: '18px', padding: '9px 14px',
                    }}>
                      <p style={{ fontSize: '12.5px', color: colors.textMuted, fontStyle: 'italic' }}>
                        🚫 This message was deleted
                      </p>
                    </div>
                  ) : (
                    <>
                      {msg.mediaType === 'post' && msg.sharedPost && (
                        <div
                          onClick={() => setViewingPostId(msg.sharedPost._id)}
                          style={{
                            width: '220px', borderRadius: '18px', overflow: 'hidden',
                            border: `1px solid ${otherBubbleBorder}`,
                            background: otherBubbleBg, cursor: 'pointer',
                            marginBottom: msg.text ? '4px' : 0,
                          }}
                        >
                          <div style={{ width: '100%', height: '150px', background: '#000', position: 'relative' }}>
                            {msg.sharedPost.mediaType === 'video' ? (
                              <video src={msg.sharedPost.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <img src={msg.sharedPost.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            <div style={{
                              position: 'absolute', top: '8px', left: '8px',
                              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                              borderRadius: '8px', padding: '3px 8px',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                              <HiSparkles style={{ color: '#fff', fontSize: '10px' }} />
                              <span style={{ color: '#fff', fontSize: '9px', fontWeight: '700' }}>Post</span>
                            </div>
                          </div>
                          <div style={{ padding: '10px 12px' }}>
                            {msg.sharedPost.caption ? (
                              <p style={{
                                fontSize: '12px', color: otherBubbleText, lineHeight: '1.4',
                                overflow: 'hidden', textOverflow: 'ellipsis',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                marginBottom: '8px',
                              }}>
                                {msg.sharedPost.caption}
                              </p>
                            ) : null}
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              gap: '6px', padding: '7px', borderRadius: '10px',
                              background: 'linear-gradient(135deg, #6C63FF15, #F7258510)',
                              border: '1px solid #6C63FF30',
                            }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6C63FF' }}>View Post</span>
                            </div>
                          </div>
                        </div>
                      )}
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
                          background: mine ? 'linear-gradient(135deg, #6C63FF, #a855f7)' : otherBubbleBg,
                          border: mine ? 'none' : `1px solid ${otherBubbleBorder}`,
                          borderRadius: '18px', padding: '10px 14px', marginBottom: msg.text ? '4px' : 0,
                        }}>
                          <audio src={msg.mediaUrl} controls style={{ width: '220px', height: '32px' }} />
                        </div>
                      )}
                      {msg.text && (
                        <div style={{
                          background: mine ? 'linear-gradient(135deg, #6C63FF, #a855f7)' : otherBubbleBg,
                          border: mine ? 'none' : `1px solid ${otherBubbleBorder}`,
                          borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '10px 14px',
                          boxShadow: mine ? '0 2px 16px rgba(108,99,255,0.4)' : 'none',
                        }}>
                          <p style={{ fontSize: '14px', color: mine ? '#fff' : otherBubbleText, lineHeight: '1.4', wordBreak: 'break-word' }}>{msg.text}</p>
                        </div>
                      )}

                      {msg.reactions && msg.reactions.length > 0 && (
                        <div style={{
                          display: 'flex', gap: '2px', marginTop: '-8px',
                          justifyContent: mine ? 'flex-end' : 'flex-start', position: 'relative', zIndex: 1,
                        }}>
                          <div style={{
                            background: colors.bgCard, border: `1px solid ${colors.border}`,
                            borderRadius: '12px', padding: '2px 6px', fontSize: '12px',
                            display: 'flex', gap: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}>
                            {[...new Set(msg.reactions.map(r => r.emoji))].map((emoji) => (
                              <span key={emoji}>{emoji}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <p style={{ fontSize: '10px', color: colors.textMuted }}>
                      {formatTime(msg.createdAt)}
                    </p>
                    {isLastMine && (
                      msg.read ? (
                        <IoCheckmarkDone style={{ fontSize: '13px', color: accentColor }} />
                      ) : (
                        <IoCheckmark style={{ fontSize: '13px', color: colors.textMuted }} />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {otherTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '9px',
              background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', flexShrink: 0,
            }}>
              {!photoURL && avatar}
            </div>
            <div style={{
              background: otherBubbleBg, border: `1px solid ${otherBubbleBorder}`,
              borderRadius: '18px 18px 18px 4px', padding: '12px 16px',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: colors.textMuted,
                  animation: `typingDot 1.2s ease infinite`, animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div style={{ padding: '0 16px 10px', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '14px', padding: '10px 14px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '12.5px', color: '#ef4444', fontWeight: '600' }}>
              You've blocked {otherUser.name}. Unblock to send messages.
            </p>
          </div>
        </div>
      )}

      {/* Reply preview bar */}
      {replyingTo && (
        <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: '14px', padding: '9px 12px',
            borderLeft: `3px solid ${accentColor}`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: accentColor }}>
                Replying to {replyingTo.senderFirebaseUid === currentUser?.uid ? 'yourself' : otherUser.name}
              </p>
              <p style={{
                fontSize: '12px', color: colors.textMuted,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {replyPreviewLabel(replyingTo)}
              </p>
            </div>
            <button onClick={() => setReplyingTo(null)} style={{
              background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center',
            }}>
              <IoClose />
            </button>
          </div>
        </div>
      )}

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
          <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handlePickFile(e, 'video')} style={{ display: 'none' }} />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => handlePickFile(e, 'image')} style={{ display: 'none' }} />

          {[
            { icon: <HiOutlinePhotograph />, label: 'Gallery', onClick: () => photoInputRef.current?.click(), color: '#6C63FF' },
            { icon: <HiOutlineFilm />, label: 'Video', onClick: () => videoInputRef.current?.click(), color: '#a855f7' },
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
      {!isBlocked && (
        <div style={{
          background: glassBg, backdropFilter: 'blur(20px) saturate(180%)',
          borderTop: `1px solid ${glassBorder}`,
          padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px',
          position: 'relative', zIndex: 2,
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
                  background: showAttachMenu ? 'linear-gradient(135deg, #6C63FF, #F72585)' : chipBg,
                  border: showAttachMenu ? 'none' : `1px solid ${chipBorder}`,
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
                  onChange={(e) => handleTextChange(e.target.value)}
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
                  width: '42px', height: '42px', borderRadius: '50%', border: `1px solid ${chipBorder}`, flexShrink: 0,
                  background: chipBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: colors.textPrimary, fontSize: '18px',
                }}>
                  <IoMic />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Clear Chat Confirm */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: colors.bgCard, borderRadius: '20px', padding: '24px',
            margin: '0 24px', border: `1px solid ${colors.border}`, textAlign: 'center', maxWidth: '320px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>Delete this chat?</h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
              This removes the chat from your inbox. {otherUser.name} will still see it.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowClearConfirm(false)} style={{
                flex: 1, padding: '12px', background: 'none', border: `1px solid ${colors.border}`,
                borderRadius: '12px', color: colors.textPrimary, fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              }}>
                Cancel
              </button>
              <button onClick={handleClearChat} style={{
                flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => !reportSubmitting && setShowReportModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: colors.bgCard, borderRadius: '20px', padding: '24px',
            margin: '0 24px', border: `1px solid ${colors.border}`, maxWidth: '340px', width: '100%',
          }}>
            {reportSent ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>✓</div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>Report submitted</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: colors.textPrimary, marginBottom: '6px' }}>
                  Report {otherUser.name}
                </h3>
                <p style={{ fontSize: '12.5px', color: colors.textMuted, marginBottom: '14px' }}>
                  Tell us what's going on. Our team will review this.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value.slice(0, 300))}
                  rows={4}
                  placeholder="Describe the issue..."
                  style={{
                    width: '100%', background: colors.inputBg || colors.bgCard,
                    border: `1px solid ${colors.border}`, borderRadius: '12px',
                    padding: '10px 12px', color: colors.textPrimary, fontSize: '13px',
                    fontFamily: 'Inter', resize: 'none', outline: 'none', marginBottom: '14px',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowReportModal(false)} style={{
                    flex: 1, padding: '11px', background: 'none', border: `1px solid ${colors.border}`,
                    borderRadius: '12px', color: colors.textPrimary, fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                  }}>
                    Cancel
                  </button>
                  <button onClick={handleSubmitReport} disabled={!reportReason.trim() || reportSubmitting} style={{
                    flex: 1, padding: '11px', background: 'linear-gradient(135deg, #F72585, #ef4444)',
                    border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                    opacity: (!reportReason.trim() || reportSubmitting) ? 0.6 : 1,
                  }}>
                    {reportSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {viewingPostId && (
        <PostModal
          postId={viewingPostId}
          onClose={() => setViewingPostId(null)}
        />
      )}
    </div>
  );
}

export default ChatPanel;