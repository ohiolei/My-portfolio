import { forwardRef } from 'react';
import { soundManager } from '../utils/audio';

/**
 * LoadingButton — Cyber-styled button with reactive loading animations.
 * Supports:
 * - 'spinner': Concentric dual-ring neon spinner
 * - 'dots': 3 pulsing cyber-matrix micro-nodes
 * - 'radar': Expanding concentric neon radar wave
 */
const LoadingButton = forwardRef(function LoadingButton(
  {
    children,
    isLoading = false,
    loadingText,
    spinnerType = 'spinner',
    variant = 'primary',
    className = '',
    disabled = false,
    onClick,
    onMouseEnter,
    type = 'button',
    ...rest
  },
  ref
) {
  const handleClick = (e) => {
    if (isLoading || disabled) {
      e.preventDefault();
      return;
    }
    soundManager.playClick();
    onClick?.(e);
  };

  const handleMouseEnter = (e) => {
    if (!isLoading && !disabled) {
      soundManager.playHover();
      onMouseEnter?.(e);
    }
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`btn btn-${variant} loading-btn ${isLoading ? 'is-loading' : ''} ${className}`}
      aria-busy={isLoading}
      {...rest}
    >
      {/* Laser Scanning Bottom Shimmer Bar (Active when loading) */}
      {isLoading && <span className="btn-progress-shimmer" aria-hidden="true" />}

      {/* Button Content / Spinner Row */}
      <span className="btn-content-wrap">
        {isLoading && (
          <span className="btn-loader-slot" aria-hidden="true">
            {spinnerType === 'dots' ? (
              <span className="btn-pulse-dots">
                <span className="dot dot-1" />
                <span className="dot dot-2" />
                <span className="dot dot-3" />
              </span>
            ) : spinnerType === 'radar' ? (
              <span className="btn-radar-wave">
                <span className="radar-circle circle-1" />
                <span className="radar-circle circle-2" />
              </span>
            ) : (
              /* Default: Cyber Kinetic Dual-Ring Spinner */
              <svg className="btn-cyber-spinner" viewBox="0 0 24 24">
                <circle
                  className="spinner-track"
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  strokeWidth="2.5"
                />
                <circle
                  className="spinner-head"
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="var(--accent-secondary)"
                  strokeWidth="2.5"
                  strokeDasharray="18 42"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        )}

        <span className="btn-label-slot">
          {isLoading ? (loadingText || children) : children}
        </span>
      </span>
    </button>
  );
});

export default LoadingButton;
