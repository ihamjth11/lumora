import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSinglePost, deletePost, editPostCaption, toggleLikePost } from '../services/apiService';
import {
  IoClose, IoTrash, IoShareSocial, IoDownload, IoCreate,
  IoCopy, IoLogoWhatsapp, IoCheckmark
} from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

function PostModal({ postId, onClose, onDeleted }) {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    const res = await getSinglePost(postId);
    if (res.success) {
      setPost(res.post);
      setEditCaption(res.post.caption || '');
    }
    setLoading(false);
  };

  const isOwner = post?.authorFirebaseUid === currentUser?.uid;
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
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this post on Lumora: ${postUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lumora Post',
          text: `Check out this post by @${post.author?.username} on Lumora`,
          url: postUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      setShowShareMenu(true);
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
        display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column',
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
              flex: window.innerWidth > 768 ? '1.2' : 'none',
              background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              maxHeight: window.innerWidth > 768 ? '90vh' : '50vh',
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
              minWidth: window.innerWidth > 768 ? '300px' : 'auto',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px', borderBottom: `1px solid ${colors.border}`,
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
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowMenu(!showMenu)} style={{
                      background: 'none', border: 'none', color: colors.textSecondary,
                      fontSize: '20px', cursor: 'pointer', padding: '4px',
                    }}>
                      ⋮
                    </button>
                    {showMenu && (
                      <div style={{
                        position: 'absolute', top: '28px', right: 0, zIndex: 20,
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                        borderRadius: '12px', overflow: 'hidden', minWidth: '160px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      }}>
                        <button onClick={() => { setEditing(true); setShowMenu(false); }} style={{
                          width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                          color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter',
                        }}>
                          <IoCreate /> Edit Caption
                        </button>
                        <button onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }} style={{
                          width: '100%', padding: '10px 14px', background: 'none', border: 'none',
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

              {/* Caption */}
              <div style={{ padding: '14px', borderBottom: `1px solid ${colors.border}`, flex: 1, overflowY: 'auto' }}>
                {editing ? (
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
                  <p style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.5' }}>
                    <span style={{ fontWeight: '700' }}>{post.author?.username}</span>{' '}
                    {post.caption || <span style={{ color: colors.textMuted }}>No caption</span>}
                  </p>
                )}
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
              </div>

              {/* Actions */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  <button onClick={handleLike} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '5px', padding: 0,
                  }}>
                    {isLiked ? <FaHeart style={{ color: '#F72585', fontSize: '20px' }} /> : <FiHeart style={{ color: colors.textSecondary, fontSize: '20px' }} />}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>{post.likesCount || 0}</span>
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button onClick={handleNativeShare} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: colors.textSecondary, fontSize: '20px', display: 'flex', alignItems: 'center',
                    }}>
                      <IoShareSocial />
                    </button>
                    {showShareMenu && (
                      <div style={{
                        position: 'absolute', bottom: '30px', left: 0, zIndex: 20,
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                        borderRadius: '14px', overflow: 'hidden', minWidth: '180px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                      }}>
                        <button onClick={handleWhatsAppShare} style={{
                          width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                          color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter',
                        }}>
                          <IoLogoWhatsapp style={{ color: '#25D366', fontSize: '18px' }} /> WhatsApp
                        </button>
                        <button onClick={() => { handleCopyLink(); setShowShareMenu(false); }} style={{
                          width: '100%', padding: '11px 14px', background: 'none', border: 'none',
                          display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                          color: colors.textPrimary, fontSize: '13px', fontFamily: 'Inter',
                        }}>
                          <IoCopy style={{ color: '#6C63FF', fontSize: '16px' }} /> Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={handleDownload} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: colors.textSecondary, fontSize: '20px', display: 'flex', alignItems: 'center',
                  }}>
                    <IoDownload />
                  </button>
                </div>

                {linkCopied && (
                  <p style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IoCheckmark /> Link copied!
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete confirm */}
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