import { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';

export default function Navbar({
  activePage,
  setActivePage,
  navLinks,
  onOpenJsonModal,
  currentTheme,
  setTheme
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (pageId) => {
    soundManager.playClick();
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playSuccess();
    }
  };

  const themes = [
    { id: 'cyber', name: 'Cyber Neon', color: '#8b5cf6' },
    { id: 'matrix', name: 'Matrix Emerald', color: '#10b981' },
    { id: 'solar', name: 'Solar Flare', color: '#f59e0b' },
    { id: 'aurora', name: 'Aurora Rose', color: '#ec4899' }
  ];

  const handleThemeChange = (themeId) => {
    soundManager.playClick();
    setTheme(themeId);
    document.body.setAttribute('data-theme', themeId);
    setThemeDropdownOpen(false);
  };

  return (
    <>
      <header
        className={`portfolio-navbar ${isScrolled ? 'scrolled' : ''}`}
        role="banner"
      >
        <div className="container nav-container">
          {/* Logo / Monogram */}
          <button
            className="brand-logo"
            onClick={() => handleNavClick('home')}
            onMouseEnter={() => soundManager.playHover()}
            aria-label="Home"
          >
            <div className="logo-glitch-box">
              <span className="logo-initials">OW</span>
              <span className="logo-beacon" />
            </div>
            <div className="logo-text">
              <span className="logo-name">O. WILLIAMS</span>
              <span className="logo-sub">FULLSTACK.SYS</span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              {navLinks.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                      onMouseEnter={() => soundManager.playHover()}
                    >
                      <span className="nav-badge">{item.badge}</span>
                      <span className="nav-label">{item.label}</span>
                      {isActive && <span className="active-glow-pill" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Utility Toolbar */}
          <div className="nav-toolbar">
            {/* Audio Toggle */}
            <button
              className={`toolbar-btn sound-btn ${!isMuted ? 'active-audio' : ''}`}
              onClick={toggleSound}
              onMouseEnter={() => soundManager.playHover()}
              title={isMuted ? 'Turn Sound ON' : 'Mute UI Audio'}
              aria-label="Toggle UI Audio"
            >
              {!isMuted ? (
                <div className="audio-bars">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                </div>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>

            {/* Theme Picker Dropdown */}
            <div className="theme-picker-wrapper">
              <button
                className="toolbar-btn theme-btn"
                onClick={() => {
                  soundManager.playClick();
                  setThemeDropdownOpen(!themeDropdownOpen);
                }}
                onMouseEnter={() => soundManager.playHover()}
                title="Change Color Theme"
                aria-label="Select Color Theme"
              >
                <span className="theme-current-dot" />
              </button>

              {themeDropdownOpen && (
                <div className="theme-dropdown glass-panel">
                  <div className="theme-dropdown-header">PALETTE</div>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-option ${currentTheme === t.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(t.id)}
                      onMouseEnter={() => soundManager.playHover()}
                    >
                      <span
                        className="theme-swatch"
                        style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}` }}
                      />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inspect JSON Modal Button */}
            <button
              className="toolbar-btn json-btn"
              onClick={() => {
                soundManager.playClick();
                onOpenJsonModal();
              }}
              onMouseEnter={() => soundManager.playHover()}
              title="Inspect JSON Data Source"
            >
              <span className="font-mono">{'{ }'}</span>
              <span className="json-btn-text">DATA.JSON</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-hamburger"
              onClick={() => {
                soundManager.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle Navigation Menu"
            >
              <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`ham-line ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel" role="dialog" aria-modal="true">
          <div className="mobile-drawer-header">
            <span className="section-label">NAVIGATION</span>
            <button
              className="close-drawer-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="mobile-nav-list">
            {navLinks.map((item) => (
              <li key={item.id}>
                <button
                  className={`mobile-nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="mobile-badge">{item.badge}</span>
                  <div className="mobile-info">
                    <span className="mobile-label">{item.label}</span>
                    <span className="mobile-hint">{item.hint}</span>
                  </div>
                  <span className="mobile-arrow">→</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mobile-drawer-footer">
            <button
              className="btn btn-secondary full-width"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJsonModal();
              }}
            >
              Inspect Data.JSON
            </button>
          </div>
        </div>
      )}
    </>
  );
}
