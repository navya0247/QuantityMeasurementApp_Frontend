import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TYPE_COLORS } from '../utils/measureConstants';
import './Sidebar.css';

const TYPE_ICONS = {
  LENGTH:      'fa-ruler-horizontal',
  WEIGHT:      'fa-weight-hanging',
  VOLUME:      'fa-flask',
  TEMPERATURE: 'fa-thermometer-half',
};

export default function Sidebar({ activeView, setActiveView, histCount, onQuickType, selectedType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon"><i className="fas fa-ruler-combined" /></div>
        <span className="sb-logo-txt">QMeasure</span>
      </div>

      {/* Main nav */}
      <div className="sb-nav">
        <div className="sb-section-lbl">Menu</div>

        <button
          className={`s-item ${activeView === 'measure' ? 'active' : ''}`}
          onClick={() => setActiveView('measure')}
        >
          <i className="fas fa-calculator" />
          <span>Measure</span>
        </button>

        <button
          className={`s-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
          style={{ opacity: user ? 1 : 0.6 }}
        >
          <i className="fas fa-history" />
          <span>History</span>
          {histCount > 0 && <span className="s-badge">{histCount > 9 ? '9+' : histCount}</span>}
        </button>

        <button
          className={`s-item ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <i className="fas fa-user-circle" />
          <span>Profile</span>
        </button>
      </div>

      <div className="sb-div" />

      {/* Type shortcuts */}
      <div className="sb-types">
        <div className="sb-section-lbl">Type</div>
        {Object.keys(TYPE_ICONS).map(t => (
          <button
            key={t}
            className={`type-sub-item ${selectedType === t && activeView === 'measure' ? 'active' : ''}`}
            onClick={() => onQuickType(t)}
            style={selectedType === t && activeView === 'measure'
              ? { color: TYPE_COLORS[t].color }
              : {}}
          >
            <i className={`fas ${TYPE_ICONS[t]}`} style={{ color: TYPE_COLORS[t].color }} />
            <span>{t.charAt(0) + t.slice(1).toLowerCase()}</span>
          </button>
        ))}
      </div>

      {/* User card */}
      <div className="sb-bottom">
        <div className="user-card">
          <div className="u-avatar">
            {user?.picture
              ? <img src={user.picture} alt={user.fullName} />
              : initials}
          </div>
          <div className="u-name">{user ? user.fullName : 'Guest'}</div>
          <div className="u-role">{user ? user.role : 'Not signed in'}</div>

          {user && <div className="u-badge">● Active</div>}

          {user ? (
            <button className="sb-logout-btn" onClick={logout}>
              <i className="fas fa-sign-out-alt" /> Logout
            </button>
          ) : (
            <button className="sb-signin-btn" onClick={() => navigate('/auth')}>
              <i className="fas fa-sign-in-alt" /> Sign In
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
