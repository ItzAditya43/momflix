import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import Player from './pages/Player';
import Settings from './pages/Settings';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠', match: (p) => p === '/' },
  { to: '/search', label: 'Search', icon: '🔍', match: (p) => p.startsWith('/search') },
  { to: '/favorites', label: 'My List', icon: '❤️', match: (p) => p === '/favorites' },
  { to: '/settings', label: 'Settings', icon: '⚙️', match: (p) => p === '/settings' },
];

// Inline SVG noise turbulence as a data URI for the grain overlay
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>` +
      `<filter id='n'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>` +
      `<feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.5 0'/>` +
      `</filter>` +
      `<rect width='100%' height='100%' filter='url(#n)'/>` +
      `</svg>`
  );

function App() {
  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });

  // Compute the active index based on the current path
  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.match(location.pathname))
  );

  // Measure the active item and place the sliding pill
  useEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const item = itemRefs.current[activeIndex];
      if (!nav || !item) return;
      const navRect = nav.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      setPill({ x: itemRect.left - navRect.left, w: itemRect.width, ready: true });
    };
    measure();
    window.addEventListener('resize', measure);
    // Re-measure once fonts are ready so labels don't shift
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener('resize', measure);
  }, [activeIndex, location.pathname]);

  return (
    <div className="app">
      {/* Existing ambient glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {/* Grain / noise overlay (subtle, mix-blend-mode: overlay) */}
      <div
        className="noise-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        aria-hidden="true"
      />

      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <span className="brand-heart">💕</span>Mom<span>Flix</span>
        </Link>
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${item.match(location.pathname) ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="main-content" key={location.pathname}>
        <div className="route-fade">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/:q" element={<Search />} />
            <Route path="/movie/:id" element={<Detail />} />
            <Route path="/tv/:id" element={<Detail />} />
            <Route path="/watch/movie/:id" element={<Player />} />
            <Route
              path="/watch/tv/:id/season/:season/episode/:episode"
              element={<Player />}
            />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>

      <nav className="bottom-nav" ref={navRef}>
        <div
          className={`bottom-nav-pill ${pill.ready ? 'ready' : ''}`}
          style={{ transform: `translateX(${pill.x}px)`, width: `${pill.w}px` }}
          aria-hidden="true"
        />
        {NAV_ITEMS.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`bottom-nav-item ${item.match(location.pathname) ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default App;