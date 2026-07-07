import React from 'react';

function LumoraLogo({ size = 36 }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${size * 0.28}px`,
      background: 'linear-gradient(135deg, #6C63FF 0%, #F72585 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 10px rgba(108,99,255,0.4)',
      flexShrink: 0,
    }}>
      {/* Book + Play — Education meets Social */}
      <svg
        width={size * 0.58}
        height={size * 0.58}
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Open Book */}
        <path
          d="M12 6C12 6 8 4 4 4V18C8 18 12 20 12 20C12 20 16 18 20 18V4C16 4 12 6 12 6Z"
          fill="white"
          opacity="0.9"
        />
        <line x1="12" y1="6" x2="12" y2="20" stroke="rgba(108,99,255,0.6)" strokeWidth="1.5"/>
        {/* Play triangle inside */}
        <path
          d="M7 9L10 11.5L7 14V9Z"
          fill="rgba(108,99,255,0.7)"
        />
        <path
          d="M14 9L17 11.5L14 14V9Z"
          fill="rgba(247,37,133,0.7)"
        />
      </svg>
    </div>
  );
}

export default LumoraLogo;