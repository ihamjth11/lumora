import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';

const allReels = [
  { id: 1, title: 'How AI is changing the world', category: 'AI', author: 'TechWithAli', color: '#6C63FF', emoji: '🤖' },
  { id: 2, title: 'Python in 60 seconds', category: 'Coding', author: 'CodeWithRaj', color: '#00B4D8', emoji: '💻' },
  { id: 3, title: 'Master Biryani at home', category: 'Cooking', author: 'ChefNadia', color: '#FB8500', emoji: '🍳' },
  { id: 4, title: 'UI Design tips that impress', category: 'Design', author: 'DesignByMaya', color: '#F72585', emoji: '🎨' },
  { id: 5, title: 'Learn React in 2 minutes', category: 'Coding', author: 'DevWithSam', color: '#10b981', emoji: '💻' },
  { id: 6, title: 'ChatGPT tricks you must know', category: 'AI', author: 'AIWithZara', color: '#6C63FF', emoji: '🤖' },
  { id: 7, title: 'Perfect rice every time', category: 'Cooking', author: 'ChefKumar', color: '#FB8500', emoji: '🍳' },
  { id: 8, title: 'Figma tips for beginners', category: 'Design', author: 'UXWithLena', color: '#F72585', emoji: '🎨' },
  { id: 9, title: 'JavaScript crash course', category: 'Coding', author: 'CodeWithAmir', color: '#00B4D8', emoji: '💻' },
  { id: 10, title: 'Machine learning basics', category: 'AI', author: 'MLWithRiya', color: '#6C63FF', emoji: '🤖' },
];

const recentSearches = ['AI basics', 'Python', 'Cooking tips', 'React'];
const hotTopics = ['🤖 AI', '💻 Coding', '🍳 Cooking', '🎨 Design', '⚡ Skills', '🔬 Science'];

function Search() {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const filtered = allReels.filter(
      (r) =>
        r.title.toLowerCase().includes(text.toLowerCase()) ||
        r.category.toLowerCase().includes(text.toLowerCase()) ||
        r.author.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div style={{
      paddingBottom: 'var(--bottom-nav-height)',
      paddingTop: '20px',
      minHeight: '100vh',
      background: colors.bgPrimary,
    }}>

      {/* Header */}
      <div style={{ padding: '16px 20px 0' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Search ✦
        </h1>
      </div>

      {/* Search Bar */}
      <div style={{
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        background: colors.bgPrimary,
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: colors.inputBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '14px',
          padding: '12px 16px',
          gap: '10px',
        }}>
          <BiSearch style={{ color: colors.textMuted, fontSize: '20px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search reels, topics, creators..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: colors.textPrimary,
              fontSize: '14px',
              fontFamily: 'Inter',
            }}
          />
          {query && (
            <AiOutlineClose
              onClick={clearSearch}
              style={{ color: colors.textMuted, fontSize: '18px', cursor: 'pointer' }}
            />
          )}
        </div>
      </div>

      {/* Default State */}
      {!searched && (
        <div style={{ padding: '0 20px' }}>

          {/* Recent Searches */}
          <h2 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '12px',
          }}>
            🕐 Recent Searches
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {recentSearches.map((s, i) => (
              <span
                key={i}
                onClick={() => handleSearch(s)}
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Hot Topics */}
          <h2 style={{
            fontSize: '15px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: '12px',
          }}>
            🔥 Hot Topics
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hotTopics.map((t, i) => (
              <span
                key={i}
                onClick={() => handleSearch(t.split(' ')[1])}
                style={{
                  background: `linear-gradient(135deg, #6C63FF22, ${colors.bgCard})`,
                  border: '1px solid #6C63FF44',
                  color: '#6C63FF',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searched && (
        <div style={{ padding: '0 20px' }}>
          <p style={{
            fontSize: '13px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}>
            {results.length} results for "{query}"
          </p>

          {results.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p style={{ color: colors.textMuted, fontSize: '15px' }}>No reels found</p>
              <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '8px' }}>
                Try a different keyword
              </p>
            </div>
          ) : (
            results.map((reel) => (
              <div key={reel.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '10px',
                cursor: 'pointer',
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${reel.color}44, ${reel.color}11)`,
                  border: `1px solid ${reel.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                }}>
                  {reel.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    lineHeight: '1.4',
                  }}>
                    {reel.title}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: colors.textMuted,
                    marginTop: '4px',
                  }}>
                    @{reel.author} · {reel.category}
                  </p>
                </div>
                <span style={{
                  fontSize: '11px',
                  color: reel.color,
                  background: `${reel.color}22`,
                  padding: '3px 10px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  flexShrink: 0,
                }}>
                  {reel.category}
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default Search;