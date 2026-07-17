import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPosts, deletePost } from '../services/apiService';
import { RiSettings4Line } from 'react-icons/ri';
import { MdVerified } from 'react-icons/md';
import { FiSun, FiMoon, FiHeart, FiGrid, FiBookmark, FiPlus, FiEdit2, FiLink, FiMapPin, FiPlay, FiTrash2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function Profile() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userProfile, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeletePost = async (postId) => {
    setDeleting(true);
    const res = await deletePost(postId);
    setDeleting(false);
    if (res.success) {
      setMyPosts(prev => prev.filter(p => p._id !== postId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>

      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid ' + colors.border,
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 100,
      }}>
        <span style={{
          fontSize: '18px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {username}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} style={{
            background: isDark ? '#27272a' : '#f0efff',
            border: 'none', borderRadius: '20px',
            padding: '6px 12px',
            display: 'flex', alignItems: 'center',
            gap: '6px', cursor: 'pointer',
            color: isDark ? '#a78bfa' : '#6C63FF',
          }}>
            {isDark ? <FiSun /> : <FiMoon />}
            <span style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'Inter' }}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>
          <RiSettings4Line
            onClick={() => navigate('/settings')}
            style={{ color: colors.textMuted, fontSize: '22px', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{
        background: colors.bgCard, margin: '16px',
        borderRadius: '24px', border: '1px solid ' + colors.border,
        padding: '24px 20px', boxShadow: colors.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: photoURL ? 'url(' + photoURL + ')' : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
          }}>
            {!photoURL && userAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.textPrimary }}>
                {displayName}
              </h2>
              <MdVerified style={{ color: '#6C63FF', fontSize: '18px', flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>{'@' + username}</p>

            {bio ? (
              <p style={{
                fontSize: '13px', color: colors.textSecondary,
                marginTop: '6px', lineHeight: '1.5',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {bio}
              </p>
            ) : null}

            {location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
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
                  marginTop: '6px', textDecoration: 'none',
                }}
              >
                <FiLink style={{ fontSize: '12px', color: '#6C63FF', flexShrink: 0 }} />
                <span style={{
                  fontSize: '12px', color: '#6C63FF', fontWeight: '600',
                  wordBreak: 'break-all',
                }}>
                  {websiteDisplay}
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-around',
          background: isDark ? '#1a1a2e' : '#f0efff',
          borderRadius: '16px', padding: '16px',
          marginBottom: '16px',
        }}>
          {[
            { label: 'Posts', value: String(postsCount) },
            { label: 'Following', value: String(userProfile?.followingCount || 0) },
            { label: 'Followers', value: String(userProfile?.followersCount || 0) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#6C63FF' }}>
                {s.value}
              </p>
              <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px', fontWeight: '500' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/edit-profile')}
          style={{
            width: '100%', padding: '10px',
            background: 'none',
            border: '1px solid ' + colors.border,
            borderRadius: '12px',
            color: colors.textPrimary,
            fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s',
          }}>
          <FiEdit2 style={{ fontSize: '14px' }} />
          Edit Profile
        </button>
      </div>

      {interests.length > 0 ? (
        <div style={{ padding: '0 16px 16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary, marginBottom: '10px' }}>
            My Interests
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {interests.map((item, i) => (
              <span key={i} style={{
                background: '#6C63FF12',
                border: '1px solid #6C63FF30',
                color: '#6C63FF',
                padding: '6px 14px', borderRadius: '20px',
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

      <div style={{
        display: 'flex',
        borderBottom: '1px solid ' + colors.border,
        margin: '0 16px', marginBottom: '4px',
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
            padding: '12px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '700',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s', fontFamily: 'Inter',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: activeTab === 'posts' && myPosts.length > 0 ? '4px' : '0 16px' }}>
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
              alignItems: 'center', padding: '40px 24px',
              textAlign: 'center',
            }}>
              <div
                onClick={() => navigate('/create')}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: '#6C63FF15', border: '2px dashed #6C63FF40',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                <FiPlus style={{ color: '#6C63FF', fontSize: '28px' }} />
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
                  style={{
                    position: 'relative', aspectRatio: '1',
                    background: '#000', overflow: 'hidden',
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

                  {/* Delete button overlay */}
                  <button
                    onClick={() => setDeleteConfirmId(post._id)}
                    style={{
                      position: 'absolute', top: '4px', left: '4px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : null}

        {activeTab === 'saved' ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '40px 24px', textAlign: 'center',
          }}>
            <FiBookmark style={{ fontSize: '48px', color: colors.border, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              Nothing saved yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>
              Bookmark reels to find them here ✨
            </p>
          </div>
        ) : null}

        {activeTab === 'liked' ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '40px 24px', textAlign: 'center',
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

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: colors.bgCard, borderRadius: '20px', padding: '24px',
            margin: '0 24px', border: '1px solid ' + colors.border, textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              Delete this post?
            </h3>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1, padding: '12px', background: 'none',
                  border: '1px solid ' + colors.border, borderRadius: '12px',
                  color: colors.textPrimary, fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                }}>
                Cancel
              </button>
              <button
                onClick={() => handleDeletePost(deleteConfirmId)}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none', borderRadius: '12px',
                  color: '#fff', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
                  opacity: deleting ? 0.7 : 1,
                }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;