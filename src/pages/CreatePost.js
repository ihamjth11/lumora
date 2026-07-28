import React, { useState, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPostMedia, createPost, uploadStoryMedia, createStory } from '../services/apiService';
import { IoArrowBack, IoClose, IoImagesOutline, IoVideocamOutline } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi';

const categories = [
  'AI', 'Coding', 'Cooking', 'Design', 'Skills', 'Science', 'Business', 'Language',
  'Fitness', 'Photography', 'Music', 'Writing', 'Travel', 'Finance', 'Marketing', 'Art',
];
const categoryColors = {
  AI: '#7c3aed', Coding: '#0ea5e9', Cooking: '#f97316',
  Design: '#ec4899', Skills: '#10b981', Science: '#f59e0b',
  Business: '#6366f1', Language: '#14b8a6',
  Fitness: '#ef4444', Photography: '#8b5cf6', Music: '#f43f5e',
  Writing: '#0891b2', Travel: '#22c55e', Finance: '#eab308',
  Marketing: '#d946ef', Art: '#fb7185',
};
const categoryEmojis = {
  AI: '🤖', Coding: '💻', Cooking: '🍳',
  Design: '🎨', Skills: '⚡', Science: '🔬',
  Business: '📈', Language: '🌍',
  Fitness: '🏋️', Photography: '📷', Music: '🎵',
  Writing: '✍️', Travel: '✈️', Finance: '💰',
  Marketing: '📣', Art: '🖌️',
};

const TYPE_META = {
  post: { label: 'Post', emoji: '📸', desc: 'Share a photo or video to your feed' },
  story: { label: 'Story', emoji: '⭕', desc: 'Disappears after 24 hours' },
  reel: { label: 'Reel', emoji: '🎬', desc: 'Short, vertical video for Explore' },
};

