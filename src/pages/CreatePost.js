import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { AiOutlinePicture } from 'react-icons/ai';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';

const categories = ['AI', 'Coding', 'Cooking', 'Design', 'Skills', 'Science', 'Business', 'Language'];
const categoryColors = {
  AI: '#7c3aed', Coding: '#0ea5e9', Cooking: '#f97316',
  Design: '#ec4899', Skills: '#10b981', Science: '#f59e0b',
  Business: '#6366f1', Language: '#14b8a6',
};
const categoryEmojis = {
  AI: '🤖', Coding: '💻', Cooking: '🍳',
  Design: '🎨', Skills: '⚡', Science: '🔬',
  Business: '📈', Language: '🌍',
};

function CreatePost() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postType, setPostType] = useState('post');
  const [posted, setPosted] = useState(false);

  const handlePost = () => {
    if (!caption.trim() || !selectedCategory) return;
    setPosted(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: '20px',
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none',
            color: colors.textPrimary, fontSize: '22px',
            cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center',
          }}
        >
          <IoArrowBack />
        </button>
        <span style={{
          fontSize: '17px', fontWeight: '800',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Create
        </span>
        <button
          onClick={handlePost}
          style={{
            background: caption.trim() && selectedCategory
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : colors.border,
            border: 'none', borderRadius: '10px',
            padding: '8px 16px',
            color: caption.trim() && selectedCategory ? '#fff' : colors.textMuted,
            fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
            transition: 'all 0.2s',
          }}
        >
          Share
        </button>
      </div>

      {/* Post Type Toggle */}
      <div style={{
        display: 'flex', gap: '8px',
        padding: '16px', margin: '0 16px',
        background: colors.bgCard,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        marginTop: '16px',
      }}>
        {['post', 'story', 'reel'].map((type) => (
          <button
            key={type}
            onClick={() => setPostType(type)}
            style={{
              flex: 1, padding: '10px',
              borderRadius: '12px', border: 'none',
              background: postType === type
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : colors.inputBg,
              color: postType === type ? '#fff' : colors.textMuted,
              fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {type === 'post' ? '📸 Post' : type === 'story' ? '⭕ Story' : '🎬 Reel'}
          </button>
        ))}
      </div>

      {/* Media Upload */}
      <div style={{ padding: '16px' }}>
        <div style={{
          height: '200px',
          background: colors.bgCard,
          border: `2px dashed ${colors.border}`,
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '12px', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '14px',
                background: '#f3eeff',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px',
                color: '#7c3aed',
              }}>
                <AiOutlinePicture />
              </div>
              <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Photo</span>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '14px',
                background: '#f3eeff',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '24px',
                color: '#7c3aed',
              }}>
                <MdOutlineVideoLibrary />
              </div>
              <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Video</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: colors.textMuted }}>
            Tap to upload photo or video
          </p>
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '14px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            gap: '12px',
          }}>
            <div style={{
              width: '38px', height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px',
              flexShrink: 0,
            }}>
              🧑‍💻
            </div>
            <textarea
              placeholder="Share what you learned today..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              style={{
                flex: 1, background: 'none',
                border: 'none', outline: 'none',
                color: colors.textPrimary,
                fontSize: '14px', fontFamily: 'Inter',
                resize: 'none', lineHeight: '1.5',
              }}
            />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: '10px',
            paddingTop: '10px',
            borderTop: `1px solid ${colors.border}`,
          }}>
            <BsEmojiSmile style={{
              color: colors.textMuted, fontSize: '20px', cursor: 'pointer',
            }} />
            <span style={{
              fontSize: '12px', color: colors.textMuted,
            }}>
              {caption.length}/300
            </span>
          </div>
        </div>
      </div>

      {/* Category Select */}
      <div style={{ padding: '16px' }}>
        <p style={{
          fontSize: '13px', fontWeight: '700',
          color: colors.textPrimary, marginBottom: '12px',
        }}>
          Select Category
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '8px',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1px solid ${selectedCategory === cat
                  ? categoryColors[cat]
                  : colors.border}`,
                background: selectedCategory === cat
                  ? `${categoryColors[cat]}15`
                  : colors.bgCard,
                color: selectedCategory === cat
                  ? categoryColors[cat]
                  : colors.textSecondary,
                fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter',
                transition: 'all 0.2s',
              }}
            >
              {categoryEmojis[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Success Modal */}
      {posted && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '480px',
          left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '24px',
            padding: '40px 32px',
            textAlign: 'center',
            margin: '0 24px',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{
              fontSize: '22px', fontWeight: '800',
              color: colors.textPrimary, marginBottom: '8px',
            }}>
              Posted!
            </h2>
            <p style={{ fontSize: '14px', color: colors.textMuted }}>
              Your {postType} is live on Lumora ✨
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePost;