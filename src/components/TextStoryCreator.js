import React, { useState, useRef } from 'react';
import { IoClose, IoCheckmark, IoLocationOutline } from 'react-icons/io5';
import { MdTextFields, MdGradient } from 'react-icons/md';

const GRADIENTS = [
  ['#6C63FF', '#F72585'],
  ['#7c3aed', '#ec4899'],
  ['#0ea5e9', '#22c55e'],
  ['#f97316', '#ef4444'],
  ['#14b8a6', '#0ea5e9'],
  ['#a855f7', '#6C63FF'],
  ['#f59e0b', '#ec4899'],
  ['#1e293b', '#0f172a'],
  ['#22c55e', '#84cc16'],
  ['#ec4899', '#f43f5e'],
];

const TEXT_COLORS = ['#ffffff', '#000000', '#fbbf24', '#f87171', '#34d399', '#60a5fa'];

function TextStoryCreator({ onCancel, onConfirm }) {
  const [text, setText] = useState('');
  const [gradientIdx, setGradientIdx] = useState(0);
  const [textColor, setTextColor] = useState('#ffffff');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stageRef = useRef(null);

  const gradient = GRADIENTS[gradientIdx];

  const cycleGradient = () => {
    setGradientIdx((i) => (i + 1) % GRADIENTS.length);
  };

  const handleConfirm = async () => {
    if (!text.trim()) return;
    setProcessing(true);

    const canvas = document.createElement('canvas');
    const W = 720, H = 1280;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, gradient[0]);
    grad.addColorStop(1, gradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Word-wrap text
    ctx.fillStyle = textColor;
    ctx.font = '800 56px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;

    const words = text.trim().split(' ');
    const lines = [];
    let line = '';
    const maxWidth = W - 100;
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);

    const lineHeight = 68;
    const totalHeight = lines.length * lineHeight;
    const startY = H / 2 - totalHeight / 2 + lineHeight / 2;
    lines.forEach((l, i) => {
      ctx.fillText(l, W / 2, startY + i * lineHeight);
    });

    if (location.trim()) {
      ctx.font = '700 28px Inter, sans-serif';
      ctx.shadowBlur = 4;
      ctx.fillText(`📍 ${location.trim()}`, W / 2, H - 120);
    }

    canvas.toBlob((blob) => {
      setProcessing(false);
      const file = new File([blob], 'text-story.jpg', { type: 'image/jpeg' });
      onConfirm(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      background: `linear-gradient(160deg, ${gradient[0]}, ${gradient[1]})`,
      transition: 'background 0.3s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', flexShrink: 0,
      }}>
        <button onClick={onCancel} style={{
          background: 'rgba(0,0,0,0.25)', border: 'none', width: '34px', height: '34px',
          borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IoClose />
        </button>
        <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Text Story</span>
        <button onClick={handleConfirm} disabled={!text.trim() || processing} style={{
          background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: 'none',
          width: '34px', height: '34px', borderRadius: '11px', color: '#fff',
          fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: (!text.trim() || processing) ? 0.5 : 1,
        }}>
          {processing ? (
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <IoCheckmark />
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Text stage */}
      <div ref={stageRef} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '30px', position: 'relative',
      }}>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 200))}
          placeholder="Start typing..."
          rows={4}
          style={{
            width: '100%', maxWidth: '340px', background: 'transparent', border: 'none', outline: 'none',
            resize: 'none', textAlign: 'center', color: textColor,
            fontSize: '32px', fontWeight: '800', fontFamily: 'Inter, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        />

        {location.trim() && (
          <div style={{
            position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)', borderRadius: '20px',
            padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <IoLocationOutline style={{ color: '#fff', fontSize: '14px' }} />
            <span style={{ color: '#fff', fontSize: '12.5px', fontWeight: '700' }}>{location.trim()}</span>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{ padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        {showLocationInput && (
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '12px',
            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '10px 14px',
          }}>
            <IoLocationOutline style={{ color: '#fff', fontSize: '18px' }} />
            <input
              autoFocus
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value.slice(0, 40))}
              placeholder="Add location..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: '13.5px', fontFamily: 'Inter',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto' }}>
          {TEXT_COLORS.map((c) => (
            <div key={c} onClick={() => setTextColor(c)} style={{
              width: '28px', height: '28px', borderRadius: '50%', background: c, flexShrink: 0,
              border: textColor === c ? '2px solid #fff' : '2px solid rgba(255,255,255,0.3)',
              boxShadow: textColor === c ? '0 0 0 2px rgba(255,255,255,0.3)' : 'none',
              cursor: 'pointer',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={cycleGradient} style={{
            flex: 1, padding: '13px', borderRadius: '16px', border: 'none',
            background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
            color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}>
            <MdGradient style={{ fontSize: '17px' }} /> Background
          </button>
          <button onClick={() => setShowLocationInput(!showLocationInput)} style={{
            flex: 1, padding: '13px', borderRadius: '16px', border: 'none',
            background: showLocationInput ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
            color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          }}>
            <IoLocationOutline style={{ fontSize: '17px' }} /> Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default TextStoryCreator;