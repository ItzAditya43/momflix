import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { search } from '../api';

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
    <div className="search-page">
      <form className="search-bar" onSubmit={handleSubmit} role="search">
        <div className="search-wrap">
          <span className="search-icon-left" aria-hidden="true">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search for movies or TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search movies and TV shows"
          />
          {loading && <span className="search-spinner" aria-label="Loading" />}
          {query && !loading && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Recent searches */}
      {showInitial && recent.length > 0 && (
        <div className="recent-row">
          <span className="recent-label">Recent</span>
          {recent.map((term) => (
            <span key={term} className="recent-chip">
              <button
                type="button"
                className="recent-chip-label"
                onClick={() => handleClickRecent(term)}
              >
                {term}
              </button>
              <button
                type="button"
                className="recent-chip-remove"
                onClick={() => handleRemoveRecent(term)}
                aria-label={`Remove ${term}`}
              >
                ✕
              </button>
            </span>
          ))}
          <button
            type="button"
            className="recent-clear-all"
            onClick={handleClearAllRecent}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Popular fallback */}
      {showInitial && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Popular Searches</h2>
          </div>
          <div className="recent-row" style={{ marginTop: 0 }}>
            {POPULAR.map((term) => (
              <button
                type="button"
                key={term}
                className="popular-chip"
                onClick={() => handleClickPopular(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Searching…</h2>
          </div>
          <div className="grid">
            {skeletonKeys.map((k) => (
              <div key={k} className="card skeleton-card" aria-hidden="true">
                <div className="card-poster skeleton-poster" />
                <div className="card-body">
                  <div className="skeleton-line skeleton-line-title" />
                  <div className="skeleton-line skeleton-line-meta" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="empty-state">
          <h3>No results found</h3>
          <p>Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              Results for <span className="section-title-accent">"{q || query}"</span>
            </h2>
            <span className="section-count">{results.length} found</span>
          </div>
          <div className="grid grid-stagger">
            {results.map((item) => (
              <Link
                key={`${item.id}-${item.media_type}`}
                to={`/${item.media_type}/${item.id}`}
                className="card stagger-item"
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
        </div>
      )}

      {/* Pre-search empty state when no recents */}
      {!searched && !loading && recent.length === 0 && (
        <div className="empty-state">
          <h3>🔍 Search Movies & TV Shows</h3>
          <p>Type something above to find what you want to watch</p>
        </div>
      )}
    </div>
  );
}

export default Search;