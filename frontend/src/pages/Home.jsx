import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getContinueWatching } from '../api';

function Home() {
  const [trending, setTrending] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trendRes, cwRes] = await Promise.all([
          getTrending(),
          getContinueWatching(),
        ]);
        setTrending(trendRes.data.results || []);
        setContinueWatching(cwRes.data.results || []);
      } catch (err) {
        console.error('Failed to load:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="section" style={{ marginBottom: 28 }}>
        <h1 className="text-gradient" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px' }}>
          Made for you, Mom <span style={{ filter: 'drop-shadow(0 0 10px rgba(255,95,162,0.6))' }}>💕</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          Simple. Beautiful. Just for you. 💗
        </p>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">▶️ Continue Watching</h2>
          </div>
          <div className="grid">
            {continueWatching.map((item) => (
              <Link
                key={`${item.tmdb_id}-${item.media_type}`}
                to={
                  item.media_type === 'movie'
                    ? `/watch/movie/${item.tmdb_id}`
                    : `/watch/tv/${item.tmdb_id}/season/${item.season}/episode/${item.episode}`
                }
                className="card"
              >
                {item.poster_path ? (
                  <img
                    className="card-poster"
                    src={item.poster_path}
                    alt={item.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="card-poster-placeholder">🎬</div>
                )}
                <div className="card-body">
                  <div className="card-title">{item.title}</div>
                  <div className="card-year">
                    {item.media_type === 'tv'
                      ? `S${item.season} E${item.episode}`
                      : 'Movie'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">🔥 Trending This Week</h2>
        </div>
        {trending.length === 0 ? (
          <div className="empty-state">
            <h3>Welcome to MomFlix! 🎬</h3>
            <p>Use the search above to find movies and shows to watch.</p>
          </div>
        ) : (
          <div className="grid">
            {trending.map((item) => (
              <Link
                key={`${item.id}-${item.media_type}`}
                to={`/${item.media_type}/${item.id}`}
                className="card"
              >
                {item.poster ? (
                  <img
                    className="card-poster"
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="card-poster-placeholder">🎬</div>
                )}
                <div className="card-rating">★ {item.vote_average?.toFixed(1)}</div>
                <div className="card-body">
                  <div className="card-title">{item.title}</div>
                  <div className="card-year">
                    {item.year} · {item.media_type === 'movie' ? 'Movie' : 'TV'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;