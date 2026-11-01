import { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';

export default function DigitalMascot({
  activePage = 'home',
  currentTheme = 'cyber',
  isMuted = false,
  onNavigate,
  onNotify
}) {
  // Activity state: 'idle' | 'walk' | 'run' | 'jump' | 'hoverboard' | 'code' | 'dance' | 'sleep' | 'drag' | 'coffee' | 'wave'
  const [activity, setActivity] = useState('idle');
  const [facing, setFacing] = useState(1); // 1 = right, -1 = left
  const [posX, setPosX] = useState(32); // px from left
  const [posY, setPosY] = useState(24); // px from bottom
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // 2.5D Perspective Tilt angles (rotX: vertical tilt, rotY: horizontal tilt, rotZ: subtle roll)
  const [tilt3D, setTilt3D] = useState({ rotX: 0, rotY: 0, rotZ: 0 });
  // Eye pupil gaze coordinates relative to eye center (-3.5 to +3.5 px)
  const [pupilGaze, setPupilGaze] = useState({ x: 0, y: 0 });
  // Natural eyelid blinking state
  const [isBlinking, setIsBlinking] = useState(false);

  // Floating Cyber Drone "BYTE" companion state
  const [dronePulse, setDronePulse] = useState(0);

  // Dialog & UI states
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [sparkles, setSparkles] = useState([]);

  const mascotRef = useRef(null);
  const scrollTimeout = useRef(null);
  const idleTimeout = useRef(null);
  const wanderInterval = useRef(null);
  const saccadeInterval = useRef(null);
  const blinkTimeout = useRef(null);
  const autoCloseTimer = useRef(null);
  const lastMouseTime = useRef(Date.now());

  // Contextual dialogues
  const dialogues = {
    home: [
      { text: "Hey! I'm Tobi's living 2.5D companion. Move your cursor around to see me track you! 👋", action: null },
      { text: "Pick me up by my hoodie and toss me anywhere on your screen! 🚀", action: null },
      { text: "Pro tip: Press Ctrl+K (or ⌘K) to open the Command Palette! ⚡", action: null },
      { text: "I've architected systems processing over 10 Billion NGN annually! 💳", action: { label: "View Timeline", page: "experience" } }
    ],
    projects: [
      { text: "Check out LMS TASCE! It handles 15,000+ students with 99.9% uptime 🎓", action: null },
      { text: "Building scalable web apps in Vue, Nuxt, Laravel & MySQL! 🚀", action: null },
      { text: "Click on any project card to inspect the full case study & metrics! 🔍", action: null }
    ],
    skills: [
      { text: "My core tech stack? Laravel 11 + Vue.js + Inertia.js! 🔥", action: null },
      { text: "Cloudinary CDN gave our university portals a 40% speed lift! ⚡", action: null },
      { text: "From MySQL indexing to AWS cloud security, I love scalable systems 🛡️", action: null }
    ],
    experience: [
      { text: "5+ years of shipping software in production! Check out the milestones ⏱", action: null },
      { text: "Click 'Download Resume (PDF)' above to get my official vector resume! 📄", action: null },
      { text: "Currently System Programmer at Tai Solarin University ICT (TASUED) 🏛️", action: null }
    ],
    about: [
      { text: "Origin story & engineering philosophy! Glad you stopped by ☕", action: null },
      { text: "Open to global relocation (Canada, UK, Europe) & remote roles! ✈️", action: { label: "Initiate Contact", page: "contact" } },
      { text: "When I'm not coding, I love technical writing and judging startups 📖", action: null }
    ],
    contact: [
      { text: "Ready to collaborate? Submissions go directly to willnagato@outlook.com! ✉️", action: null },
      { text: "Feel free to use the Quick Transmission templates on the left! ⚡", action: null },
      { text: "Let's build something extraordinary together! 🚀", action: null }
    ]
  };

  const currentList = dialogues[activePage] || dialogues.home;
  const currentDialogue = currentList[dialogIndex % currentList.length];

  // Activities List for User Control
  const activityList = [
    { id: 'walk', label: 'Walk', icon: '🚶' },
    { id: 'run', label: 'Sprint', icon: '🏃' },
    { id: 'hoverboard', label: 'Skate', icon: '🛹' },
    { id: 'code', label: 'Code', icon: '💻' },
    { id: 'jump', label: 'Backflip', icon: '🦘' },
    { id: 'dance', label: 'Groove', icon: '🕺' },
    { id: 'coffee', label: 'Coffee', icon: '☕' },
    { id: 'wave', label: 'Wave', icon: '👋' },
    { id: 'sleep', label: 'Nap', icon: '😴' }
  ];

  // 1. 2.5D REAL-TIME PERSPECTIVE TILT & EYE TRACKING
  useEffect(() => {
    const handleMouseMove = (e) => {
      lastMouseTime.current = Date.now();
      if (!mascotRef.current || isDragging || activity === 'sleep') return;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.4;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // 3D Perspective Tilt (-16deg to +16deg on Y axis, -12deg to +10deg on X axis)
      const normX = Math.max(-1, Math.min(1, deltaX / (window.innerWidth * 0.45)));
      const normY = Math.max(-1, Math.min(1, deltaY / (window.innerHeight * 0.45)));

      const rotY = Number((normX * 18).toFixed(1));
      const rotX = Number((-normY * 13).toFixed(1));
      const rotZ = Number((normX * 2.5).toFixed(1));

      setTilt3D({ rotX, rotY, rotZ });

      // Pupil Gaze calculation
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(3.6, Math.hypot(deltaX, deltaY) / 48);
      setPupilGaze({
        x: Number((Math.cos(angle) * distance).toFixed(1)),
        y: Number((Math.sin(angle) * distance).toFixed(1))
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging, activity]);

  // 2. AUTONOMOUS SACCADES & IDLE 3D SWAY (Glancing around naturally when mouse is still)
  useEffect(() => {
    saccadeInterval.current = setInterval(() => {
      if (isDragging || activity === 'sleep') return;

      const idleDuration = Date.now() - lastMouseTime.current;
      // If mouse hasn't moved in 2.2 seconds, take spontaneous glances
      if (idleDuration > 2200) {
        const glances = [
          { gaze: { x: 2.8, y: -1.2 }, tilt: { rotX: 4, rotY: 8, rotZ: 1.5 } },
          { gaze: { x: -2.8, y: -0.8 }, tilt: { rotX: 2, rotY: -8, rotZ: -1.5 } },
          { gaze: { x: 0, y: -2.6 }, tilt: { rotX: 9, rotY: 0, rotZ: 0 } }, // looking up at page
          { gaze: { x: 1.5, y: 1.5 }, tilt: { rotX: -4, rotY: 5, rotZ: 0 } },
          { gaze: { x: 0, y: 0 }, tilt: { rotX: 0, rotY: 0, rotZ: 0 } }
        ];
        const nextGlance = glances[Math.floor(Math.random() * glances.length)];
        setPupilGaze(nextGlance.gaze);
        setTilt3D(nextGlance.tilt);
      }
    }, 2800);

    return () => {
      if (saccadeInterval.current) clearInterval(saccadeInterval.current);
    };
  }, [isDragging, activity]);

  // 3. NATURAL BLINKING ENGINE (Single & occasional double-blinks)
  useEffect(() => {
    const scheduleBlink = () => {
      const nextDelay = 3200 + Math.random() * 3600;
      blinkTimeout.current = setTimeout(() => {
        if (activity !== 'sleep') {
          setIsBlinking(true);
          setTimeout(() => {
            setIsBlinking(false);
            // 25% chance of an inquisitive double-blink
            if (Math.random() < 0.25) {
              setTimeout(() => {
                setIsBlinking(true);
                setTimeout(() => setIsBlinking(false), 120);
              }, 160);
            }
          }, 140);
        }
        scheduleBlink();
      }, nextDelay);
    };

    scheduleBlink();
    return () => {
      if (blinkTimeout.current) clearTimeout(blinkTimeout.current);
    };
  }, [activity]);

  // 4. AUTONOMOUS WANDERING & CASUAL LIFE ACTIONS (Strolls, waves, inspects)
  useEffect(() => {
    if (isMinimized || isDragging) return;

    wanderInterval.current = setInterval(() => {
      if (activity === 'idle') {
        const roll = Math.random();

        // 45% chance to wander across screen
        if (roll < 0.45) {
          const screenW = window.innerWidth;
          const maxRange = Math.min(screenW - 140, 480);
          const minRange = 28;

          const targetX = Math.floor(minRange + Math.random() * (maxRange - minRange));
          const moveDir = targetX > posX ? 1 : -1;
          setFacing(moveDir);
          setActivity('walk');

          // Smoothly animate towards target
          setPosX(targetX);

          // Spawn ground dust sparkles along the walk
          const sId = Date.now();
          setSparkles((prev) => [...prev, sId]);
          setTimeout(() => setSparkles((prev) => prev.filter((s) => s !== sId)), 1800);

          setTimeout(() => {
            const nextRoll = Math.random();
            if (nextRoll < 0.3) {
              setActivity('code');
              setTimeout(() => setActivity('idle'), 3800);
            } else if (nextRoll < 0.5) {
              setActivity('wave');
              setTimeout(() => setActivity('idle'), 2400);
            } else {
              setActivity('idle');
            }
          }, 2200);
        } else if (roll < 0.65) {
          // Quick friendly wave in place
          setActivity('wave');
          setTimeout(() => setActivity('idle'), 2200);
        }
      }
    }, 9500);

    return () => {
      if (wanderInterval.current) clearInterval(wanderInterval.current);
    };
  }, [activity, isMinimized, isDragging, posX]);

  // 5. REACTIVE SCROLLING: Runs or Skates when user scrolls the page
  useEffect(() => {
    const handleScroll = () => {
      if (isMinimized || isDragging) return;

      if (activity !== 'run' && activity !== 'hoverboard') {
        const newAct = window.scrollY > 850 ? 'hoverboard' : 'run';
        setActivity(newAct);
        setFacing(1);
      }

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        // When scroll stops, smoothly return to idle
        setActivity('idle');
      }, 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [activity, isMinimized, isDragging]);

  // 6. INACTIVITY TIMER: Falls asleep after 35s of inactivity
  useEffect(() => {
    const resetIdle = () => {
      if (activity === 'sleep') {
        setActivity('idle');
      }
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
      idleTimeout.current = setTimeout(() => {
        if (!isMinimized && !isDragging) {
          setActivity('sleep');
        }
      }, 35000);
    };

    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('touchstart', resetIdle, { passive: true });
    window.addEventListener('keydown', resetIdle, { passive: true });

    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, [activity, isMinimized, isDragging]);

  // 7. DRAG & DROP PHYSICS (2.5D Grab & Drop Bounce)
  const handleStartDrag = (clientX, clientY) => {
    if (isMinimized) return;
    setIsDragging(true);
    setActivity('drag');
    soundManager.playClick();

    const rect = mascotRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - (window.innerHeight - rect.bottom)
      });
    }
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.mascot-minimize-toggle') || e.target.closest('.mascot-actions-trigger') || e.target.closest('.mascot-drone-unit')) return;
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.mascot-minimize-toggle') || e.target.closest('.mascot-actions-trigger') || e.target.closest('.mascot-drone-unit')) return;
    const touch = e.touches[0];
    handleStartDrag(touch.clientX, touch.clientY);
  };

  const handleDragMove = useCallback((clientX, clientY) => {
    if (!isDragging) return;
    const newX = Math.max(12, Math.min(window.innerWidth - 110, clientX - dragOffset.x));
    const newY = Math.max(16, Math.min(window.innerHeight - 150, window.innerHeight - clientY - 30));
    setPosX(newX);
    setPosY(newY);
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    soundManager.playSuccess();

    // Gravity drop to floor with 2.5D squash bounce
    setActivity('jump');
    setPosY(24);

    setTimeout(() => {
      setActivity('idle');
    }, 750);
  }, [isDragging]);

  useEffect(() => {
    const onMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (isDragging && e.touches[0]) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onMouseUp = () => handleDragEnd();
    const onTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // 8. Speech Bubble Auto-Close
  useEffect(() => {
    if (isOpen) {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
      autoCloseTimer.current = setTimeout(() => {
        setIsOpen(false);
      }, 7500);
    }
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, [isOpen, dialogIndex]);

  // Click mascot (Petting on head / Jumps & Hearts)
  const handleMascotClick = (e) => {
    if (isDragging) return;
    soundManager.playSuccess();
    setHasInteracted(true);

    // Spawn floating heart particles
    const id = Date.now();
    setHearts((prev) => [...prev, id]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h !== id)), 1400);

    if (activity === 'sleep') {
      setActivity('jump');
      setTimeout(() => setActivity('idle'), 900);
      setIsOpen(true);
      return;
    }

    setActivity('jump');
    setTimeout(() => {
      setActivity((prev) => (prev === 'jump' ? 'idle' : prev));
    }, 900);

    if (!isOpen) {
      setIsOpen(true);
    } else {
      setDialogIndex((prev) => (prev + 1) % currentList.length);
    }
  };

  const handleNextDialogue = (e) => {
    e.stopPropagation();
    soundManager.playClick();
    setDialogIndex((prev) => (prev + 1) % currentList.length);
  };

  const handleActionClick = (e, targetPage) => {
    e.stopPropagation();
    soundManager.playClick();
    if (onNavigate && targetPage) {
      onNavigate(targetPage);
      setIsOpen(false);
    }
  };

  const handleToggleMinimize = (e) => {
    e.stopPropagation();
    soundManager.playClick();
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setIsOpen(false);
      setShowActivityPicker(false);
    }
  };

  const handleSelectActivity = (e, actId) => {
    e.stopPropagation();
    soundManager.playClick();
    setActivity(actId);

    if (actId === 'coffee') {
      soundManager.playSuccess();
      setTimeout(() => setActivity('run'), 1800);
    } else if (actId === 'sleep') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  // Drone click reaction (aerial 360 spin & chime)
  const handleDroneClick = (e) => {
    e.stopPropagation();
    soundManager.playSuccess();
    setDronePulse((prev) => prev + 1);
  };

  // Calculate 2.5D perspective transform for the avatar wrapper
  const avatarTransform3D = `
    rotateX(${tilt3D.rotX}deg)
    rotateY(${(tilt3D.rotY * facing).toFixed(1)}deg)
    rotateZ(${tilt3D.rotZ * facing}deg)
    scaleX(${facing})
  `;

  return (
    <aside
      ref={mascotRef}
      className={`digital-mascot-container ${isMinimized ? 'minimized' : ''} ${isDragging ? 'is-dragging' : ''} activity-${activity}`}
      style={{
        left: `${posX}px`,
        bottom: `${posY}px`
      }}
      aria-label="Interactive 2.5D Companion Mascot"
    >
      {/* Activity Control Bar */}
      {!isMinimized && showActivityPicker && (
        <div
          className="mascot-activity-toolbar glass-panel"
          role="toolbar"
          aria-label="Mascot Activities"
        >
          <div className="activity-toolbar-header font-mono">
            <span>TOBI.SYS ACTIVITIES</span>
            <button className="toolbar-close-btn" onClick={() => setShowActivityPicker(false)}>✕</button>
          </div>
          <div className="activity-buttons-row">
            {activityList.map((item) => (
              <button
                key={item.id}
                className={`activity-pill-btn font-mono ${activity === item.id ? 'active' : ''}`}
                onClick={(e) => handleSelectActivity(e, item.id)}
                title={`Make Tobi ${item.label}`}
              >
                <span className="act-icon">{item.icon}</span>
                <span className="act-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Hearts when Pet / Clicked */}
      {hearts.map((hId) => (
        <span key={hId} className="mascot-heart-particle" aria-hidden="true">❤️</span>
      ))}

      {/* Interactive Speech Bubble */}
      {isOpen && !isMinimized && !isDragging && (
        <div
          className="mascot-speech-bubble glass-panel"
          role="dialog"
          aria-live="polite"
        >
          <button
            className="speech-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            title="Dismiss bubble"
            aria-label="Dismiss message"
          >
            ✕
          </button>

          <div className="speech-content font-mono">
            <div className="speech-badge-row">
              <span className="speech-speaker-badge text-gradient-neon">TOBI.SYS 2.5D</span>
              <span className="speech-state-badge font-mono">{activity.toUpperCase()}</span>
            </div>
            <p className="speech-text">{currentDialogue.text}</p>
          </div>

          <div className="speech-footer">
            {currentDialogue.action && (
              <button
                className="speech-action-btn font-mono"
                onClick={(e) => handleActionClick(e, currentDialogue.action.page)}
              >
                <span>{currentDialogue.action.label}</span>
                <span>→</span>
              </button>
            )}
            <button
              className="speech-next-btn font-mono"
              onClick={handleNextDialogue}
              title="Next tip"
            >
              <span>Next</span>
              <span>↻</span>
            </button>
          </div>
          <div className="speech-bubble-tail" aria-hidden="true" />
        </div>
      )}

      {/* 2.5D Mascot Character Body Wrapper */}
      <div
        className="mascot-avatar-wrapper"
        style={{ transform: avatarTransform3D }}
        onMouseDown={handlePointerDown}
        onTouchStart={handleTouchStart}
        onClick={handleMascotClick}
        title="Click to interact, or drag to pick me up in 2.5D!"
      >
        {/* Ambient Volumetric Backlight Glow */}
        <div className="mascot-ambient-glow" aria-hidden="true" />

        {/* Speed Wind Lines during Run */}
        {activity === 'run' && (
          <div className="mascot-speed-lines" aria-hidden="true">
            <span className="speed-line line-1" />
            <span className="speed-line line-2" />
            <span className="speed-line line-3" />
          </div>
        )}

        {/* Sleep ZZZ particles during Nap */}
        {activity === 'sleep' && (
          <div className="mascot-sleep-particles font-mono" aria-hidden="true">
            <span className="zzz z1">z</span>
            <span className="zzz z2">Z</span>
            <span className="zzz z3">Z</span>
          </div>
        )}

        {/* Music Notes during Dance */}
        {activity === 'dance' && (
          <div className="mascot-music-notes" aria-hidden="true">
            <span className="note note-1">♪</span>
            <span className="note note-2">♫</span>
            <span className="note note-3">♬</span>
          </div>
        )}

        {/* Coffee steam during Coffee */}
        {activity === 'coffee' && (
          <div className="mascot-coffee-steam" aria-hidden="true">
            <span className="steam steam-1">♨</span>
            <span className="steam steam-2">⚡</span>
          </div>
        )}

        {/* Minimized Pill Toggle */}
        <button
          className="mascot-minimize-toggle"
          onClick={handleToggleMinimize}
          title={isMinimized ? 'Wake companion' : 'Sleep companion'}
          aria-label={isMinimized ? 'Wake companion' : 'Sleep companion'}
        >
          {isMinimized ? '⚡' : '−'}
        </button>

        {/* Quick Activity Controller Trigger */}
        {!isMinimized && (
          <button
            className="mascot-actions-trigger"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setShowActivityPicker(!showActivityPicker);
            }}
            title="Choose Mascot Activity"
            aria-label="Choose Mascot Activity"
          >
            🎮
          </button>
        )}

        {/* ========================================================
            2.5D VOLUMETRIC VECTOR CHIBI SVG
            Articulated joints, multi-layer depth, spherical shading
            ======================================================== */}
        <div className="mascot-svg-box">
          <svg
            className={`mascot-svg mascot-anim-${activity}`}
            viewBox="0 0 120 155"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* 1. Volumetric Head & Skin Spherical Gradient (Key Light 42% 35%) */}
              <radialGradient id="tobiSkin3D" cx="42%" cy="36%" r="58%" fx="38%" fy="32%">
                <stop offset="0%" stopColor="#9a6e56" />
                <stop offset="40%" stopColor="#7e533c" />
                <stop offset="78%" stopColor="#603b27" />
                <stop offset="100%" stopColor="#432414" />
              </radialGradient>

              {/* 2. Ambient Occlusion Neck / Chin Shadow */}
              <linearGradient id="tobiNeckShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3c1e0e" />
                <stop offset="100%" stopColor="#241107" />
              </linearGradient>

              {/* 3. Hair Volumetric 3D Gradient with Specular Sheen */}
              <radialGradient id="tobiHair3D" cx="48%" cy="20%" r="65%" fx="45%" fy="15%">
                <stop offset="0%" stopColor="#36302c" />
                <stop offset="35%" stopColor="#231f1c" />
                <stop offset="80%" stopColor="#120f0d" />
                <stop offset="100%" stopColor="#080706" />
              </radialGradient>

              {/* 4. Cyber Streetwear Hoodie (Volumetric Cylindrical Torso) */}
              <linearGradient id="tobiHoodie3D" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#2f3b63" />
                <stop offset="30%" stopColor="#202947" />
                <stop offset="75%" stopColor="#141a2e" />
                <stop offset="100%" stopColor="#0b0e1b" />
              </linearGradient>

              {/* 5. Techwear Joggers (Cylindrical depth with rim shine) */}
              <linearGradient id="tobiPants3D" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#252f4f" />
                <stop offset="45%" stopColor="#161c30" />
                <stop offset="90%" stopColor="#0d101d" />
                <stop offset="100%" stopColor="#06080e" />
              </linearGradient>

              {/* 6. High-Top Chunky Cyber Sneakers (3D Shaded) */}
              <linearGradient id="tobiSneakers3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#414e7a" />
                <stop offset="45%" stopColor="#222a44" />
                <stop offset="85%" stopColor="#101424" />
                <stop offset="100%" stopColor="#080a14" />
              </linearGradient>

              {/* 7. Hoverboard 2.5D Deck (Isometric Gradient) */}
              <linearGradient id="tobiHoverboardDeck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="50%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>

              {/* 8. Mini Drone "BYTE" Metallic Shell */}
              <radialGradient id="byteShell3D" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="40%" stopColor="#94a3b8" />
                <stop offset="85%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>

              {/* 9. Bloom Specular Glow Filter */}
              <filter id="chibiBloom" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* 10. Ambient Contact Shadow Filter */}
              <filter id="chibiFloorShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.55 0"/>
              </filter>
            </defs>

            {/* Back Glow Halo Ring */}
            <circle
              cx="60"
              cy="52"
              r="44"
              fill="none"
              stroke="var(--accent-glow)"
              strokeWidth="1.6"
              strokeDasharray="6 5"
              opacity="0.65"
              className="mascot-halo-ring"
            />

            {/* HOVERBOARD 2.5D (Under feet during hoverboard activity) */}
            {activity === 'hoverboard' && (
              <g className="mascot-hoverboard-prop" filter="url(#chibiBloom)">
                {/* 3D Isometric Deck */}
                <ellipse cx="60" cy="142" rx="46" ry="8.5" fill="url(#tobiHoverboardDeck)" />
                <ellipse cx="60" cy="141" rx="41" ry="5.5" fill="#080c1a" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
                {/* Dual Anti-Gravity Plasma Thruster Flares */}
                <ellipse cx="32" cy="148" rx="9" ry="4.5" fill="var(--accent-secondary)" className="thruster-glow" />
                <ellipse cx="88" cy="148" rx="9" ry="4.5" fill="var(--accent-secondary)" className="thruster-glow" />
              </g>
            )}

            {/* Jump Impact Shockwave Ring */}
            {activity === 'jump' && (
              <ellipse
                cx="60"
                cy="144"
                rx="34"
                ry="6"
                fill="none"
                stroke="var(--accent-secondary)"
                strokeWidth="2.2"
                filter="url(#chibiBloom)"
                className="jump-ripple-ring"
              />
            )}

            {/* 2.5D Dynamic Ground Contact Shadow (Squashes with jump height & drag) */}
            {!isDragging && activity !== 'hoverboard' && (
              <ellipse
                cx="60"
                cy="143"
                rx={activity === 'jump' ? 14 : 32}
                ry={activity === 'jump' ? 2.5 : 5.5}
                fill="#000000"
                filter="url(#chibiFloorShadow)"
                className="mascot-ground-shadow"
              />
            )}

            {/* ========================================================
                1. LEGS & CHUNKY CYBER SNEAKERS
                ======================================================== */}
            <g className={`mascot-legs-group ${isDragging ? 'legs-dangling' : ''}`}>
              {/* Left Leg */}
              <g className="mascot-leg mascot-leg-left">
                {/* Joggers */}
                <path d="M 44 98 L 40 128 L 53 128 L 54 98 Z" fill="url(#tobiPants3D)" />
                {/* Neon Jogger Accent Stripe */}
                <line x1="41" y1="100" x2="40" y2="126" stroke="var(--accent-secondary)" strokeWidth="1.6" opacity="0.85" />

                {/* Left Chunky Sneaker */}
                <g className="mascot-sneaker">
                  <path d="M 28 127 L 54 127 L 56 138 L 27 138 Z" fill="url(#tobiSneakers3D)" />
                  {/* Glowing Translucent Sole Air Cushion */}
                  <rect x="26" y="136" width="31" height="4" rx="2" fill="var(--accent-secondary)" filter="url(#chibiBloom)" />
                  {/* Sneaker Cyber Lines */}
                  <line x1="33" y1="130" x2="44" y2="130" stroke="#ffffff" strokeWidth="1.2" />
                  <line x1="35" y1="133" x2="42" y2="133" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                </g>
              </g>

              {/* Right Leg */}
              <g className="mascot-leg mascot-leg-right">
                {/* Joggers */}
                <path d="M 66 98 L 67 128 L 80 128 L 76 98 Z" fill="url(#tobiPants3D)" />
                {/* Neon Jogger Accent Stripe */}
                <line x1="79" y1="100" x2="80" y2="126" stroke="var(--accent-secondary)" strokeWidth="1.6" opacity="0.85" />

                {/* Right Chunky Sneaker */}
                <g className="mascot-sneaker">
                  <path d="M 64 127 L 90 127 L 92 138 L 63 138 Z" fill="url(#tobiSneakers3D)" />
                  {/* Glowing Translucent Sole Air Cushion */}
                  <rect x="62" y="136" width="31" height="4" rx="2" fill="var(--accent-secondary)" filter="url(#chibiBloom)" />
                  {/* Sneaker Cyber Lines */}
                  <line x1="69" y1="130" x2="80" y2="130" stroke="#ffffff" strokeWidth="1.2" />
                  <line x1="71" y1="133" x2="78" y2="133" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                </g>
              </g>
            </g>

            {/* ========================================================
                2. CYBER HOODIE TORSO (3D Volumetric)
                ======================================================== */}
            <g className="mascot-torso-group">
              {/* Torso Base */}
              <path
                d="M 36 74 C 36 65 47 63 60 63 C 73 63 84 65 84 74 L 85 101 C 85 104 80 106 60 106 C 40 106 35 104 35 101 Z"
                fill="url(#tobiHoodie3D)"
                stroke="var(--border-glass)"
                strokeWidth="1.2"
              />

              {/* 3D Kangaroo Pocket with Fold Shadow */}
              <path
                d="M 43 89 C 43 86 51 85 60 85 C 69 85 77 86 77 89 L 79 102 C 79 104 74 105 60 105 C 46 105 41 104 41 102 Z"
                fill="#161e36"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />

              {/* Cyber Neon Seamlines with Glow */}
              <path d="M 49 66 L 60 80 L 71 66" fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" strokeLinecap="round" filter="url(#chibiBloom)" />
              <path d="M 60 80 L 60 102" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.8" />

              {/* Glowing Chest Badge "OW.SYS" */}
              <rect x="44" y="82" width="32" height="12.5" rx="4" fill="rgba(6,9,18,0.9)" stroke="var(--accent-cyan-glow)" strokeWidth="1" />
              <text x="60" y="91" textAnchor="middle" fill="var(--accent-secondary)" fontSize="7.2" fontFamily="var(--font-mono)" fontWeight="bold">
                OW.SYS
              </text>
            </g>

            {/* ========================================================
                3. ARMS & PROPS (Clean Dedicated Poses — No Duplicate Hands)
                ======================================================== */}
            {activity === 'code' ? (
              /* Dedicated 2.5D Coding Arms & Holographic Terminal */
              <g className="mascot-coding-setup">
                {/* Left Arm reaching naturally from shoulder down to keyboard */}
                <g className="typing-arm typing-arm-left">
                  <path d="M 36 73 C 31 81 33 94 48 103 C 51 104 53 102 51 100 C 42 93 39 82 43 75 Z" fill="url(#tobiHoodie3D)" />
                  <circle cx="50" cy="103" r="4.6" fill="url(#tobiSkin3D)" className="typing-hand typing-left" />
                </g>
                {/* Right Arm reaching naturally from shoulder down to keyboard */}
                <g className="typing-arm typing-arm-right">
                  <path d="M 84 73 C 89 81 87 94 72 103 C 69 104 67 102 69 100 C 78 93 81 82 77 75 Z" fill="url(#tobiHoodie3D)" />
                  <circle cx="70" cy="103" r="4.6" fill="url(#tobiSkin3D)" className="typing-hand typing-right" />
                </g>

                {/* Holographic Cyber Laptop Workstation */}
                <g className="mascot-laptop-prop" filter="url(#chibiBloom)">
                  {/* Glowing Neon Ground Reflection under deck */}
                  <ellipse cx="60" cy="108" rx="26" ry="3.5" fill="var(--accent-secondary)" opacity="0.35" />

                  {/* Keyboard Deck (Base) */}
                  <polygon points="32,104 88,104 93,113 27,113" fill="#0d1326" stroke="var(--accent-secondary)" strokeWidth="1.2" />
                  {/* Illuminated Neon Keys Grid */}
                  <rect x="36" y="105.5" width="48" height="4.5" rx="1" fill="rgba(6, 182, 212, 0.45)" />
                  {/* Trackpad */}
                  <rect x="54" y="110.5" width="12" height="1.8" rx="0.5" fill="rgba(255, 255, 255, 0.5)" />

                  {/* Holographic Display Screen (Angled cleanly at waist level) */}
                  <polygon points="36,82 84,82 88,104 32,104" fill="rgba(8, 14, 32, 0.92)" stroke="var(--accent-primary)" strokeWidth="1.4" />
                  
                  {/* Terminal Window Header Bar */}
                  <rect x="36" y="82" width="48" height="3.5" fill="var(--accent-primary)" opacity="0.6" />
                  <circle cx="39" cy="83.8" r="0.9" fill="#f43f5e" />
                  <circle cx="42" cy="83.8" r="0.9" fill="#fbbf24" />
                  <circle cx="45" cy="83.8" r="0.9" fill="#10b981" />

                  {/* Animated Code Syntax Streams */}
                  <line x1="40" y1="88" x2="66" y2="88" stroke="#06b6d4" strokeWidth="1.4" strokeLinecap="round" className="code-line line-c1" />
                  <line x1="40" y1="92" x2="78" y2="92" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" className="code-line line-c2" />
                  <line x1="40" y1="96" x2="56" y2="96" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" className="code-line line-c3" />
                  <line x1="40" y1="100" x2="72" y2="100" stroke="#38bdf8" strokeWidth="1.4" strokeLinecap="round" className="code-line line-c4" />

                  {/* Floating Hologram Code Particles */}
                  <text x="49" y="78" fill="var(--accent-secondary)" fontSize="4.6" fontFamily="var(--font-mono)" opacity="0.9" className="holo-code-snip-1">
                    &lt;Dev/&gt;
                  </text>
                  <text x="69" y="75" fill="var(--accent-primary)" fontSize="4.2" fontFamily="var(--font-mono)" opacity="0.85" className="holo-code-snip-2">
                    10B+
                  </text>
                </g>
              </g>
            ) : (
              /* Normal Articulated Arms for Standing / Walking / Waving */
              <g className="mascot-arms-group">
                {/* Left Arm */}
                <g className={`mascot-arm mascot-arm-left ${activity === 'wave' ? 'arm-wave' : ''}`}>
                  <path d="M 36 72 C 29 78 26 89 30 98 C 31 100 35 100 36 98 C 36 91 39 80 43 74 Z" fill="url(#tobiHoodie3D)" />
                  <circle cx="30" cy="99" r="5" fill="url(#tobiSkin3D)" />
                </g>

                {/* Right Arm */}
                <g className={`mascot-arm mascot-arm-right ${activity === 'wave' ? 'arm-wave' : ''}`}>
                  <path d="M 84 72 C 91 78 94 89 90 98 C 89 100 85 100 84 98 C 84 91 81 80 77 74 Z" fill="url(#tobiHoodie3D)" />
                  <circle cx="90" cy="99" r="5" fill="url(#tobiSkin3D)" />
                </g>
              </g>
            )}

            {activity === 'coffee' && (
              <g className="mascot-coffee-mug" filter="url(#chibiBloom)">
                <rect x="76" y="84" width="18" height="20" rx="3.5" fill="#ffffff" stroke="var(--accent-primary)" strokeWidth="1.4" />
                <path d="M 94 88 C 99 88 99 100 94 100" fill="none" stroke="var(--accent-primary)" strokeWidth="1.6" />
                <text x="85" y="97" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="bold">ICT</text>
              </g>
            )}

            {/* ========================================================
                5. 2.5D SPHERICAL HEAD & LIVING FACE
                ======================================================== */}
            <g className={`mascot-head-group ${activity === 'sleep' ? 'head-sleep' : ''}`}>
              {/* Neck with 3D Ambient Occlusion Shadow */}
              <rect x="53" y="58" width="14" height="12" rx="3.5" fill="url(#tobiNeckShadow)" />

              {/* Ears */}
              <circle cx="32" cy="46" r="6.2" fill="url(#tobiSkin3D)" />
              <circle cx="32" cy="46" r="3.6" fill="url(#tobiNeckShadow)" />
              <circle cx="88" cy="46" r="6.2" fill="url(#tobiSkin3D)" />
              <circle cx="88" cy="46" r="3.6" fill="url(#tobiNeckShadow)" />

              {/* Cyber Ear-Cuff Beacon */}
              <circle cx="30" cy="43" r="3" fill="var(--accent-secondary)" filter="url(#chibiBloom)" />

              {/* 3D Volumetric Spherical Head */}
              <rect x="33" y="22" width="54" height="46" rx="21" fill="url(#tobiSkin3D)" />

              {/* Warm Cheek Highlights (Subsurface Scattering) */}
              <circle cx="43" cy="51" r="5.5" fill="#ab7155" opacity="0.45" />
              <circle cx="77" cy="51" r="5.5" fill="#ab7155" opacity="0.45" />

              {/* Hair: Clean Fade Cut with Curved Hairline & Specular Top */}
              <path
                d="M 32 35 C 32 19 44 13 60 13 C 76 13 88 19 88 35 C 88 36 85 30 79 28 C 70 25 50 25 41 28 C 35 30 32 36 32 35 Z"
                fill="url(#tobiHair3D)"
              />
              <path
                d="M 37 31 C 45 29 54 29 60 29 C 66 29 75 29 83 31 L 83 23 C 76 17 44 17 37 23 Z"
                fill="url(#tobiHair3D)"
              />
              {/* Specular Hair Highlight Sheen Arc */}
              <path d="M 45 18 C 53 16 67 16 75 18" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.8" strokeLinecap="round" />

              {/* Dynamic Eyebrows */}
              <path d="M 41 36 C 45 34 51 35 54 37" fill="none" stroke="#161311" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M 79 36 C 75 34 69 35 66 37" fill="none" stroke="#161311" strokeWidth="2.6" strokeLinecap="round" />

              {/* 2.5D EYES (Interactive Gaze Tracking + Natural Blinking) */}
              {activity !== 'sleep' && !isBlinking ? (
                <g className="mascot-eyes">
                  {/* Left Eye Sclera */}
                  <ellipse cx="47" cy="42" rx="5.8" ry="6.5" fill="#f8fafc" />
                  {/* Left Iris & Pupil (Smooth Vector Gaze) */}
                  <g transform={`translate(${pupilGaze.x}, ${pupilGaze.y})`}>
                    <ellipse cx="47" cy="42" rx="4.2" ry="4.8" fill="#13100e" />
                    <circle cx="47" cy="42" r="2.5" fill="#4a1d06" opacity="0.85" />
                    {/* Fixed Specular Corneal Highlights (stays fixed for 3D sphere look!) */}
                    <circle cx="45.6" cy="40.4" r="1.8" fill="#ffffff" />
                    <circle cx="48.5" cy="43.5" r="0.9" fill="#ffffff" />
                  </g>

                  {/* Right Eye Sclera */}
                  <ellipse cx="73" cy="42" rx="5.8" ry="6.5" fill="#f8fafc" />
                  {/* Right Iris & Pupil (Smooth Vector Gaze) */}
                  <g transform={`translate(${pupilGaze.x}, ${pupilGaze.y})`}>
                    <ellipse cx="73" cy="42" rx="4.2" ry="4.8" fill="#13100e" />
                    <circle cx="73" cy="42" r="2.5" fill="#4a1d06" opacity="0.85" />
                    {/* Fixed Specular Corneal Highlights */}
                    <circle cx="71.6" cy="40.4" r="1.8" fill="#ffffff" />
                    <circle cx="74.5" cy="43.5" r="0.9" fill="#ffffff" />
                  </g>
                </g>
              ) : (
                /* Blinking / Sleeping Happy Arcs */
                <g className="mascot-eyes-closed">
                  <path d="M 42 43 C 45 47 50 47 53 43" fill="none" stroke="#161311" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M 67 43 C 70 47 75 47 78 43" fill="none" stroke="#161311" strokeWidth="2.6" strokeLinecap="round" />
                </g>
              )}

              {/* 3D Nose with Depth Shadow */}
              <path d="M 60 43 L 57.5 48.5 C 58.5 49.5 61.5 49.5 62.5 48.5 Z" fill="#48291a" />

              {/* Mustache */}
              <path d="M 53 51.5 C 57 50.5 60 51.5 60 51.5 C 60 51.5 63 50.5 67 51.5" fill="none" stroke="#161311" strokeWidth="1.8" strokeLinecap="round" />

              {/* Expressive Mouth */}
              {activity === 'jump' || activity === 'dance' || activity === 'coffee' ? (
                /* Excited Open Laugh / Cheer */
                <path d="M 52 54 C 54 62 66 62 68 54 Z" fill="#b91c1c" stroke="#2c170d" strokeWidth="1.4" />
              ) : isDragging ? (
                /* Surprised 'O' Mouth while being lifted in air */
                <ellipse cx="60" cy="55" rx="4" ry="5.2" fill="#2c170d" />
              ) : (
                /* Confident Warm Smile */
                <path d="M 53 54 C 57 58.5 63 58.5 67 54" fill="none" stroke="#2c170d" strokeWidth="2.4" strokeLinecap="round" />
              )}

              {/* Chin Goatee */}
              <path d="M 57 60 C 58 63.5 62 63.5 63 60 L 61.5 65 C 60.5 66 59.5 66 58.5 65 Z" fill="#161311" />

              {/* Cyber DJ Headphones (Active during Dance or Unmuted) */}
              {(activity === 'dance' || !isMuted) && (
                <g className="mascot-headphones" filter="url(#chibiBloom)">
                  {/* Metallic 3D Headband */}
                  <path d="M 31 43 C 31 16 89 16 89 43" fill="none" stroke="var(--accent-primary)" strokeWidth="4" strokeLinecap="round" />
                  {/* Left & Right Cushioned Earcups with Glowing LED Ring */}
                  <rect x="25" y="37" width="8" height="18" rx="4" fill="var(--accent-secondary)" />
                  <rect x="87" y="37" width="8" height="18" rx="4" fill="var(--accent-secondary)" />
                </g>
              )}
            </g>

            {/* ========================================================
                6. MINI CYBER-DRONE "BYTE" COMPANION (Orbits in 2.5D space)
                ======================================================== */}
            <g
              className={`mascot-drone-unit ${dronePulse > 0 ? 'drone-spin' : ''}`}
              onClick={handleDroneClick}
              title="BYTE — Tobi's cyber-drone companion! Click me to do a 360 flip!"
            >
              {/* Drone Ion Hover Trail */}
              <ellipse cx="106" cy="46" rx="9" ry="3.5" fill="var(--accent-secondary)" opacity="0.75" filter="url(#chibiBloom)" />
              {/* Metallic 3D Drone Body Sphere */}
              <circle cx="106" cy="40" r="10" fill="url(#byteShell3D)" stroke="var(--accent-primary)" strokeWidth="1.2" />
              {/* Glowing Antenna Beacon */}
              <line x1="106" y1="30" x2="106" y2="25" stroke="var(--accent-secondary)" strokeWidth="1.4" />
              <circle cx="106" cy="24" r="2.2" fill="var(--accent-secondary)" filter="url(#chibiBloom)" />
              {/* Digital LED Visor Face (Reactive) */}
              <rect x="99" y="37" width="14" height="6" rx="2.5" fill="#050814" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              <text x="106" y="42" textAnchor="middle" fill="var(--accent-secondary)" fontSize="4.8" fontFamily="var(--font-mono)" fontWeight="bold">
                {activity === 'code' ? '///' : activity === 'sleep' ? 'zZ' : activity === 'dance' ? '♫' : '^▽^'}
              </text>
            </g>
          </svg>
        </div>

        {/* Mascot Status Pill Badge */}
        <div className="mascot-status-pill font-mono">
          <span className="mascot-beacon" />
          <span className="mascot-name">TOBI</span>
          <span className="mascot-act-tag">{isDragging ? 'FLYING' : activity.toUpperCase()}</span>
        </div>
      </div>
    </aside>
  );
}
