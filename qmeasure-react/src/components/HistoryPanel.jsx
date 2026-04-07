import React from 'react';
import { OPS, TYPE_COLORS } from '../utils/measureConstants';
import './HistoryPanel.css';

const TYPE_ICONS = {
  LENGTH:      'fa-ruler-horizontal',
  WEIGHT:      'fa-weight-hanging',
  VOLUME:      'fa-flask',
  TEMPERATURE: 'fa-thermometer-half',
};

export default function HistoryPanel({ history, user, onSignIn }) {
  if (!user) {
    return (
      <div className="hist-panel">
        <div className="hist-panel-hdr">
          <h3><i className="fas fa-history" /> Recent Operations</h3>
        </div>
        <div className="hist-lock">
          <div className="hist-lock-ico">
            <i className="fas fa-lock" />
          </div>
          <div className="hist-lock-title">Login Required</div>
          <div className="hist-lock-sub">Sign in to save and view your operation history.</div>
          <button className="hist-lock-btn" onClick={onSignIn}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="G"
            />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hist-panel">
      <div className="hist-panel-hdr">
        <h3><i className="fas fa-history" /> Recent Operations</h3>
      </div>
      <div className="hist-panel-body">
        {history.length === 0 ? (
          <div className="hist-empty">
            <i className="fas fa-inbox" />
            <span>No operations yet.</span>
          </div>
        ) : (
          history.slice(0, 15).map((h, i) => {
            const tc = TYPE_COLORS[h.type] || {};
            return (
              <div className="hist-item" key={i}>
                <div
                  className="hist-item-dot"
                  style={{ background: tc.bg, color: tc.color }}
                >
                  <i className={`fas ${TYPE_ICONS[h.type] || 'fa-calculator'}`} />
                </div>
                <div className="hist-item-info">
                  <div className="hist-item-op">{h.op} · {h.type}</div>
                  <div className="hist-item-det">
                    {h.o1} {OPS[h.op?.toLowerCase()] || ''} {h.o2}
                  </div>
                </div>
                <div className={`hist-item-res ${h.isErr ? 'err' : ''}`}>
                  {h.isErr ? h.err : h.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
