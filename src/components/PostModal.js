import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSinglePost, deletePost, editPostCaption, toggleLikePost, getComments, addComment } from '../services/apiService';
import {
  IoClose, IoTrash, IoShareSocial, IoDownload, IoCreate,
  IoCopy, IoLogoWhatsapp, IoCheckmark, IoSend, IoEllipsisVertical
} from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

function PostModal({ postId, onClose, onDeleted }) {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('caption'); // 'caption' | 'comments'
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const menuRef = useRef(null);
  const shareRef = useRef(null);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (shareRef.current && !shareRef.current.contains(e.target)) setShowShareMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadPost = async () => {
    setLoading(true);
    const res = await getSinglePost(postId);
    if (res.success) {
      setPost(res.post);
      setEditCaption(res.post.caption || '');
    }
    setLoading(false);
  };

  const loadComments = async () => {
    setLoadingComments(true);
    const res = await getComments(postId);
    if (res.success) setComments(res.comments);
    setLoadingComments(false);
  };

  const openComments = () => {
    setActiveTab('comments');
    loadComments();
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || sendingComment) return;
    setSendingComment(true);
    const res = await addComment(postId, commentText.trim());
    setSendingComment(false);
    if (res.success) {
      setComments((prev) => [res.comment, ...prev]);
      setCommentText('');
      setPost((prev) => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
    }
  };

  const isOwner = !!currentUser?.uid && post?.authorFirebaseUid === currentUser.uid;
  const isLiked = post?.likedBy?.includes(currentUser?.uid);
  const postUrl = post ? `${window.location.origin}/u/${post.author?.username}` : '';

  const handleLike = async () => {
    if (!post) return;
    setPost((prev) => ({
      ...prev,
      likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      likedBy: isLiked
        ? prev.likedBy.filter((id) => id !== currentUser?.uid)
        : [...(prev.likedBy || []), currentUser?.uid],
    }));
    await toggleLikePost(postId);
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await deletePost(postId);
    setSaving(false);
    if (res.success) {
      onDeleted?.(postId);
      onClose();
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    const res = await editPostCaption(postId, editCaption);
    setSaving(false);
    if (res.success) {
      setPost((prev) => ({ ...prev, caption: editCaption }));
      setEditing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(post.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumora-post.${post.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(post.mediaUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setLinkCopied(true);
    setShowShareMenu(false);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareText = `Check out this post on Lumora`;

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ': ' + postUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('Check this out on Lumora')}&body=${encodeURIComponent(shareText + ': ' + postUrl)}`;
    setShowShareMenu(false);
  };

  const handleSmsShare = () => {
    window.location.href = `sms:?body=${encodeURIComponent(shareText + ': ' + postUrl)}`;
    setShowShareMenu(false);
  };

  const handleNativeDeviceShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Lumora', text: shareText, url: postUrl });
        setShowShareMenu(false);
      } catch (err) {
        // user cancelled, do nothing
      }
    }
  };
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  const isWide = typeof window !== 'undefined' && window.innerWidth > 768;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />

      <div style={{
        position: 'relative', background: colors.bgCard,
        width: '100%', maxWidth: '900px', maxHeight: '90vh',
        margin: '0 16px', borderRadius: '20px', overflow: 'hidden',
        display: 'flex', flexDirection: isWide ? 'row' : 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 10,
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer',
        }}>
          <IoClose />
        </button>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !post ? (
          <div style={{ flex: 1, padding: '60px', textAlign: 'center' }}>
            <p style={{ color: colors.textMuted }}>Post not found</p>
          </div>
        ) : (
          <>
            {/* Media */}
            <div style={{
              flex: isWide ? '1.2' : 'none',
              background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              maxHeight: isWide ? '90vh' : '50vh',
            }}>
              {post.mediaType === 'video' ? (
                <video src={post.mediaUrl} controls style={{ width: '100%', maxHeight: '90vh', display: 'block' }} />
              ) : (
                <img src={post.mediaUrl} alt="post" style={{ width: '100%', maxHeight: '90vh', objectFit: 'contain', display: 'block' }} />
              )}
            </div>

            {/* Details */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              minWidth: isWide ? '320px' : 'auto',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 44px 14px 14px', borderBottom: `1px solid ${colors.border}`,
              }}>
                <div
                  onClick={() => { onClose(); navigate('/u/' + post.author?.username); }}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                    background: post.author?.photoURL ? `url(${post.author.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
                  }}>
                  {!post.author?.photoURL && (post.author?.avatar || '🧑‍💻')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.textPrimary }}>
                      {post.author?.username || 'user'}
                    </span>
                    <MdVerified style={{ color: '#6C63FF', fontSize: '12px' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: colors.textMuted }}>{timeAgo(post.createdAt)}</p>
                </div>

                {isOwner && (
                  <div ref={menuRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowMenu(!showMenu)} style={{
                      background: 'none', border: 'none', color: colors.textSecondary,
                      fontSize: '18px', cursor: 'pointer', padding: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <IoEllipsisVertical />
                    </button>
                    {showMenu && (
                      <div style={{
                        position: 'absolute', top: '32px', right: 0, zIndex: 20,
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                        borderRadius: '14px', overflow: 'hidden', minWidth: '170px',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                      }}>
                        <button onClick={() => { setEditing(true); setShowMenu(false); setActiveTab('caption'); }} style={{
                          width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                          color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter',
                        }}>
                          <IoCreate /> Edit Caption
                        </button>
                        <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }} style={{
                          width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                          color: '#ef4444', fontSize: '13px', fontFamily: 'Inter',
                        }}>
                          <IoTrash /> Delete Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs: Caption / Comments */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}` }}>
                {['caption', 'comments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => tab === 'comments' ? openComments() : setActiveTab('caption')}
                    style={{
                      flex: 1, padding: '10px', background: 'none', border: 'none',
                      borderBottom: activeTab === tab ? '2px solid #6C63FF' : '2px solid transparent',
                      color: activeTab === tab ? '#6C63FF' : colors.textMuted,
                      fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    {tab === 'comments' ? <FiMessageCircle /> : null}
                    {tab === 'caption' ? 'Post' : `Comments (${post.commentsCount || 0})`}
                  </button>
                ))}
              </div>

              {/* Content area */}
              <div style={{ padding: '14px', flex: 1, overflowY: 'auto', minHeight: '160px' }}>
                {activeTab === 'caption' ? (
                  editing ? (
                    <div>
                      <textarea
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value.slice(0, 500))}
                        rows={4}
                        style={{
                          width: '100%', background: colors.inputBg || colors.bgCard,
                          border: `1px solid ${colors.border}`, borderRadius: '10px',
                          padding: '10px', color: colors.textPrimary, fontSize: '13px',
                          fontFamily: 'Inter', resize: 'none', outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button onClick={handleSaveEdit} disabled={saving} style={{
                          flex: 1, padding: '8px', background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                          border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700',
                          fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter',
                        }}>
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => { setEditing(false); setEditCaption(post.caption || ''); }} style={{
                          flex: 1, padding: '8px', background: 'none', border: `1px solid ${colors.border}`,
                          borderRadius: '10px', color: colors.textPrimary, fontWeight: '700',
                          fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter',
                        }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.5' }}>
                        <span style={{ fontWeight: '700' }}>{post.author?.username}</span>{' '}
                        {post.caption || <span style={{ color: colors.textMuted }}>No caption</span>}
                      </p>
                      {post.category && (
                        <span style={{
                          display: 'inline-block', marginTop: '10px',
                          fontSize: '11px', fontWeight: '700',
                          background: '#6C63FF15', color: '#6C63FF',
                          padding: '4px 10px', borderRadius: '12px',
                        }}>
                          {post.category}
                        </span>
                      )}
                    </>
                  )
                ) : (
                  <div>
                    {loadingComments ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF',
                          animation: 'spin 0.8s linear infinite',
                        }} />
                      </div>
                    ) : comments.length === 0 ? (
                      <p style={{ fontSize: '13px', color: colors.textMuted, textAlign: 'center', padding: '20px 0' }}>
                        No comments yet. Be the first! 💬
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c._id} style={{ display: 'flex', gap: '10px', padding: '8px 0' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: c.author?.photoURL ? `url(${c.author.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', flexShrink: 0,
                          }}>
                            {!c.author?.photoURL && (c.author?.avatar || '🧑‍💻')}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '13px', color: colors.textPrimary }}>
                              <span style={{ fontWeight: '700' }}>{c.author?.username || 'user'}</span> {c.text}
                            </p>
                            <p style={{ fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{timeAgo(c.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Comment input (only on comments tab) */}
              {activeTab === 'comments' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderTop: `1px solid ${colors.border}`,
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: userProfile?.photoURL ? `url(${userProfile.photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', flexShrink: 0,
                  }}>
                    {!userProfile?.photoURL && (userProfile?.avatar || '🧑‍💻')}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value.slice(0, 300))}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    style={{
                      flex: 1, background: colors.inputBg || colors.bgCard,
                      border: `1px solid ${colors.border}`, borderRadius: '20px',
                      padding: '8px 14px', outline: 'none', color: colors.textPrimary,
                      fontSize: '13px', fontFamily: 'Inter',
                    }}
                  />
                  <button onClick={handleSendComment} disabled={!commentText.trim() || sendingComment} style={{
                    background: 'none', border: 'none',
                    color: commentText.trim() ? '#6C63FF' : colors.textMuted,
                    fontSize: '18px', cursor: commentText.trim() ? 'pointer' : 'default', padding: 0,
                    display: 'flex', alignItems: 'center',
                  }}>
                    <IoSend />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div style={{ padding: '12px 14px', borderTop: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <button onClick={handleLike} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px', padding: 0,
                  }}>
                    {isLiked ? <FaHeart style={{ color: '#F72585', fontSize: '20px' }} /> : <FiHeart style={{ color: colors.textSecondary, fontSize: '20px' }} />}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>{post.likesCount || 0}</span>
                  </button>

                  <button onClick={openComments} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px', padding: 0,
                  }}>
                    <FiMessageCircle style={{ color: colors.textSecondary, fontSize: '20px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>{post.commentsCount || 0}</span>
                  </button>

                  <div ref={shareRef} style={{ position: 'relative' }}>
                    <button onClick={() => setShowShareMenu(!showShareMenu)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: colors.textSecondary, fontSize: '20px', display: 'flex', alignItems: 'center',
                    }}>
                      <IoShareSocial />
                    </button>
                    {showShareMenu && (
                      <div style={{
                        position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 20,
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                        borderRadius: '16px', overflow: 'hidden', minWidth: '220px',
                        maxHeight: '320px', overflowY: 'auto',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.border}` }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Share to
                          </span>
                        </div>

                        {typeof navigator.share === 'function' && (
                          <button onClick={handleNativeDeviceShare} style={{
                            width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                            borderBottom: `1px solid ${colors.border}`,
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter', fontWeight: '700',
                          }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '9px',
                              background: 'linear-gradient(135deg, #6C63FF22, #F7258522)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <IoShareSocial style={{ color: '#6C63FF', fontSize: '15px' }} />
                            </div>
                            Share via Device...
                          </button>
                        )}

                        {[
                          { label: 'WhatsApp', icon: <IoLogoWhatsapp style={{ color: '#25D366', fontSize: '16px' }} />, bg: '#25D36622', onClick: handleWhatsAppShare },
                          { label: 'Facebook', icon: <span style={{ color: '#1877F2', fontWeight: '900', fontSize: '13px' }}>f</span>, bg: '#1877F222', onClick: handleFacebookShare },
                          { label: 'Telegram', icon: <span style={{ fontSize: '15px' }}>✈️</span>, bg: '#0088cc22', onClick: handleTelegramShare },
                          { label: 'X (Twitter)', icon: <span style={{ color: colors.textPrimary, fontWeight: '900', fontSize: '13px' }}>X</span>, bg: 'rgba(128,128,128,0.15)', onClick: handleTwitterShare },
                          { label: 'Email', icon: <span style={{ fontSize: '15px' }}>✉️</span>, bg: '#ea433522', onClick: handleEmailShare },
                          { label: 'SMS', icon: <span style={{ fontSize: '15px' }}>💬</span>, bg: '#34C75922', onClick: handleSmsShare },
                          { label: 'Copy Link', icon: <IoCopy style={{ color: '#6C63FF', fontSize: '14px' }} />, bg: '#6C63FF22', onClick: handleCopyLink },
                        ].map((item, i) => (
                          <button key={i} onClick={item.onClick} style={{
                            width: '100%', padding: '12px 14px', background: 'none', border: 'none',
                            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                            color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter',
                          }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '9px', background: item.bg,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {item.icon}
                            </div>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }} />

                  <button onClick={handleDownload} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: colors.textSecondary, fontSize: '20px', display: 'flex', alignItems: 'center',
                  }}>
                    <IoDownload />
                  </button>
                </div>

                {linkCopied && (
                  <p style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <IoCheckmark /> Link copied!
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: colors.bgCard, borderRadius: '20px', padding: '24px',
            margin: '0 24px', border: `1px solid ${colors.border}`, textAlign: 'center', maxWidth: '320px',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>Delete this post?</h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '12px', background: 'none', border: `1px solid ${colors.border}`,
                borderRadius: '12px', color: colors.textPrimary, fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} style={{
                flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostModal;