import React, { useRef, useState, useEffect } from 'react';
import { IoClose, IoCheckmark, IoColorPaletteOutline } from 'react-icons/io5';
import { MdUndo, MdClear } from 'react-icons/md';

const COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
  '#22c55e', '#06b6d4', '#6C63FF', '#a855f7', '#F72585',
  '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#fb923c',
];

const BRUSHES = [
  { label: 'Pen', size: 4, opacity: 1 },
  { label: 'Marker', size: 14, opacity: 0.7 },
  { label: 'Neon', size: 10, opacity: 0.9, glow: true },
  { label: 'Eraser', size: 24, opacity: 1, eraser: true },
];

function StoryDrawingCanvas({ backgroundSrc, onCancel, onConfirm }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const [color, setColor] = useState('#ffffff');
  const [brushIdx, setBrushIdx] = useState(0);
  const [strokes, setStrokes] = useState([]); // for undo
  const [drawing, setDrawing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const lastPos = useRef(null);
  const currentStrokeRef = useRef([]);

  const brush = BRUSHES[brushIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw(strokes);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const redraw = (strokeList) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeList.forEach((stroke) => drawStroke(ctx, stroke));
  };

  const drawStroke = (ctx, stroke) => {
    if (stroke.points.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over';
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.glow) {
      ctx.shadowColor = stroke.color;
      ctx.shadowBlur = stroke.size * 2;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      const mid = {
        x: (stroke.points[i - 1].x + stroke.points[i].x) / 2,
        y: (stroke.points[i - 1].y + stroke.points[i].y) / 2,
      };
      ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, mid.x, mid.y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    currentStrokeRef.current = [pos];
  };

  const continueDraw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    currentStrokeRef.current.push(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tempStroke = {
      points: currentStrokeRef.current,
      color: brush.eraser ? '#000' : color,
      size: brush.size,
      opacity: brush.opacity,
      eraser: brush.eraser || false,
      glow: brush.glow || false,
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redraw(strokes);
    drawStroke(ctx, tempStroke);
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    setDrawing(false);
    const newStroke = {
      points: [...currentStrokeRef.current],
      color: brush.eraser ? '#000' : color,
      size: brush.size,
      opacity: brush.opacity,
      eraser: brush.eraser || false,
      glow: brush.glow || false,
    };
    const updated = [...strokes, newStroke];
    setStrokes(updated);
    redraw(updated);
    currentStrokeRef.current = [];
  };

  const handleUndo = () => {
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redraw(updated);
  };

  const handleClear = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleConfirm = async () => {
    setProcessing(true);
    const drawCanvas = canvasRef.current;

    const finalCanvas = document.createElement('canvas');
    const W = 720, H = 1280;
    finalCanvas.width = W;
    finalCanvas.height = H;
    const ctx = finalCanvas.getContext('2d');

    if (backgroundSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = backgroundSrc;
      await new Promise((res) => { img.onload = res; });
      ctx.drawImage(img, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.drawImage(drawCanvas, 0, 0, W, H);

    finalCanvas.toBlob((blob) => {
      setProcessing(false);
      const file = new File([blob], 'drawn-story.jpg', { type: 'image/jpeg' });
      onConfirm(file, URL.createObjectURL(blob));
    }, 'image/jpeg', 0.92);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: '#000', display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        canvas { touch-action: none; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'rgba(10,10,18,0.85)', backdropFilter: 'blur(16px)',
        flexShrink: 0, zIndex: 2,
      }}>
        <button onClick={onCancel} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', width: '34px', height: '34px',
          borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IoClose />
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleUndo} disabled={strokes.length === 0} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', width: '34px', height: '34px',
            borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: strokes.length === 0 ? 0.4 : 1,
          }}>
            <MdUndo />
          </button>
          <button onClick={handleClear} disabled={strokes.length === 0} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', width: '34px', height: '34px',
            borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: strokes.length === 0 ? 0.4 : 1,
          }}>
            <MdClear />
          </button>
        </div>
        <button onClick={handleConfirm} disabled={processing} style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none',
          width: '34px', height: '34px', borderRadius: '11px', color: '#fff',
          fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: processing ? 0.6 : 1,
        }}>
          {processing ? (
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <IoCheckmark />
          )}
        </button>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {backgroundSrc && (
          <img
            src={backgroundSrc}
            alt="bg"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', pointerEvents: 'none',
            }}
          />
        )}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            cursor: brush.eraser ? 'cell' : 'crosshair',
          }}
          onMouseDown={startDraw}
          onMouseMove={continueDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={continueDraw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Bottom controls */}
      <div style={{
        background: 'rgba(10,10,18,0.92)', backdropFilter: 'blur(20px)',
        flexShrink: 0, padding: '14px 16px', paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
      }}>
        {/* Brush selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {BRUSHES.map((b, i) => (
            <button key={b.label} onClick={() => setBrushIdx(i)} style={{
              flex: 1, padding: '9px 6px', borderRadius: '12px', border: 'none',
              background: brushIdx === i ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.07)',
              color: brushIdx === i ? '#a855f7' : 'rgba(255,255,255,0.6)',
              fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              boxShadow: brushIdx === i ? '0 0 0 1.5px #a855f7' : 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
            }}>
              <div style={{
                width: b.eraser ? '20px' : `${Math.min(b.size * 1.5, 20)}px`,
                height: b.eraser ? '20px' : `${Math.min(b.size * 1.5, 20)}px`,
                borderRadius: '50%',
                background: b.eraser ? 'rgba(255,255,255,0.2)' : color,
                border: b.eraser ? '2px solid rgba(255,255,255,0.4)' : 'none',
                boxShadow: b.glow ? `0 0 8px ${color}` : 'none',
              }} />
              {b.label}
            </button>
          ))}
        </div>

        {/* Color palette */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
          {COLORS.map((c) => (
            <div key={c} onClick={() => { setColor(c); if (brush.eraser) setBrushIdx(0); }} style={{
              width: color === c ? '30px' : '24px', height: color === c ? '30px' : '24px',
              borderRadius: '50%', background: c, flexShrink: 0,
              border: color === c ? '2px solid #fff' : '2px solid rgba(255,255,255,0.2)',
              boxShadow: color === c ? '0 0 0 2px rgba(168,85,247,0.5)' : 'none',
              cursor: 'pointer', transition: 'all 0.15s',
            }} />
          ))}
          <label style={{
            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
            background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
            border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
          }}>
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); if (brush.eraser) setBrushIdx(0); }}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default StoryDrawingCanvas;