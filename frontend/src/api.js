import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3456/api',
});

export const search = (q, type = 'multi') => API.get('/search', { params: { q, type } });
export const getTrending = () => API.get('/trending');
export const getMovie = (id) => API.get(`/movie/${id}`);
export const getTV = (id) => API.get(`/tv/${id}`);
export const getSeason = (id, season) => API.get(`/tv/${id}/season/${season}`);

export const getFavorites = () => API.get('/favorites');
export const addFavorite = (item) => API.post('/favorites', item);
export const removeFavorite = (id) => API.delete(`/favorites/${id}`);

export const getContinueWatching = () => API.get('/continue-watching');
export const updateContinueWatching = (data) => API.post('/continue-watching', data);
export const removeContinueWatching = (tmdb_id, media_type) => API.delete(`/continue-watching/${tmdb_id}/${media_type}`);

// Data management / Settings
export const clearContinueWatching = () => API.delete('/continue-watching/all');
export const clearFavorites = () => API.delete('/favorites/all');
export const clearAllData = () => API.delete('/clear-all-data');