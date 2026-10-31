import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPosition({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target;
      if (
        target &&
        (target.closest('a') ||
          target.closest('button') ||
          target.closest('.interactive') ||
          target.closest('input') ||
          target.closest('textarea'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth lerp follower loop
    const followLoop = () => {
      const ease = 0.18;
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      setFollowerPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(followLoop);
    };

    animationFrameId = requestAnimationFrame(followLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className={`custom-cursor ${isHovered ? 'hovering' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        aria-hidden="true"
      />
      <div
        className={`cursor-follower ${isHovered ? 'hovering' : ''}`}
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`
        }}
        aria-hidden="true"
      />
    </>
  );
}
