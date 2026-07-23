import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFeed, toggleLikePost, toggleSavePost } from '../services/apiService';
import Stories from '../components/Stories';
import LumoraLogo from '../components/LumoraLogo';
import Notifications from '../components/Notifications';
import CommentModal from '../components/CommentModal';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiSend, FiBell, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa';


function Home() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = 3;

  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoadingFeed(true);
    const res = await getFeed();
    if (res.success) {
      setPosts(res.posts);
    }
    setLoadingFeed(false);
  };

  const handleLike = async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const alreadyLiked = p.likedBy?.includes(currentUser?.uid);
      return {
        ...p,
        likesCount: alreadyLiked ? p.likesCount - 1 : p.likesCount + 1,
        likedBy: alreadyLiked
          ? p.likedBy.filter(id => id !== currentUser?.uid)
          : [...(p.likedBy || []), currentUser?.uid],
      };
    }));

    await toggleLikePost(postId);
  };
  const handleSave = async (postId) => {
    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const alreadySaved = p.savedBy?.includes(currentUser?.uid);
      return {
        ...p,
        savedBy: alreadySaved
          ? p.savedBy.filter(id => id !== currentUser?.uid)
          : [...(p.savedBy || []), currentUser?.uid],
      };
    }));
    await toggleSavePost(postId);
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
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LumoraLogo size={36} />
          <span style={{
            fontSize: '22px', fontWeight: '900',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            lumora
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
              position: 'relative',
              display: 'flex', alignItems: 'center',
              color: colors.textSecondary, fontSize: '22px',
            }}
          >
            <FiBell />
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#F72585',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${colors.navBg}`,
              }}>
                <span style={{ fontSize: '9px', color: '#fff', fontWeight: '800' }}>
                  {unreadCount}
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate('/messages')}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: colors.textSecondary,
              fontSize: '22px', display: 'flex', alignItems: 'center', padding: 0,
            }}
          >
            <FiSend />
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div
            onClick={() => setShowNotifications(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 9998,
            }}
          />
          <Notifications onClose={() => setShowNotifications(false)} />
        </>
      )}

      {/* Stories */}
      <Stories />

      {/* Create Post Button */}
      <div style={{ padding: '12px 16px 0' }}>
        <button
          onClick={() => navigate('/create')}
          style={{
            width: '100%', background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '16px', padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            cursor: 'pointer', boxShadow: colors.shadow,
          }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px',
            flexShrink: 0,
          }}>
            {!photoURL && userAvatar}
          </div>
          <span style={{ color: colors.textMuted, fontSize: '14px', flex: 1, textAlign: 'left' }}>
            Share something you learned...
          </span>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#6C63FF', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '18px',
          }}>
            <AiOutlinePlus />
          </div>
        </button>
      </div>

      {/* Feed */}
      {loadingFeed ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid rgba(108,99,255,0.2)',
            borderTop: '3px solid #6C63FF',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
          <h3 style={{
            fontSize: '20px', fontWeight: '800',
            color: colors.textPrimary, marginBottom: '8px',
          }}>
            Your feed is empty
          </h3>
          <p style={{
            fontSize: '14px', color: colors.textMuted,
            lineHeight: '1.6', marginBottom: '24px',
          }}>
            Follow creators to see their posts here. Start exploring! ✨
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
            Explore Content 🚀
          </button>
        </div>
      ) : (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => {
            const isLiked = post.likedBy?.includes(currentUser?.uid);
            const authorName = post.author?.name || 'User';
            const authorUsername = post.author?.username || 'user';
            const authorAvatar = post.author?.avatar || '🧑‍💻';
            const authorPhoto = post.author?.photoURL || '';

            return (
              <div key={post._id} style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: colors.shadow,
              }}>
                {/* Post Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px',
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: authorPhoto ? `url(${authorPhoto})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                  }}>
                    {!authorPhoto && authorAvatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textPrimary }}>
                      {authorName}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.textMuted }}>
                      @{authorUsername} · {timeAgo(post.createdAt)}
                    </p>
                  </div>
                  {post.category && (
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      background: '#6C63FF15', color: '#6C63FF',
                      padding: '4px 10px', borderRadius: '12px',
                    }}>
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Media */}
                <div style={{ background: '#000' }}>
                  {post.mediaType === 'video' ? (
                    <video src={post.mediaUrl} controls style={{
                      width: '100%', maxHeight: '480px', display: 'block',
                    }} />
                  ) : (
                    <img src={post.mediaUrl} alt="post" style={{
                      width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block',
                    }} />
                  )}
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '10px 14px',
                }}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px', padding: 0,
                    }}
                  >
                    {isLiked ? (
                      <FaHeart style={{ color: '#F72585', fontSize: '20px' }} />
                    ) : (
                      <FiHeart style={{ color: colors.textSecondary, fontSize: '20px' }} />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
                      {post.likesCount || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveCommentPostId(post._id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px', padding: 0,
                    }}>
                    <FiMessageCircle style={{ color: colors.textSecondary, fontSize: '20px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textSecondary }}>
                      {post.commentsCount || 0}
                    </span>
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => handleSave(post._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {post.savedBy?.includes(currentUser?.uid) ? (
                      <BsBookmarkFill style={{ color: '#6C63FF', fontSize: '19px' }} />
                    ) : (
                      <BsBookmark style={{ color: colors.textSecondary, fontSize: '19px' }} />
                    )}
                  </button>
                </div>

                {/* Caption */}
                {post.caption && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <p style={{ fontSize: '13px', color: colors.textPrimary, lineHeight: '1.5' }}>
                      <span style={{ fontWeight: '700' }}>{authorUsername}</span>{' '}
                      {post.caption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
          onCommentAdded={() => {
            setPosts(prev => prev.map(p =>
              p._id === activeCommentPostId
                ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
                : p
            ));
          }}
        />
      )}

    </div>
  );
}

export default Home;