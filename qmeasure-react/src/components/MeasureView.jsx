import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { runMeasurement } from '../services/api';
import { UNITS, TMAP, OPS, LBL2, TYPE_COLORS } from '../utils/measureConstants';
import './MeasureView.css';

const TYPES   = ['LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];
const ACTIONS = ['compare', 'convert'];
const ARITH   = ['add', 'subtract', 'divide'];
const TYPE_ICONS = {
  LENGTH: 'fa-ruler-horizontal', WEIGHT: 'fa-weight-hanging',
  VOLUME: 'fa-flask', TEMPERATURE: 'fa-thermometer-half',
};

export default function MeasureView({ selectedType, setSelectedType, onAddHistory, history, setActiveView }) {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [action,    setAction]    = useState(null);
  const [arithOpen, setArithOpen] = useState(false);
  const [val1,      setVal1]      = useState('');
  const [val2,      setVal2]      = useState('');
  const [unit1,     setUnit1]     = useState('');
  const [unit2,     setUnit2]     = useState('');
  const [tgtUnit,   setTgtUnit]   = useState('');
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab,       setAuthTab]       = useState('signin');

  const units  = selectedType ? UNITS[selectedType] : [];
  const isTmp  = selectedType === 'TEMPERATURE';
  const canRun = selectedType && action;

  const handleTypeSelect = (t) => {
    setSelectedType(t); setAction(null); setResult(null);
    setVal1(''); setVal2('');
    const u = UNITS[t];
    setUnit1(u[0]); setUnit2(u[0]); setTgtUnit(u[0]);
  };

  const handleAction = (a) => {
    if (!selectedType) return;
    setAction(a);
    if (!ARITH.includes(a)) setArithOpen(false);
    setResult(null);
  };

  const handleRun = async () => {
    if (!canRun) return;
    const mt = TMAP[selectedType];
    const body = {
      thisQuantity: { value: parseFloat(val1) || 0, unit: unit1, measurementType: mt },
      thatQuantity: { value: parseFloat(val2) || 0, unit: unit2, measurementType: mt },
    };
    if ((action === 'add' || action === 'subtract') && tgtUnit)
      body.targetUnit = { value: 0, unit: tgtUnit, measurementType: mt };

    setLoading(true);
    try {
      const res  = await runMeasurement(action, body, user?.token || null);
      const data = res.data;
      setResult({ data, isErr: false });
      setSavedToHistory(false);
      // Note: history is saved manually via Save button, not automatically
    } catch (e) {
      const msg = e.response?.data?.message || 'Cannot connect to API. Make sure ASP.NET Core is running on port 5000.';
      setResult({ data: { result: msg }, isErr: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = (setActiveView) => {
    if (!result || result.isErr) return;
    onAddHistory({
      op:     result.data.operation   || action.toUpperCase(),
      type:   result.data.measureType || selectedType,
      o1:     result.data.operandOne  || '—',
      o2:     result.data.operandTwo  || '—',
      result: result.data.result      || '—',
      isErr:  false,
      err:    '',
    });
    setSavedToHistory(true);
  };

  const openAuthModal = (tab = 'signin') => { setAuthTab(tab); setShowAuthModal(true); };

  return (
    <div className="measure-wrap">

      {/* ── Auth Modal Overlay ── */}
      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>
              <i className="fas fa-times" />
            </button>

            {/* Tabs */}
            <div className="modal-tabs">
              <button
                className={`modal-tab ${authTab === 'signin' ? 'active' : ''}`}
                onClick={() => setAuthTab('signin')}
              >Sign In</button>
              <button
                className={`modal-tab ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthTab('signup')}
              >Sign Up</button>
            </div>

            <div className="modal-body">
              <p className="modal-desc">
                {authTab === 'signin'
                  ? 'Sign in to save your operation history and access all features.'
                  : 'Create a free account to save history and access all features.'}
              </p>

              {/* Google button */}
              <button
                className="modal-google-btn"
                onClick={() => { setShowAuthModal(false); navigate('/auth'); }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                {authTab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </button>

              <div className="modal-divider"><span>or use email</span></div>

              <button
                className="modal-email-btn"
                onClick={() => { setShowAuthModal(false); navigate('/auth'); }}
              >
                <i className="fas fa-envelope" />
                {authTab === 'signin' ? 'Sign in with Email' : 'Sign up with Email'}
              </button>

              <p className="modal-switch">
                {authTab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className="modal-switch-btn"
                  onClick={() => setAuthTab(authTab === 'signin' ? 'signup' : 'signin')}
                >
                  {authTab === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Guest banner ── */}
      {!user && (
        <div className="guest-banner">
          <i className="fas fa-info-circle" />
          <span>Using as guest — operations work freely.{' '}
            <button className="banner-link" onClick={() => openAuthModal('signin')}>Sign in</button>
            {' '}to save history.
          </span>
          <button className="gb-btn" onClick={() => openAuthModal('signin')}>Sign In Free →</button>
        </div>
      )}

      {/* ── Type grid ── */}
      <div className="type-grid">
        {TYPES.map(t => {
          const c      = TYPE_COLORS[t];
          const active = selectedType === t;
          return (
            <button
              key={t}
              className={`type-card ${active ? 'active' : ''}`}
              onClick={() => handleTypeSelect(t)}
              style={active ? { background: `linear-gradient(135deg,${c.color},${c.color}cc)`, borderColor: c.color } : {}}
            >
              <i className={`fas ${TYPE_ICONS[t]}`} style={{ color: active ? '#fff' : c.color }} />
              <span style={{ color: active ? '#fff' : 'var(--muted)' }}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main area ── */}
      <div className="measure-main">

        {/* Left: form */}
        <div className="form-col">
          {/* Action card */}
          <div className="action-card">
            <div className="action-lbl">Choose Action</div>
            <div className="action-row">
              {ACTIONS.map(a => (
                <button
                  key={a}
                  className={`a-btn ${action === a ? 'active' : ''}`}
                  onClick={() => handleAction(a)}
                  disabled={!selectedType}
                >
                  <i className={`fas fa-${a === 'compare' ? 'equals' : 'exchange-alt'}`} />
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
              <button
                className={`arith-toggle ${ARITH.includes(action) ? 'active-group' : ''}`}
                onClick={() => { if (selectedType) setArithOpen(o => !o); }}
                disabled={!selectedType}
              >
                <i className="fas fa-calculator" /> Arithmetic
                <i className={`fas fa-chevron-down arith-chev ${arithOpen ? 'open' : ''}`} />
              </button>
            </div>
            {arithOpen && (
              <div className="arith-sub">
                {ARITH.map(a => (
                  <button
                    key={a}
                    className={`arith-btn ${action === a ? 'active' : ''}`}
                    onClick={() => handleAction(a)}
                    disabled={isTmp}
                  >
                    <i className={`fas fa-${a === 'add' ? 'plus' : a === 'subtract' ? 'minus' : 'divide'}`} />
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            )}
            {isTmp && (
              <div className="tmp-warn">
                ⚠ Temperature only supports <strong>Compare</strong> and <strong>Convert</strong>.
              </div>
            )}
          </div>

          {/* Inputs card */}
          <div className="inputs-card">
            <div className="inputs-row">
              <div className="inp-grp">
                <label>Value 1</label>
                <input className="inp" type="number" placeholder="0.0" step="any"
                  value={val1} onChange={e => setVal1(e.target.value)} disabled={!selectedType} />
                <select className="inp sel" value={unit1} onChange={e => setUnit1(e.target.value)} disabled={!selectedType}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="op-circle">{action ? (OPS[action] || '?') : '?'}</div>
              <div className="inp-grp">
                <label>{action ? LBL2[action] : 'Value 2'}</label>
                <input className="inp" type="number" placeholder="0.0" step="any"
                  value={val2} onChange={e => setVal2(e.target.value)} disabled={!selectedType} />
                <select className="inp sel" value={unit2} onChange={e => setUnit2(e.target.value)} disabled={!selectedType}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {(action === 'add' || action === 'subtract') && (
              <div className="tgt-row">
                <label>Result Unit</label>
                <select className="inp sel" value={tgtUnit} onChange={e => setTgtUnit(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )}

            <button className="run-btn" onClick={handleRun} disabled={!canRun || loading}>
              {loading
                ? <><span className="spin" /> Processing...</>
                : canRun
                  ? `Run ${action.charAt(0).toUpperCase() + action.slice(1)}`
                  : selectedType ? 'Select an action' : 'Select type and action'}
            </button>
          </div>
        </div>

        {/* Right: result OR history panel */}
        <div className="right-col">
          {result ? (
            /* ── Result Panel ── */
            <div className="result-panel">
              <div className="result-panel-hdr">
                <div className={`result-ico ${result.isErr ? 'err' : 'ok'}`}>
                  <i className={`fas fa-${result.isErr ? 'times' : 'check'}`} />
                </div>
                <div>
                  <div className="result-ttl">
                    {result.isErr ? 'Operation Failed' : `${action?.toUpperCase()} Result`}
                  </div>
                  <div className="result-sub">
                    {result.isErr ? 'Something went wrong' : `${selectedType} · ${action}`}
                  </div>
                </div>
                <button className="result-clear-btn" onClick={() => setResult(null)} title="Clear result">
                  <i className="fas fa-times" />
                </button>
              </div>

              <div className={`result-val-big ${result.isErr ? 'err' : 'ok'}`}>
                {result.data.result || result.data.message || '—'}
              </div>

              {!result.isErr && result.data.operandOne && (
                <div className="result-meta">
                  {result.data.operandOne} {OPS[action]} {result.data.operandTwo}
                </div>
              )}

              {/* Save / Sign in buttons */}
              {!result.isErr && (
                <div className="result-actions">
                  {user ? (
                    savedToHistory ? (
                      <button className="view-hist-btn" onClick={() => setActiveView('history')}>
                        <i className="fas fa-history" /> View History
                      </button>
                    ) : (
                      <button className="save-hist-btn" onClick={handleSaveHistory}>
                        <i className="fas fa-bookmark" /> Save to History
                      </button>
                    )
                  ) : (
                    <>
                      <div className="result-lock-msg">
                        <i className="fas fa-lock" /> Sign in to save this result
                      </div>
                      <div className="result-auth-btns">
                        <button className="rab signin" onClick={() => openAuthModal('signin')}>
                          Sign In
                        </button>
                        <button className="rab signup" onClick={() => openAuthModal('signup')}>
                          Sign Up Free
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Recent history below result */}
              {user && history.length > 0 && (
                <div className="mini-history">
                  <div className="mini-hist-lbl">
                    <i className="fas fa-history" /> Recent
                  </div>
                  {history.slice(0, 5).map((h, i) => {
                    const tc = TYPE_COLORS[h.type] || {};
                    return (
                      <div className="mini-hist-item" key={i}>
                        <div className="mini-hist-dot" style={{ background: tc.bg, color: tc.color }}>
                          <i className={`fas ${TYPE_ICONS[h.type] || 'fa-calculator'}`} />
                        </div>
                        <div className="mini-hist-info">
                          <div className="mini-hist-op">{h.op} · {h.type}</div>
                          <div className="mini-hist-det">{h.o1} → {h.o2}</div>
                        </div>
                        <div className={`mini-hist-res ${h.isErr ? 'err' : ''}`}>
                          {h.isErr ? h.err : h.result}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── Empty right panel (no result yet) ── */
            <div className="right-empty-panel">
              <div className="right-panel-hdr">
                <i className="fas fa-history" />
                <span>Recent Operations</span>
              </div>

              {!user ? (
                <div className="hist-lock">
                  <div className="hist-lock-ico"><i className="fas fa-lock" /></div>
                  <div className="hist-lock-title">Login Required</div>
                  <div className="hist-lock-sub">Sign in to save and view your operation history.</div>
                  <div className="hist-lock-btns">
                    <button className="hlb signin" onClick={() => openAuthModal('signin')}>Sign In</button>
                    <button className="hlb signup" onClick={() => openAuthModal('signup')}>Sign Up</button>
                  </div>
                </div>
              ) : history.length === 0 ? (
                <div className="hist-empty">
                  <i className="fas fa-inbox" />
                  <span>No operations yet.</span>
                  <small>Run a measurement to see it here.</small>
                </div>
              ) : (
                <div className="hist-panel-body">
                  {history.slice(0, 15).map((h, i) => {
                    const tc = TYPE_COLORS[h.type] || {};
                    return (
                      <div className="hist-item" key={i}>
                        <div className="hist-item-dot" style={{ background: tc.bg, color: tc.color }}>
                          <i className={`fas ${TYPE_ICONS[h.type] || 'fa-calculator'}`} />
                        </div>
                        <div className="hist-item-info">
                          <div className="hist-item-op">{h.op} · {h.type}</div>
                          <div className="hist-item-det">{h.o1} {OPS[h.op?.toLowerCase()] || ''} {h.o2}</div>
                        </div>
                        <div className={`hist-item-res ${h.isErr ? 'err' : ''}`}>
                          {h.isErr ? h.err : h.result}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}