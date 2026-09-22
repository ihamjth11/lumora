import React, { useState } from 'react';
import { IoClose, IoCheckmark, IoHelpCircleOutline, IoStatsChartOutline } from 'react-icons/io5';

function StoryInteractionCreator({ onCancel, onConfirm }) {
  const [type, setType] = useState('poll');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('Yes');
  const [optionB, setOptionB] = useState('No');

  const handleConfirm = () => {
    if (!question.trim()) return;
    onConfirm({
      type,
      question: question.trim(),
      options: type === 'poll' ? [optionA.trim() || 'Yes', optionB.trim() || 'No'] : [],
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'linear-gradient(180deg, #1a1030, #0d0a1a)',
        borderRadius: '28px 28px 0 0',
        padding: '24px 20px 32px',
        border: '1px solid rgba(168,85,247,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Type toggle */}
        <div style={{
          display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '5px', marginBottom: '20px',
        }}>
          {[
            { key: 'poll', label: 'Poll', icon: <IoStatsChartOutline /> },
            { key: 'question', label: 'Question', icon: <IoHelpCircleOutline /> },
          ].map((t) => (
            <button key={t.key} onClick={() => setType(t.key)} style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
              background: type === t.key ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent',
              color: type === t.key ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: type === t.key ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Question input */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            {type === 'poll' ? 'Poll Question' : 'Ask a Question'}
          </label>
          <input
            autoFocus
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, 100))}
            placeholder={type === 'poll' ? 'Which do you prefer?' : 'Ask your followers...'}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '14px', padding: '12px 16px', color: '#fff',
              fontSize: '14px', outline: 'none', fontFamily: 'Inter',
            }}
          />
        </div>

        {/* Poll options */}
        {type === 'poll' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input
              type="text"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value.slice(0, 30))}
              placeholder="Option A"
              style={{
                flex: 1, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.35)',
                borderRadius: '12px', padding: '10px 14px', color: '#fff',
                fontSize: '13px', outline: 'none', fontFamily: 'Inter', textAlign: 'center', fontWeight: '700',
              }}
            />
            <input
              type="text"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value.slice(0, 30))}
              placeholder="Option B"
              style={{
                flex: 1, background: 'rgba(247,37,133,0.15)', border: '1px solid rgba(247,37,133,0.35)',
                borderRadius: '12px', padding: '10px 14px', color: '#fff',
                fontSize: '13px', outline: 'none', fontFamily: 'Inter', textAlign: 'center', fontWeight: '700',
              }}
            />
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '13px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)', fontWeight: '700',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter',
          }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={!question.trim()} style={{
            flex: 1, padding: '13px', borderRadius: '14px', border: 'none',
            background: question.trim() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.08)',
            color: question.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: '700',
            fontSize: '13px', cursor: question.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Inter',
            boxShadow: question.trim() ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
          }}>
            Add to Story
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoryInteractionCreator;