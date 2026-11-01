import { useState, useEffect, useRef } from 'react';
import { soundManager } from '../utils/audio';
import { downloadResumePdf } from '../utils/pdfResumeBuilder';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  personal,
  projects,
  portfolioData,
  setTheme,
  currentTheme,
  isMuted,
  toggleSound,
  onNotify
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundManager.playClick();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Actions catalog
  const navigationItems = [
    { id: 'nav-home', category: 'Navigation', title: 'Go to Overview', icon: '✦', action: () => onNavigate('home') },
    { id: 'nav-projects', category: 'Navigation', title: 'Explore Works & Projects', icon: '⚡', action: () => onNavigate('projects') },
    { id: 'nav-skills', category: 'Navigation', title: 'View Capabilities & Skills', icon: '❖', action: () => onNavigate('skills') },
    { id: 'nav-experience', category: 'Navigation', title: 'Timeline & Career Chronology', icon: '⏱', action: () => onNavigate('experience') },
    { id: 'nav-about', category: 'Navigation', title: 'Origin Story & Philosophy', icon: '📖', action: () => onNavigate('about') },
    { id: 'nav-contact', category: 'Navigation', title: 'Initiate Collaboration / Contact', icon: '✉', action: () => onNavigate('contact') }
  ];

  const quickActions = [
    {
      id: 'act-copy-email',
      category: 'Actions',
      title: `Copy Email (${personal.email})`,
      icon: '📋',
      action: () => {
        navigator.clipboard.writeText(personal.email);
        soundManager.playSuccess();
        if (onNotify) {
          onNotify(`Copied ${personal.email} to clipboard! 📋`);
        } else {
          alert('Email copied to clipboard: ' + personal.email);
        }
      }
    },
    {
      id: 'act-download-resume',
      category: 'Actions',
      title: 'Download Official Resume (PDF)',
      icon: '📄',
      action: () => {
        soundManager.playSuccess();
        downloadResumePdf(portfolioData || { personal, projects });
        onNotify?.('Compiled & downloaded official vector PDF resume! 📄✨');
      }
    },
    {
      id: 'act-mascot-companion',
      category: 'Assistant',
      title: 'Talk to Tobi Mascot Companion',
      icon: '🤖',
      action: () => {
        window.dispatchEvent(new CustomEvent('toggle-mascot-dialogue'));
      }
    },
    {
      id: 'act-toggle-sound',
      category: 'Preferences',
      title: isMuted ? 'Unmute Sound Effects' : 'Mute UI Sound Effects',
      icon: isMuted ? '🔊' : '🔇',
      action: () => {
        toggleSound();
        onNotify?.(isMuted ? 'UI audio unmuted 🔊' : 'UI audio muted 🔇');
      }
    },
    {
      id: 'theme-cyber',
      category: 'Themes',
      title: 'Theme: Cyber Neon (Default)',
      icon: '🟣',
      action: () => {
        setTheme('cyber');
        document.body.setAttribute('data-theme', 'cyber');
        onNotify?.('Activated Cyber Neon Theme 🟣');
      }
    },
    {
      id: 'theme-matrix',
      category: 'Themes',
      title: 'Theme: Matrix Emerald',
      icon: '🟢',
      action: () => {
        setTheme('matrix');
        document.body.setAttribute('data-theme', 'matrix');
        onNotify?.('Activated Matrix Emerald Theme 🟢');
      }
    },
    {
      id: 'theme-solar',
      category: 'Themes',
      title: 'Theme: Solar Flare',
      icon: '🟠',
      action: () => {
        setTheme('solar');
        document.body.setAttribute('data-theme', 'solar');
        onNotify?.('Activated Solar Flare Theme 🟠');
      }
    },
    {
      id: 'theme-aurora',
      category: 'Themes',
      title: 'Theme: Aurora Rose',
      icon: '🌸',
      action: () => {
        setTheme('aurora');
        document.body.setAttribute('data-theme', 'aurora');
        onNotify?.('Activated Aurora Rose Theme 🌸');
      }
    }
  ];

  // Project quick links
  const projectItems = projects.map((p) => ({
    id: `proj-${p.id}`,
    category: 'Flagship Projects',
    title: p.title,
    subtitle: p.subtitle,
    icon: '🚀',
    action: () => {
      onNavigate('projects');
    }
  }));

  const allItems = [...navigationItems, ...quickActions, ...projectItems];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item) => {
    soundManager.playClick();
    item.action();
    onClose();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="command-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="command-palette-box glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header Search Input */}
        <div className="palette-input-bar">
          <svg className="palette-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="palette-input font-mono"
            placeholder="Type a command or jump to page... (e.g. 'Resume', 'Works', 'Theme')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <span className="palette-esc-badge font-mono">ESC</span>
        </div>

        {/* Results List */}
        <div className="palette-results-list">
          {filteredItems.length === 0 ? (
            <div className="palette-empty font-mono">
              No matching commands or destinations found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  className={`palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="palette-item-left">
                    <span className="palette-item-icon">{item.icon}</span>
                    <div className="palette-item-text">
                      <span className="palette-item-title">{item.title}</span>
                      {item.subtitle && <span className="palette-item-subtitle font-mono">{item.subtitle}</span>}
                    </div>
                  </div>
                  <span className="palette-item-category font-mono">{item.category}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="palette-footer font-mono">
          <div className="palette-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Dismiss</span>
          </div>
          <span className="palette-branding text-gradient-neon">{personal.nickname}</span>
        </div>
      </div>
    </div>
  );
}
