import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useTheme } from '../ThemeContext';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import { MdCrop, MdTune, MdFilterVintage } from 'react-icons/md';

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

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

async function getEditedImage(imageSrc, pixelCrop, filterCss, brightness, contrast, saturation) {
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

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.92);
  });
}

function ImageEditor({ imageSrc, onCancel, onConfirm }) {
  const { colors, isDark } = useTheme();
  const [tab, setTab] = useState('crop'); // crop | filter | adjust
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(4 / 5);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const activeFilterCss = FILTERS.find((f) => f.name === selectedFilter)?.css || 'none';
  const previewFilter = `${activeFilterCss === 'none' ? '' : activeFilterCss} brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`.trim();

  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : '#f3eeff';
  const chipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108,99,255,0.15)';

  const handleConfirm = async () => {
    setProcessing(true);
    const blob = await getEditedImage(imageSrc, croppedAreaPixels, activeFilterCss, brightness, contrast, saturation);
    setProcessing(false);
    const file = new File([blob], 'edited-photo.jpg', { type: 'image/jpeg' });
    onConfirm(file, URL.createObjectURL(blob));
  };

  const TABS = [
    { key: 'crop', label: 'Crop', icon: <MdCrop /> },
    { key: 'filter', label: 'Filters', icon: <MdFilterVintage /> },
    { key: 'adjust', label: 'Adjust', icon: <MdTune /> },
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
        <span style={{
          fontSize: '15px', fontWeight: '800', color: '#fff',
        }}>
          Edit Photo
        </span>
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
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', background: '#000',
          }}>
            <img
              src={imageSrc}
              alt="preview"
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                filter: previewFilter,
              }}
            />
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
                background: aspect === a.value ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.08)',
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

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '13px', background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              color: tab === t.key ? '#a855f7' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: '18px',
            }}>
              {t.icon}
              <span style={{ fontSize: '10.5px', fontWeight: '700' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;