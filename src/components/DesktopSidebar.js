import React from 'react';
import LumoraLogo from './LumoraLogo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { AiFillHome, AiOutlineHome } from 'react-icons/ai';
import { MdExplore, MdOutlineExplore } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { RiUser3Line, RiUser3Fill } from 'react-icons/ri';
import { FiSend, FiPlusSquare } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

function DesktopSidebar() {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { route: '/', icon: path === '/' ? <AiFillHome /> : <AiOutlineHome />, label: 'Home' },
    { route: '/explore', icon: path === '/explore' ? <MdExplore /> : <MdOutlineExplore />, label: 'Explore' },
    { route: '/search', icon: <BiSearch />, label: 'Search' },
    { route: '/create', icon: <FiPlusSquare />, label: 'Create' },
    { route: '/messages', icon: <FiSend />, label: 'Messages' },
    { route: '/saved', icon: path === '/saved' ? <BsBookmarkFill /> : <BsBookmark />, label: 'Saved' },
    { route: '/profile', icon: path === '/profile' ? <RiUser3Fill /> : <RiUser3Line />, label: 'Profile' },
    { route: '/founder', icon: <HiSparkles />, label: 'Founder' },
  ];

  return (
    <div className="desktop-sidebar" style={{
      width: '240px',
      minHeight: '100vh',
      background: isDark ? '#111111' : '#ffffff',
      borderRight: `1px solid ${colors.border}`,
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '8px 12px', marginBottom: '24px', cursor: 'pointer',
}} onClick={() => navigate('/')}>
  <LumoraLogo size={36} />
  <span style={{
    fontSize: '22px', fontWeight: '900',
    background: 'linear-gradient(135deg, #6C63FF, #F72585)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.5px',
  }}>
    lumora
  </span>
</div>

      {/* Nav Items */}
      {tabs.map((tab) => (
        <button
          key={tab.route}
          onClick={() => navigate(tab.route)}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 14px', borderRadius: '14px',
            background: path === tab.route
              ? 'linear-gradient(135deg, #6C63FF15, #F7258515)'
              : 'none',
            border: path === tab.route
              ? '1px solid #6C63FF30'
              : '1px solid transparent',
            color: path === tab.route ? '#6C63FF' : colors.textSecondary,
            fontSize: '22px', cursor: 'pointer',
            transition: 'all 0.2s', width: '100%',
            textAlign: 'left',
          }}
        >
          {tab.icon}
          <span style={{
            fontSize: '15px', fontWeight: path === tab.route ? '700' : '500',
            fontFamily: 'Inter', color: path === tab.route ? '#6C63FF' : colors.textSecondary,
          }}>
            {tab.label}
          </span>
        </button>
      ))}

      {/* Bottom — Founder card */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <div
          onClick={() => navigate('/founder')}
          style={{
            background: 'linear-gradient(135deg, #6C63FF, #F72585)',
            borderRadius: '16px', padding: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108,99,255,0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px',
            }}>
              🧑‍💻
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                Hamjath
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                Founder · Lumora
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopSidebar;