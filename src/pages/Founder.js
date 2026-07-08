import React from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { MdVerified } from 'react-icons/md';
import { FiLinkedin } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { AiFillHeart } from 'react-icons/ai';

function Founder() {
  const { colors } = useTheme();
  const navigate = useNavigate();

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
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none',
          color: colors.textPrimary, fontSize: '22px',
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center',
        }}>
          <IoArrowBack />
        </button>
        <span style={{
          fontSize: '17px', fontWeight: '800',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Founder
        </span>
      </div>

      {/* Hero Card */}
      <div style={{
        margin: '16px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #6C63FF, #F72585)',
        padding: '40px 24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(108,99,255,0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '16px', right: '20px',
          fontSize: '40px', opacity: 0.15,
        }}>✦</div>
        <div style={{
          position: 'absolute', bottom: '16px', left: '20px',
          fontSize: '28px', opacity: 0.15,
        }}>✦</div>

        {/* Avatar */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '3px solid rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '46px',
          margin: '0 auto 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          🧑‍💻
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px', marginBottom: '8px',
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff' }}>
            Hamjath
          </h1>
          <MdVerified style={{ color: '#fff', fontSize: '24px' }} />
        </div>

        <p style={{
          fontSize: '15px', color: 'rgba(255,255,255,0.85)',
          fontWeight: '600', marginBottom: '6px',
        }}>
          Software Engineering
        </p>
        <p style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.65)',
          marginBottom: '24px',
        }}>
          🇱🇰 Sri Lanka
        </p>

        {/* Social Links */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '12px',
        }}>
          {[
            { icon: <FiLinkedin />, label: 'LinkedIn' },
          ].map((s, i) => (
            <button key={i} style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: '14px', padding: '10px 20px',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', color: '#fff',
              fontSize: '18px', fontFamily: 'Inter',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
            }}>
              {s.icon}
              <span style={{ fontSize: '13px', fontWeight: '700' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div style={{
        margin: '0 16px 16px',
        background: colors.bgCard,
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        padding: '22px',
        boxShadow: colors.shadow,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', marginBottom: '14px',
        }}>
          <HiSparkles style={{ color: '#6C63FF', fontSize: '18px' }} />
          <h2 style={{
            fontSize: '15px', fontWeight: '800',
            color: colors.textPrimary,
          }}>
            About
          </h2>
        </div>
        <p style={{
          fontSize: '14px', color: colors.textSecondary,
          lineHeight: '1.8',
        }}>
          Hi, I'm <strong style={{ color: '#6C63FF' }}>Hamjath</strong> — a passionate
          Software Engineer from 🇱🇰 Sri Lanka. I created{' '}
          <strong style={{ color: '#F72585' }}>Lumora</strong> with one mission:
          to make education social, engaging, and accessible for everyone.
          Learning should feel as exciting as scrolling your feed. ✨
        </p>
      </div>

      {/* Lumora Mission */}
      <div style={{
        margin: '0 16px 16px',
        background: 'linear-gradient(135deg, #6C63FF12, #F7258512)',
        borderRadius: '20px',
        border: '1px solid #6C63FF25',
        padding: '22px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', marginBottom: '14px',
        }}>
          <HiSparkles style={{ color: '#F72585', fontSize: '18px' }} />
          <h2 style={{
            fontSize: '15px', fontWeight: '800',
            color: colors.textPrimary,
          }}>
            Why Lumora?
          </h2>
        </div>
        <p style={{
          fontSize: '14px', color: colors.textSecondary,
          lineHeight: '1.8',
        }}>
          Social media is powerful — but it's mostly entertainment.
          Lumora flips the script. Every reel, every post, every moment
          on Lumora is designed to teach you something new.
          <strong style={{ color: '#6C63FF' }}> Learn in moments.</strong> 🚀
        </p>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '20px 16px',
        color: colors.textMuted, fontSize: '13px',
      }}>
        Made with <AiFillHeart style={{
          color: '#F72585', fontSize: '14px',
          verticalAlign: 'middle',
        }} /> by Hamjath · Lumora ✦
      </div>

    </div>
  );
}

export default Founder;