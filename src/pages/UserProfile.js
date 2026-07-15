import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileByUsername, toggleFollow, getUserPosts } from '../services/apiService';
import { IoArrowBack } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';
import { FiGrid, FiLink, FiMapPin, FiPlay } from 'react-icons/fi';

function UserProfile() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser, userProfile: myProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    setNotFound(false);
    const res = await getProfileByUsername(username);
    if (res.success) {
      setProfile(res.data);
      setFollowersCount(res.data.followersCount || 0);
      setIsFollowing((res.data.followers || []).includes(currentUser?.uid));
      loadPosts(res.data.firebaseUid);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const loadPosts = async (firebaseUid) => {
    setLoadingPosts(true);
    const res = await getUserPosts(firebaseUid);
    if (res.success) {
      setPosts(res.posts);
    }
    setLoadingPosts(false);
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    const res = await toggleFollow(profile.firebaseUid);
    setFollowLoading(false);
    if (res.success) {
      setIsFollowing(res.following);
      setFollowersCount(res.followersCount);
    }
  };

  const isOwnProfile = myProfile?.username === username;

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

  if (notFound) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: colors.bgPrimary, padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
          User not found
        </h3>
        <button onClick={() => navigate(-1)} style={{
          marginTop: '16px', padding: '10px 20px',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          border: 'none', borderRadius: '12px', color: '#fff',
          fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
        }}>
          Go Back
        </button>
      </div>
    );
  }

  const photoURL = profile?.photoURL || '';
  const avatar = profile?.avatar || '🧑‍💻';
  const website = profile?.website || '';
  const websiteDisplay = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const websiteHref = website.startsWith('http') ? website : 'https://' + website;

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid ' + colors.border,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
        zIndex: 100,
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none',
          color: colors.textPrimary, fontSize: '22px',
          cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
        }}>
          <IoArrowBack />
        </button>
        <span style={{ fontSize: '17px', fontWeight: '800', color: colors.textPrimary }}>
          @{profile.username}
        </span>
      </div>

      {/* Profile Card */}
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
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
          }}>
            {!photoURL && avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.textPrimary }}>
                {profile.name}
              </h2>
              <MdVerified style={{ color: '#6C63FF', fontSize: '18px', flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted, marginTop: '2px' }}>@{profile.username}</p>

            {profile.bio ? (
              <p style={{
                fontSize: '13px', color: colors.textSecondary,
                marginTop: '6px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {profile.bio}
              </p>
            ) : null}

            {profile.location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <FiMapPin style={{ fontSize: '12px', color: colors.textMuted, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{profile.location}</span>
              </div>
            ) : null}

            {website ? (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                marginTop: '6px', textDecoration: 'none',
              }}>
                <FiLink style={{ fontSize: '12px', color: '#6C63FF', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: '#6C63FF', fontWeight: '600', wordBreak: 'break-all' }}>
                  {websiteDisplay}
                </span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          background: colors.bgPrimary === '#0a0a0a' ? '#1a1a2e' : '#f0efff',
          borderRadius: '16px', padding: '16px', marginBottom: '16px',
        }}>
          {[
            { label: 'Posts', value: String(profile.postsCount || 0) },
            { label: 'Following', value: String(profile.followingCount || 0) },
            { label: 'Followers', value: String(followersCount) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#6C63FF' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px', fontWeight: '500' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Follow / Edit Button */}
        {!isOwnProfile && (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            style={{
              width: '100%', padding: '10px',
              background: isFollowing ? 'none' : 'linear-gradient(135deg, #6C63FF, #F72585)',
              border: isFollowing ? '1px solid ' + colors.border : 'none',
              borderRadius: '12px',
              color: isFollowing ? colors.textPrimary : '#fff',
              fontSize: '14px', fontWeight: '700',
              cursor: followLoading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
              opacity: followLoading ? 0.7 : 1,
              transition: 'all 0.2s',
            }}>
            {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Interests */}
      {profile.interests?.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary, marginBottom: '10px' }}>
            Interests
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {profile.interests.map((item, i) => (
              <span key={i} style={{
                background: '#6C63FF12', border: '1px solid #6C63FF30', color: '#6C63FF',
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        margin: '0 16px 8px', padding: '10px 0',
        borderBottom: '1px solid ' + colors.border,
      }}>
        <FiGrid style={{ color: '#6C63FF', fontSize: '16px' }} />
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#6C63FF' }}>Posts</span>
      </div>

      {loadingPosts ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '3px solid rgba(108,99,255,0.2)',
            borderTop: '3px solid #6C63FF',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ fontSize: '14px', color: colors.textMuted }}>No posts yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '0 4px' }}>
          {posts.map((post) => (
            <div key={post._id} style={{
              position: 'relative', aspectRatio: '1', background: '#000', overflow: 'hidden',
            }}>
              {post.mediaType === 'video' ? (
                <>
                  <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <FiPlay style={{
                    position: 'absolute', top: '6px', right: '6px', color: '#fff', fontSize: '16px',
                  }} />
                </>
              ) : (
                <img src={post.mediaUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserProfile;