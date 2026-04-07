import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OPS, TYPE_COLORS } from '../utils/measureConstants';
import './HistoryView.css';

const FILTERS = ['ALL', 'LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];
const TYPE_ICONS = {
  LENGTH:      'fa-ruler-horizontal',
  WEIGHT:      'fa-weight-hanging',
  VOLUME:      'fa-flask',
  TEMPERATURE: 'fa-thermometer-half',
};

export default function HistoryView({ history, onClear }) {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? history : history.filter(h => h.type === filter);

  if (!user) {
    return (
      <div className="history-wrap">
        <div className="view-hdr">
          <div>
            <h2>Operation <span>History</span></h2>
            <p>All your past measurement operations</p>
          </div>
        </div>
        <div className="hist-full-card">
          <div className="hist-lock-full">
            <div className="hlf-ico"><i className="fas fa-lock" /></div>
            <div className="hlf-title">Login Required</div>
            <div className="hlf-sub">Sign in to view and save your full operation history.</div>
            <button className="hlf-google-btn" onClick={() => navigate('/auth')}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" />
              Sign in with Google
            </button>
            <a href="/auth" onClick={e => { e.preventDefault(); navigate('/auth'); }} className="hlf-email-link">
              Or use email &amp; password →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-wrap">
      <div className="view-hdr">
        <div>
          <h2>Operation <span>History</span></h2>
          <p>{history.length} total operation{history.length !== 1 ? 's' : ''} recorded this session</p>
        </div>
        {history.length > 0 && (
          <button className="clr-btn" onClick={onClear}>
            <i className="fas fa-trash-alt" /> Clear All
          </button>
        )}
      </div>

      <div className="hist-full-card">
        {/* Filter toolbar */}
        <div className="hist-toolbar">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== 'ALL' && (
                <span className="filter-count">
                  {history.filter(h => h.type === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="hist-full-body">
          {filtered.length === 0 ? (
            <div className="hist-full-empty">
              <i className="fas fa-inbox" />
              <span>No operations yet.</span>
              <small>Run a measurement on the Measure tab to see it here.</small>
            </div>
          ) : (
            filtered.map((h, i) => {
              const tc = TYPE_COLORS[h.type] || {};
              return (
                <div className="hfi" key={i}>
                  <div className="hfi-badge" style={{ background: tc.bg, color: tc.color }}>
                    <i className={`fas ${TYPE_ICONS[h.type] || 'fa-calculator'}`} />
                  </div>
                  <div className="hfi-info">
                    <div className="hfi-top">
                      <span className="hfi-op">{h.op}</span>
                      <span className="hfi-type">· {h.type}</span>
                    </div>
                    <div className="hfi-det">
                      {h.o1} {OPS[h.op?.toLowerCase()] || ''} {h.o2}
                    </div>
                  </div>
                  <div className={`hfi-result ${h.isErr ? 'err' : ''}`}>
                    {h.isErr ? h.err : h.result}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
