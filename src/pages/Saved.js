import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getSavedPosts } from '../services/apiService';
import PostModal from '../components/PostModal';
import { BsBookmark } from 'react-icons/bs';
import { FiPlay } from 'react-icons/fi';

function Saved() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePostId, setActivePostId] = useState(null);

  useEffect(() => {
    loadSaved();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    const res = await getSavedPosts();
    if (res.success) setPosts(res.posts);
    setLoading(false);
  };

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(180deg, #0a0a12 0%, #0d0a1a 40%, #0a0a12 100%)'
        : 'linear-gradient(180deg, #fafaff 0%, #f5f3ff 40%, #fafaff 100%)',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: '-10%', width: '300px', height: '300px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,37,133,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ padding: '20px 20px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BsBookmark style={{ color: '#6C63FF', fontSize: '20px' }} />
          <h1 style={{
            fontSize: '22px', fontWeight: '800',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Saved
          </h1>
        </div>
        <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>
          {posts.length} {posts.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '50px 24px', textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF15, #F7258510)',
            border: '2px dashed #6C63FF40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '18px',
          }}>
            <BsBookmark style={{ fontSize: '32px', color: '#6C63FF' }} />
          </div>
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
            Nothing saved yet
          </h3>
          <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.6', marginBottom: '24px', maxWidth: '280px' }}>
            Tap the bookmark icon on any post to save it here ✨
          </p>
          <button
            onClick={() => navigate('/explore')}
            style={{
              padding: '13px 30px',
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              border: 'none', borderRadius: '14px',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter',
              boxShadow: '0 6px 20px rgba(108,99,255,0.35)',
            }}
          >
            Explore Content 🚀
          </button>
        </div>
      ) : (
        <div style={{ padding: '0 4px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
            {posts.map((post) => (
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
                    <video src={post.mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <FiPlay style={{
                      position: 'absolute', top: '6px', right: '6px', color: '#fff', fontSize: '16px',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                    }} />
                  </>
                ) : (
                  <img src={post.mediaUrl} alt="saved" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{
                  position: 'absolute', top: '6px', left: '6px',
                  background: 'rgba(0,0,0,0.5)', borderRadius: '8px', padding: '3px 6px',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <BsBookmark style={{ color: '#fff', fontSize: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePostId && (
        <PostModal
          postId={activePostId}
          onClose={() => setActivePostId(null)}
          onDeleted={(deletedId) => {
            setPosts((prev) => prev.filter((p) => p._id !== deletedId));
          }}
        />
      )}
    </div>
  );
}

export default Saved;