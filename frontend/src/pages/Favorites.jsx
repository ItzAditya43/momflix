import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../api';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFavorites();
      setFavorites(res.data.results || []);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id) => {
    try {
      await removeFavorite(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">❤️ My Favorites</h2>
        {favorites.length > 0 && (
          <span style={{ color: 'var(--text-muted)' }}>
            {favorites.length} saved
          </span>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h3>No favorites yet</h3>
          <p>Browse movies and shows and click the ❤️ to save them here</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 20, textDecoration: 'none' }}>
            🏠 Browse Now
          </Link>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((item) => (
            <div key={item.id} className="card" style={{ position: 'relative' }}>
              <Link
                to={`/${item.media_type}/${item.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
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
                    {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                  </div>
                </div>
              </Link>
              <button
                className="card-fav-btn active"
                onClick={() => handleRemove(item.id)}
                title="Remove from favorites"
              >
                ❤️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;