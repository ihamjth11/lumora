import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useTheme } from '../ThemeContext';
import { IoClose, IoCheckmark, IoTrash } from 'react-icons/io5';
import { MdCrop, MdTune, MdFilterVintage, MdTextFields, MdEmojiEmotions } from 'react-icons/md';

const ASPECTS = [
  { label: 'Original', value: null },
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:9', value: 16 / 9 },
];

const FILTERS = [
  { name: 'Normal', css: 'none' },
  { name: 'Clarendon', css: 'contrast(1.2) saturate(1.35) brightness(1.05)' },
  { name: 'Vivid', css: 'saturate(1.6) contrast(1.1)' },
  { name: 'Mono', css: 'grayscale(1) contrast(1.1)' },
  { name: 'Warm', css: 'sepia(0.3) saturate(1.3) hue-rotate(-10deg)' },
  { name: 'Cool', css: 'saturate(1.1) hue-rotate(15deg) brightness(1.03)' },
  { name: 'Fade', css: 'contrast(0.85) brightness(1.1) saturate(0.75)' },
  { name: 'Noir', css: 'grayscale(1) contrast(1.3) brightness(0.9)' },
];

const TEXT_COLORS = ['#ffffff', '#000000', '#ef4444', '#f59e0b', '#10b981', '#6C63FF', '#F72585', '#fbbf24'];
const STICKERS = ['❤️', '🔥', '✨', '😂', '😍', '👍', '🎉', '💯', '🙌', '⭐', '💜', '🌟', '😎', '🥳', '👏', '💪'];

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

async function getEditedImage(imageSrc, pixelCrop, filterCss, brightness, contrast, saturation, overlays) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const cropW = pixelCrop ? pixelCrop.width : image.width;
  const cropH = pixelCrop ? pixelCrop.height : image.height;
  canvas.width = cropW;
  canvas.height = cropH;

  const combinedFilter = `${filterCss === 'none' ? '' : filterCss} brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
  ctx.filter = combinedFilter.trim();

  if (pixelCrop) {
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      0, 0, cropW, cropH
    );
  } else {
    ctx.drawImage(image, 0, 0);
  }

  // Reset filter before drawing overlays so they aren't affected by photo filter
  ctx.filter = 'none';

  overlays.forEach((ov) => {
    const px = (ov.xPct / 100) * cropW;
    const py = (ov.yPct / 100) * cropH;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((ov.rotation || 0) * Math.PI / 180);
    ctx.scale(ov.scale || 1, ov.scale || 1);

    if (ov.type === 'text') {
      const fontSize = Math.round(cropW * 0.06);
      ctx.font = `800 ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = ov.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = fontSize * 0.08;
      ctx.fillText(ov.content, 0, 0);
    } else {
      const fontSize = Math.round(cropW * 0.14);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ov.content, 0, 0);
    }
    ctx.restore();
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

