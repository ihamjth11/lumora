import React from 'react';
import { useTheme } from '../ThemeContext';
import { AiOutlinePlus } from 'react-icons/ai';

function Stories() {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '12px 16px',
      overflowX: 'auto',
      background: colors.bgSecondary,
      borderBottom: `1px solid ${colors.border}`,
    }}>
      {/* Your Story */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '6px',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '50%',
          background: colors.storyBg,
          border: `2px dashed #6C63FF`,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '26px',
          position: 'relative',
        }}>
          🧑‍💻
          <div style={{
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
    </div>
  );
}

export default Stories;