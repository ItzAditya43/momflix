import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../api';
import Icon from '../components/Icons';

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
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 className="section-title" style={{ color: 'var(--text)', fontSize: '22px' }}>
            <Icon name="heart" size={20} /> My Favorites
          </h2>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>No favorites yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>Browse movies and shows and click the <Icon name="heart" size={14} /> to save them here</p>
            <Link to="/" style={{ display: 'inline-block', marginTop: '20px', textDecoration: 'none', background: 'rgba(255, 94, 91, 0.2)', padding: '12px 24px', borderRadius: '25px', color: 'var(--primary)' }}>
              <Icon name="home" size={16} /> Browse Now
            </Link>
          </div>
        ) : (
          <div className="grid" style={{ gap: '16px' }}>
            {favorites.map((item) => (
              <div key={item.id} style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                <Link
                  to={`/${item.media_type}/${item.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  {item.poster_path ? (
                    <img
                      style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover' }}
                      src={item.poster_path}
                      alt={item.title}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: '100%', height: 'auto', aspectRatio: '2/3', background: '#241633', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="film" size={32} />
                    </div>
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    <div className="card-title" style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.title}</div>
                    <div className="card-year" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                    </div>
                  </div>
                </Link>
                <button
                  className="card-fav-btn active"
                  onClick={() => handleRemove(item.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(20, 12, 30, 0.75)',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease',
                  }}
                  title="Remove from favorites"
                >
                  <Icon name="heartFilled" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;