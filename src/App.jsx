import { useState, useEffect } from 'react';
import portfolioData from './data/portfolioData.json';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AmbientCanvas from './components/AmbientCanvas';
import CustomCursor from './components/CustomCursor';
import ProjectModal from './components/ProjectModal';
import JsonDataModal from './components/JsonDataModal';

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
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cyber');

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

  // Update URL hash when page changes
  const navigateTo = (pageId) => {
    setActivePage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
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
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        currentTheme={currentTheme}
        setTheme={setCurrentTheme}
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
            onNavigate={navigateTo}
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
          <ContactView personal={portfolioData.personal} />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        personal={portfolioData.personal}
        onNavigate={navigateTo}
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
      />

      {/* Interactive Project Case Study Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Raw JSON Data Viewer Modal */}
      {isJsonModalOpen && (
        <JsonDataModal onClose={() => setIsJsonModalOpen(false)} />
      )}
    </>
  );
}

export default App;