function ImageEditor({ imageSrc, onCancel, onConfirm }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('crop'); // crop | filter | adjust | text | stickers
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 5);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [processing, setProcessing] = useState(false);

  const [overlays, setOverlays] = useState([]); // { id, type, content, xPct, yPct, scale, rotation, color }
  const [activeOverlayId, setActiveOverlayId] = useState(null);
  const [textDraft, setTextDraft] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const dragRef = useRef(null); // { id, startX, startY, startXPct, startYPct }
  const stageRef = useRef(null);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const activeFilterCss = FILTERS.find((f) => f.name === selectedFilter)?.css || 'none';
  const previewFilter = `${activeFilterCss === 'none' ? '' : activeFilterCss} brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`.trim();

  const addTextOverlay = () => {
    if (!textDraft.trim()) return;
    const id = Date.now().toString();
    setOverlays((prev) => [...prev, {
      id, type: 'text', content: textDraft.trim(), xPct: 50, yPct: 50, scale: 1, rotation: 0, color: textColor,
    }]);
    setTextDraft('');
    setActiveOverlayId(id);
  };

  const addSticker = (emoji) => {
    const id = Date.now().toString();
    setOverlays((prev) => [...prev, {
      id, type: 'sticker', content: emoji, xPct: 50, yPct: 50, scale: 1, rotation: 0,
    }]);
    setActiveOverlayId(id);
  };

  const removeActiveOverlay = () => {
    setOverlays((prev) => prev.filter((o) => o.id !== activeOverlayId));
    setActiveOverlayId(null);
  };

  const handlePointerDown = (e, ov) => {
    e.stopPropagation();
    setActiveOverlayId(ov.id);
    const stage = stageRef.current.getBoundingClientRect();
    dragRef.current = {
      id: ov.id,
      stageW: stage.width, stageH: stage.height, stageLeft: stage.left, stageTop: stage.top,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { id, stageW, stageH, stageLeft, stageTop } = dragRef.current;
    let xPct = ((e.clientX - stageLeft) / stageW) * 100;
    let yPct = ((e.clientY - stageTop) / stageH) * 100;
    xPct = Math.max(0, Math.min(100, xPct));
    yPct = Math.max(0, Math.min(100, yPct));
    setOverlays((prev) => prev.map((o) => o.id === id ? { ...o, xPct, yPct } : o));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  const adjustActiveScale = (delta) => {
    setOverlays((prev) => prev.map((o) => o.id === activeOverlayId ? { ...o, scale: Math.max(0.4, Math.min(3, (o.scale || 1) + delta)) } : o));
  };

  const chipBg = 'rgba(255,255,255,0.08)';

  const handleConfirm = async () => {
    setProcessing(true);
    const blob = await getEditedImage(imageSrc, croppedAreaPixels, activeFilterCss, brightness, contrast, saturation, overlays);
    setProcessing(false);
    const file = new File([blob], 'edited-photo.jpg', { type: 'image/jpeg' });
    onConfirm(file, URL.createObjectURL(blob));
  };

  const TABS = [
    { key: 'crop', label: 'Crop', icon: <MdCrop /> },
    { key: 'filter', label: 'Filters', icon: <MdFilterVintage /> },
    { key: 'adjust', label: 'Adjust', icon: <MdTune /> },
    { key: 'text', label: 'Text', icon: <MdTextFields /> },
    { key: 'stickers', label: 'Stickers', icon: <MdEmojiEmotions /> },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: '#000', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', background: 'rgba(10,10,18,0.9)', backdropFilter: 'blur(16px)',
        flexShrink: 0,
      }}>
        <button onClick={onCancel} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', width: '34px', height: '34px',
          borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IoClose />
        </button>
        <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Edit Photo</span>
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {tab === 'crop' ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            style={{
              containerStyle: { background: '#000' },
              mediaStyle: { filter: previewFilter },
            }}
          />
        ) : (
          <div
            ref={stageRef}
            onClick={() => setActiveOverlayId(null)}
            style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', background: '#000',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <img
              src={imageSrc}
              alt="preview"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: previewFilter, pointerEvents: 'none' }}
            />
            {overlays.map((ov) => (
              <div
                key={ov.id}
                onPointerDown={(e) => handlePointerDown(e, ov)}
                style={{
                  position: 'absolute',
                  left: `${ov.xPct}%`, top: `${ov.yPct}%`,
                  transform: `translate(-50%, -50%) rotate(${ov.rotation || 0}deg) scale(${ov.scale || 1})`,
                  cursor: 'grab', userSelect: 'none', touchAction: 'none',
                  border: activeOverlayId === ov.id ? '2px dashed rgba(168,85,247,0.8)' : '2px dashed transparent',
                  padding: '4px 8px', borderRadius: '8px',
                }}
              >
                {ov.type === 'text' ? (
                  <span style={{
                    fontSize: '28px', fontWeight: '800', color: ov.color,
                    textShadow: '0 2px 6px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
                  }}>
                    {ov.content}
                  </span>
                ) : (
                  <span style={{ fontSize: '48px', lineHeight: 1 }}>{ov.content}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div style={{
        background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(20px)',
        flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tab === 'crop' && (
          <div style={{ display: 'flex', gap: '8px', padding: '14px 16px', overflowX: 'auto' }}>
            {ASPECTS.map((a) => (
              <button key={a.label} onClick={() => setAspect(a.value)} style={{
                padding: '8px 16px', borderRadius: '20px', flexShrink: 0,
                background: aspect === a.value ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : chipBg,
                border: 'none', color: '#fff', fontSize: '12.5px', fontWeight: '700',
                cursor: 'pointer', fontFamily: 'Inter',
              }}>
                {a.label}
              </button>
            ))}
          </div>
        )}

        {tab === 'filter' && (
          <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', overflowX: 'auto' }}>
            {FILTERS.map((f) => (
              <div key={f.name} onClick={() => setSelectedFilter(f.name)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                cursor: 'pointer', flexShrink: 0,
              }}>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '14px', overflow: 'hidden',
                  border: selectedFilter === f.name ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: selectedFilter === f.name ? '0 0 0 3px rgba(168,85,247,0.25)' : 'none',
                }}>
                  <img src={imageSrc} alt={f.name} style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    filter: f.css === 'none' ? 'none' : f.css,
                  }} />
                </div>
                <span style={{ fontSize: '10.5px', color: selectedFilter === f.name ? '#a855f7' : 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                  {f.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'adjust' && (
          <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Brightness', value: brightness, setter: setBrightness, min: 0.5, max: 1.5 },
              { label: 'Contrast', value: contrast, setter: setContrast, min: 0.5, max: 1.5 },
              { label: 'Saturation', value: saturation, setter: setSaturation, min: 0, max: 2 },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12.5px', color: '#fff', fontWeight: '600' }}>{s.label}</span>
                  <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>{Math.round((s.value - 1) * 100)}</span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} step={0.01}
                  value={s.value} onChange={(e) => s.setter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#a855f7' }}
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'text' && (
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value.slice(0, 60))}
                placeholder="Type text..."
                style={{
                  flex: 1, background: chipBg, border: 'none', borderRadius: '12px',
                  padding: '10px 14px', color: '#fff', fontSize: '13px', outline: 'none', fontFamily: 'Inter',
                }}
              />
              <button onClick={addTextOverlay} style={{
                padding: '10px 18px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff',
                fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
              }}>
                Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TEXT_COLORS.map((c) => (
                <div key={c} onClick={() => setTextColor(c)} style={{
                  width: '26px', height: '26px', borderRadius: '50%', background: c,
                  border: textColor === c ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer', flexShrink: 0,
                }} />
              ))}
            </div>
            {activeOverlayId && overlays.find(o => o.id === activeOverlayId)?.type === 'text' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => adjustActiveScale(-0.15)} style={{ ...pillBtnStyle }}>A-</button>
                <button onClick={() => adjustActiveScale(0.15)} style={{ ...pillBtnStyle }}>A+</button>
                <button onClick={removeActiveOverlay} style={{ ...pillBtnStyle, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IoTrash /> Remove
                </button>
              </div>
            )}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Drag the text on the photo to reposition it.</p>
          </div>
        )}

        {tab === 'stickers' && (
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {STICKERS.map((emoji) => (
                <button key={emoji} onClick={() => addSticker(emoji)} style={{
                  width: '42px', height: '42px', borderRadius: '12px', background: chipBg,
                  border: 'none', fontSize: '22px', cursor: 'pointer',
                }}>
                  {emoji}
                </button>
              ))}
            </div>
            {activeOverlayId && overlays.find(o => o.id === activeOverlayId)?.type === 'sticker' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => adjustActiveScale(-0.15)} style={{ ...pillBtnStyle }}>Smaller</button>
                <button onClick={() => adjustActiveScale(0.15)} style={{ ...pillBtnStyle }}>Bigger</button>
                <button onClick={removeActiveOverlay} style={{ ...pillBtnStyle, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IoTrash /> Remove
                </button>
              </div>
            )}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Tap a sticker to add it, then drag on the photo.</p>
          </div>
        )}

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, minWidth: '64px', padding: '12px 6px', background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              color: tab === t.key ? '#a855f7' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '17px',
            }}>
              {t.icon}
              <span style={{ fontSize: '10px', fontWeight: '700' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const pillBtnStyle = {
  padding: '8px 14px', borderRadius: '20px', border: 'none',
  background: 'rgba(255,255,255,0.08)', color: '#fff',
  fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter',
};

export default ImageEditor;