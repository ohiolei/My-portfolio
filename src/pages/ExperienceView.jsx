import { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import { soundManager } from '../utils/audio';
import { downloadResumePdf, previewResumePdf } from '../utils/pdfResumeBuilder';
import defaultPortfolioData from '../data/portfolioData.json';

export default function ExperienceView({
  experience,
  education,
  onNavigate,
  portfolioData,
  onNotify
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const activeData = portfolioData || defaultPortfolioData;

  const handleDownloadResume = () => {
    soundManager.playSuccess();
    setIsGenerating(true);

    try {
      const fileName = `${activeData?.personal?.name?.replace(/\s+/g, '_') || 'Oluwatobiloba_Williams'}_Resume.pdf`;
      downloadResumePdf(activeData, fileName);
      onNotify?.(`Compiled & downloaded ${fileName}! 📄✨`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      onNotify?.('Error generating PDF resume. Please try again.');
    } finally {
      setTimeout(() => setIsGenerating(false), 900);
    }
  };

  const handlePreviewResume = () => {
    soundManager.playClick();
    try {
      previewResumePdf(activeData);
      onNotify?.('Opened vector resume in new tab ↗');
    } catch (err) {
      console.error('Failed to preview PDF:', err);
    }
  };

  return (
    <div className="experience-view page-transition container">
      {/* Header */}
      <div className="page-header">
        <span className="section-label">CHRONOLOGY</span>
        <h1 className="section-title">
          Experience & <span className="text-gradient">Milestones</span>
        </h1>
        <p className="section-subtitle">
          An interactive track record of technical leadership, architectural breakthroughs, and high-impact web products.
        </p>
      </div>

      {/* Action Row */}
      <div className="experience-action-bar glass-panel">
        <div className="exp-bar-info">
          <span className="live-beacon" />
          <span className="font-mono exp-status-text">
            5+ years building scalable web applications, university ICT systems & instant payment platforms
          </span>
        </div>
        <div className="exp-btn-group">
          <button
            className="btn btn-secondary resume-preview-btn font-mono"
            onClick={handlePreviewResume}
            onMouseEnter={() => soundManager.playHover()}
            title="Preview generated PDF in a new tab"
          >
            <span>Preview PDF</span>
            <span>↗</span>
          </button>
          <button
            className="btn btn-primary resume-dl-btn font-mono"
            onClick={handleDownloadResume}
            disabled={isGenerating}
            onMouseEnter={() => soundManager.playHover()}
            title="Build and download official vector PDF resume"
          >
            {isGenerating ? (
              <>
                <span className="btn-spinner" />
                <span>Building PDF...</span>
              </>
            ) : (
              <>
                <span>Download Resume (PDF)</span>
                <span>↓</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="timeline-container">
        <div className="timeline-spine-line" />

        {experience.map((item, index) => (
          <div key={item.company} className="timeline-entry">
            {/* Timeline node icon */}
            <div className="timeline-node">
              <span className="node-ring" />
              <span className="node-dot" />
            </div>

            {/* Timeline Card */}
            <Card3DTilt maxTilt={5} className="timeline-card glass-panel">
              <div className="timeline-card-header">
                <div>
                  <span className="badge badge-cyan font-mono">{item.period}</span>
                  <h3 className="timeline-role font-display">{item.role}</h3>
                  <div className="timeline-company-row">
                    <strong className="timeline-company">{item.company}</strong>
                    <span className="timeline-loc font-mono">• {item.location}</span>
                  </div>
                </div>
                {item.badge && (
                  <span className="badge badge-glow font-mono">{item.badge}</span>
                )}
              </div>

              <p className="timeline-desc">{item.description}</p>

              {/* Highlights */}
              <div className="timeline-highlights">
                <span className="highlights-label font-mono">SELECTED IMPACT:</span>
                <ul className="timeline-list">
                  {item.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="timeline-bullet">
                      <span className="timeline-chevron">›</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech stack badges */}
              <div className="timeline-tech-row">
                {item.technologies.map((t) => (
                  <span key={t} className="badge font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </Card3DTilt>
          </div>
        ))}
      </div>

      {/* Education & Academic Rigor */}
      <div className="education-section">
        <div className="section-center-head">
          <span className="section-label">ACADEMIC FOUNDATION</span>
          <h2 className="section-title">Education & Credentials</h2>
        </div>

        <div className="education-grid">
          {education.map((edu, idx) => (
            <div key={idx} className="education-card glass-panel">
              <div className="edu-period font-mono text-gradient-neon">{edu.period}</div>
              <h3 className="edu-degree font-display">{edu.degree}</h3>
              <p className="edu-inst font-mono">{edu.institution}</p>
              <p className="edu-notes">{edu.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
