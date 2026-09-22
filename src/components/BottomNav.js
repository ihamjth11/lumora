import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import useIsDesktop from '../hooks/useIsDesktop';
import { AiFillHome, AiOutlineHome } from 'react-icons/ai';
import { MdExplore, MdOutlineExplore } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { RiUser3Line, RiUser3Fill } from 'react-icons/ri';
import { FiBell } from 'react-icons/fi';
import { getNotifications } from '../services/apiService';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const { colors } = useTheme();
  const isDesktop = useIsDesktop();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const res = await getNotifications();
      if (res.success) setUnreadCount(res.unreadCount);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isDesktop) return null;

  const tabs = [
    { route: '/', icon: path === '/' ? <AiFillHome /> : <AiOutlineHome />, label: 'Home' },
    { route: '/explore', icon: path === '/explore' ? <MdExplore /> : <MdOutlineExplore />, label: 'Explore' },
    { route: '/search', icon: <BiSearch />, label: 'Search' },
    {
      route: '/notifications',
      icon: <FiBell />,
      label: 'Activity',
      badge: unreadCount,
    },
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
          onClick={() => {
            navigate(tab.route);
            if (tab.route === '/notifications') setUnreadCount(0);
          }}
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
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {tab.icon}
            {tab.badge > 0 && (
              <div style={{
                position: 'absolute', top: '-6px', right: '-8px',
                background: 'linear-gradient(135deg, #6C63FF, #F72585)',
                borderRadius: '20px',
                minWidth: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>
                <span style={{ color: '#fff', fontSize: '9px', fontWeight: '800' }}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              </div>
            )}
          </div>
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