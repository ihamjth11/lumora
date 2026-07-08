import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { AiFillHome, AiOutlineHome } from 'react-icons/ai';
import { MdExplore, MdOutlineExplore } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { RiUser3Line, RiUser3Fill } from 'react-icons/ri';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { colors } = useTheme();

  const tabs = [
    { route: '/', icon: path === '/' ? <AiFillHome /> : <AiOutlineHome />, label: 'Home' },
    { route: '/explore', icon: path === '/explore' ? <MdExplore /> : <MdOutlineExplore />, label: 'Explore' },
    { route: '/search', icon: <BiSearch />, label: 'Search' },
    { route: '/saved', icon: path === '/saved' ? <BsBookmarkFill /> : <BsBookmark />, label: 'Saved' },
    { route: '/profile', icon: path === '/profile' ? <RiUser3Fill /> : <RiUser3Line />, label: 'Profile' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: 'var(--bottom-nav-height)',
      background: colors.navBg,
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.route}
          onClick={() => navigate(tab.route)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: path === tab.route ? '#6C63FF' : colors.textMuted,
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px 12px',
          }}
        >
          {tab.icon}
          <span style={{
            fontSize: '10px',
            fontFamily: 'Inter',
            fontWeight: path === tab.route ? '700' : '500',
          }}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
