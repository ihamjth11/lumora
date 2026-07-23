import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPosts, deletePost } from '../services/apiService';
import PostModal from '../components/PostModal';
import { RiSettings4Line } from 'react-icons/ri';
import { MdVerified } from 'react-icons/md';
import { FiSun, FiMoon, FiHeart, FiGrid, FiBookmark, FiPlus, FiEdit2, FiLink, FiMapPin, FiPlay } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activePostId, setActivePostId] = useState(null);

  const displayName = userProfile?.name || 'User';
  const username = userProfile?.username || 'user';
  const interests = userProfile?.interests || [];
  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';
  const bio = userProfile?.bio || '';
  const website = userProfile?.website || '';
  const location = userProfile?.location || '';
  const postsCount = userProfile?.postsCount || 0;

  const websiteDisplay = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const websiteHref = website.startsWith('http') ? website : 'https://' + website;

  useEffect(() => {
    if (currentUser?.uid) {
      loadMyPosts();
    }
  }, [currentUser]);

  const loadMyPosts = async () => {
    setLoadingPosts(true);
    const res = await getUserPosts(currentUser.uid);
    if (res.success) {
      setMyPosts(res.posts);
    }
    setLoadingPosts(false);
  };

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #0a0a12 0%, #0d0a1a 40%, #0a0a12 100%)'
        : 'linear-gradient(180deg, #fafaff 0%, #f5f3ff 40%, #fafaff 100%)',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: '-10%', width: '350px', height: '350px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 100,
      }}>
        <span style={{
          fontSize: '17px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          @{username}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleTheme} style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f0efff',
            border: 'none', borderRadius: '20px',
            padding: '7px 14px',
            display: 'flex', alignItems: 'center',
            gap: '6px', cursor: 'pointer',
            color: isDark ? '#a78bfa' : '#6C63FF',
          }}>
            {isDark ? <FiSun /> : <FiMoon />}
            <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'Inter' }}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>
          <button onClick={() => navigate('/settings')} style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#f0efff',
            border: 'none', borderRadius: '12px', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <RiSettings4Line style={{ color: colors.textMuted, fontSize: '19px' }} />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{
        background: colors.bgCard, margin: '18px',
        borderRadius: '28px', border: `1px solid ${colors.border}`,
        padding: '28px 22px', boxShadow: colors.shadow,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '22px' }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: photoURL ? 'url(' + photoURL + ')' : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '34px', flexShrink: 0,
            boxShadow: '0 6px 24px rgba(108,99,255,0.35)',
            border: '3px solid ' + (isDark ? 'rgba(108,99,255,0.3)' : '#fff'),
          }}>
            {!photoURL && userAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{
                fontSize: '20px', fontWeight: '800',
                background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {'@' + username}
              </h2>
              <MdVerified style={{ color: '#6C63FF', fontSize: '18px', flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: '14px', color: colors.textPrimary, marginTop: '3px', fontWeight: '700' }}>
              {displayName}
            </p>

            {bio ? (
              <p style={{
                fontSize: '13px', color: colors.textSecondary,
                marginTop: '8px', lineHeight: '1.5',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {bio}
              </p>
            ) : null}

            {location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '7px' }}>
                <FiMapPin style={{ fontSize: '12px', color: colors.textMuted, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{location}</span>
              </div>
            ) : null}

            {website ? (<a
              
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  marginTop: '7px', textDecoration: 'none',
                }}
              >
                <FiLink style={{ fontSize: '12px', color: '#6C63FF', flexShrink: 0 }} />
                <span style={{
                  fontSize: '12px', color: '#6C63FF', fontWeight: '700',
                  wordBreak: 'break-all',
                }}>
                  {websiteDisplay}
                </span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          background: isDark ? 'rgba(108,99,255,0.08)' : 'linear-gradient(135deg, #f0efff, #fdf0f8)',
          borderRadius: '18px', padding: '18px',
          marginBottom: '18px',
          border: '1px solid ' + (isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.1)'),
        }}>
          {[
            { label: 'Posts', value: String(postsCount) },
            { label: 'Following', value: String(userProfile?.followingCount || 0) },
            { label: 'Followers', value: String(userProfile?.followersCount || 0) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '23px', fontWeight: '800',
                background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '3px', fontWeight: '600' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/edit-profile')}
          style={{
            width: '100%', padding: '12px',
            background: 'linear-gradient(135deg, #6C63FF15, #F7258510)',
            border: '1px solid #6C63FF30',
            borderRadius: '14px',
            color: colors.textPrimary,
            fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '7px',
            transition: 'all 0.2s',
          }}>
          <FiEdit2 style={{ fontSize: '14px', color: '#6C63FF' }} />
          Edit Profile
        </button>
      </div>

      {/* Interests */}
      {interests.length > 0 ? (
        <div style={{ padding: '0 18px 18px', position: 'relative', zIndex: 1 }}>
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: colors.textPrimary, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Interests
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {interests.map((item, i) => (
              <span key={i} style={{
                background: isDark ? 'rgba(108,99,255,0.1)' : '#6C63FF12',
                border: '1px solid #6C63FF30',
                color: '#6C63FF',
                padding: '7px 15px', borderRadius: '20px',
                fontSize: '13px', fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                <HiSparkles style={{ fontSize: '12px' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${colors.border}`,
        margin: '0 18px', marginBottom: '4px',
        position: 'relative', zIndex: 1,
      }}>
        {[
          { key: 'posts', label: 'Posts', icon: <FiGrid /> },
          { key: 'saved', label: 'Saved', icon: <FiBookmark /> },
          { key: 'liked', label: 'Liked', icon: <FiHeart /> },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            flex: 1, background: 'none', border: 'none',
            borderBottom: activeTab === tab.key ? '2px solid #6C63FF' : '2px solid transparent',
            color: activeTab === tab.key ? '#6C63FF' : colors.textMuted,
            padding: '13px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s', fontFamily: 'Inter',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: activeTab === 'posts' && myPosts.length > 0 ? '4px' : '0 18px', position: 'relative', zIndex: 1 }}>
        {activeTab === 'posts' ? (
          loadingPosts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: '3px solid rgba(108,99,255,0.2)',
                borderTop: '3px solid #6C63FF',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : myPosts.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '50px 24px',
              textAlign: 'center',
            }}>
              <div
                onClick={() => navigate('/create')}
                style={{
                  width: '84px', height: '84px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6C63FF15, #F7258510)',
                  border: '2px dashed #6C63FF40',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                <FiPlus style={{ color: '#6C63FF', fontSize: '30px' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
                No posts yet
              </h3>
              <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6' }}>
                Share your first learning post! ✨
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px',
            }}>
              {myPosts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => setActivePostId(post._id)}
                  style={{
                    position: 'relative', aspectRatio: '1',
                    background: '#000', overflow: 'hidden', cursor: 'pointer',
                  }}
                >
                  {post.mediaType === 'video' ? (
                    <>
                      <video src={post.mediaUrl} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                      }} />
                      <FiPlay style={{
                        position: 'absolute', top: '6px', right: '6px',
                        color: '#fff', fontSize: '16px',
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                      }} />
                    </>
                  ) : (
                    <img src={post.mediaUrl} alt="post" style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }} />
                  )}
                </div>
              ))}
            </div>
          )
        ) : null}

        {activeTab === 'saved' ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '50px 24px', textAlign: 'center',
          }}>
            <FiBookmark style={{ fontSize: '48px', color: colors.border, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              Nothing saved yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>
              Bookmark posts to find them here ✨
            </p>
          </div>
        ) : null}

        {activeTab === 'liked' ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '50px 24px', textAlign: 'center',
          }}>
            <FiHeart style={{ fontSize: '48px', color: colors.border, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              No liked posts yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>
              Like posts to see them here ✨
            </p>
          </div>
        ) : null}
      </div>

      {activePostId && (
        <PostModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
          onDeleted={(deletedId) => {
            setMyPosts((prev) => prev.filter((p) => p._id !== deletedId));
          }}
        />
      )}
    </div>
  );
}

export default Profile;