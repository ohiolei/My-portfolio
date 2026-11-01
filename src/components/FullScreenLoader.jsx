import { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export default function FullScreenLoader({
  isLoading = true,
  onComplete,
  duration = 1400,
  mode = 'boot', // 'boot' | 'transition'
  title = "OLUWATOBILOBA OHIOLE WILLIAMS",
  subtitle = "DISTRIBUTED SYSTEMS // SENSORY WEB ARCHITECTURE"
}) {
  const [progress, setProgress] = useState(0);
  const [activeLog, setActiveLog] = useState(
    mode === 'transition' ? `ROUTING TO ${title}...` : "INITIALIZING SECURE SYSTEM BUS..."
  );
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      return;
    }

    setIsFadingOut(false);
    setProgress(0);

    const actualDuration = mode === 'transition' ? Math.min(duration, 550) : duration;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.floor((elapsed / actualDuration) * 100));
      setProgress(current);

      if (mode === 'transition') {
        if (current < 40) {
          setActiveLog(`ENCRYPTING QUANTUM PIPELINE...`);
        } else if (current < 85) {
          setActiveLog(`MOUNTING ${title.toUpperCase()}...`);
        } else {
          setActiveLog(`RENDER COMPLETE // READY`);
        }
      } else {
        if (current < 25) {
          setActiveLog("INITIALIZING QUANTUM RUNTIME & STATE BUS...");
        } else if (current < 55) {
          setActiveLog("MOUNTING DISTRIBUTED PORTFOLIO MODULES...");
        } else if (current < 85) {
          setActiveLog("COMPILING 2.5D COMPANION SHADERS & ASSETS...");
        } else {
          setActiveLog("SYSTEM ONLINE // OPERATOR ACCESS GRANTED");
        }
      }

      if (current >= 100) {
        clearInterval(interval);
        if (mode === 'boot') {
          soundManager.playSuccess();
        }
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 280);
      }
    }, 20);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearInterval(interval);
        soundManager.playClick();
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete?.();
        }, 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoading, duration, mode, title, onComplete]);

  const handleSkip = () => {
    soundManager.playClick();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 150);
  };

  if (!isLoading && isFadingOut) return null;

  return (
    <div
      className={`fullscreen-loader-overlay ${mode === 'transition' ? 'mode-transition' : 'mode-boot'} ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="System loading animation"
    >
      {/* Background Cyber Ambient Mesh & Scanlines */}
      <div className="loader-ambient-mesh" aria-hidden="true" />
      <div className="loader-scanlines" aria-hidden="true" />

      {/* Top Telemetry Header Bar */}
      <header className="loader-telemetry-header font-mono">
        <div className="telemetry-node">
          <span className="live-beacon" />
          <span>STATUS: {mode === 'transition' ? 'ROUTING' : 'ONLINE'}</span>
        </div>
        <div className="telemetry-node">
          <span>PORT: 5173 // TLS 1.3</span>
        </div>
        <div className="telemetry-node">
          <span>HOST: OHIA-SYS.PROD</span>
        </div>
      </header>

      {/* Central 2.5D Holographic Reactor Spinner */}
      <main className="loader-reactor-box">
        <div className="loader-hud-rings-wrap">
          <svg className="loader-hud-svg" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="hudRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="50%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>

              <filter id="loaderBloom" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Slow Clockwise Ring with Notches */}
            <circle
              cx="100"
              cy="100"
              r="88"
              fill="none"
              stroke="url(#hudRingGrad)"
              strokeWidth="2"
              strokeDasharray="28 14 6 14"
              className="ring-outer"
              filter="url(#loaderBloom)"
            />

            {/* Middle Counter-Clockwise Segmented Ring */}
            <circle
              cx="100"
              cy="100"
              r="72"
              fill="none"
              stroke="var(--accent-secondary)"
              strokeWidth="2.5"
              strokeDasharray="45 20 15 20"
              className="ring-middle"
            />

            {/* Hexagon Target Guides */}
            <polygon
              points="100,38 154,69 154,131 100,162 46,131 46,69"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.2"
              className="ring-hexagon"
            />

            {/* Inner Pulsing Radar Arc */}
            <circle
              cx="100"
              cy="100"
              r="54"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeDasharray="90 120"
              className="ring-inner"
              filter="url(#loaderBloom)"
            />
          </svg>

          {/* Central Glowing Monogram Badge */}
          <div className="loader-core-monogram font-display">
            <span className="core-initials text-gradient-neon">OW</span>
            <span className="core-subtag font-mono">SYS.2.5D</span>
          </div>
        </div>

        {/* Title and Telemetry Labels */}
        <div className="loader-meta-group">
          <h1 className="loader-system-title font-display">{title}</h1>
          <p className="loader-system-subtitle font-mono">{subtitle}</p>
        </div>

        {/* Live Progress Bar with Specular Laser Runner */}
        <div className="loader-progress-section font-mono">
          <div className="loader-progress-info">
            <span className="loader-log-text">{activeLog}</span>
            <span className="loader-percentage-text text-gradient-neon">{progress}%</span>
          </div>

          <div className="loader-progress-track">
            <div
              className="loader-progress-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="loader-progress-glow-head" />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer with Interactive Bypass Option */}
      <footer className="loader-footer font-mono">
        <span className="loader-hint">
          {mode === 'boot' ? 'ESC OR CLICK TO BYPASS INITIAL BOOT' : 'QUANTUM TRANSITION IN PROGRESS'}
        </span>
        {mode === 'boot' && (
          <button
            className="loader-skip-btn"
            onClick={handleSkip}
            title="Skip loading screen"
          >
            <span>SKIP_BOOT</span>
            <span>[ ✕ ]</span>
          </button>
        )}
      </footer>
    </div>
  );
}
