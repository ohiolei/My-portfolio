import { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export default function BackToTop({ scrollProgress }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      className="floating-back-to-top glass-panel"
      onClick={scrollToTop}
      onMouseEnter={() => soundManager.playHover()}
      aria-label="Scroll back to top"
      title="Back to top"
    >
      <svg className="progress-ring" width="46" height="46" viewBox="0 0 46 46">
        <circle
          className="progress-ring-track"
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          strokeWidth="2.5"
        />
        <circle
          className="progress-ring-indicator"
          cx="23"
          cy="23"
          r={radius}
          fill="none"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="back-arrow" aria-hidden="true">↑</span>
    </button>
  );
}
