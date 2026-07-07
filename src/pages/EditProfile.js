import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCamera } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';

const avatarOptions = [
  '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🔬', '👨‍🍳', '👩‍🍳',
  '🧑‍🎨', '👨‍💼', '👩‍💼', '🧑‍🏫', '👨‍🚀', '👩‍🚀',
];

function EditProfile() {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState('🧑‍💻');
  const [name, setName] = useState('Hamjath');
  const [username, setUsername] = useState('hamjath');
  const [bio, setBio] = useState('Learning every day ✦');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('Sri Lanka 🇱🇰');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate('/profile');
    }, 1500);
  };

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Header */}
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
        <button onClick={handleSave} style={{
          background: saved
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #6C63FF, #F72585)',
          border: 'none', borderRadius: '10px',
          padding: '8px 16px',
          color: '#fff', fontSize: '13px', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'Inter',
          transition: 'all 0.2s',
        }}>
          {saved ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      {/* Avatar Section */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '28px 16px 20px',
      }}>
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
          }}>
            {avatar}
          </div>
          <button
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
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
        <button
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          style={{
            background: 'none', border: 'none',
            color: '#6C63FF', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
          }}>
          Change Avatar
        </button>
      </div>

      {/* Avatar Picker */}
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
                onClick={() => { setAvatar(av); setShowAvatarPicker(false); }}
                style={{
                  width: '100%', aspectRatio: '1',
                  background: avatar === av
                    ? 'linear-gradient(135deg, #6C63FF22, #F7258522)'
                    : colors.inputBg,
                  border: avatar === av
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

      {/* Form Fields */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Section: Basic Info */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: colors.shadow,
        }}>
          {[
            { label: 'Name', value: name, onChange: setName, placeholder: 'Your full name' },
            { label: 'Username', value: username, onChange: setUsername, placeholder: 'username', prefix: '@' },
          ].map((field, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderBottom: i === 0 ? `1px solid ${colors.border}` : 'none',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: '700',
                color: '#6C63FF', marginBottom: '4px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {field.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {field.prefix && (
                  <span style={{ color: colors.textMuted, fontSize: '14px' }}>
                    {field.prefix}
                  </span>
                )}
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    outline: 'none', color: colors.textPrimary,
                    fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Bio */}
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

        {/* Website + Location */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px', overflow: 'hidden',
          boxShadow: colors.shadow,
        }}>
          {[
            { label: 'Website', value: website, onChange: setWebsite, placeholder: 'https://yoursite.com' },
            { label: 'Location', value: location, onChange: setLocation, placeholder: 'Where are you from?' },
          ].map((field, i) => (
            <div key={i} style={{
              padding: '14px 16px',
              borderBottom: i === 0 ? `1px solid ${colors.border}` : 'none',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: '700',
                color: '#6C63FF', marginBottom: '4px',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {field.label}
              </p>
              <input
                type="text"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  outline: 'none', color: colors.textPrimary,
                  fontSize: '15px', fontFamily: 'Inter', fontWeight: '500',
                }}
              />
            </div>
          ))}
        </div>

        {/* Preview Card */}
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
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>
              {avatar}
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