import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TYPE_COLORS, OPS } from '../utils/measureConstants';
import './ProfileView.css';

const TYPE_ICONS = {
  LENGTH:      'fa-ruler-horizontal',
  WEIGHT:      'fa-weight-hanging',
  VOLUME:      'fa-flask',
  TEMPERATURE: 'fa-thermometer-half',
};

const OP_ICONS = {
  COMPARE:  'fa-equals',
  CONVERT:  'fa-exchange-alt',
  ADD:      'fa-plus',
  SUBTRACT: 'fa-minus',
  DIVIDE:   'fa-divide',
};

export default function ProfileView({ history }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="profile-wrap">
        <div className="view-hdr">
          <div>
            <h2>My <span>Profile</span></h2>
            <p>Account details and recent activity</p>
          </div>
        </div>
        <div className="guest-profile">
          <div className="gp-ico"><i className="fas fa-user-slash" /></div>
          <div className="gp-title">You're not signed in</div>
          <div className="gp-sub">Sign in to see your profile and save history.</div>
          <button className="gp-google-btn" onClick={() => navigate('/auth')}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Sign in with Google
          </button>
          <a href="/auth" onClick={e => { e.preventDefault(); navigate('/auth'); }} className="gp-email-link">
            Or use email &amp; password →
          </a>
        </div>
      </div>
    );
  }

  const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Group ops by type for stats
  const opCounts = {};
  history.forEach(h => {
    opCounts[h.type] = (opCounts[h.type] || 0) + 1;
  });

  return (
    <div className="profile-wrap">
      <div className="view-hdr">
        <div>
          <h2>My <span>Profile</span></h2>
          <p>Account details and recent activity</p>
        </div>
      </div>

      <div className="profile-layout">

        {/* ── Left: user card ── */}
        <div className="prof-card">
          {/* Avatar */}
          <div className="prof-avatar-wrap">
            <div className="prof-avatar">
              {user.picture
                ? <img src={user.picture} alt={user.fullName} />
                : initials}
            </div>
            <div className="prof-online-dot" />
          </div>

          <div className="prof-name">{user.fullName}</div>
          <div className="prof-email">{user.email}</div>

          <div className="prof-badges">
            <span className="prof-role-badge">{user.role}</span>
            <span className="prof-provider-badge">
              {user.authProvider === 'Google'
                ? <><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{width:10,height:10}} /> Google</>
                : <><i className="fas fa-key" style={{fontSize:9}} /> Local</>}
            </span>
          </div>

          <div className="prof-divider" />

          {/* Stats row */}
          <div className="prof-stats">
            <div className="prof-stat">
              <div className="prof-stat-n">{history.length}</div>
              <div className="prof-stat-l">Total Ops</div>
            </div>
            <div className="prof-stat-sep" />
            <div className="prof-stat">
              <div className="prof-stat-n">{Object.keys(opCounts).length || 0}</div>
              <div className="prof-stat-l">Types Used</div>
            </div>
            <div className="prof-stat-sep" />
            <div className="prof-stat">
              <div className="prof-stat-n">
                {history.filter(h => !h.isErr).length}
              </div>
              <div className="prof-stat-l">Successful</div>
            </div>
          </div>

          <div className="prof-divider" />

          {/* Type usage mini bars */}
          {history.length > 0 && (
            <div className="prof-type-usage">
              <div className="ptu-label">Activity by type</div>
              {Object.entries(opCounts).map(([type, count]) => {
                const tc = TYPE_COLORS[type] || {};
                const pct = Math.round((count / history.length) * 100);
                return (
                  <div className="ptu-row" key={type}>
                    <i className={`fas ${TYPE_ICONS[type]}`} style={{color: tc.color, width:14, fontSize:10}} />
                    <span className="ptu-type">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                    <div className="ptu-bar-wrap">
                      <div className="ptu-bar-fill" style={{width:`${pct}%`, background: tc.color}} />
                    </div>
                    <span className="ptu-count">{count}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="prof-divider" />

          {/* Session info */}
          <div className="prof-session">
            <i className="fas fa-shield-alt" style={{color:'var(--green)',fontSize:11}} />
            <span>JWT Active</span>
          </div>

          <button className="prof-logout" onClick={logout}>
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>

        {/* ── Right: recent operations ── */}
        <div className="prof-right">
          <div className="recent-ops-card">
            <div className="roc-hdr">
              <div className="roc-title">
                <i className="fas fa-history" />
                Recent Operations
              </div>
              {history.length > 0 && (
                <span className="roc-count">{history.length} total</span>
              )}
            </div>

            {history.length === 0 ? (
              <div className="roc-empty">
                <div className="roc-empty-ico"><i className="fas fa-layer-group" /></div>
                <div className="roc-empty-title">No operations yet</div>
                <div className="roc-empty-sub">Go to Measure tab and run your first operation!</div>
                <button className="roc-go-btn" onClick={() => navigate('/')}>
                  <i className="fas fa-calculator" /> Start Measuring
                </button>
              </div>
            ) : (
              <div className="roc-list">
                {history.map((h, i) => {
                  const tc  = TYPE_COLORS[h.type] || {};
                  const opK = h.op?.toUpperCase();
                  return (
                    <div className="roc-item" key={i}>
                      {/* Left icon */}
                      <div className="roc-type-icon" style={{background: tc.bg, color: tc.color}}>
                        <i className={`fas ${TYPE_ICONS[h.type] || 'fa-calculator'}`} />
                      </div>

                      {/* Middle info */}
                      <div className="roc-info">
                        <div className="roc-item-top">
                          <span className="roc-op-badge" style={{background: tc.bg, color: tc.color}}>
                            <i className={`fas ${OP_ICONS[opK] || 'fa-cog'}`} />
                            {h.op}
                          </span>
                          <span className="roc-type-lbl">{h.type}</span>
                        </div>
                        <div className="roc-operands">
                          {h.o1} {OPS[h.op?.toLowerCase()] || '→'} {h.o2}
                        </div>
                      </div>

                      {/* Right result */}
                      <div className={`roc-result ${h.isErr ? 'err' : ''}`}>
                        {h.isErr
                          ? <><i className="fas fa-times-circle" /> Error</>
                          : h.result}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}