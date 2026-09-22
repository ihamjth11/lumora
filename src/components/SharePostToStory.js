import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { uploadStoryMedia, createStory } from '../services/apiService';
import { IoClose } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';

function SharePostToStory({ post, onClose, onShared }) {
  const { colors, isDark } = useTheme();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    setSharing(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      const W = 720, H = 1280;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#1a0a2e');
      grad.addColorStop(1, '#0d0a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // "Posted by" header
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '600 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Posted by @' + (post.author?.username || 'user'), W / 2, 120);

      // Post image (center card)
      if (post.mediaUrl && post.mediaType === 'image') {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = post.mediaUrl;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = () => res(); // skip if fails
        });
        const margin = 60;
        const cardW = W - margin * 2;
        const cardH = cardW;
        const cardX = margin;
        const cardY = (H - cardH) / 2 - 60;

        ctx.save();
        ctx.beginPath();
        const r = 32;
        ctx.moveTo(cardX + r, cardY);
        ctx.lineTo(cardX + cardW - r, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
        ctx.lineTo(cardX + cardW, cardY + cardH - r);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
        ctx.lineTo(cardX + r, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
        ctx.lineTo(cardX, cardY + r);
        ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, cardX, cardY, cardW, cardH);
        ctx.restore();
      }

      // Caption snippet
      if (post.caption) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '700 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        const snippet = post.caption.length > 60 ? post.caption.slice(0, 60) + '...' : post.caption;
        ctx.fillText(snippet, W / 2, H - 200);
      }

      // Lumora branding
      ctx.fillStyle = 'rgba(168,85,247,0.8)';
      ctx.font = '800 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('lumora ✦', W / 2, H - 80);

      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      const file = new File([blob], 'story-repost.jpg', { type: 'image/jpeg' });

      const uploadRes = await uploadStoryMedia(file);
      if (!uploadRes.success) throw new Error(uploadRes.error || 'Upload failed');

      const storyRes = await createStory(uploadRes.url, 'image');
      if (!storyRes.success) throw new Error(storyRes.error || 'Story creation failed');

      setSharing(false);
      onShared?.();
      onClose();
    } catch (err) {
      setSharing(false);
      setError(err.message || 'Failed to share to story');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999998,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '480px',
        background: isDark ? 'linear-gradient(180deg, #1a1030, #0d0a1a)' : colors.bgCard,
        borderRadius: '28px 28px 0 0', padding: '20px 20px 32px',
        border: `1px solid ${isDark ? 'rgba(168,85,247,0.2)' : colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <HiSparkles style={{ color: '#a855f7', fontSize: '16px' }} />
            <span style={{
              fontSize: '15px', fontWeight: '800',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Share to your Story
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', width: '30px', height: '30px',
            borderRadius: '10px', color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
          }}>
            <IoClose />
          </button>
        </div>

        {/* Post preview */}
        <div style={{
          display: 'flex', gap: '12px', alignItems: 'center',
          background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '12px',
          marginBottom: '16px', border: '1px solid rgba(168,85,247,0.15)',
        }}>
          {post.mediaUrl && post.mediaType === 'image' && (
            <img src={post.mediaUrl} alt="post" style={{
              width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0,
            }} />
          )}
          {post.mediaUrl && post.mediaType === 'video' && (
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
            }}>
              🎬
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12.5px', fontWeight: '700', color: '#fff', marginBottom: '3px' }}>
              @{post.author?.username || 'user'}
            </p>
            <p style={{
              fontSize: '12px', color: 'rgba(255,255,255,0.5)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {post.caption || 'No caption'}
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', textAlign: 'center' }}>
          This post will be added to your story with Lumora branding ✨
        </p>

        {error && (
          <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', textAlign: 'center' }}>{error}</p>
        )}

        <button onClick={handleShare} disabled={sharing} style={{
          width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7, #F72585)',
          color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
          boxShadow: '0 6px 20px rgba(124,58,237,0.4)', opacity: sharing ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          {sharing ? (
            <>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
              Sharing...
            </>
          ) : (
            <>⭕ Share to Story</>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default SharePostToStory;