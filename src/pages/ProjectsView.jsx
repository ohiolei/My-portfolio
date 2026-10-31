import { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import { portfolioImages } from '../assets/images';
import { soundManager } from '../utils/audio';

export default function ProjectsView({ projects, onSelectProject }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category)))];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (cat) => {
    soundManager.playClick();
    setActiveCategory(cat);
  };

  return (
    <div className="projects-view page-transition container">
      {/* Page Header */}
      <div className="page-header">
        <span className="section-label">SELECTED WORKS</span>
        <h1 className="section-title">
          Architectural <span className="text-gradient">Case Studies</span>
        </h1>
        <p className="section-subtitle">
          Explore interactive web applications, real-time distributed telemetry, AI agent workspaces, and sensory spatial audio synths.
        </p>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="projects-control-bar glass-panel">
        <div className="category-pill-group">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              onMouseEnter={() => soundManager.playHover()}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-box-wrapper">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input font-mono"
            placeholder="Filter by tech or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Project Status Count */}
      <div className="projects-counter-row font-mono">
        <span>
          Showing {filteredProjects.length} of {projects.length} curated works
        </span>
        {activeCategory !== 'All' && <span>Filter: {activeCategory}</span>}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="no-projects-found glass-panel">
          <p className="no-proj-title">No projects match "{searchQuery}"</p>
          <p className="no-proj-sub">Try searching for "React", "AI", "WebGL", or reset the category filter.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="projects-archive-grid">
          {filteredProjects.map((project) => {
            const pImg = project.thumbnail || portfolioImages[project.imageKey];
            return (
              <Card3DTilt
                key={project.id}
                maxTilt={7}
                className="project-archive-card glass-panel"
                onClick={() => {
                  soundManager.playClick();
                  onSelectProject(project);
                }}
              >
                {/* Visual Banner */}
                {pImg && (
                  <div className="archive-image-wrap">
                    <img
                      src={pImg}
                      alt={project.title}
                      className="archive-card-img"
                      loading="lazy"
                    />
                    <div className="archive-card-gradient" />
                    <span className="badge badge-glow archive-badge font-mono">
                      {project.category}
                    </span>
                    <span className="archive-year font-mono">{project.year}</span>
                  </div>
                )}

                {/* Content */}
                <div className="archive-body">
                  <h3 className="archive-title font-display">{project.title}</h3>
                  <p className="archive-subtitle font-mono">{project.subtitle}</p>
                  <p className="archive-desc">{project.shortDesc}</p>

                  {/* Highlights / Metrics Pills */}
                  {project.metrics && (
                    <div className="archive-metrics-row">
                      {Object.values(project.metrics).slice(0, 2).map((val, idx) => (
                        <div key={idx} className="metric-chip font-mono">
                          <span className="chip-dot" />
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="archive-tags-row">
                    {project.tags.map((tag) => (
                      <span key={tag} className="badge">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="archive-footer-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        onSelectProject(project);
                      }}
                    >
                      <span>Deep Dive</span>
                      <span>↗</span>
                    </button>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                        }}
                      >
                        <span>Live Demo</span>
                        <span>↗</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm font-mono"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                        }}
                      >
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              </Card3DTilt>
            );
          })}
        </div>
      )}
    </div>
  );
}
