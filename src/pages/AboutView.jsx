import { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import LoadingButton from '../components/LoadingButton';
import { portfolioImages } from '../assets/images';
import { soundManager } from '../utils/audio';

export default function AboutView({ personal, currentVibe, faq, onNavigate }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isPlayingSynth, setIsPlayingSynth] = useState(false);

  const avatarImg = portfolioImages[personal.avatarKey];

  const toggleFaq = (index) => {
    soundManager.playClick();
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const playSynthesizerVibe = () => {
    soundManager.playSuccess();
    setIsPlayingSynth(true);
    setTimeout(() => setIsPlayingSynth(false), 1800);
  };

  const principles = [
    {
      title: 'Latency is Human Friction',
      desc: 'Every millisecond of perceived delay disrupts user focus. I architect systems that respond instantly via optimistic UI updates, edge computation, and zero-jank frame scheduling.'
    },
    {
      title: 'Motion with Spatial Meaning',
      desc: 'Animations should never be superficial eye-candy. They must establish spatial hierarchy, explain state transitions, and make digital tools feel organic and tangible.'
    },
    {
      title: 'Resilient Distributed Systems',
      desc: 'Beneath every alluring visual interface lies a rock-solid, type-safe data architecture designed to withstand flaky networks, edge concurrency, and sudden traffic spikes.'
    }
  ];

  return (
    <div className="about-view page-transition container">
      {/* Header */}
      <div className="page-header">
        <span className="section-label">ORIGIN & PHILOSOPHY</span>
        <h1 className="section-title">
          Engineering the <span className="text-gradient">Sensory Web</span>
        </h1>
        <p className="section-subtitle">
          Bridging speculative digital design, distributed computing, and generative AI agents into cohesive production realities.
        </p>
      </div>

      {/* Story & Portrait Grid */}
      <div className="about-story-grid">
        {/* Left Column: Portrait & Audio Vibe Card */}
        <div className="about-left-col">
          <Card3DTilt maxTilt={8} className="about-avatar-card glass-panel">
            {avatarImg && (
              <div className="about-img-box">
                <img src={avatarImg} alt={personal.name} className="about-photo" />
                <div className="about-photo-overlay" />
              </div>
            )}
            <div className="about-avatar-details">
              <h3 className="about-name font-display">{personal.name}</h3>
              <p className="about-role font-mono">{personal.title}</p>
              <div className="about-loc font-mono">
                <span>📍 {personal.location}</span>
              </div>
            </div>
          </Card3DTilt>

          {/* Interactive Synthesizer Vibe Widget */}
          <div className="synth-vibe-widget glass-panel">
            <div className="synth-header">
              <span className="badge badge-cyan font-mono">NOW VIBING</span>
              <LoadingButton
                variant="secondary"
                className={`synth-trigger-btn font-mono ${isPlayingSynth ? 'playing' : ''}`}
                onClick={playSynthesizerVibe}
                isLoading={isPlayingSynth}
                loadingText="Streaming Chime..."
                spinnerType="dots"
                title="Play Audio Chime"
              >
                <span>♫ Play Synth Tone</span>
              </LoadingButton>
            </div>

            <div className="synth-visualizer-bars">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="synth-bar"
                  style={{
                    animationDelay: `${(i * 0.12).toFixed(2)}s`,
                    height: `${Math.sin(i * 0.8) * 16 + 24}px`
                  }}
                />
              ))}
            </div>

            <div className="synth-track-details">
              <div className="font-mono synth-title">{currentVibe.track}</div>
              <div className="synth-artist font-mono">{currentVibe.artist}</div>
              <div className="synth-status font-mono">⚡ {currentVibe.status}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Bio Narrative & Core Tenets */}
        <div className="about-right-col">
          <div className="narrative-card glass-panel">
            <h2 className="narrative-heading font-display">The Craft Manifesto</h2>
            <div className="narrative-paragraphs">
              {personal.bioParagraphs.map((para, idx) => (
                <p key={idx} className="narrative-p">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Core Principles */}
          <div className="principles-wrap">
            <h3 className="principles-header font-display">Core Engineering Principles</h3>
            <div className="principles-list">
              {principles.map((pr, idx) => (
                <div key={idx} className="principle-card glass-panel">
                  <div className="principle-number font-mono text-gradient-neon">
                    0{idx + 1}
                  </div>
                  <div>
                    <h4 className="principle-title font-display">{pr.title}</h4>
                    <p className="principle-desc">{pr.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="faq-section">
        <div className="section-center-head">
          <span className="section-label">CLARIFICATIONS</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion-list">
          {faq.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`faq-item glass-panel ${isOpen ? 'open' : ''}`}
              >
                <button
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                  onMouseEnter={() => soundManager.playHover()}
                >
                  <span className="faq-q-text font-display">{item.q}</span>
                  <span className="faq-icon-arrow font-mono">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-box">
                    <p className="faq-answer-text">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
