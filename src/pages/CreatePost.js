import React, { useState, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPostMedia, createPost } from '../services/apiService';
import { IoArrowBack, IoClose } from 'react-icons/io5';
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
  const { userProfile } = useAuth();
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [postType, setPostType] = useState('post');
  const [posted, setPosted] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // Media state
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaKind, setMediaKind] = useState(''); // 'image' | 'video'
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedType, setUploadedType] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';

  const handleMediaSelect = async (e, kind) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = kind === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max ${kind === 'video' ? '50MB' : '10MB'} allowed.`);
      return;
    }

    setError('');
    setMediaFile(file);
    setMediaKind(kind);
    setMediaPreview(URL.createObjectURL(file));
    e.target.value = '';

    // Upload immediately to Cloudinary
    setUploadingMedia(true);
    const res = await uploadPostMedia(file);
    setUploadingMedia(false);

    if (res.success) {
      setUploadedUrl(res.url);
      setUploadedType(res.mediaType);
    } else {
      setError(res.error || 'Failed to upload media');
      setMediaPreview('');
      setMediaFile(null);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaKind('');
    setUploadedUrl('');
    setUploadedType('');
  };

  const handlePost = async () => {
    setError('');

    if (postType === 'story') {
      setError('Stories are coming soon! Please post as a Post or Reel for now.');
      return;
    }
    if (!uploadedUrl) {
      setError('Please upload a photo or video');
      return;
    }
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    if (uploadingMedia) {
      setError('Please wait, media is still uploading...');
      return;
    }

    setPosting(true);
    const res = await createPost({
      mediaUrl: uploadedUrl,
      mediaType: uploadedType,
      caption,
      category: selectedCategory,
      type: postType === 'reel' ? 'reel' : 'post',
    });
    setPosting(false);

    if (res.success) {
      setPosted(true);
      setTimeout(() => navigate('/'), 1800);
    } else {
      setError(res.error || 'Failed to create post');
    }
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
          disabled={posting}
          style={{
            background: uploadedUrl && selectedCategory
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : colors.border,
            border: 'none', borderRadius: '10px',
            padding: '8px 16px',
            color: uploadedUrl && selectedCategory ? '#fff' : colors.textMuted,
            fontSize: '14px', fontWeight: '700',
            cursor: posting ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
            transition: 'all 0.2s', opacity: posting ? 0.7 : 1,
          }}
        >
          {posting ? 'Posting...' : 'Share'}
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

      {postType === 'story' && (
        <div style={{ padding: '0 16px', marginTop: '12px' }}>
          <div style={{
            background: '#f59e0b15', border: '1px solid #f59e0b30',
            borderRadius: '12px', padding: '12px 14px',
          }}>
            <p style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>
              ⏳ Stories are coming soon! For now, please post as a Post or Reel.
            </p>
          </div>
        </div>
      )}

      {/* Media Upload / Preview */}
      <div style={{ padding: '16px' }}>
        <input
          type="file"
          accept="image/*"
          ref={photoInputRef}
          onChange={(e) => handleMediaSelect(e, 'image')}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={(e) => handleMediaSelect(e, 'video')}
          style={{ display: 'none' }}
        />

        {!mediaPreview ? (
          <div style={{
            height: '200px',
            background: colors.bgCard,
            border: `2px dashed ${colors.border}`,
            borderRadius: '20px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div
                onClick={() => photoInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '6px', cursor: 'pointer',
                }}
              >
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
              <div
                onClick={() => videoInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '6px', cursor: 'pointer',
                }}
              >
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
        ) : (
          <div style={{
            position: 'relative', borderRadius: '20px',
            overflow: 'hidden', background: '#000',
          }}>
            {mediaKind === 'image' ? (
              <img src={mediaPreview} alt="preview" style={{
                width: '100%', maxHeight: '360px', objectFit: 'contain', display: 'block',
              }} />
            ) : (
              <video src={mediaPreview} controls style={{
                width: '100%', maxHeight: '360px', display: 'block',
              }} />
            )}

            {uploadingMedia && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '10px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>Uploading...</span>
              </div>
            )}

            <button
              onClick={handleRemoveMedia}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', cursor: 'pointer',
              }}
            >
              <IoClose />
            </button>

            {uploadedUrl && !uploadingMedia && (
              <div style={{
                position: 'absolute', top: '10px', left: '10px',
                background: 'rgba(16,185,129,0.9)', borderRadius: '20px',
                padding: '4px 10px',
              }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓ Uploaded</span>
              </div>
            )}
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #7c3aed, #a855f7)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px',
              flexShrink: 0,
            }}>
              {!photoURL && userAvatar}
            </div>
            <textarea
              placeholder="Share what you learned today..."
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 300))}
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

      {/* Error */}
      {error && (
        <div style={{ padding: '0 16px' }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '14px', padding: '10px 14px',
          }}>
            <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>{error}</p>
          </div>
        </div>
      )}

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