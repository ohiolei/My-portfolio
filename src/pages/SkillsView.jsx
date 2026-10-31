import { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import { soundManager } from '../utils/audio';

export default function SkillsView({ skillsData, servicesData, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState(skillsData.categories[0].id);

  const activeCategoryData =
    skillsData.categories.find((c) => c.id === selectedCategory) ||
    skillsData.categories[0];

  return (
    <div className="skills-view page-transition container">
      {/* Header */}
      <div className="page-header">
        <span className="section-label">TECHNICAL MATRIX</span>
        <h1 className="section-title">
          Capabilities & <span className="text-gradient">Specializations</span>
        </h1>
        <p className="section-subtitle">
          A granular breakdown of core competencies, infrastructure protocols, generative AI frameworks, and client service offerings.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="skills-tabs-row glass-panel">
        {skillsData.categories.map((cat) => (
          <button
            key={cat.id}
            className={`skills-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory(cat.id);
            }}
            onMouseEnter={() => soundManager.playHover()}
          >
            <span className="tab-title font-display">{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Active Skills Category Grid */}
      <div className="skills-detail-box glass-panel">
        <div className="skills-box-header">
          <div>
            <h2 className="skills-box-title font-display">{activeCategoryData.title}</h2>
            <p className="skills-box-desc">{activeCategoryData.description}</p>
          </div>
          <span className="badge badge-glow font-mono">
            {activeCategoryData.skills.length} TECHNOLOGIES
          </span>
        </div>

        <div className="skills-bars-grid">
          {activeCategoryData.skills.map((skill) => (
            <div key={skill.name} className="skill-meter-card">
              <div className="skill-header-line">
                <span className="skill-name font-display">{skill.name}</span>
                <div className="skill-meta-tags">
                  <span className="badge badge-cyan font-mono">{skill.tag}</span>
                  <span className="skill-percentage font-mono">{skill.level}%</span>
                </div>
              </div>

              {/* Progress bar with neon fill and glowing node */}
              <div className="skill-progress-track">
                <div
                  className="skill-progress-fill"
                  style={{ width: `${skill.level}%` }}
                >
                  <span className="skill-progress-glow-node" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services & Architectural Offerings Grid */}
      <div className="services-section">
        <div className="section-center-head">
          <span className="section-label">CLIENT ENGAGEMENTS</span>
          <h2 className="section-title">Service Architecture</h2>
          <p className="section-subtitle">
            How I collaborate with engineering leadership and founders to ship transformational digital products.
          </p>
        </div>

        <div className="services-grid">
          {servicesData.map((service) => (
            <Card3DTilt
              key={service.id}
              maxTilt={6}
              className="service-card glass-panel"
            >
              <div className="service-header font-mono">
                <span className="service-num text-gradient-neon">{service.subtitle}</span>
              </div>
              <h3 className="service-title font-display">{service.title}</h3>
              <p className="service-description">{service.description}</p>

              <div className="service-deliverables">
                <span className="deliverable-label font-mono">CORE DELIVERABLES:</span>
                <ul className="deliverable-list">
                  {service.deliverables.map((item, idx) => (
                    <li key={idx} className="deliverable-item font-mono">
                      <span className="deliverable-check">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="btn btn-secondary service-inquire-btn"
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('contact');
                }}
                onMouseEnter={() => soundManager.playHover()}
              >
                <span>Request Scope & Timeline</span>
                <span>→</span>
              </button>
            </Card3DTilt>
          ))}
        </div>
      </div>
    </div>
  );
}
