# MomFlix - A Movie Streaming App

A beautiful, glassmorphism-designed movie and TV show streaming application built with React, Express, and SQLite. Created with love for my mom 💕

## 🎬 Features

- **Browse Movies & TV Shows**: Search and discover content from TMDB
- **Continue Watching**: Pick up where you left off with watch history
- **Favorites**: Save your favorite movies and shows
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Beautiful UI**: Premium glassmorphism design with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Custom glassmorphism design system
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Local database (better-sqlite3)
- **TMDB API** - Movie and TV show data
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
momflix/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Detail.jsx
│   │   │   ├── Player.jsx
│   │   │   ├── Favorites.jsx
│   │   │   └── Settings.jsx
│   │   ├── App.jsx         # Main app component
│   │   ├── api.js          # API service functions
│   │   └── index.css       # Global styles
│   ├── index.html
│   └── package.json
├── backend/
│   ├── server.js           # Express server
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ItzAditya43/momflix.git
   cd momflix
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure TMDB API Key**
   
   Get your free API key from [TMDB](https://www.themoviedb.org/settings/api) and add it to `backend/server.js`:
   ```javascript
   const TMDB_API_KEY = 'your_api_key_here';
   ```

5. **Start the backend server**
   ```bash
   cd backend
   node server.js
   ```
   Server runs on http://localhost:3456

6. **Start the frontend dev server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   App runs on http://localhost:5435

## 🎨 Design System

### Glassmorphism Design
- **Glass Effects**: Semi-transparent backgrounds with backdrop blur
- **Gradient Borders**: Premium gradient border effects
- **Glow Effects**: Pink and violet glow shadows
- **Smooth Animations**: CSS transitions and keyframe animations

### Color Palette
- **Primary**: Pink to Violet gradient (#ff2d8c → #a855f7)
- **Background**: Deep purple (#0d0716)
- **Text**: White with muted variations
- **Accents**: Gold for ratings

### Typography
- **Headings**: Sora font family
- **Body**: Inter font family
- **Weights**: 700 for headings, 600 for UI elements

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (bottom navigation)
- **Tablet**: 768px - 1023px (top navbar with links)
- **Desktop**: 1024px+ (horizontal top sidebar navigation)

### Grid System
- Mobile: 2 columns
- 600px+: 3 columns
- 900px+: 4 columns
- 1200px+: 5 columns
- 1400px+: 6 columns

## 🔧 API Endpoints

### TMDB Integration
- `GET /api/search` - Search movies/shows
- `GET /api/trending` - Get trending content
- `GET /api/movie/:id` - Get movie details
- `GET /api/tv/:id` - Get TV show details
- `GET /api/tv/:id/season/:season` - Get season episodes

### Favorites Management
- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Continue Watching
- `GET /api/continue-watching` - Get watch history
- `POST /api/continue-watching` - Update watch progress
- `DELETE /api/continue-watching/:tmdb_id/:media_type` - Remove from history

### Settings / Data Management
- `DELETE /api/continue-watching/all` - Clear watch history
- `DELETE /api/favorites/all` - Clear all favorites
- `DELETE /api/clear-all-data` - Clear all data

## 🎯 Key Features Implemented

### Frontend Improvements
1. **Desktop Navigation**: Horizontal top sidebar for desktop views
2. **Enhanced Grid**: Up to 6-column layout for large screens
3. **Typography Scaling**: Responsive font sizes across breakpoints
4. **Card Hover Effects**: Shine sweep and lift animations
5. **Hero Section**: Larger, more impactful on desktop
6. **Settings Modal**: Confirmation dialogs for data management
7. **Toast Notifications**: Success/error feedback messages

### Backend Features
1. **SQLite Database**: Persistent storage for favorites and watch history
2. **TMDB Integration**: Real-time movie and TV show data
3. **CORS Enabled**: Cross-origin requests for frontend
4. **Error Handling**: Comprehensive error handling and logging
5. **Data Management**: Clear data endpoints for settings

## 🎓 Educational Purpose

This project was created for **educational purposes** to demonstrate:
- Modern React patterns and hooks
- Responsive web design principles
- Glassmorphism UI design system
- RESTful API design with Express
- Database integration with SQLite
- Client-side routing with React Router
- State management with React hooks
- CSS Grid and Flexbox layouts
- Progressive enhancement for different screen sizes

## 📝 What I Learned

### Frontend Development
- Building responsive layouts with CSS Grid and Flexbox
- Creating reusable component patterns
- Implementing smooth animations and transitions
- Managing application state with React hooks
- Client-side routing and navigation
- Glassmorphism design techniques
- Progressive enhancement for different devices

### Backend Development
- Building RESTful APIs with Express.js
- Database design and SQL queries
- API integration with third-party services (TMDB)
- CORS configuration for cross-origin requests
- Error handling and logging
- Data validation and sanitization

### Design & UX
- Creating cohesive design systems
- Color theory and typography
- Micro-interactions and animations
- Responsive design best practices
- Accessibility considerations

## ⚠️ Disclaimer

This project is created for **educational purposes only**. 

- This is a personal project created for learning and demonstration
- The app uses TMDB API for educational integration examples
- No copyright infringement is intended
- This is not a commercial product
- Built as a learning exercise for modern web development

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the movie database API
- [React](https://react.dev/) for the amazing UI library
- [Vite](https://vitejs.dev/) for the fast build tool
- [Express](https://expressjs.com/) for the backend framework

## 📄 License

This project is for educational purposes and is not licensed for commercial use.

---

**Made with 💕 for my mom**

*Built with React, Express, and lots of coffee ☕*