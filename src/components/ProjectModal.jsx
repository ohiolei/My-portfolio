import { useEffect } from 'react';
import { portfolioImages } from '../assets/images';
import { soundManager } from '../utils/audio';

export default function ProjectModal({ project, onClose }) {
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

  if (!project) return null;

  const projectImg = project.thumbnail || portfolioImages[project.imageKey] || null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content glass-panel project-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-tags">
            <span className="badge badge-glow">{project.category}</span>
            <span className="badge font-mono">{project.year}</span>
          </div>
          <h2 className="modal-title">{project.title}</h2>
          <p className="modal-subtitle">{project.subtitle}</p>
        </div>

        {/* Project Image Banner */}
        {projectImg && (
          <div className="modal-image-wrapper">
            <img
              src={projectImg}
              alt={project.title}
              className="modal-hero-image"
              loading="lazy"
            />
            <div className="modal-image-glow" />
          </div>
        )}

        {/* Metrics Grid */}
        {project.metrics && (
          <div className="modal-metrics-grid">
            {Object.entries(project.metrics).map(([key, val]) => (
              <div key={key} className="metric-box">
                <span className="metric-label">{key.toUpperCase()}</span>
                <span className="metric-val">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Deep Dive Case Study Content */}
        <div className="modal-body-scroll">
          <div className="case-study-section">
            <h4 className="case-title">EXECUTIVE OVERVIEW</h4>
            <p>{project.overview}</p>
          </div>

          <div className="case-grid">
            <div className="case-box challenge-box">
              <h4 className="case-title">THE ARCHITECTURAL CHALLENGE</h4>
              <p>{project.challenge}</p>
            </div>
            <div className="case-box solution-box">
              <h4 className="case-title">THE ENGINEERING SOLUTION</h4>
              <p>{project.solution}</p>
            </div>
          </div>

          {project.achievements && (
            <div className="case-study-section">
              <h4 className="case-title">KEY IMPACT & MILESTONES</h4>
              <ul className="achievements-list">
                {project.achievements.map((item, idx) => (
                  <li key={idx} className="achievement-item">
                    <span className="achievement-bullet">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="case-study-section">
            <h4 className="case-title">TECHNOLOGIES & PROTOCOLS</h4>
            <div className="modal-tech-pills">
              {project.tags.map((tag) => (
                <span key={tag} className="tech-pill font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() => soundManager.playClick()}
            >
              <span>Visit Live Platform</span>
              <span>↗</span>
            </a>
          )}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              onClick={() => soundManager.playClick()}
            >
              <span>Inspect Source Code</span>
              <span>↗</span>
            </a>
          ) : (
            <span className="badge badge-glow font-mono" style={{ padding: '10px 18px' }}>
              🔒 Institutional / Private Codebase
            </span>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
