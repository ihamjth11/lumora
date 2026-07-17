import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getActiveStories, uploadStoryMedia, createStory, getMyStories } from '../services/apiService';
import StoryViewer from './StoryViewer';
import { AiOutlinePlus } from 'react-icons/ai';

function Stories() {
  const { colors } = useTheme();
  const { userProfile, currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [storyGroups, setStoryGroups] = useState([]);
  const [myStoryCount, setMyStoryCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerGroupIndex, setViewerGroupIndex] = useState(0);

  const userAvatar = userProfile?.avatar || '🧑‍💻';
  const photoURL = userProfile?.photoURL || '';

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const res = await getActiveStories();
    if (res.success) {
      // Put my own stories first if they exist, exclude from "others" list
      const mine = res.storyGroups.find(g => g.authorFirebaseUid === currentUser?.uid);
      const others = res.storyGroups.filter(g => g.authorFirebaseUid !== currentUser?.uid);
      setMyStoryCount(mine ? mine.stories.length : 0);
      setStoryGroups(mine ? [mine, ...others] : others);
    }
  };

  const handleAddStory = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large. Max ${isVideo ? '50MB' : '10MB'} allowed.`);
      return;
    }

    setUploading(true);
    const uploadRes = await uploadStoryMedia(file);
    if (uploadRes.success) {
      await createStory(uploadRes.url, uploadRes.mediaType);
      await loadStories();
    } else {
      alert(uploadRes.error || 'Failed to upload story');
    }
    setUploading(false);
    e.target.value = '';
  };

  const openViewer = (index) => {
    setViewerGroupIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    loadStories(); // refresh viewed status
  };

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '12px 16px',
        overflowX: 'auto',
        background: colors.bgSecondary,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Your Story */}
        <div
          onClick={() => (myStoryCount > 0 ? openViewer(0) : handleAddStory())}
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: photoURL ? `url(${photoURL})` : colors.storyBg,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: myStoryCount > 0 ? '2px solid #6C63FF' : `2px dashed #6C63FF`,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '26px',
            position: 'relative',
          }}>
            {!photoURL && userAvatar}
            {uploading && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
            <div
              onClick={(e) => { e.stopPropagation(); handleAddStory(); }}
              style={{
                position: 'absolute', bottom: '0px', right: '0px',
                width: '20px', height: '20px',
                borderRadius: '50%', background: '#6C63FF',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${colors.bgCard}`,
              }}>
              <AiOutlinePlus style={{ color: '#fff', fontSize: '11px' }} />
            </div>
          </div>
          <span style={{
            fontSize: '11px', color: colors.textPrimary,
            fontWeight: '600', maxWidth: '64px',
            textAlign: 'center',
          }}>
            Your Story
          </span>
        </div>

        {/* Other Users' Stories */}
        {storyGroups.slice(myStoryCount > 0 ? 1 : 0).map((group, idx) => {
          const actualIndex = storyGroups.findIndex(g => g === group);
          const hasUnviewed = group.stories.some(s => !s.viewedBy?.includes(currentUser?.uid));
          const authorPhoto = group.author?.photoURL || '';
          const authorAvatar = group.author?.avatar || '🧑‍💻';

          return (
            <div
              key={group.authorFirebaseUid}
              onClick={() => openViewer(actualIndex)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: authorPhoto ? `url(${authorPhoto})` : colors.storyBg,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: hasUnviewed ? '2px solid #6C63FF' : `2px solid ${colors.border}`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '26px',
              }}>
                {!authorPhoto && authorAvatar}
              </div>
              <span style={{
                fontSize: '11px', color: colors.textPrimary,
                fontWeight: '600', maxWidth: '64px',
                textAlign: 'center', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {group.author?.username || 'user'}
              </span>
            </div>
          );
        })}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {viewerOpen && storyGroups.length > 0 && (
        <StoryViewer
          storyGroups={storyGroups}
          initialGroupIndex={viewerGroupIndex}
          onClose={closeViewer}
        />
      )}
    </>
  );
}

export default Stories;