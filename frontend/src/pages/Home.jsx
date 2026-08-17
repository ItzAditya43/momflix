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
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="section">
        <h1 className="hero-greeting" style={{ color: 'var(--text)', marginBottom: '8px' }}>
          Made for you, Mom <span className="hero-heart">💕</span>
        </h1>
        <p className="hero-subtitle" style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
          Simple. Beautiful. Just for you. 💗
        </p>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <div className="section" style={{ marginBottom: '30px' }}>
          <div className="section-header">
            <h2 className="section-title" style={{ color: 'var(--text)', fontSize: '22px' }}>▶️ Continue Watching</h2>
          </div>
          <div className="grid" style={{ gap: '16px' }}>
            {continueWatching.map((item) => (
              <Link
                key={`${item.tmdb_id}-${item.media_type}`}
                to={
                  item.media_type === 'movie'
                    ? `/watch/movie/${item.tmdb_id}`
                    : `/watch/tv/${item.tmdb_id}/season/${item.season}/episode/${item.episode}`
                }
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {item.poster_path ? (
                  <img
                    className="card-poster"
                    src={item.poster_path}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="card-poster-placeholder" style={{ width: '100%', height: 'auto', aspectRatio: '2/3', background: '#241633', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🎬
                  </div>
                )}
                <div className="card-body" style={{ padding: '12px 14px' }}>
                  <div className="card-title" style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.title}</div>
                  <div className="card-year" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.media_type === 'tv' ? `S${item.season} E${item.episode}` : 'Movie'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div className="section" style={{ marginBottom: '30px' }}>
        <div className="section-header">
          <h2 className="section-title" style={{ color: 'var(--text)', fontSize: '22px' }}>🔥 Trending This Week</h2>
        </div>
        {trending.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>Welcome to MomFlix! 🎬</h3>
            <p style={{ color: 'var(--text-muted)' }}>Use the search above to find movies and shows to watch.</p>
          </div>
        ) : (
          <div className="grid" style={{ gap: '16px' }}>
            {trending.map((item) => (
              <Link
                key={`${item.id}-${item.media_type}`}
                to={`/${item.media_type}/${item.id}`}
                style={{
                  position: 'relative',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                {item.poster ? (
                  <img
                    className="card-poster"
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="card-poster-placeholder" style={{ width: '100%', height: 'auto', aspectRatio: '2/3', background: '#241633', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px' }}>
                    🎬
                  </div>
                )}
                <div className="card-rating" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(20, 12, 30, 0.75)', backdropFilter: 'blur(6px)', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: 'var(--gold)', border: '1px solid rgba(255, 210, 122, 0.3)' }}>
                  ★ {item.vote_average?.toFixed(1)}
                </div>
                <div className="card-body" style={{ padding: '12px 14px 14px' }}>
                  <div className="card-title" style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div className="card-year" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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