import React, { useState } from 'react';
import { clearContinueWatching, clearFavorites, clearAllData } from '../api';
import Icon from '../components/Icons';

function ConfirmModal({ title, text, onConfirm, onCancel, danger }) {
  return (
    <div>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
          borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '400px',
          textAlign: 'center', color: 'var(--text)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>{title}</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>{text}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button style={{
              background: 'none', border: '1px solid var(--glass-border)',
              color: 'var(--text)', padding: '12px 24px', borderRadius: '12px',
              cursor: 'pointer', transition: 'all 0.25s ease', width: '120px'
            }} onClick={onCancel}>Cancel</button>
            <button style={{
              background: danger ? 'rgba(255, 94, 91, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              border: danger ? '1px solid rgba(255, 94, 91, 0.3)' : '1px solid var(--glass-border)',
              color: danger ? 'var(--primary)' : 'var(--text)', padding: '12px 24px',
              borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s ease', width: '120px'
            }} onClick={onConfirm}>{danger ? 'Clear' : 'Confirm'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, icon) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleClearContinueWatching = async () => {
    try {
      await clearContinueWatching();
      showToast('Continue watching history cleared', 'check');
    } catch (err) {
      showToast('Failed to clear data', 'alert');
    }
    setModal(null);
  };

  const handleClearFavorites = async () => {
    try {
      await clearFavorites();
      showToast('All favorites cleared', 'check');
    } catch (err) {
      showToast('Failed to clear favorites', 'alert');
    }
    setModal(null);
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      showToast('All data cleared successfully', 'check');
    } catch (err) {
      showToast('Failed to clear data', 'alert');
    }
    setModal(null);
  };

  const openModal = (title, text, danger, onConfirm) => {
    setModal({ title, text, danger, onConfirm });
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '20px' }}>
      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '20px', right: '20px',
          display: 'flex', gap: '12px', zIndex: 1000
        }}>
          {toasts.map((t) => (
            <div key={t.id} style={{
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px', padding: '12px 20px', color: 'var(--text)',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
            }}>
              <span style={{ color: 'var(--primary)' }}>
                <Icon name={t.icon} size={16} />
              </span>
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

      <div style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ color: 'var(--text)', fontSize: '24px', marginBottom: '16px' }}>
            <Icon name="settings" size={22} /> Settings
          </h2>
        </div>
      </div>

      {/* Data Management */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: 'var(--text)', fontSize: '16px', marginBottom: '8px' }}>
            <Icon name="database" size={16} /> Data Management
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage your local data including favorites and watch history. These actions cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <button style={{
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 94, 91, 0.3)',
            color: 'var(--text)', padding: '12px 24px', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.25s ease', width: '100%'
          }} onClick={() => openModal('Clear Watch History', 'This will remove all your continue watching progress. Your favorites will be kept.', false, handleClearContinueWatching)}>
            <Icon name="clock" size={16} /> Clear Watch History
          </button>

          <button style={{
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 94, 91, 0.3)',
            color: 'var(--text)', padding: '12px 24px', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.25s ease', width: '100%'
          }} onClick={() => openModal('Clear Favorites', 'This will remove all your saved favorites. Watch history will be kept.', false, handleClearFavorites)}>
            <Icon name="heart" size={16} /> Clear All Favorites
          </button>

          <button style={{
            background: 'rgba(255, 94, 91, 0.1)', border: '1px solid rgba(255, 94, 91, 0.2)',
            color: 'var(--primary)', padding: '12px 24px', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.25s ease', width: '100%'
          }} onClick={() => openModal('Clear All Data', 'This will permanently delete ALL your data including favorites and watch history. This cannot be undone!', true, handleClearAll)}>
            <Icon name="trash" size={16} /> Clear Everything
          </button>
        </div>
      </div>

      {/* About */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: 'var(--text)', fontSize: '16px', marginBottom: '8px' }}>
            <Icon name="info" size={16} /> About MomFlix
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            A beautiful streaming app made with love. Browse movies and TV shows, save favorites, and pick up where you left off.
          </p>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Made for you, Mom <Icon name="heart" size={12} />
        </div>
      </div>
    </div>
  );
}

export default Settings;