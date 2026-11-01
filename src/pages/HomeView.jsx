import { useState, useEffect } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import LoadingButton from '../components/LoadingButton';
import { portfolioImages } from '../assets/images';
import { soundManager } from '../utils/audio';

export default function HomeView({ data, onNavigate, onSelectProject }) {
  const { personal, stats, projects, testimonials, currentVibe } = data;
  const avatarImg = portfolioImages[personal.avatarKey];
  const featuredProjects = projects.filter((p) => p.isFeatured || p.featured).slice(0, 6);

  // Animated counter effect for stats
  const [tickerCounts, setTickerCounts] = useState(stats.map(() => 0));
  const [loadingTarget, setLoadingTarget] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTickerCounts(stats.map((s) => s.value));
    }, 200);
    return () => clearTimeout(timer);
  }, [stats]);

  return (
    <div className="home-view page-transition">
      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-grid">
          {/* Hero Left Content */}
          <div className="hero-content">
            {/* Status Beacon */}
            <div className="status-badge-wrap">
              <span className="live-beacon" />
              <span className="status-text font-mono">{personal.availabilityStatus}</span>
            </div>

            {/* Kinetic Title */}
            <h1 className="hero-main-title">
              Crafting <span className="text-gradient">Fluid Realities</span> & Autonomous Systems.
            </h1>

            <p className="hero-tagline">
              Hello, I'm <strong className="hero-highlight">{personal.name}</strong> — {personal.title}. {personal.tagline}
            </p>

            {/* Action Buttons with Interactive Loading Animations */}
            <div className="hero-cta-group">
              <LoadingButton
                variant="primary"
                isLoading={loadingTarget === 'projects'}
                loadingText="Mounting Systems..."
                spinnerType="spinner"
                onClick={() => {
                  setLoadingTarget('projects');
                  onNavigate('projects');
                  setTimeout(() => setLoadingTarget(null), 600);
                }}
              >
                <span>Explore Works</span>
                <span>→</span>
              </LoadingButton>

              <LoadingButton
                variant="secondary"
                isLoading={loadingTarget === 'contact'}
                loadingText="Connecting..."
                spinnerType="radar"
                onClick={() => {
                  setLoadingTarget('contact');
                  onNavigate('contact');
                  setTimeout(() => setLoadingTarget(null), 600);
                }}
              >
                <span>Initiate Contact</span>
                <span>⚡</span>
              </LoadingButton>

              <LoadingButton
                variant="ghost"
                className="font-mono"
                isLoading={loadingTarget === 'experience'}
                loadingText="Loading Bio..."
                spinnerType="dots"
                onClick={() => {
                  setLoadingTarget('experience');
                  onNavigate('experience');
                  setTimeout(() => setLoadingTarget(null), 600);
                }}
              >
                <span>Resume / Bio ↓</span>
              </LoadingButton>
            </div>

            {/* Current Vibe Bar */}
            <div className="current-vibe-pill glass-panel">
              <div className="vibe-icon-wave">
                <span className="wave-bar" />
                <span className="wave-bar" />
                <span className="wave-bar" />
              </div>
              <div className="vibe-text">
                <span className="vibe-label font-mono">CURRENT VIBE:</span>
                <span className="vibe-track">{currentVibe.track}</span>
              </div>
            </div>
          </div>

          {/* Hero Right Avatar 3D Card */}
          <div className="hero-avatar-area">
            <Card3DTilt maxTilt={10} className="avatar-tilt-card glass-panel">
              <div className="avatar-frame">
                {avatarImg ? (
                  <img
                    src={avatarImg}
                    alt={personal.name}
                    className="avatar-photo"
                  />
                ) : (
                  <div className="avatar-fallback" />
                )}
                <div className="avatar-cyber-grid" />
                <div className="avatar-scanline" />
              </div>

              <div className="avatar-card-info">
                <div className="avatar-identity">
                  <span className="avatar-name font-display">{personal.name}</span>
                  <span className="avatar-handle font-mono">{personal.nickname}</span>
                </div>
                <div className="avatar-badge-row">
                  <span className="badge badge-glow">{personal.location}</span>
                  <span className="badge badge-cyan">Full-Stack Lead</span>
                </div>
              </div>

              {/* Floating Hologram Badges */}
              <div className="holo-pill holo-pill-top font-mono">
                <span>⚡ 60FPS CRAFT</span>
              </div>
              <div className="holo-pill holo-pill-bottom font-mono">
                <span>✦ {personal.yearsOfExperience}+ YEARS IN PROD</span>
              </div>
            </Card3DTilt>
          </div>
        </div>
      </section>

      {/* Numerical Stats Ticker Section */}
      <section className="stats-section container">
        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div key={idx} className="stat-card glass-panel">
              <div className="stat-number font-display text-gradient-neon">
                {tickerCounts[idx] || item.value}
              </div>
              <div className="stat-label font-display">{item.label}</div>
              <div className="stat-detail font-mono">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Works Showcase */}
      <section className="featured-section container">
        <div className="section-header-row">
          <div>
            <span className="section-label">SELECTED WORKS</span>
            <h2 className="section-title">Flagship Architectures</h2>
            <p className="section-subtitle">
              A curated selection of sensory interfaces, real-time telemetry systems, and frontier AI canvases.
            </p>
          </div>
          <button
            className="btn btn-secondary view-all-btn"
            onClick={() => {
              soundManager.playClick();
              onNavigate('projects');
            }}
            onMouseEnter={() => soundManager.playHover()}
          >
            <span>View All Works ({projects.length})</span>
            <span>→</span>
          </button>
        </div>

        <div className="featured-projects-grid">
          {featuredProjects.map((project) => {
            const pImg = project.thumbnail || portfolioImages[project.imageKey];
            return (
              <Card3DTilt
                key={project.id}
                maxTilt={6}
                className="featured-project-card glass-panel"
                onClick={() => {
                  soundManager.playClick();
                  onSelectProject(project);
                }}
              >
                {pImg && (
                  <div className="project-thumbnail-box">
                    <img
                      src={pImg}
                      alt={project.title}
                      className="project-thumb-img"
                    />
                    <div className="thumb-gradient-mask" />
                    <span className="category-pill font-mono">{project.category}</span>
                    <button
                      className="quick-view-overlay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        onSelectProject(project);
                      }}
                    >
                      <span>Deep Dive Case Study</span>
                      <span>↗</span>
                    </button>
                  </div>
                )}

                <div className="featured-card-body">
                  <div className="project-meta-row font-mono">
                    <span className="project-year">{project.year}</span>
                    <span className="project-tagline-short">{project.subtitle}</span>
                  </div>
                  <h3 className="project-heading font-display">{project.title}</h3>
                  <p className="project-blurb">{project.shortDesc}</p>

                  <div className="project-tags-row">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="badge">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="badge badge-glow font-mono">
                        +{project.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </Card3DTilt>
            );
          })}
        </div>
      </section>

      {/* Praise / Testimonials Quotes */}
      <section className="testimonials-section container">
        <div className="section-center-head">
          <span className="section-label">ENDORSEMENTS</span>
          <h2 className="section-title">What Engineering Leaders Say</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card glass-panel">
              <div className="quote-mark">“</div>
              <p className="quote-text">{t.quote}</p>
              <div className="quote-author-info">
                <div className="author-details">
                  <strong className="author-name font-display">{t.author}</strong>
                  <span className="author-role font-mono">
                    {t.title} • {t.company}
                  </span>
                </div>
                <div className="rating-stars">
                  {'★'.repeat(t.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="cta-banner-section container">
        <div className="cta-banner-card glass-panel">
          <div className="cta-glow-mesh" />
          <div className="cta-content">
            <span className="section-label">START A PROJECT</span>
            <h2 className="cta-heading font-display">
              Ready to build something <span className="text-gradient">extraordinary</span>?
            </h2>
            <p className="cta-desc">
              Whether you are architecting a new AI canvas, scaling a mission-critical SaaS, or crafting an Awwwards-worthy web experience, let's turn vision into reality.
            </p>
            <div className="cta-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('contact');
                }}
                onMouseEnter={() => soundManager.playHover()}
              >
                <span>Initiate Consultation</span>
                <span>→</span>
              </button>
              <button
                className="btn btn-secondary font-mono"
                onClick={() => {
                  soundManager.playClick();
                  navigator.clipboard.writeText(personal.email);
                  soundManager.playSuccess();
                  alert(`Copied ${personal.email} to clipboard!`);
                }}
              >
                <span>Copy: {personal.email}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
