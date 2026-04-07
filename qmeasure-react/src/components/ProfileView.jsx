import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileView.css';

const CAPS = [
  { icon: '📏', label: 'Length',      units: 'FEET · INCHES · YARDS · CM',        color: '#0284c7' },
  { icon: '⚖️',  label: 'Weight',      units: 'KILOGRAM · GRAM · POUND',           color: '#f97316' },
  { icon: '🧪', label: 'Volume',      units: 'LITRE · MILLILITRE · GALLON',       color: '#10b981' },
  { icon: '🌡️', label: 'Temperature', units: 'CELSIUS · FAHRENHEIT · KELVIN',    color: '#8b5cf6' },
];

const ACTIONS = [
  { icon: 'fa-equals',       label: 'Compare',    desc: 'Check equality between two quantities' },
  { icon: 'fa-exchange-alt', label: 'Convert',    desc: 'Convert a value to another unit' },
  { icon: 'fa-plus',         label: 'Add',        desc: 'Add two quantities together' },
  { icon: 'fa-minus',        label: 'Subtract',   desc: 'Subtract one quantity from another' },
  { icon: 'fa-divide',       label: 'Divide',     desc: 'Divide one quantity by another' },
];

export default function ProfileView({ history }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="profile-wrap">
        <div className="view-hdr">
          <div>
            <h2>My <span>Profile</span></h2>
            <p>Account details and app capabilities</p>
          </div>
        </div>
        <div className="guest-profile">
          <div className="gp-ico"><i className="fas fa-user-slash" /></div>
          <div className="gp-title">You're not signed in</div>
          <div className="gp-sub">
            Sign in to see your profile, save history, and access all features.
          </div>
          <button
            className="gp-google-btn"
            onClick={() => navigate('/auth')}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
            />
            Sign in with Google
          </button>
          <a
            href="/auth"
            onClick={e => { e.preventDefault(); navigate('/auth'); }}
            className="gp-email-link"
          >
            Or use email &amp; password →
          </a>
        </div>
      </div>
    );
  }

  const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="profile-wrap">
      <div className="view-hdr">
        <div>
          <h2>My <span>Profile</span></h2>
          <p>Account details and app capabilities</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left — user card */}
        <div className="prof-card">
          <div className="prof-avatar">
            {user.picture
              ? <img src={user.picture} alt={user.fullName} />
              : initials}
          </div>
          <div className="prof-name">{user.fullName}</div>
          <div className="prof-email">{user.email}</div>
          <div className="prof-role-badge">{user.role}</div>

          <div className="prof-provider">
            {user.authProvider === 'Google' ? (
              <>
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  style={{ width: 13, height: 13 }}
                />
                Google account
              </>
            ) : (
              <><i className="fas fa-key" style={{ fontSize: 10 }} /> Local account</>
            )}
          </div>

          <div className="prof-divider" />

          <div className="prof-stats">
            <div className="prof-stat">
              <div className="prof-stat-n">{history.length}</div>
              <div className="prof-stat-l">Operations</div>
            </div>
            <div className="prof-stat">
              <div className="prof-stat-n">4</div>
              <div className="prof-stat-l">Types</div>
            </div>
            <div className="prof-stat">
              <div className="prof-stat-n">5</div>
              <div className="prof-stat-l">Actions</div>
            </div>
          </div>

          <div className="prof-divider" />

          <button className="prof-logout" onClick={logout}>
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>

        {/* Right — info panels */}
        <div className="prof-right">
          {/* Account info */}
          <div className="info-card">
            <div className="info-card-title">Account Info</div>
            <div className="info-row">
              <span className="info-lbl">Full Name</span>
              <span className="info-val">{user.fullName}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Email</span>
              <span className="info-val">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Role</span>
              <span className="info-val">{user.role}</span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Auth Provider</span>
              <span className="info-val">
                {user.authProvider === 'Google' ? '🟢 Google OAuth' : '🔑 Email / Password'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-lbl">Session</span>
              <span className="info-val" style={{ color: 'var(--green)' }}>● JWT Active</span>
            </div>
          </div>

          {/* Capabilities */}
          <div className="info-card">
            <div className="info-card-title">Measurement Types</div>
            <div className="caps-grid">
              {CAPS.map(c => (
                <div className="cap-item" key={c.label}>
                  <div className="cap-icon">{c.icon}</div>
                  <div className="cap-label" style={{ color: c.color }}>{c.label}</div>
                  <div className="cap-units">{c.units}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Operations */}
          <div className="info-card">
            <div className="info-card-title">Available Operations</div>
            <div className="ops-list">
              {ACTIONS.map(a => (
                <div className="ops-item" key={a.label}>
                  <div className="ops-ico">
                    <i className={`fas ${a.icon}`} />
                  </div>
                  <div>
                    <div className="ops-label">{a.label}</div>
                    <div className="ops-desc">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