function CreatePost() {
  const { colors, isDark } = useTheme();
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

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaKind, setMediaKind] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedType, setUploadedType] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';

  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff';
  const chipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';

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

    setUploadingMedia(true);
    const res = postType === 'story' ? await uploadStoryMedia(file) : await uploadPostMedia(file);
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

  const handleTypeSwitch = (type) => {
    setPostType(type);
    handleRemoveMedia();
    setError('');
  };

  const handlePost = async () => {
    setError('');
    if (!uploadedUrl) {
      setError('Please upload a photo or video');
      return;
    }
    if (uploadingMedia) {
      setError('Please wait, media is still uploading...');
      return;
    }

    setPosting(true);

    if (postType === 'story') {
      const res = await createStory(uploadedUrl, uploadedType);
      setPosting(false);
      if (res.success) {
        setPosted(true);
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(res.error || 'Failed to share story');
      }
      return;
    }

    if (!selectedCategory) {
      setPosting(false);
      setError('Please select a category');
      return;
    }

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

  const canShare = postType === 'story'
    ? !!uploadedUrl && !uploadingMedia
    : !!uploadedUrl && !!selectedCategory && !uploadingMedia;

  return (
    <div style={{
      background: isDark
        ? 'linear-gradient(180deg, #0a0a12 0%, #14102a 30%, #0a0a12 100%)'
        : 'linear-gradient(180deg, #fafaff 0%, #f3f0ff 30%, #fafaff 100%)',
      minHeight: '100vh',
      paddingBottom: '20px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '320px', height: '320px',
        borderRadius: '50%', background: `radial-gradient(circle, rgba(124,58,237,${isDark ? 0.15 : 0.07}) 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: isDark ? 'rgba(20,16,42,0.7)' : 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${chipBorder}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100, position: 'relative',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: chipBg, border: 'none', width: '36px', height: '36px', borderRadius: '12px',
            color: colors.textPrimary, fontSize: '18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <IoArrowBack />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HiSparkles style={{ color: '#7c3aed', fontSize: '15px' }} />
          <span style={{
            fontSize: '17px', fontWeight: '800',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Create
          </span>
        </div>
        <button
          onClick={handlePost}
          disabled={posting || !canShare}
          style={{
            background: canShare
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : chipBg,
            border: 'none', borderRadius: '12px',
            padding: '8px 18px',
            color: canShare ? '#fff' : colors.textMuted,
            fontSize: '13.5px', fontWeight: '700',
            cursor: (posting || !canShare) ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
            transition: 'all 0.2s', opacity: posting ? 0.7 : 1,
            boxShadow: canShare ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
          }}
        >
          {posting ? 'Sharing...' : 'Share'}
        </button>
      </div>

      {/* Post Type Toggle */}
      <div style={{
        display: 'flex', gap: '6px',
        padding: '7px', margin: '16px 16px 0',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.05)',
        borderRadius: '22px',
        border: `1px solid ${chipBorder}`,
        position: 'relative', zIndex: 1,
      }}>
        {['post', 'story', 'reel'].map((type) => {
          const active = postType === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeSwitch(type)}
              style={{
                flex: 1, padding: '12px 8px',
                borderRadius: '16px', border: 'none',
                background: active
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)'
                  : 'transparent',
                color: active ? '#fff' : colors.textMuted,
                fontSize: '13px', fontWeight: '800',
                cursor: 'pointer', fontFamily: 'Inter',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: active ? '0 6px 20px rgba(124,58,237,0.4)' : 'none',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <span style={{ fontSize: '15px' }}>{TYPE_META[type].emoji}</span>
              {TYPE_META[type].label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '10px 16px 0', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
          {TYPE_META[postType].desc}
        </p>
      </div>

      {/* Media Upload / Preview */}
      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
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
            height: postType === 'reel' ? '380px' : '220px',
            background: colors.bgCard,
            border: `2px dashed ${chipBorder}`,
            borderRadius: '24px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              {(postType !== 'reel') && (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '8px', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: '58px', height: '58px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #7c3aed18, #a855f712)',
                    border: `1px solid #7c3aed30`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '26px',
                    color: '#7c3aed',
                  }}>
                    <IoImagesOutline />
                  </div>
                  <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Photo</span>
                </div>
              )}
              <div
                onClick={() => videoInputRef.current?.click()}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: '8px', cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '58px', height: '58px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #7c3aed18, #a855f712)',
                  border: `1px solid #7c3aed30`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '26px',
                  color: '#7c3aed',
                }}>
                  <IoVideocamOutline />
                </div>
                <span style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '600' }}>Video</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>
              {postType === 'reel' ? 'Tap to upload a vertical video' : 'Tap to upload photo or video'}
            </p>
          </div>
        ) : (
          <div style={{
            position: 'relative', borderRadius: '24px',
            overflow: 'hidden', background: '#000',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          }}>
            {mediaKind === 'image' ? (
              <img src={mediaPreview} alt="preview" style={{
                width: '100%', maxHeight: '420px', objectFit: 'contain', display: 'block',
              }} />
            ) : (
              <video src={mediaPreview} controls style={{
                width: '100%', maxHeight: '420px', display: 'block',
              }} />
            )}

            {uploadingMedia && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
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
                position: 'absolute', top: '12px', right: '12px',
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '18px', cursor: 'pointer',
              }}
            >
              <IoClose />
            </button>

            {uploadedUrl && !uploadingMedia && (
              <div style={{
                position: 'absolute', top: '12px', left: '12px',
                background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(8px)', borderRadius: '20px',
                padding: '5px 12px',
              }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓ Uploaded</span>
              </div>
            )}
          </div>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Caption + Category — only for Post/Reel */}
      {postType !== 'story' && (
        <>
          <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '20px',
              padding: '16px',
              boxShadow: isDark ? 'none' : '0 4px 16px rgba(108,99,255,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '13px',
                  background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
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
                <BsEmojiSmile style={{ color: colors.textMuted, fontSize: '20px', cursor: 'pointer' }} />
                <span style={{ fontSize: '12px', color: colors.textMuted }}>
                  {caption.length}/300
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: colors.textPrimary, marginBottom: '12px' }}>
              Select Category
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                const c = categoryColors[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '7px 14px 7px 7px',
                      borderRadius: '24px',
                      border: `1.5px solid ${active ? c : colors.border}`,
                      background: active ? `${c}18` : colors.bgCard,
                      color: active ? c : colors.textSecondary,
                      fontSize: '12.5px', fontWeight: '700',
                      cursor: 'pointer', fontFamily: 'Inter',
                      transition: 'all 0.2s',
                      boxShadow: active ? `0 4px 14px ${c}30` : 'none',
                      transform: active ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: active ? c : `${c}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', flexShrink: 0,
                      transition: 'background 0.2s',
                    }}>
                      {categoryEmojis[cat]}
                    </span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
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
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '28px',
            padding: '44px 32px',
            textAlign: 'center',
            margin: '0 24px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 20px 60px rgba(124,58,237,0.25)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
              {postType === 'story' ? 'Story shared!' : 'Posted!'}
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