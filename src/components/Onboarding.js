import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkUsernameAvailable, createUserProfile } from '../services/apiService';
import { interestsList } from '../constants/interests';

const steps = [
  { id: 1, title: 'Add your name', subtitle: 'Add your name so friends can find you', field: 'name', placeholder: 'Full name', type: 'text' },
  { id: 2, title: 'Create a username', subtitle: 'Pick a username for your profile. You can always change it later.', field: 'username', placeholder: 'Username', type: 'text', prefix: '' },
  { id: 3, title: 'Add your birthday', subtitle: 'Use your own birthday, even if this account is for a business, pet, or something else. No one will see this unless you choose to share it.', field: 'birthday', placeholder: 'Birthday', type: 'date' },
  { id: 4, title: 'What are you interested in?', subtitle: 'Choose 3 or more topics you enjoy. This helps us personalize your experience.', field: 'interests', type: 'interests' },
];

function Onboarding() {
  const { currentUser, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: currentUser?.displayName || '', username: '', birthday: '', interests: [],
  });
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const current = steps[step];

  useEffect(() => {
    if (current.field !== 'username' || data.username.length < 3) {
      setUsernameStatus('');
      return;
    }
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailable(data.username);
      if (res.success) {
        setUsernameStatus(res.available ? 'available' : 'taken');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [data.username, current.field]);

  const validate = () => {
    if (current.field === 'name' && !data.name.trim()) {
      setError('Please enter your name'); return false;
    }
    if (current.field === 'username') {
      if (!data.username.trim()) { setError('Please enter a username'); return false; }
      if (data.username.includes(' ')) { setError('Username cannot contain spaces'); return false; }
      if (data.username.length < 3) { setError('Username must be at least 3 characters'); return false; }
      if (usernameStatus === 'taken') { setError('This username is already taken'); return false; }
      if (usernameStatus === 'checking') { setError('Please wait, checking username...'); return false; }
    }
    if (current.field === 'birthday' && !data.birthday) {
      setError('Please enter your birthday'); return false;
    }
    if (current.field === 'interests' && data.interests.length < 3) {
      setError('Please select at least 3 interests'); return false;
    }
    return true;
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError('');

    const interestNames = data.interests.map(
      id => interestsList.find(i => i.id === id)?.name
    ).filter(Boolean);

    const res = await createUserProfile({
      name: data.name,
      username: data.username,
      birthday: data.birthday,
      interests: interestNames,
    });

    if (res.success) {
      await refreshProfile();
    } else {
      setSubmitting(false);
      setError(res.error || 'Failed to save profile. Try again.');
    }
  };

  const handleNext = () => {
    if (!validate()) return;
    setError('');
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const toggleInterest = (id) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id],
    }));
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '480px', margin: '0 auto',
    }}>

      <div style={{ height: '2px', background: '#e5e7eb' }}>
        <div style={{
          height: '100%', background: 'linear-gradient(90deg, #6C63FF, #F72585)',
          width: `${progress}%`, transition: 'width 0.4s ease',
        }} />
      </div>

      <div style={{
        padding: '16px 20px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 6C12 6 8 4 4 4V18C8 18 12 20 12 20C12 20 16 18 20 18V4C16 4 12 6 12 6Z"
                fill="white" opacity="0.95"/>
              <path d="M7 9L10 11.5L7 14V9Z" fill="rgba(108,99,255,0.9)"/>
              <path d="M14 9L17 11.5L14 14V9Z" fill="rgba(247,37,133,0.9)"/>
            </svg>
          </div>
          <span style={{
            fontSize: '18px', fontWeight: '900',
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            lumora
          </span>
        </div>
        <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
          {step + 1} / {steps.length}
        </span>
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '26px', fontWeight: '800',
            color: '#0a0a0a', marginBottom: '8px',
            letterSpacing: '-0.5px', lineHeight: '1.2',
          }}>
            {current.title}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
            {current.subtitle}
          </p>
        </div>

        {current.type !== 'interests' ? (
          <div>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px', overflow: 'hidden',
              background: '#f9fafb',
            }}>
              {current.prefix !== undefined && (
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <span style={{ color: '#6b7280', fontSize: '15px' }}>
                    {current.field === 'username' ? 'lumora.app/' : ''}
                  </span>
                  <input
                    type={current.type}
                    placeholder={current.placeholder}
                    value={data[current.field]}
                    onChange={(e) => {
                      setError('');
                      setData(prev => ({ ...prev, [current.field]: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') }));
                    }}
                    style={{
                      flex: 1, background: 'none', border: 'none',
                      outline: 'none', color: '#0a0a0a',
                      fontSize: '15px', fontFamily: 'Inter',
                    }}
                  />
                </div>
              )}
              {current.prefix === undefined && (
                <input
                  type={current.type}
                  placeholder={current.placeholder}
                  value={data[current.field]}
                  onChange={(e) => {
                    setError('');
                    setData(prev => ({ ...prev, [current.field]: e.target.value }));
                  }}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    outline: 'none', color: '#0a0a0a',
                    fontSize: '15px', fontFamily: 'Inter',
                    padding: '14px 16px',
                  }}
                />
              )}
            </div>

            {current.field === 'username' && data.username.length > 2 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '8px',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: usernameStatus === 'available' ? '#10b981'
                    : usernameStatus === 'taken' ? '#ef4444' : '#9ca3af',
                }} />
                <span style={{
                  fontSize: '12px', fontWeight: '600',
                  color: usernameStatus === 'available' ? '#10b981'
                    : usernameStatus === 'taken' ? '#ef4444' : '#9ca3af',
                }}>
                  {usernameStatus === 'checking' && 'Checking availability...'}
                  {usernameStatus === 'available' && `${data.username} is available`}
                  {usernameStatus === 'taken' && `${data.username} is already taken`}
                </span>
              </div>
            )}

            {current.field === 'birthday' && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                marginTop: '12px', padding: '12px',
                background: '#f0efff', borderRadius: '10px',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '12px', color: '#6C63FF', lineHeight: '1.5' }}>
                  This won't be shown on your public profile. We use this to verify your age.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px',
            overflowY: 'auto', flex: 1,
          }}>
            {interestsList.map((item) => {
              const isSelected = data.interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { toggleInterest(item.id); setError(''); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: `1.5px solid ${isSelected ? item.color : '#e5e7eb'}`,
                    background: isSelected ? `${item.color}15` : '#ffffff',
                    color: isSelected ? item.color : '#6b7280',
                    fontSize: '13px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'Inter',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {item.name}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '10px', fontWeight: '500' }}>
            {error}
          </p>
        )}

        {current.field === 'interests' && (
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '12px' }}>
            {data.interests.length} selected
            {data.interests.length < 3 ? ` (${3 - data.interests.length} more needed)` : ' ✓'}
          </p>
        )}

        <div style={{ flex: 1 }} />

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handleNext}
            disabled={submitting}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #6C63FF, #F72585)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
              boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
              marginBottom: '12px', opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Saving...' : (step === steps.length - 1 ? 'Finish Setup 🚀' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;