import { useState, useEffect } from 'react';
import portfolioRawData from '../data/portfolioData.json';
import { soundManager } from '../utils/audio';

export default function JsonDataModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const jsonString = JSON.stringify(portfolioRawData, null, 2);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    soundManager.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const lines = jsonString.split('\n');
  const filteredLines = filterQuery
    ? lines.filter((l) => l.toLowerCase().includes(filterQuery.toLowerCase()))
    : lines;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content glass-panel json-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="json-modal-header">
          <div className="json-modal-title-wrap">
            <span className="section-label">DATA SOURCE</span>
            <h3 className="modal-title font-mono">portfolioData.json</h3>
            <p className="json-modal-desc">
              All portfolio content (bio, skills, projects, timeline, services) is loaded dynamically from this JSON document.
            </p>
          </div>

          <div className="json-actions">
            <button
              className="btn btn-primary"
              onClick={handleCopy}
              onMouseEnter={() => soundManager.playHover()}
            >
              {copied ? '✓ Copied to Clipboard' : 'Copy Raw JSON'}
            </button>
            <button
              className="modal-close-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter input */}
        <div className="json-filter-bar">
          <input
            type="text"
            className="json-search-input font-mono"
            placeholder="Search keys or values (e.g., 'React', 'metrics', 'projects')..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          <span className="line-count font-mono">
            {filteredLines.length} {filteredLines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        {/* Code viewer */}
        <div className="json-code-viewer font-mono">
          <pre>
            <code>{filteredLines.join('\n')}</code>
          </pre>
        </div>

        <div className="json-modal-footer">
          <span className="file-path font-mono">src/data/portfolioData.json</span>
          <button
            className="btn btn-secondary"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
