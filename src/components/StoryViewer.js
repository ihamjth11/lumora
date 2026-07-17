import React, { useState, useEffect, useRef } from 'react';
import { markStoryViewed } from '../services/apiService';
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5';

function StoryViewer({ storyGroups, initialGroupIndex, onClose }) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const DURATION = 5000; // 5 seconds per story

  const currentGroup = storyGroups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];

  useEffect(() => {
    if (!currentStory) return;
    markStoryViewed(currentStory._id);
    setProgress(0);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      }
    }, 50);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, storyIndex]);

  const goNext = () => {
    clearInterval(timerRef.current);
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    clearInterval(timerRef.current);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(0);
    }
  };

  if (!currentGroup || !currentStory) return null;

  const authorName = currentGroup.author?.name || 'User';
  const authorAvatar = currentGroup.author?.avatar || '🧑‍💻';
  const authorPhoto = currentGroup.author?.photoURL || '';

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      zIndex: 99999, display: 'flex', flexDirection: 'column',
      maxWidth: '480px', margin: '0 auto',
    }}>
      {/* Progress bars */}
      <div style={{
        display: 'flex', gap: '4px', padding: '10px 12px 0',
      }}>
        {currentGroup.stories.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '2.5px', borderRadius: '2px',
            background: 'rgba(255,255,255,0.3)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: '#fff',
              width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
              transition: i === storyIndex ? 'none' : 'width 0.2s',
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: authorPhoto ? `url(${authorPhoto})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0,
        }}>
          {!authorPhoto && authorAvatar}
        </div>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', flex: 1 }}>
          {authorName}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
          {timeAgo(currentStory.createdAt)}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#fff',
          fontSize: '24px', cursor: 'pointer', padding: '0 0 0 8px',
          display: 'flex', alignItems: 'center',
        }}>
          <IoClose />
        </button>
      </div>

      {/* Media */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {currentStory.mediaType === 'video' ? (
          <video
            key={currentStory._id}
            src={currentStory.mediaUrl}
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <img
            src={currentStory.mediaUrl}
            alt="story"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {/* Tap zones */}
        <div onClick={goPrev} style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer',
        }} />
        <div onClick={goNext} style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', cursor: 'pointer',
        }} />

        {/* Nav arrows (visual, desktop-friendly) */}
        <button onClick={goPrev} style={{
          position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', cursor: 'pointer', fontSize: '18px',
        }}>
          <IoChevronBack />
        </button>
        <button onClick={goNext} style={{
          position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', cursor: 'pointer', fontSize: '18px',
        }}>
          <IoChevronForward />
        </button>
      </div>
    </div>
  );
}

export default StoryViewer;