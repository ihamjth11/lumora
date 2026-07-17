import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getFeed } from '../services/apiService';
import { FiPlay, FiHeart } from 'react-icons/fi';

const categories = [
  { name: 'AI', color: '#7c3aed', emoji: '🤖' },
  { name: 'Coding', color: '#0ea5e9', emoji: '💻' },
  { name: 'Cooking', color: '#f97316', emoji: '🍳' },
  { name: 'Design', color: '#ec4899', emoji: '🎨' },
  { name: 'Skills', color: '#10b981', emoji: '⚡' },
  { name: 'Science', color: '#f59e0b', emoji: '🔬' },
  { name: 'Business', color: '#6366f1', emoji: '📈' },
  { name: 'Language', color: '#14b8a6', emoji: '🌍' },
];

function Explore() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const res = await getFeed();
    if (res.success) {
      setAllPosts(res.posts);
    }
    setLoading(false);
  };

  const filteredPosts = selectedCategory
    ? allPosts.filter((p) => p.category === selectedCategory)
    : allPosts;

  const categoryCount = (catName) =>
    allPosts.filter((p) => p.category === catName).length;

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      paddingTop: '20px',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>
      <div style={{ padding: '16px 20px 0' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Explore
        </h1>
      </div>

      {/* Category Chips */}
      <div style={{
        display: 'flex', gap: '8px', padding: '16px 20px',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            flexShrink: 0, padding: '8px 16px', borderRadius: '20px',
            border: selectedCategory === null ? 'none' : `1px solid ${colors.border}`,
            background: selectedCategory === null
              ? 'linear-gradient(135deg, #6C63FF, #F72585)'
              : colors.bgCard,
            color: selectedCategory === null ? '#fff' : colors.textSecondary,
            fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
            whiteSpace: 'nowrap',
          }}
        >
          ✨ All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: '20px',
              border: selectedCategory === cat.name ? `1px solid ${cat.color}` : `1px solid ${colors.border}`,
              background: selectedCategory === cat.name ? `${cat.color}15` : colors.bgCard,
              color: selectedCategory === cat.name ? cat.color : colors.textSecondary,
              fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Category Grid (only when nothing selected) */}
      {!selectedCategory && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
          }}>
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${cat.color}44`,
                  borderRadius: '16px',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{cat.emoji}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textPrimary }}>
                    {cat.name}
                  </p>
                  <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                    {categoryCount(cat.name)} posts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div style={{ padding: '0 4px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '3px solid rgba(108,99,255,0.2)',
              borderTop: '3px solid #6C63FF',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>
              {selectedCategory ? `No posts in ${selectedCategory} yet` : 'No posts yet'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px',
          }}>
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => navigate('/u/' + (post.author?.username || ''))}
                style={{
                  position: 'relative', aspectRatio: '1',
                  background: '#000', cursor: 'pointer', overflow: 'hidden',
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
                <div style={{
                  position: 'absolute', bottom: '4px', left: '6px',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <FiHeart style={{ color: '#fff', fontSize: '12px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }} />
                  <span style={{
                    color: '#fff', fontSize: '11px', fontWeight: '700',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                  }}>
                    {post.likesCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;