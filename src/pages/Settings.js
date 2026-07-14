import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoShieldCheckmark } from 'react-icons/io5';
import { FiSun, FiMoon, FiLock, FiBell, FiEye, FiUser, FiLogOut } from 'react-icons/fi';
import { MdVerified, MdOutlinePrivacyTip } from 'react-icons/md';
import { BsShieldLock, BsPhone, BsKey } from 'react-icons/bs';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { logoutUser } from '../firebase/authService';

function Toggle({ value, onChange, color = '#6C63FF' }) {
  return (
    <div onClick={onChange} style={{
      width: '46px', height: '26px', borderRadius: '13px',
      background: value ? color : '#d1d5db',
      position: 'relative', cursor: 'pointer',
      transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#ffffff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <p style={{
      fontSize: '12px', fontWeight: '700', color: '#6C63FF',
      textTransform: 'uppercase', letterSpacing: '0.8px',
      padding: '16px 16px 8px',
    }}>
      {title}
    </p>
  );
}

function SettingRow({ icon, title, subtitle, right, onClick, colors, danger }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      gap: '14px', padding: '14px 16px',
      background: colors.bgCard,
      borderBottom: `1px solid ${colors.border}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '12px',
        background: danger ? '#fee2e2' : '#f3eeff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '18px',
        color: danger ? '#ef4444' : '#6C63FF', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '14px', fontWeight: '600',
          color: danger ? '#ef4444' : colors.textPrimary,
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  );
}

function Settings() {
  const { colors, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [twoStep, setTwoStep] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [msgNotif, setMsgNotif] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step2FA, setStep2FA] = useState(1);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
  await logoutUser();
  setShowLogoutConfirm(false);
  };

  return (
    <div style={{
      background: colors.bgPrimary,
      minHeight: '100vh',
      paddingBottom: 'var(--bottom-nav-height)',
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0,
        background: colors.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 100,
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
          fontSize: '18px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Settings
        </span>
      </div>

      {/* Profile Card */}
      <div style={{
        margin: '16px',
        background: 'linear-gradient(135deg, #6C63FF, #F72585)',
        borderRadius: '20px', padding: '20px',
        display: 'flex', alignItems: 'center',
        gap: '14px',
        boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '28px',
          border: '2px solid rgba(255,255,255,0.4)',
        }}>
          🧑‍💻
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              Hamjath
            </span>
            <MdVerified style={{ color: '#fff', fontSize: '16px' }} />
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
            @hamjath · lumora
          </span>
        </div>
        <button
          onClick={() => navigate('/edit-profile')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '10px', padding: '6px 14px',
            color: '#fff', fontSize: '13px', fontWeight: '700',
            cursor: 'pointer', fontFamily: 'Inter',
          }}
        >
          Edit
        </button>
      </div>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <div style={{
        background: colors.bgCard, borderRadius: '16px',
        margin: '0 16px', overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <SettingRow
          icon={isDark ? <FiMoon /> : <FiSun />}
          title={isDark ? 'Dark Mode' : 'Light Mode'}
          subtitle="Switch between light and dark"
          colors={colors}
          right={<Toggle value={isDark} onChange={toggleTheme} />}
        />
      </div>

      {/* Privacy */}
      <SectionHeader title="Privacy" />
      <div style={{
        background: colors.bgCard, borderRadius: '16px',
        margin: '0 16px', overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <SettingRow icon={<FiLock />} title="Private Account"
          subtitle="Only approved followers can see your posts"
          colors={colors}
          right={<Toggle value={privateAccount} onChange={() => setPrivateAccount(!privateAccount)} />}
        />
        <SettingRow icon={<FiEye />} title="Show Activity Status"
          subtitle="Let others see when you're online"
          colors={colors}
          right={<Toggle value={showActivity} onChange={() => setShowActivity(!showActivity)} />}
        />
        <SettingRow icon={<MdOutlinePrivacyTip />} title="Allow Messages"
          subtitle="Who can send you direct messages"
          colors={colors}
          right={<Toggle value={allowMessages} onChange={() => setAllowMessages(!allowMessages)} />}
        />
        <SettingRow icon={<BsKey />} title="Show Saved Posts"
          subtitle="Let others see your saved collection"
          colors={colors}
          right={<Toggle value={showSaved} onChange={() => setShowSaved(!showSaved)} />}
        />
      </div>

      {/* Security */}
      <SectionHeader title="Security" />
      <div style={{
        background: colors.bgCard, borderRadius: '16px',
        margin: '0 16px', overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <SettingRow icon={<BsShieldLock />} title="Two-Step Verification"
          subtitle={twoStep ? '✅ Enabled — Your account is protected' : 'Add extra security to your account'}
          colors={colors}
          onClick={() => { setShow2FA(true); setStep2FA(1); }}
          right={<Toggle value={twoStep} onChange={() => { setShow2FA(true); setStep2FA(1); }} />}
        />
        <SettingRow icon={<IoShieldCheckmark />} title="Login Alerts"
          subtitle="Get notified of new logins"
          colors={colors}
          right={<Toggle value={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />}
        />
        <SettingRow icon={<BsPhone />} title="Biometric Login"
          subtitle="Use fingerprint or face ID"
          colors={colors}
          right={<Toggle value={biometric} onChange={() => setBiometric(!biometric)} />}
        />
      </div>

      {/* Notifications */}
      <SectionHeader title="Notifications" />
      <div style={{
        background: colors.bgCard, borderRadius: '16px',
        margin: '0 16px', overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <SettingRow icon={<FiBell />} title="Push Notifications"
          subtitle="Reels, likes, comments alerts"
          colors={colors}
          right={<Toggle value={pushNotif} onChange={() => setPushNotif(!pushNotif)} />}
        />
        <SettingRow icon={<FiBell />} title="Email Notifications"
          subtitle="Weekly digest and updates"
          colors={colors}
          right={<Toggle value={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />}
        />
        <SettingRow icon={<FiBell />} title="Message Notifications"
          subtitle="New DM alerts"
          colors={colors}
          right={<Toggle value={msgNotif} onChange={() => setMsgNotif(!msgNotif)} />}
        />
      </div>

      {/* Account */}
      <SectionHeader title="Account" />
      <div style={{
        background: colors.bgCard, borderRadius: '16px',
        margin: '0 16px', overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}>
        <SettingRow icon={<FiUser />} title="Edit Profile"
          subtitle="Update name, bio, avatar"
          colors={colors}
          onClick={() => navigate('/edit-profile')}
        />
        <SettingRow icon={<AiOutlineInfoCircle />} title="About Lumora"
          subtitle="Version 1.0.0 · lumora.app"
          colors={colors}
        />
        <SettingRow
          icon={<FiLogOut />}
          title="Log Out"
          colors={colors}
          danger={true}
          onClick={() => setShowLogoutConfirm(true)}
        />
      </div>

      <div style={{ height: '24px' }} />

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
          maxWidth: '480px',
          left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '24px 24px 0 0',
            padding: '28px 20px 32px',
            width: '100%',
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>👋</div>
              <h2 style={{
                fontSize: '20px', fontWeight: '800',
                color: colors.textPrimary, marginBottom: '8px',
              }}>
                Log out of Lumora?
              </h2>
              <p style={{ fontSize: '14px', color: colors.textMuted }}>
                You can always sign back in anytime ✦
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none', borderRadius: '14px',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Inter',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
                }}
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  width: '100%', padding: '14px',
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '14px',
                  color: colors.textSecondary, fontSize: '15px', fontWeight: '600',
                  cursor: 'pointer', fontFamily: 'Inter',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FA && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
          maxWidth: '480px',
          left: '50%', transform: 'translateX(-50%)',
        }}>
          <div style={{
            background: colors.bgCard,
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px', width: '100%',
            border: `1px solid ${colors.border}`,
          }}>
            {step2FA === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
                    Two-Step Verification
                  </h2>
                  <p style={{ fontSize: '13px', color: colors.textMuted, lineHeight: '1.5' }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div style={{
                  background: colors.inputBg, border: `1px solid ${colors.border}`,
                  borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '18px' }}>📱</span>
                  <input type="tel" placeholder="Enter your phone number"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: colors.textPrimary, fontSize: '14px', fontFamily: 'Inter',
                    }}
                  />
                </div>
                <button onClick={() => phone.trim().length >= 8 && setStep2FA(2)} style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                  border: 'none', borderRadius: '14px',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Inter',
                  boxShadow: '0 4px 14px rgba(108,99,255,0.3)', marginBottom: '12px',
                }}>
                  Send Code
                </button>
                <button onClick={() => setShow2FA(false)} style={{
                  width: '100%', padding: '12px', background: 'none', border: 'none',
                  color: colors.textMuted, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter',
                }}>
                  Cancel
                </button>
              </>
            )}

            {step2FA === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
                    Enter OTP
                  </h2>
                  <p style={{ fontSize: '13px', color: colors.textMuted }}>
                    Code sent to {phone}. Enter 123456 for demo.
                  </p>
                </div>
                <div style={{
                  background: colors.inputBg, border: `1px solid ${colors.border}`,
                  borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px',
                }}>
                  <span style={{ fontSize: '18px' }}>🔐</span>
                  <input type="number" placeholder="6-digit code"
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    style={{
                      flex: 1, background: 'none', border: 'none', outline: 'none',
                      color: colors.textPrimary, fontSize: '20px', fontFamily: 'Inter',
                      fontWeight: '700', letterSpacing: '4px',
                    }}
                  />
                </div>
                <button onClick={() => {
                  if (otp === '123456') { setTwoStep(true); setStep2FA(3); }
                }} style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                  border: 'none', borderRadius: '14px',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Inter',
                  boxShadow: '0 4px 14px rgba(108,99,255,0.3)', marginBottom: '12px',
                }}>
                  Verify
                </button>
                <button onClick={() => setStep2FA(1)} style={{
                  width: '100%', padding: '12px', background: 'none', border: 'none',
                  color: colors.textMuted, fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter',
                }}>
                  Back
                </button>
              </>
            )}

            {step2FA === 3 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: colors.textPrimary, marginBottom: '8px' }}>
                  Account Protected!
                </h2>
                <p style={{ fontSize: '14px', color: colors.textMuted, lineHeight: '1.5', marginBottom: '24px' }}>
                  Two-step verification is now enabled 🛡️
                </p>
                <button onClick={() => setShow2FA(false)} style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                  border: 'none', borderRadius: '14px',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Inter',
                  boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
                }}>
                  Done 🎉
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;