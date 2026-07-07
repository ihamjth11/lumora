import React, { useState } from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BsBookmarkFill, BsBookmark } from 'react-icons/bs';
import { FiShare2 } from 'react-icons/fi';

function ReelCard({ reel, onSave }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(reel.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      scrollSnapAlign: 'start',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${reel.color}22, #0a0a0a 60%)`,
      borderBottom: '1px solid #1a1a1a',
    }}>

      {/* Category Badge */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        background: reel.color,
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '0.5px',
      }}>
        {reel.category}
      </div>

      {/* Center Visual */}
      <div style={{
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${reel.color}44, ${reel.color}11)`,
        border: `2px solid ${reel.color}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '64px',
      }}>
        {reel.category === 'AI' && '🤖'}
        {reel.category === 'Coding' && '💻'}
        {reel.category === 'Cooking' && '🍳'}
        {reel.category === 'Design' && '🎨'}
        {reel.category === 'Skills' && '⚡'}
      </div>

      {/* Bottom Info */}
      <div style={{
        position: 'absolute',
        bottom: '90px',
        left: '20px',
        right: '80px',
      }}>
        {/* Author */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}>
          <img
            src={reel.avatar}
            alt={reel.author}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `2px solid ${reel.color}`,
              background: '#1a1a1a',
            }}
          />
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
          }}>
            @{reel.author}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#ffffff',
          lineHeight: '1.4',
          marginBottom: '8px',
        }}>
          {reel.title}
        </h2>

        {/* Progress Bar */}
        <div style={{
          height: '2px',
          background: '#27272a',
          borderRadius: '2px',
          marginTop: '12px',
        }}>
          <div style={{
            width: '60%',
            height: '100%',
            background: reel.color,
            borderRadius: '2px',
          }} />
        </div>
      </div>

      {/* Right Action Buttons */}
      <div style={{
        position: 'absolute',
        right: '16px',
        bottom: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Like */}
        <button onClick={handleLike} style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: liked ? '#ef4444' : '#ffffff',
          fontSize: '28px',
          transition: 'transform 0.2s',
          transform: liked ? 'scale(1.2)' : 'scale(1)',
        }}>
          {liked ? <AiFillHeart /> : <AiOutlineHeart />}
          <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
            {likes.toLocaleString()}
          </span>
        </button>

        {/* Save */}
        <button onClick={() => onSave(reel.id)} style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: reel.saved ? '#a855f7' : '#ffffff',
          fontSize: '26px',
          transition: 'transform 0.2s',
          transform: reel.saved ? 'scale(1.2)' : 'scale(1)',
        }}>
          {reel.saved ? <BsBookmarkFill /> : <BsBookmark />}
          <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Save</span>
        </button>

        {/* Share */}
        <button style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          color: '#ffffff',
          fontSize: '24px',
        }}>
          <FiShare2 />
          <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Share</span>
        </button>
      </div>
    </div>
  );
}

export default ReelCard;