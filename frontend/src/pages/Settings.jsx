import React, { useState } from 'react';
import { clearContinueWatching, clearFavorites, clearAllData } from '../api';

function ConfirmModal({ title, text, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-text">{text}</div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, icon = '✅') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleClearContinueWatching = async () => {
    try {
      await clearContinueWatching();
      showToast('Continue watching history cleared', '🗑️');
    } catch (err) {
      showToast('Failed to clear data', '❌');
    }
    setModal(null);
  };

  const handleClearFavorites = async () => {
    try {
      await clearFavorites();
      showToast('All favorites cleared', '🗑️');
    } catch (err) {
      showToast('Failed to clear favorites', '❌');
    }
    setModal(null);
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      showToast('All data cleared successfully', '✨');
    } catch (err) {
      showToast('Failed to clear data', '❌');
    }
    setModal(null);
  };

  return (
    <div className="settings-page">
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <span className="toast-icon">{t.icon}</span>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ConfirmModal
          title={modal.title}
          text={modal.text}
          danger={modal.danger}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">⚙️ Settings</h2>
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-group">
        <div className="settings-group-title">🗂️ Data Management</div>
        <div className="settings-group-desc">
          Manage your local data including favorites and watch history. These actions cannot be undone.
        </div>
        <div className="settings-actions">
          <button
            className="btn btn-shimmer"
            onClick={() =>
              setModal({
                title: 'Clear Watch History',
                text: 'This will remove all your continue watching progress. Your favorites will be kept.',
                danger: false,
                onConfirm: handleClearContinueWatching,
              })
            }
          >
            🗑️ Clear Watch History
          </button>

          <button
            className="btn btn-shimmer"
            onClick={() =>
              setModal({
                title: 'Clear Favorites',
                text: 'This will remove all your saved favorites. Watch history will be kept.',
                danger: false,
                onConfirm: handleClearFavorites,
              })
            }
          >
            💔 Clear All Favorites
          </button>

          <button
            className="btn btn-danger"
            onClick={() =>
              setModal({
                title: '⚠️ Clear All Data',
                text: 'This will permanently delete ALL your data including favorites and watch history. This cannot be undone!',
                danger: true,
                onConfirm: handleClearAll,
              })
            }
          >
            🧹 Clear Everything
          </button>
        </div>
      </div>

      {/* About */}
      <div className="settings-group">
        <div className="settings-group-title">💕 About MomFlix</div>
        <div className="settings-group-desc">
          A beautiful streaming app made with love. Browse movies and TV shows, save favorites, and pick up where you left off.
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Made for you, Mom 💗
        </div>
      </div>
    </div>
  );
}

export default Settings;