import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

const categories = [
  { id: 1, name: 'Artificial Intelligence', emoji: 'AI', color: '#6C63FF', count: '2.4k reels' },
  { id: 2, name: 'Coding', emoji: 'CD', color: '#00B4D8', count: '3.1k reels' },
  { id: 3, name: 'Cooking', emoji: 'CK', color: '#FB8500', count: '1.8k reels' },
  { id: 4, name: 'UI/UX Design', emoji: 'DS', color: '#F72585', count: '1.2k reels' },
];

function Explore() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(null);

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      paddingTop: '20px',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>
      <div style={{ padding: '16px 20px 0' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Explore
        </h1>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              style={{
                background: colors.bgCard,
                border: `1px solid ${cat.color}44`,
                borderRadius: '16px',
                padding: '18px 16px',
                cursor: 'pointer',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary }}>
                {cat.name}
              </p>
              <p style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                {cat.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Explore;
