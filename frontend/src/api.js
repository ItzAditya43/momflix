// Direct TMDB API client with localStorage for all user data
// No backend server needed - works fully offline for stored data

const TMDB_API_KEY = '661902f1f2f56a813857ec9cabe8ce8c';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

// ============ Local Storage Helpers ============

const FAVORITES_KEY = 'momflix_favorites';
const CONTINUE_WATCHING_KEY = 'momflix_continue_watching';

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write failed:', err);
  }
}

// ============ TMDB API Calls ============

async function tmdbFetch(path, params = {}) {
  const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
  const res = await fetch(`${TMDB_BASE}${path}?${query}`);
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`);
  }
  return res.json();
}

function mapResult(item, type) {
  return {
    id: item.id,
    title: item.title || item.name,
    year: (item.release_date || item.first_air_date || '').split('-')[0],
    poster: item.poster_path ? `${TMDB_IMG}/w342${item.poster_path}` : null,
    backdrop: item.backdrop_path ? `${TMDB_IMG}/w780${item.backdrop_path}` : null,
    overview: item.overview,
    media_type: item.media_type || type,
    vote_average: item.vote_average,
  };
}

export const search = async (q, type = 'multi') => {
  const data = await tmdbFetch(`/search/${type}`, { query: q, page: 1 });
  const results = (data.results || [])
    .filter((item) => item.media_type !== 'person')
    .slice(0, 20)
    .map((item) => mapResult(item, type));
  return { data: { results } };
};

export const getTrending = async () => {
  const data = await tmdbFetch('/trending/all/week');
  const results = (data.results || [])
    .filter((item) => item.media_type !== 'person')
    .slice(0, 20)
    .map((item) => mapResult(item, 'movie'));
  return { data: { results } };
};

export const getMovie = async (id) => {
  const data = await tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos' });
  return {
    data: {
      id: data.id,
      title: data.title,
      year: (data.release_date || '').split('-')[0],
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      overview: data.overview,
      runtime: data.runtime,
      genres: data.genres?.map((g) => g.name) || [],
      vote_average: data.vote_average,
      cast: (data.credits?.cast || []).slice(0, 10).map((c) => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : null,
      })),
      trailer: (data.videos?.results || []).find((v) => v.type === 'Trailer' && v.site === 'YouTube'),
      media_type: 'movie',
    },
  };
};

export const getTV = async (id) => {
  const data = await tmdbFetch(`/tv/${id}`, { append_to_response: 'credits,videos' });
  return {
    data: {
      id: data.id,
      title: data.name,
      year: (data.first_air_date || '').split('-')[0],
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      overview: data.overview,
      seasons: (data.seasons || []).filter((s) => s.season_number > 0).map((s) => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        poster: s.poster_path ? `${TMDB_IMG}/w185${s.poster_path}` : null,
      })),
      genres: data.genres?.map((g) => g.name) || [],
      vote_average: data.vote_average,
      cast: (data.credits?.cast || []).slice(0, 10).map((c) => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : null,
      })),
      trailer: (data.videos?.results || []).find((v) => v.type === 'Trailer' && v.site === 'YouTube'),
      media_type: 'tv',
      number_of_seasons: data.number_of_seasons,
    },
  };
};

export const getSeason = async (id, season) => {
  const data = await tmdbFetch(`/tv/${id}/season/${season}`);
  return {
    data: {
      episodes: (data.episodes || []).map((ep) => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path ? `${TMDB_IMG}/w300${ep.still_path}` : null,
        vote_average: ep.vote_average,
        air_date: ep.air_date,
      })),
    },
  };
};

// ============ Favorites (localStorage) ============

export const getFavorites = async () => {
  const favorites = readStorage(FAVORITES_KEY, []);
  return { data: { results: favorites } };
};

export const addFavorite = async (item) => {
  const favorites = readStorage(FAVORITES_KEY, []);
  const exists = favorites.some((f) => f.id === item.id);
  if (!exists) {
    favorites.unshift({ ...item, added_at: new Date().toISOString() });
    writeStorage(FAVORITES_KEY, favorites);
  }
  return { data: { success: true } };
};

export const removeFavorite = async (id) => {
  const favorites = readStorage(FAVORITES_KEY, []);
  const filtered = favorites.filter((f) => f.id !== id);
  writeStorage(FAVORITES_KEY, filtered);
  return { data: { success: true } };
};

// ============ Continue Watching (localStorage) ============

export const getContinueWatching = async () => {
  const items = readStorage(CONTINUE_WATCHING_KEY, []);
  return { data: { results: items } };
};

export const updateContinueWatching = async (data) => {
  const items = readStorage(CONTINUE_WATCHING_KEY, []);
  const idx = items.findIndex(
    (i) => i.tmdb_id === data.tmdb_id && i.media_type === data.media_type
  );
  const entry = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) {
    items[idx] = entry;
  } else {
    items.unshift(entry);
  }
  writeStorage(CONTINUE_WATCHING_KEY, items.slice(0, 20));
  return { data: { success: true } };
};

export const removeContinueWatching = async (tmdb_id, media_type) => {
  const items = readStorage(CONTINUE_WATCHING_KEY, []);
  const filtered = items.filter(
    (i) => !(i.tmdb_id === tmdb_id && i.media_type === media_type)
  );
  writeStorage(CONTINUE_WATCHING_KEY, filtered);
  return { data: { success: true } };
};

// ============ Data Management (localStorage) ============

export const clearContinueWatching = async () => {
  writeStorage(CONTINUE_WATCHING_KEY, []);
  return { data: { success: true } };
};

export const clearFavorites = async () => {
  writeStorage(FAVORITES_KEY, []);
  return { data: { success: true } };
};

export const clearAllData = async () => {
  writeStorage(CONTINUE_WATCHING_KEY, []);
  writeStorage(FAVORITES_KEY, []);
  return { data: { success: true } };
};