import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { search } from '../api';
import Icon from '../components/Icons';

const RECENT_KEY = 'momflix_recent_searches';
const RECENT_MAX = 5;
const POPULAR = [
  'Romance',
  'Comedy',
  'Action',
  'Family',
  'Drama',
  'Musical',
  'Feel-good',
];

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* ignore */
  }
}

function pushRecent(list, term) {
  const t = term.trim();
  if (!t) return list;
  const filtered = list.filter((x) => x.toLowerCase() !== t.toLowerCase());
  return [t, ...filtered].slice(0, RECENT_MAX);
}

function Search() {
  const { q } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recent, setRecent] = useState(() => loadRecent());

  // Guard against out-of-order / stale responses.
  const requestIdRef = useRef(0);
  // Track the latest committed debounced term so we only push to URL after debounce settles.
  const debounceTimerRef = useRef(null);
  const navTimerRef = useRef(null);

  const runSearch = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      return;
    }
    const id = ++requestIdRef.current;
    setLoading(true);
    setSearched(true);
    try {
      const res = await search(trimmed);
      // Drop stale results.
      if (id !== requestIdRef.current) return;
      setResults(res.data.results || []);
    } catch (err) {
      if (id !== requestIdRef.current) return;
      console.error('Search error:', err);
      setResults([]);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);

  // When the URL parameter changes (e.g. clicking a recent chip or back/forward),
  // run a search immediately (no debounce — it's a discrete action).
  useEffect(() => {
    if (q) {
      setQuery(q);
      // Clear any pending debounce/nav timers.
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      runSearch(q);
    } else {
      setQuery('');
      setResults([]);
      setSearched(false);
      setLoading(false);
    }
  }, [q, runSearch]);

  // Debounce live-typing into the search input.
  useEffect(() => {
    // Skip the first run if URL already provided q.
    if (q && query === q) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      runSearch(trimmed);
      // Update URL quietly with replace so back/forward still works but we
      // don't push a history entry per keystroke.
      navTimerRef.current = setTimeout(() => {
        navigate(`/search/${encodeURIComponent(trimmed)}`, { replace: true });
      }, 60);
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, q, runSearch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // Cancel debounced timers so the search runs now.
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    // Update recent searches.
    const next = pushRecent(loadRecent(), trimmed);
    setRecent(next);
    saveRecent(next);
    // Push (not replace) a history entry on submit.
    navigate(`/search/${encodeURIComponent(trimmed)}`);
    runSearch(trimmed);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    setLoading(false);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navigate('/search', { replace: true });
  };

  const handleRemoveRecent = (term) => {
    const next = recent.filter((x) => x !== term);
    setRecent(next);
    saveRecent(next);
  };

  const handleClearAllRecent = () => {
    setRecent([]);
    saveRecent([]);
  };

  const handleClickRecent = (term) => {
    setQuery(term);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    const next = pushRecent(loadRecent(), term);
    setRecent(next);
    saveRecent(next);
    navigate(`/search/${encodeURIComponent(term)}`);
    runSearch(term);
  };

  const handleClickPopular = (term) => {
    handleClickRecent(term);
  };

  const showInitial = !searched && !loading;
  const noResults = !loading && searched && results.length === 0;

  const skeletonKeys = useMemo(
    () => Array.from({ length: 10 }, (_, i) => `sk-${i}`),
    []
  );

  return (
    <div className="search-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <form className="search-bar" onSubmit={handleSubmit} role="search" style={{ background: 'rgba(15, 30, 30, 0.8)', padding: '20px', borderRadius: '20px', marginBottom: '24px' }}>
        <div className="search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="search-icon-left" aria-hidden="true" style={{ color: 'var(--text-muted)', marginRight: '12px' }}>
            <Icon name="search" size={20} />
          </span>
          <input
            className="search-input"
            type="text"
            placeholder="Search for movies or TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search movies and TV shows"
            style={{
              flex: 1,
              padding: '16px 22px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text)',
              fontSize: '18px',
              outline: 'none',
              transition: 'all 0.25s ease',
            }}
          />
          {loading && <span className="search-spinner" aria-label="Loading" style={{ color: 'var(--primary)' }} />}
          {query && !loading && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClear}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Recent searches */}
      {showInitial && recent.length > 0 && (
        <div className="recent-row" style={{ marginBottom: '16px' }}>
          <span className="recent-label" style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Recent</span>
          {recent.map((term) => (
            <span key={term} className="recent-chip" style={{ marginRight: '8px' }}>
              <button
                type="button"
                className="recent-chip-label"
                onClick={() => handleClickRecent(term)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 94, 91, 0.3)',
                  color: 'var(--text)',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.25s ease',
                }}
              >
                {term}
              </button>
              <button
                type="button"
                className="recent-chip-remove"
                onClick={() => handleRemoveRecent(term)}
                aria-label={`Remove ${term}`}
                style={{
                  marginLeft: '8px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                <Icon name="close" size={12} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="recent-clear-all"
            onClick={handleClearAllRecent}
            style={{
              marginLeft: 'auto',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 94, 91, 0.3)',
              color: 'var(--text-muted)',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.25s ease',
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Popular fallback */}
      {showInitial && (
        <div className="section" style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h2 className="section-title" style={{ color: 'var(--text)', fontSize: '20px' }}>Popular Searches</h2>
          </div>
          <div className="recent-row" style={{ marginTop: 0, gap: '8px' }}>
            {POPULAR.map((term) => (
              <button
                type="button"
                key={term}
                className="popular-chip"
                onClick={() => handleClickPopular(term)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 94, 91, 0.3)',
                  color: 'var(--text)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.25s ease',
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="section" style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h2 className="section-title" style={{ color: 'var(--text)', fontSize: '20px' }}>Searching…</h2>
          </div>
          <div className="grid" style={{ gap: '12px' }}>
            {skeletonKeys.map((k) => (
              <div key={k} className="card skeleton-card" aria-hidden="true" style={{ background: 'var(--bg-card)', borderRadius: '12px', height: '120px' }}>
                <div className="card-poster skeleton-poster" style={{ width: '100%', height: '60px', background: '#241633', borderRadius: '8px' }} />
                <div className="card-body" style={{ padding: '8px' }}>
                  <div className="skeleton-line skeleton-line-title" style={{ width: '70%', height: '12px', background: 'rgba(255, 255, 255, 0.1)', marginBottom: '8px' }} />
                  <div className="skeleton-line skeleton-line-meta" style={{ width: '50%', height: '10px', background: 'rgba(255, 255, 255, 0.08)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>No results found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="section" style={{ marginBottom: '30px' }}>
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h2 className="section-title">
              Results for <span className="section-title-accent" style={{ color: 'var(--primary)' }}>{q || query}</span>
            </h2>
            <span className="section-count" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{results.length} found</span>
          </div>
          <div className="grid grid-stagger" style={{ gap: '16px' }}>
            {results.map((item) => (
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
                    <Icon name="film" size={40} />
                  </div>
                )}
                <div className="card-rating" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(20, 12, 30, 0.75)', backdropFilter: 'blur(6px)', padding: '4px 9px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', color: 'var(--gold)', border: '1px solid rgba(255, 210, 122, 0.3)' }}>
                  <Icon name="star" size={10} /> {item.vote_average?.toFixed(1)}
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
        </div>
      )}

      {/* Pre-search empty state when no recents */}
      {!searched && !loading && recent.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--text)', marginBottom: '12px' }}>
            <Icon name="search" size={20} /> Search Movies & TV Shows
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>Type something above to find what you want to watch</p>
        </div>
      )}
    </div>
  );
}

export default Search;