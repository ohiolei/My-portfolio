import { useState, useRef } from 'react';

export default function Card3DTilt({
  children,
  className = '',
  maxTilt = 8,
  glare = true,
  onClick
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({
        opacity: 0.25,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
        transition: 'opacity 0.15s ease-out'
      });
    }
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.4s ease-out'
    });
  };

  return (
    <div
      ref={cardRef}
      className={`card-3d-tilt ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {children}
      {glare && (
        <div
          className="glare-overlay"
          style={{
            ...glareStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 10
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
