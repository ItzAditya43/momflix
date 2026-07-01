import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMovie, getTV, getSeason, getFavorites, addFavorite, removeFavorite } from '../api';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMovie = window.location.pathname.startsWith('/movie');
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [epLoading, setEpLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = isMovie ? await getMovie(id) : await getTV(id);
        setItem(res.data);
        
        // Check if favorited
        const favRes = await getFavorites();
        const favs = favRes.data.results || [];
        setIsFav(favs.some(f => f.id === res.data.id));
        
        // Load first season episodes for TV
        if (!isMovie && res.data.seasons?.length > 0) {
          setSelectedSeason(res.data.seasons[0].season_number);
        }
      } catch (err) {
        console.error('Failed to load details:', err);
      }
      setLoading(false);
    };
    load();
  }, [id, isMovie]);

  useEffect(() => {
    if (!isMovie && item && selectedSeason) {
      const loadEpisodes = async () => {
        setEpLoading(true);
        try {
          const res = await getSeason(id, selectedSeason);
          setEpisodes(res.data.episodes || []);
        } catch (err) {
          console.error('Failed to load episodes:', err);
          setEpisodes([]);
        }
        setEpLoading(false);
      };
      loadEpisodes();
    }
  }, [id, isMovie, item, selectedSeason]);

  const toggleFav = async () => {
    try {
      if (isFav) {
        await removeFavorite(item.id);
        setIsFav(false);
      } else {
        await addFavorite({
          id: item.id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster,
        });
        setIsFav(true);
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleWatch = () => {
    if (isMovie) {
      navigate(`/watch/movie/${item.id}`);
    } else {
      navigate(`/watch/tv/${item.id}/season/${selectedSeason}/episode/1`);
    }
  };

  const handleWatchEpisode = (episode) => {
    navigate(`/watch/tv/${item.id}/season/${selectedSeason}/episode/${episode.episode_number}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="empty-state">
        <h3>Content not found</h3>
        <p>This movie or show could not be loaded.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {item.backdrop && (
        <img className="detail-backdrop" src={item.backdrop} alt="" />
      )}
      
      <div className="detail-content">
        <div className="detail-header">
          {item.poster ? (
            <img className="detail-poster" src={item.poster} alt={item.title} />
          ) : (
            <div className="detail-poster" style={{ background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
              🎬
            </div>
          )}
          <div className="detail-info">
            <h1 className="detail-title">{item.title}</h1>
            <div className="detail-meta">
              <span>{item.year}</span>
              {item.runtime && <span>{item.runtime} min</span>}
              <span className="rating">★ {item.vote_average?.toFixed(1)}</span>
              <span>{isMovie ? 'Movie' : 'TV Series'}</span>
            </div>
            {item.genres?.length > 0 && (
              <div className="detail-genres">
                {item.genres.map((g) => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            )}
            <p className="detail-overview">{item.overview}</p>
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={handleWatch}>
                ▶️ {isMovie ? 'Watch Now' : 'Watch Season'}
              </button>
              <button
                className={`btn btn-icon ${isFav ? 'active' : ''}`}
                onClick={toggleFav}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFav ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        </div>

        {/* Cast */}
        {item.cast?.length > 0 && (
          <div className="cast-section">
            <h3>🎭 Cast</h3>
            <div className="cast-grid">
              {item.cast.map((c, i) => (
                <div key={i} className="cast-card">
                  {c.photo ? (
                    <img className="cast-photo" src={c.photo} alt={c.name} />
                  ) : (
                    <div className="cast-photo" style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                      🎭
                    </div>
                  )}
                  <div className="cast-name">{c.name}</div>
                  <div className="cast-character">{c.character}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasons & Episodes for TV */}
        {!isMovie && item.seasons?.length > 0 && (
          <div className="seasons-section">
            <h3>📺 Seasons</h3>
            <div className="season-list">
              {item.seasons.map((s) => (
                <button
                  key={s.season_number}
                  className={`season-btn ${selectedSeason === s.season_number ? 'active' : ''}`}
                  onClick={() => setSelectedSeason(s.season_number)}
                >
                  {s.name} ({s.episode_count} eps)
                </button>
              ))}
            </div>

            {epLoading ? (
              <div className="loading"><div className="spinner" /></div>
            ) : episodes.length > 0 ? (
              <div className="episode-list">
                {episodes.map((ep) => (
                  <div
                    key={ep.episode_number}
                    className="episode-item"
                    onClick={() => handleWatchEpisode(ep)}
                  >
                    {ep.still_path ? (
                      <img className="episode-still" src={ep.still_path} alt={ep.name} />
                    ) : (
                      <div className="episode-still" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, background: '#1a1a2e' }}>
                        📺
                      </div>
                    )}
                    <div className="episode-info">
                      <div className="episode-number">Episode {ep.episode_number}</div>
                      <div className="episode-name">{ep.name}</div>
                      <div className="episode-overview">{ep.overview || 'No description available'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 20 }}>
                <p>No episode information available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Detail;