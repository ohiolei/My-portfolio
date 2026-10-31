import { useState } from 'react';
import Card3DTilt from '../components/Card3DTilt';
import { soundManager } from '../utils/audio';

export default function ContactView({ personal, onNotify }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Full-Stack Architecture',
    budget: '$25k - $50k',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'
  const [copiedEmail, setCopiedEmail] = useState(false);

  const projectTypes = [
    'Generative AI Canvas',
    'Full-Stack Architecture',
    'Sensory UI / WebGL',
    'Engineering Advisory'
  ];

  const budgetTiers = [
    '$15k - $25k',
    '$25k - $50k',
    '$50k - $100k+',
    'Monthly Retainer'
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    soundManager.playSuccess();
    setCopiedEmail(true);
    onNotify?.(`Copied ${personal.email} to clipboard! 📋`);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyTemplate = (type, sampleMsg) => {
    soundManager.playClick();
    setFormData((prev) => ({
      ...prev,
      projectType: type,
      message: sampleMsg
    }));
  };

  const getMailtoUrl = () => {
    const subject = encodeURIComponent(
      `Collaboration Inquiry: ${formData.projectType} — ${formData.name || 'Visitor'}`
    );
    const body = encodeURIComponent(
      `Hello ${personal.name},\n\n` +
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Focus Area: ${formData.projectType}\n` +
      `Estimated Investment: ${formData.budget}\n\n` +
      `Project Brief / Message:\n${formData.message}\n`
    );
    return `mailto:${personal.email}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('Please fill out your name, email, and a brief message.');
      return;
    }

    soundManager.playClick();
    setFormStatus('sending');

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(personal.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `New Transmission from ${formData.name} via Portfolio`,
          _replyto: formData.email,
          _template: 'table',
          _captcha: 'false',
          Name: formData.name,
          Email: formData.email,
          'Focus Area': formData.projectType,
          'Estimated Investment': formData.budget,
          Message: formData.message
        })
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok || result.success === 'true' || result.success === true) {
        soundManager.playSuccess();
        setFormStatus('sent');
        onNotify?.('Message delivered directly to willnagato@outlook.com! 🚀');
      } else {
        throw new Error(result.message || 'Transmission failed to deliver.');
      }
    } catch (err) {
      console.warn('Direct API submission encountered an error, activating mail client fallback:', err);
      soundManager.playClick();
      setFormStatus('fallback');
    }
  };

  return (
    <div className="contact-view page-transition container">
      {/* Header */}
      <div className="page-header">
        <span className="section-label">ESTABLISH UPLINK</span>
        <h1 className="section-title">
          Initiate a <span className="text-gradient">Collaboration</span>
        </h1>
        <p className="section-subtitle">
          Have an ambitious product in mind or need staff-level engineering firepower? Send a transmission below.
        </p>
      </div>

      <div className="contact-grid">
        {/* Left Column: Interactive Contact Form */}
        <div className="contact-form-col">
          <div className="form-card glass-panel">
            {formStatus === 'sent' ? (
              <div className="form-success-state">
                <div className="success-icon-ring">✓</div>
                <h3 className="success-title font-display">Transmission Dispatched</h3>
                <p className="success-desc">
                  Thank you, <strong>{formData.name}</strong>. Your message has been sent directly to <strong>{personal.email}</strong>. You will receive a response within 24 hours.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <a
                    href={getMailtoUrl()}
                    className="btn btn-secondary font-mono"
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => soundManager.playHover()}
                  >
                    Open Backup Copy in Mail Client ↗
                  </a>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      soundManager.playClick();
                      setFormStatus('idle');
                      setFormData({
                        name: '',
                        email: '',
                        projectType: 'Full-Stack Architecture',
                        budget: '$25k - $50k',
                        message: ''
                      });
                    }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : formStatus === 'fallback' ? (
              <div className="form-success-state">
                <div className="success-icon-ring" style={{ borderColor: 'var(--accent-secondary)', color: 'var(--accent-secondary)' }}>✉</div>
                <h3 className="success-title font-display">Ready to Send via Email</h3>
                <p className="success-desc">
                  Click below to open your preferred mail app (Outlook, Gmail, or Apple Mail) with all your details pre-addressed to <strong>{personal.email}</strong>.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                  <a
                    href={getMailtoUrl()}
                    className="btn btn-primary"
                    onClick={() => soundManager.playSuccess()}
                  >
                    Launch Mail Client & Send →
                  </a>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      soundManager.playClick();
                      setFormStatus('idle');
                    }}
                  >
                    Return to Form
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-quick-templates">
                  <span className="template-label font-mono">QUICK STARTERS:</span>
                  <div className="template-pills">
                    <button
                      type="button"
                      className="template-btn font-mono"
                      onClick={() =>
                        applyTemplate(
                          'Generative AI Canvas',
                          'We are building a node-based visual AI application and need an experienced architect to lead the front-end canvas engine and real-time state streaming.'
                        )
                      }
                    >
                      + AI Canvas Build
                    </button>
                    <button
                      type="button"
                      className="template-btn font-mono"
                      onClick={() =>
                        applyTemplate(
                          'Sensory UI / WebGL',
                          'We want to create a high-impact interactive web showcase with 3D WebGL visuals, fluid micro-interactions, and 60fps buttery smoothness.'
                        )
                      }
                    >
                      + Sensory UI
                    </button>
                    <button
                      type="button"
                      className="template-btn font-mono"
                      onClick={() =>
                        applyTemplate(
                          'Engineering Advisory',
                          'Looking to book an architecture review and performance audit for our engineering team in Q1.'
                        )
                      }
                    >
                      + Advisory Review
                    </button>
                  </div>
                </div>

                {/* Name & Email Inputs */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label font-mono">NAME *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Dr. Alex Vance"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label font-mono">EMAIL *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. alex@hyperion.ai"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Project Category Picker */}
                <div className="form-group">
                  <label className="form-label font-mono">FOCUS AREA</label>
                  <div className="radio-pill-group">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`radio-pill ${formData.projectType === type ? 'selected' : ''}`}
                        onClick={() => {
                          soundManager.playClick();
                          setFormData({ ...formData, projectType: type });
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="form-group">
                  <label className="form-label font-mono">ESTIMATED INVESTMENT</label>
                  <div className="radio-pill-group">
                    {budgetTiers.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        className={`radio-pill ${formData.budget === tier ? 'selected' : ''}`}
                        onClick={() => {
                          soundManager.playClick();
                          setFormData({ ...formData, budget: tier });
                        }}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label font-mono">PROJECT BRIEF / DETAILS *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe your goals, desired timeline, technical stack preferences, or links to references..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formStatus === 'sending'}
                  className="btn btn-primary form-submit-btn"
                  onMouseEnter={() => soundManager.playHover()}
                >
                  {formStatus === 'sending' ? (
                    <span>Routing Transmission to {personal.email}...</span>
                  ) : (
                    <>
                      <span>Transmit Message to {personal.name}</span>
                      <span>⚡</span>
                    </>
                  )}
                </button>

                <div className="direct-mailto-hint font-mono">
                  <span>Delivers directly to: <strong className="text-gradient-neon">{personal.email}</strong></span>
                  <a
                    href={getMailtoUrl()}
                    className="mailto-direct-link"
                    onClick={() => soundManager.playClick()}
                  >
                    Open in default mail client ↗
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Direct Channels & Live Availability */}
        <div className="contact-info-col">
          {/* Quick Copy Email Card */}
          <Card3DTilt maxTilt={6} className="direct-channel-card glass-panel">
            <span className="section-label">DIRECT INBOX</span>
            <h3 className="direct-title font-display">Fastest Response</h3>
            <p className="direct-desc">
              For urgent inquiries, speaking invitations, or confidential advisory briefs, reach out directly:
            </p>
            <div className="email-copy-bar">
              <span className="email-text font-mono">{personal.email}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyEmail}
                onMouseEnter={() => soundManager.playHover()}
              >
                {copiedEmail ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </Card3DTilt>

          {/* Availability Status Card */}
          <div className="availability-card glass-panel">
            <div className="avail-header">
              <span className="live-beacon" />
              <span className="font-mono avail-tag">CALENDAR STATUS</span>
            </div>
            <h4 className="avail-title font-display">System Programmer • Open to Relocation</h4>
            <p className="avail-desc">
              Currently delivering university ICT solutions at TASUED. Eager and actively <strong>open to relocation</strong> to contribute to Canada's growing digital economy and global engineering teams.
            </p>
            <div className="timezones font-mono">
              <div>📍 Location: {personal.location}</div>
              <div>📞 Phone: {personal.phone}</div>
              <div>⚡ Timezone: West Africa Time (WAT / UTC+1) • Flexible with EU/EST</div>
            </div>
          </div>

          {/* Social Presence Matrix */}
          <div className="socials-matrix-card glass-panel">
            <span className="section-label">CONNECT ACROSS THE WEB</span>
            <div className="social-links-grid">
              {personal.socials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-channel-item"
                  onMouseEnter={() => soundManager.playHover()}
                >
                  <div className="social-left">
                    <span
                      className="social-dot"
                      style={{ backgroundColor: soc.accent, boxShadow: `0 0 8px ${soc.accent}` }}
                    />
                    <strong className="social-name font-display">{soc.name}</strong>
                  </div>
                  <span className="social-handle font-mono">{soc.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
