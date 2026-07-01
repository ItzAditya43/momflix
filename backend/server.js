const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json());

// TMDB config
const TMDB_API_KEY = '661902f1f2f56a813857ec9cabe8ce8c';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

// Database setup
const db = new Database(path.join(__dirname, 'momflix.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY,
    media_type TEXT NOT NULL,
    title TEXT,
    poster_path TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS continue_watching (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tmdb_id INTEGER NOT NULL,
    media_type TEXT NOT NULL,
    title TEXT,
    poster_path TEXT,
    season INTEGER DEFAULT 1,
    episode INTEGER DEFAULT 1,
    timestamp INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tmdb_id, media_type)
  );
`);

// ============ TMDB API Routes ============

// Search movies/shows
app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'multi' } = req.query;
    if (!q) return res.json({ results: [] });
    
    const { data } = await axios.get(`${TMDB_BASE}/search/${type}`, {
      params: { api_key: TMDB_API_KEY, query: q, page: 1 }
    });
    
    const results = data.results
      .filter(item => item.media_type !== 'person')
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || '').split('-')[0],
        poster: item.poster_path ? `${TMDB_IMG}/w342${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `${TMDB_IMG}/w780${item.backdrop_path}` : null,
        overview: item.overview,
        media_type: item.media_type || type,
        vote_average: item.vote_average,
      }));
    
    res.json({ results });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get trending
app.get('/api/trending', async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/trending/all/week`, {
      params: { api_key: TMDB_API_KEY }
    });
    
    const results = data.results
      .filter(item => item.media_type !== 'person')
      .slice(0, 20)
      .map(item => ({
        id: item.id,
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || '').split('-')[0],
        poster: item.poster_path ? `${TMDB_IMG}/w342${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `${TMDB_IMG}/w780${item.backdrop_path}` : null,
        overview: item.overview,
        media_type: item.media_type,
        vote_average: item.vote_average,
      }));
    
    res.json({ results });
  } catch (err) {
    console.error('Trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

// Get movie details
app.get('/api/movie/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/movie/${req.params.id}`, {
      params: { api_key: TMDB_API_KEY, append_to_response: 'credits,videos' }
    });
    
    res.json({
      id: data.id,
      title: data.title,
      year: (data.release_date || '').split('-')[0],
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      overview: data.overview,
      runtime: data.runtime,
      genres: data.genres?.map(g => g.name) || [],
      vote_average: data.vote_average,
      cast: (data.credits?.cast || []).slice(0, 10).map(c => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : null,
      })),
      trailer: (data.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube'),
      media_type: 'movie',
    });
  } catch (err) {
    console.error('Movie detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Get TV show details
app.get('/api/tv/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/tv/${req.params.id}`, {
      params: { api_key: TMDB_API_KEY, append_to_response: 'credits,videos' }
    });
    
    res.json({
      id: data.id,
      title: data.name,
      year: (data.first_air_date || '').split('-')[0],
      poster: data.poster_path ? `${TMDB_IMG}/w500${data.poster_path}` : null,
      backdrop: data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null,
      overview: data.overview,
      seasons: (data.seasons || []).filter(s => s.season_number > 0).map(s => ({
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count,
        poster: s.poster_path ? `${TMDB_IMG}/w185${s.poster_path}` : null,
      })),
      genres: data.genres?.map(g => g.name) || [],
      vote_average: data.vote_average,
      cast: (data.credits?.cast || []).slice(0, 10).map(c => ({
        name: c.name,
        character: c.character,
        photo: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : null,
      })),
      trailer: (data.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube'),
      media_type: 'tv',
      number_of_seasons: data.number_of_seasons,
    });
  } catch (err) {
    console.error('TV detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch TV details' });
  }
});

// Get TV season episodes
app.get('/api/tv/:id/season/:season', async (req, res) => {
  try {
    const { data } = await axios.get(`${TMDB_BASE}/tv/${req.params.id}/season/${req.params.season}`, {
      params: { api_key: TMDB_API_KEY }
    });
    
    res.json({
      episodes: (data.episodes || []).map(ep => ({
        id: ep.id,
        episode_number: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still_path: ep.still_path ? `${TMDB_IMG}/w300${ep.still_path}` : null,
        vote_average: ep.vote_average,
        air_date: ep.air_date,
      }))
    });
  } catch (err) {
    console.error('Season error:', err.message);
    res.status(500).json({ error: 'Failed to fetch season details' });
  }
});

// ============ Favorites ============

app.get('/api/favorites', (req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites ORDER BY added_at DESC').all();
  res.json({ results: favorites });
});

app.post('/api/favorites', (req, res) => {
  const { id, media_type, title, poster_path } = req.body;
  try {
    db.prepare('INSERT OR REPLACE INTO favorites (id, media_type, title, poster_path) VALUES (?, ?, ?, ?)').run(id, media_type, title, poster_path);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites/:id', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ============ Continue Watching ============

app.get('/api/continue-watching', (req, res) => {
  const items = db.prepare('SELECT * FROM continue_watching ORDER BY updated_at DESC LIMIT 20').all();
  res.json({ results: items });
});

app.post('/api/continue-watching', (req, res) => {
  const { tmdb_id, media_type, title, poster_path, season, episode, timestamp } = req.body;
  try {
    db.prepare(`
      INSERT INTO continue_watching (tmdb_id, media_type, title, poster_path, season, episode, timestamp, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(tmdb_id, media_type) DO UPDATE SET
        season = excluded.season,
        episode = excluded.episode,
        timestamp = excluded.timestamp,
        updated_at = CURRENT_TIMESTAMP
    `).run(tmdb_id, media_type, title, poster_path, season || 1, episode || 1, timestamp || 0);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/continue-watching/:tmdb_id/:media_type', (req, res) => {
  db.prepare('DELETE FROM continue_watching WHERE tmdb_id = ? AND media_type = ?').run(req.params.tmdb_id, req.params.media_type);
  res.json({ success: true });
});

// ============ Settings / Data Management ============

// Clear all continue watching data
app.delete('/api/continue-watching/all', (req, res) => {
  try {
    db.prepare('DELETE FROM continue_watching').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all favorites
app.delete('/api/favorites/all', (req, res) => {
  try {
    db.prepare('DELETE FROM favorites').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear ALL data (favorites + continue watching)
app.delete('/api/clear-all-data', (req, res) => {
  try {
    db.prepare('DELETE FROM continue_watching').run();
    db.prepare('DELETE FROM favorites').run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Start Server ============

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 MomFlix backend running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});