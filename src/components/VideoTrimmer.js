import React, { useState, useRef, useEffect } from 'react';
import { IoClose, IoCheckmark, IoPlay, IoPause } from 'react-icons/io5';

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function VideoTrimmer({ videoSrc, onCancel, onConfirm }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const MAX_DURATION = 60; // cap reel length at 60s

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoaded = () => {
      const d = video.duration;
      setDuration(d);
      setEnd(Math.min(d, MAX_DURATION));
    };
    video.addEventListener('loadedmetadata', handleLoaded);
    return () => video.removeEventListener('loadedmetadata', handleLoaded);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.currentTime >= end) {
        video.currentTime = start;
        if (!playing) video.pause();
      }
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [start, end, playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      if (video.currentTime < start || video.currentTime >= end) video.currentTime = start;
      video.play();
      setPlaying(true);
    }
  };

  const handleStartChange = (val) => {
    const v = Math.min(Number(val), end - 0.5);
    setStart(Math.max(0, v));
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, v);
  };

  const handleEndChange = (val) => {
    const maxEnd = Math.min(duration, start + MAX_DURATION);
    const v = Math.max(Number(val), start + 0.5);
    setEnd(Math.min(maxEnd, v));
  };

  const handleExport = async () => {
    const video = videoRef.current;
    if (!video) return;
    setExporting(true);
    setExportProgress(0);
    video.pause();
    setPlaying(false);

    try {
      const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const finished = new Promise((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      });

      video.currentTime = start;
      video.muted = false;

      await new Promise((res) => {
        const onSeeked = () => { video.removeEventListener('seeked', onSeeked); res(); };
        video.addEventListener('seeked', onSeeked);
      });

      recorder.start();
      video.play();

      const trimLen = end - start;
      const progressInterval = setInterval(() => {
        const pct = Math.min(100, ((video.currentTime - start) / trimLen) * 100);
        setExportProgress(pct);
        if (video.currentTime >= end) {
          clearInterval(progressInterval);
          video.pause();
          recorder.stop();
        }
      }, 100);

      const blob = await finished;
      clearInterval(progressInterval);
      setExporting(false);

      const file = new File([blob], 'trimmed-video.webm', { type: 'video/webm' });
      onConfirm(file, URL.createObjectURL(blob));
    } catch (err) {
      setExporting(false);
      alert('Trim failed: ' + err.message + '. Your browser may not support video trimming — try uploading a pre-trimmed clip instead.');
    }
  };

  const trimmedLength = end - start;
  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;

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
        <button onClick={onCancel} disabled={exporting} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', width: '34px', height: '34px',
          borderRadius: '11px', color: '#fff', fontSize: '18px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: exporting ? 0.5 : 1,
        }}>
          <IoClose />
        </button>
        <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>Trim Video</span>
        <button onClick={handleExport} disabled={exporting} style={{
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'none',
          width: '34px', height: '34px', borderRadius: '11px', color: '#fff',
          fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: exporting ? 0.6 : 1,
        }}>
          {exporting ? (
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <IoCheckmark />
          )}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Video preview */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 0 }}>
        <video
          ref={videoRef}
          src={videoSrc}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          playsInline
        />
        <button onClick={togglePlay} style={{
          position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '26px', cursor: 'pointer',
        }}>
          {playing ? <IoPause /> : <IoPlay style={{ marginLeft: '3px' }} />}
        </button>

        {exporting && (
          <div style={{
            position: 'absolute', bottom: '20px', left: '20px', right: '20px',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            borderRadius: '14px', padding: '12px 16px',
          }}>
            <p style={{ color: '#fff', fontSize: '12.5px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
              Trimming... {Math.round(exportProgress)}%
            </p>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${exportProgress}%`,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)', transition: 'width 0.1s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Trim scrubber */}
      <div style={{
        background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(20px)',
        flexShrink: 0, padding: '18px 16px', paddingBottom: 'calc(18px + env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: '700' }}>
            Selected: {trimmedLength.toFixed(1)}s {trimmedLength >= MAX_DURATION ? '(max)' : ''}
          </span>
        </div>

        {/* Visual timeline */}
        <div style={{ position: 'relative', height: '44px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '14px', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${startPct}%`, width: `${endPct - startPct}%`,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(168,85,247,0.35))',
            border: '2px solid #a855f7', borderRadius: '8px',
          }} />
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${duration ? (currentTime / duration) * 100 : 0}%`,
            width: '2px', background: '#fff',
          }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Start: {formatTime(start)}</label>
          <input
            type="range" min={0} max={duration || 0} step={0.1}
            value={start}
            onChange={(e) => handleStartChange(e.target.value)}
            style={{ width: '100%', accentColor: '#a855f7' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>End: {formatTime(end)}</label>
          <input
            type="range" min={0} max={duration || 0} step={0.1}
            value={end}
            onChange={(e) => handleEndChange(e.target.value)}
            style={{ width: '100%', accentColor: '#a855f7' }}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoTrimmer;