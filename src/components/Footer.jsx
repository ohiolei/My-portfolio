import { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export default function Footer({ personal, onNavigate }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    soundManager.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="portfolio-footer">
      <div className="container">
        <div className="footer-top-row">
          <div className="footer-brand">
            <div className="brand-logo-inline">
              <span className="logo-initials font-display">OW</span>
              <span className="logo-beacon" />
              <span className="footer-title font-display">{personal.name}</span>
            </div>
            <p className="footer-tagline font-mono">{personal.tagline}</p>
          </div>

          <div className="footer-nav-columns">
            <div className="footer-col">
              <span className="footer-heading font-mono">EXPLORE</span>
              <button onClick={() => onNavigate('home')} className="footer-link">Overview</button>
              <button onClick={() => onNavigate('projects')} className="footer-link">Works</button>
              <button onClick={() => onNavigate('skills')} className="footer-link">Capabilities</button>
            </div>

            <div className="footer-col">
              <span className="footer-heading font-mono">INSIGHT</span>
              <button onClick={() => onNavigate('experience')} className="footer-link">Timeline</button>
              <button onClick={() => onNavigate('about')} className="footer-link">Story & Vibe</button>
              <button onClick={() => onNavigate('contact')} className="footer-link">Connect</button>
            </div>

            <div className="footer-col">
              <span className="footer-heading font-mono">LOCATION</span>
              <div className="footer-location-text font-mono">
                {personal.location}
              </div>
              <div className="footer-time-badge font-mono">
                <span className="live-beacon" />
                <span>WAT: {timeStr || '12:00:00 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-copy font-mono">
            © {new Date().getFullYear()} {personal.name}. All rights reserved. Software Engineer & Full-Stack Developer.
          </div>

          <button
            className="back-to-top-btn font-mono"
            onClick={scrollToTop}
            onMouseEnter={() => soundManager.playHover()}
          >
            <span>BACK TO TOP</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
