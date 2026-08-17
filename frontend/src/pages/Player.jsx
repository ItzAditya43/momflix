import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovie, getTV, updateContinueWatching } from '../api';

function Player() {
  const { id, season, episode } = useParams();
  const isMovie = window.location.pathname.startsWith('/watch/movie');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [subtitle, setSubtitle] = useState('en');

  const playerContainerRef = useRef(null);

  const handleFullscreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = isMovie ? await getMovie(id) : await getTV(id);
        setItem(res.data);

        // Save to continue watching
        await updateContinueWatching({
          tmdb_id: parseInt(id),
          media_type: isMovie ? 'movie' : 'tv',
          title: res.data.title,
          poster_path: res.data.poster,
          season: season ? parseInt(season) : 1,
          episode: episode ? parseInt(episode) : 1,
          timestamp: 0,
        });
      } catch (err) {
        console.error('Failed to load:', err);
      }
      setLoading(false);
    };
    load();
  }, [id, isMovie, season, episode]);

  // Build vidsrc URL
  let embedUrl;
  if (isMovie) {
    embedUrl = `https://vidsrc.sbs/embed/movie/${id}`;
  } else {
    embedUrl = `https://vidsrc.sbs/embed/tv/${id}/${season}/${episode}`;
  }

  // Add query params
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  params.set('sub', subtitle);
  const finalUrl = `${embedUrl}?${params.toString()}`;

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '20px' }}>
      {/* Player */}
      <div className="player-container" ref={playerContainerRef} style={{ position: 'relative', background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
        <iframe
          className="player-iframe"
          src={finalUrl}
          allow="autoplay; encrypted-media; picture-in-picture"
          title={item?.title || 'Player'}
          style={{ width: '100%', height: '320px', border: 'none' }}
        />
        <button className="custom-fullscreen-btn" onClick={handleFullscreen} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 94, 91, 0.3)', color: 'var(--text)', borderRadius: '50px', width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}>
          ⛶
        </button>
      </div>

      {/* Player Controls */}
      <div className="player-controls" style={{ background: 'rgba(15, 30, 30, 0.8)', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(14px)', border: '1px solid var(--glass-border)' }}>
        <label className="player-control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          Autoplay
        </label>
        <label className="player-control-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          Subtitles:
          <select value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text)', fontSize: '15px' }}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            <option value="">None</option>
          </select>
        </label>
      </div>

      {/* Info */}
      {item && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="player-title-section" style={{ color: 'var(--text)', fontSize: '24px' }}>{item.title}</h2>
            {!isMovie && (
              <p className="player-episode-info" style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Season {season} · Episode {episode}
              </p>
            )}
          </div>
          <Link to={`/${isMovie ? 'movie' : 'tv'}/${id}`} className="btn btn-secondary" style={{ marginTop: '12px', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text)' }}>
            📋 Details
          </Link>
          <p className="player-overview" style={{ color: 'var(--text-muted)', fontSize: '17px', lineHeight: 1.7, marginBottom: '0' }}>{item.overview}</p>
        </div>
      )}
    </div>
  );
}

export default Player;