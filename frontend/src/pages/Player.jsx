import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovie, getTV, updateContinueWatching } from '../api';

function Player() {
  const { id, season, episode } = useParams();
  const isMovie = window.location.pathname.startsWith('/watch/movie');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [subtitle, setSubtitle] = useState('en');

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
    <div>
      {/* Player */}
      <div className="player-container">
        <iframe
          className="player-iframe"
          src={finalUrl}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          title={item?.title || 'Player'}
        />
      </div>

      {/* Player Controls */}
      <div className="player-controls">
        <label className="player-control-label">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => setAutoplay(e.target.checked)}
          />
          Autoplay
        </label>
        <label className="player-control-label">
          Subtitles:
          <select value={subtitle} onChange={(e) => setSubtitle(e.target.value)}>
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
        <div className="section">
          <div className="section-header">
            <div>
              <h2 className="player-title-section">{item.title}</h2>
              {!isMovie && (
                <p className="player-episode-info">
                  Season {season} · Episode {episode}
                </p>
              )}
            </div>
            <Link to={`/${isMovie ? 'movie' : 'tv'}/${id}`} className="btn btn-secondary">
              📋 Details
            </Link>
          </div>
          <p className="player-overview">{item.overview}</p>
        </div>
      )}
    </div>
  );
}

export default Player;