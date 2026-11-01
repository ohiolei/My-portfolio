import { useState, useEffect, useCallback } from 'react';
import portfolioData from './data/portfolioData.json';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AmbientCanvas from './components/AmbientCanvas';
import CustomCursor from './components/CustomCursor';
import ProjectModal from './components/ProjectModal';
import CommandPalette from './components/CommandPalette';
import BackToTop from './components/BackToTop';
import DigitalMascot from './components/DigitalMascot';
import FullScreenLoader from './components/FullScreenLoader';
import { soundManager } from './utils/audio';

// Pages
import HomeView from './pages/HomeView';
import ProjectsView from './pages/ProjectsView';
import SkillsView from './pages/SkillsView';
import ExperienceView from './pages/ExperienceView';
import AboutView from './pages/AboutView';
import ContactView from './pages/ContactView';

import './App.css';

function getInitialPage() {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '');
    const validPages = ['home', 'projects', 'skills', 'experience', 'about', 'contact'];
    if (validPages.includes(hash)) return hash;
  }
  return 'home';
}

function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('cyber');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const [isBooting, setIsBooting] = useState(true);

  // Show interactive glass toast notification
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const toggleSound = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playSuccess();
    }
  }, [isMuted]);

  // Track window scroll progress for progress bar and back to top
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K listener to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundManager.playClick();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync hash routing and browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages = ['home', 'projects', 'skills', 'experience', 'about', 'contact'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [pageTransition, setPageTransition] = useState(null);

  // Update URL hash when page changes with quantum full-screen loading transition
  const navigateTo = (pageId) => {
    if (pageId === activePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    soundManager.playClick();

    const routeMeta = {
      home: { title: "SYSTEM OVERVIEW", subtitle: "ROUTING TO CORE ARCHITECTURE..." },
      projects: { title: "PRODUCTION SYSTEMS", subtitle: "FETCHING REPOSITORY CASE STUDIES..." },
      skills: { title: "CAPABILITIES & STACK", subtitle: "COMPILING SKILL MATRIX & TOOLS..." },
      experience: { title: "TIMELINE & CHRONOLOGY", subtitle: "SYNCING PRODUCTION MILESTONES..." },
      about: { title: "ORIGIN & PHILOSOPHY", subtitle: "LOADING PROFILE METRICS..." },
      contact: { title: "COLLABORATION INBOX", subtitle: "ESTABLISHING ENCRYPTED TRANSMISSION..." }
    };

    setPageTransition(routeMeta[pageId] || { title: pageId.toUpperCase(), subtitle: "LOADING MODULE..." });

    setTimeout(() => {
      setActivePage(pageId);
      window.location.hash = pageId;
      window.scrollTo({ top: 0 });
    }, 240);

    setTimeout(() => {
      setPageTransition(null);
    }, 550);
  };

  return (
    <>
      {/* Top Real-time Reading / Scroll Progress Bar */}
      <div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Subtle Tactile Ambient Noise Texture */}
      <div className="ambient-noise-overlay" aria-hidden="true" />

      {/* Interactive Background Canvas */}
      <AmbientCanvas />

      {/* Ambient Neon Glow Orbs */}
      <div className="ambient-glow-mesh" aria-hidden="true">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* Reactive Custom Cursor */}
      <CustomCursor />

      {/* Sticky Glass Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={navigateTo}
        navLinks={portfolioData.navigation}
        currentTheme={currentTheme}
        setTheme={setCurrentTheme}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Main Page Content */}
      <main className="main-content" id="main-content">
        {activePage === 'home' && (
          <HomeView
            data={portfolioData}
            onNavigate={navigateTo}
            onSelectProject={setSelectedProject}
          />
        )}

        {activePage === 'projects' && (
          <ProjectsView
            projects={portfolioData.projects}
            onSelectProject={setSelectedProject}
          />
        )}

        {activePage === 'skills' && (
          <SkillsView
            skillsData={portfolioData.skills}
            servicesData={portfolioData.services}
            onNavigate={navigateTo}
          />
        )}

        {activePage === 'experience' && (
          <ExperienceView
            experience={portfolioData.experience}
            education={portfolioData.education}
            portfolioData={portfolioData}
            onNavigate={navigateTo}
            onNotify={showToast}
          />
        )}

        {activePage === 'about' && (
          <AboutView
            personal={portfolioData.personal}
            currentVibe={portfolioData.currentVibe}
            faq={portfolioData.faq}
            onNavigate={navigateTo}
          />
        )}

        {activePage === 'contact' && (
          <ContactView
            personal={portfolioData.personal}
            onNotify={showToast}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        personal={portfolioData.personal}
        onNavigate={navigateTo}
      />

      {/* Floating Back to Top Button */}
      <BackToTop scrollProgress={scrollProgress} />

      {/* Interactive 2D Digital Mascot Companion */}
      <DigitalMascot
        activePage={activePage}
        currentTheme={currentTheme}
        isMuted={isMuted}
        onNavigate={navigateTo}
        onNotify={showToast}
      />

      {/* Command Palette Modal (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={navigateTo}
        personal={portfolioData.personal}
        projects={portfolioData.projects}
        portfolioData={portfolioData}
        setTheme={setCurrentTheme}
        currentTheme={currentTheme}
        isMuted={isMuted}
        toggleSound={toggleSound}
        onNotify={showToast}
        onTriggerBootloader={(mode) => {
          if (mode === 'transition') {
            setPageTransition({ title: "QUANTUM DIAGNOSTICS", subtitle: "RUNNING 2.5D SHADER PIPELINE..." });
            setTimeout(() => setPageTransition(null), 550);
          } else {
            setIsBooting(true);
          }
        }}
      />

      {/* Interactive Project Case Study Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Global Glass Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div key={toast.id} className="toast glass-panel">
              <span className="toast-dot" />
              <span className="toast-message font-mono">{toast.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Type 1: 2.5D Full-Screen Sci-Fi Bootloader & Quantum Route Transitions */}
      {(isBooting || pageTransition) && (
        <FullScreenLoader
          key={isBooting ? 'boot' : pageTransition?.title}
          isLoading={Boolean(isBooting || pageTransition)}
          mode={isBooting ? 'boot' : 'transition'}
          duration={isBooting ? 1400 : 500}
          title={pageTransition?.title || "OLUWATOBILOBA OHIOLE WILLIAMS"}
          subtitle={pageTransition?.subtitle || "DISTRIBUTED SYSTEMS // SENSORY WEB ARCHITECTURE"}
          onComplete={() => {
            if (isBooting) setIsBooting(false);
            if (pageTransition) setPageTransition(null);
          }}
        />
      )}
    </>
  );
}

export default App;
