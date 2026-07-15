import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/apiService';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';

const recentSearches = [];
const hotTopics = ['🤖 AI', '💻 Coding', '🍳 Cooking', '🎨 Design', '⚡ Skills', '🔬 Science'];

function Search() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    setLoading(true);
    const res = await searchUsers(text.trim());
    if (res.success) {
      setResults(res.users);
    }
    setLoading(false);
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

      <div style={{ padding: '16px 20px 0' }}>
        <h1 style={{
          fontSize: '24px', fontWeight: '700',
          background: 'linear-gradient(135deg, #6C63FF, #F72585)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Search ✦
        </h1>
      </div>

      <div style={{ padding: '16px 20px', position: 'sticky', top: 0, background: colors.bgPrimary, zIndex: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: colors.inputBg, border: '1px solid ' + colors.border,
          borderRadius: '14px', padding: '12px 16px', gap: '10px',
        }}>
          <BiSearch style={{ color: colors.textMuted, fontSize: '20px', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search creators by name or username..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: colors.textPrimary, fontSize: '14px', fontFamily: 'Inter',
            }}
          />
          {query && (
            <AiOutlineClose onClick={clearSearch} style={{
              color: colors.textMuted, fontSize: '18px', cursor: 'pointer',
            }} />
          )}
        </div>
      </div>

      {!searched && (
        <div style={{ padding: '0 20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: colors.textPrimary, marginBottom: '12px' }}>
            🔥 Hot Topics
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hotTopics.map((t, i) => (
              <span key={i} style={{
                background: 'linear-gradient(135deg, #6C63FF22, ' + colors.bgCard + ')',
                border: '1px solid #6C63FF44', color: '#6C63FF',
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {searched && (
        <div style={{ padding: '0 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                border: '3px solid rgba(108,99,255,0.2)',
                borderTop: '3px solid #6C63FF',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>
                {results.length} results for "{query}"
              </p>

              {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <p style={{ color: colors.textMuted, fontSize: '15px' }}>No users found</p>
                </div>
              ) : (
                results.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate('/u/' + user.username)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: colors.bgCard, border: '1px solid ' + colors.border,
                      borderRadius: '14px', padding: '14px', marginBottom: '10px',
                      cursor: 'pointer',
                    }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: user.photoURL ? 'url(' + user.photoURL + ')' : 'linear-gradient(135deg, #6C63FF, #F72585)',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', flexShrink: 0,
                    }}>
                      {!user.photoURL && (user.avatar || '🧑‍💻')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: colors.textPrimary }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
                        @{user.username}
                      </p>
                      {user.bio ? (
                        <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '3px' }}>
                          {user.bio}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default Search;