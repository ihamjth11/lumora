import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkUsernameAvailable, updateUserProfile, uploadProfilePhoto } from '../services/apiService';
import { IoArrowBack, IoCamera } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';

const avatarOptions = [
  '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🔬', '👨‍🍳', '👩‍🍳',
  '🧑‍🎨', '👨‍💼', '👩‍💼', '🧑‍🏫', '👨‍🚀', '👩‍🚀',
];

function EditProfile() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { userProfile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [avatar, setAvatar] = useState('🧑‍💻');
  const [photoURL, setPhotoURL] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');

  useEffect(() => {
    if (userProfile) {
      setAvatar(userProfile.avatar || '🧑‍💻');
      setPhotoURL(userProfile.photoURL || '');
      setName(userProfile.name || '');
      setUsername(userProfile.username || '');
      setOriginalUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setWebsite(userProfile.website || '');
      setLocation(userProfile.location || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('');
      return;
    }
    if (username.toLowerCase() === originalUsername.toLowerCase()) {
      setUsernameStatus('same');
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailable(username);
      if (res.success) {
        setUsernameStatus(res.available ? 'available' : 'taken');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, originalUsername]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError('');
    setUploadingPhoto(true);
    const res = await uploadProfilePhoto(file);
    setUploadingPhoto(false);

    if (res.success) {
      setPhotoURL(res.url);
    } else {
      setError(res.error || 'Failed to upload photo');
    }
  };

  const handleSave = async () => {
    setError('');

    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }
    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('This username is already taken');
      return;
    }
    if (usernameStatus === 'checking') {
      setError('Please wait, checking username...');
      return;
    }

    setSaving(true);
    const res = await updateUserProfile({
      name,
      username,
      bio,
      website,
      location,
      avatar,
      photoURL,
    });
    setSaving(false);

    if (res.success) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        navigate('/profile');
      }, 1200);
    } else {
      setError(res.error || 'Failed to save profile');
    }
  };

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
      fontFamily: 'Inter, sans-serif',
    }}>

      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 100,
      }}>
        <button onClick={() => navigate('/profile')} style={{
          background: 'none', border: 'none',
          color: colors.textPrimary, fontSize: '22px',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center',
        }}>
          <IoArrowBack />
        </button>
        <span style={{
          fontSize: '16px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Edit Profile
        </span>
        <button onClick={handleSave} disabled={saving} style={{
          background: saved
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #6C63FF, #F72585)',
          border: 'none', borderRadius: '10px',
          padding: '8px 16px',
          color: '#fff', fontSize: '13px', fontWeight: '700',
          cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
          transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      {/* Avatar/Photo Section */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '28px 16px 20px',
      }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handlePhotoSelect}
          style={{ display: 'none' }}
        />
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
          }}>
            {!photoURL && avatar}
            {uploadingPhoto && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.3)',
                  borderTop: '3px solid #fff',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              border: `2px solid ${colors.bgPrimary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', fontSize: '14px',
            }}>
            <IoCamera />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none', border: 'none',
              color: '#6C63FF', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter',
            }}>
            Upload Photo
          </button>
          <span style={{ color: colors.textMuted }}>|</span>
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            style={{
              background: 'none', border: 'none',
              color: '#6C63FF', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter',
            }}>
            Use Avatar
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {showAvatarPicker && (
        <div style={{
          margin: '0 16px 20px',
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', padding: '16px',
          boxShadow: colors.shadow,
        }}>
          <p style={{
            fontSize: '13px', fontWeight: '700',
            color: colors.textPrimary, marginBottom: '12px',
          }}>
            Choose Avatar
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '8px',
          }}>
            {avatarOptions.map((av, i) => (
              <button
                key={i}
                onClick={() => { setAvatar(av); setPhotoURL(''); setShowAvatarPicker(false); }}
                style={{
                  width: '100%', aspectRatio: '1',
                  background: avatar === av && !photoURL
                    ? 'linear-gradient(135deg, #6C63FF22, #F7258522)'
                    : colors.inputBg,
                  border: avatar === av && !photoURL
                    ? '2px solid #6C63FF'
                    : `1px solid ${colors.border}`,
                  borderRadius: '12px', fontSize: '24px',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: colors.shadow,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
            <p style={{
              fontSize: '11px', fontWeight: '700',
              color: '#6C63FF', marginBottom: '4px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Name
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              style={{
                width: '100%', background: 'none', border: 'none',
                outline: 'none', color: colors.textPrimary,
                fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
              }}
            />
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{
              fontSize: '11px', fontWeight: '700',
              color: '#6C63FF', marginBottom: '4px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Username
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: colors.textMuted, fontSize: '14px' }}>@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                placeholder="username"
                style={{
                  flex: 1, background: 'none', border: 'none',
                  outline: 'none', color: colors.textPrimary,
                  fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
                }}
              />
            </div>
            {username.length > 2 && usernameStatus !== 'same' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: usernameStatus === 'available' ? '#10b981'
                    : usernameStatus === 'taken' ? '#ef4444' : '#9ca3af',
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: '600',
                  color: usernameStatus === 'available' ? '#10b981'
                    : usernameStatus === 'taken' ? '#ef4444' : colors.textMuted,
                }}>
                  {usernameStatus === 'checking' && 'Checking...'}
                  {usernameStatus === 'available' && 'Username available'}
                  {usernameStatus === 'taken' && 'Username already taken'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', padding: '14px 16px',
          boxShadow: colors.shadow,
        }}>
          <p style={{
            fontSize: '11px', fontWeight: '700',
            color: '#6C63FF', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Bio
          </p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            placeholder="Write something about yourself..."
            rows={3}
            style={{
              width: '100%', background: 'none', border: 'none',
              outline: 'none', color: colors.textPrimary,
              fontSize: '14px', fontFamily: 'Inter',
              resize: 'none', lineHeight: '1.5',
            }}
          />
          <p style={{
            fontSize: '11px', color: colors.textMuted,
            textAlign: 'right', marginTop: '4px',
          }}>
            {bio.length}/150
          </p>
        </div>

        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: colors.shadow,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
            <p style={{
              fontSize: '11px', fontWeight: '700',
              color: '#6C63FF', marginBottom: '4px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Website
            </p>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              style={{
                width: '100%', background: 'none', border: 'none',
                outline: 'none', color: colors.textPrimary,
                fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
              }}
            />
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{
              fontSize: '11px', fontWeight: '700',
              color: '#6C63FF', marginBottom: '4px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Location
            </p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Where are you from?"
              style={{
                width: '100%', background: 'none', border: 'none',
                outline: 'none', color: colors.textPrimary,
                fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '14px', padding: '10px 14px',
          }}>
            <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        <div style={{
          background: `linear-gradient(135deg, #6C63FF15, #F7258510)`,
          border: '1px solid #6C63FF25',
          borderRadius: '20px', padding: '16px',
        }}>
          <p style={{
            fontSize: '11px', fontWeight: '700',
            color: '#6C63FF', marginBottom: '12px',
            textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>
            Preview
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: photoURL ? `url(${photoURL})` : 'linear-gradient(135deg, #6C63FF, #F72585)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>
              {!photoURL && avatar}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: colors.textPrimary }}>
                  {name || 'Your Name'}
                </span>
                <MdVerified style={{ color: '#6C63FF', fontSize: '14px' }} />
              </div>
              <p style={{ fontSize: '12px', color: colors.textMuted }}>
                @{username || 'username'}
              </p>
              <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '3px' }}>
                {bio || 'Your bio'}
              </p>
            </div>
          </div>
        </div>

      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
}

export default EditProfile;