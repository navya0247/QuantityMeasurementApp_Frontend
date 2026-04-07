import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { runMeasurement } from '../services/api';
import { UNITS, TMAP, OPS, LBL2, TYPE_COLORS } from '../utils/measureConstants';
import HistoryPanel from './HistoryPanel';
import './MeasureView.css';

const TYPES = ['LENGTH', 'WEIGHT', 'VOLUME', 'TEMPERATURE'];
const ACTIONS = ['compare', 'convert'];
const ARITH   = ['add', 'subtract', 'divide'];
const TYPE_ICONS = { LENGTH:'fa-ruler-horizontal', WEIGHT:'fa-weight-hanging', VOLUME:'fa-flask', TEMPERATURE:'fa-thermometer-half' };

export default function MeasureView({ selectedType, setSelectedType, onAddHistory, history }) {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [action,     setAction]     = useState(null);
  const [arithOpen,  setArithOpen]  = useState(false);
  const [val1,       setVal1]       = useState('');
  const [val2,       setVal2]       = useState('');
  const [unit1,      setUnit1]      = useState('');
  const [unit2,      setUnit2]      = useState('');
  const [tgtUnit,    setTgtUnit]    = useState('');
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);

  const units = selectedType ? UNITS[selectedType] : [];
  const isTmp = selectedType === 'TEMPERATURE';
  const canRun = selectedType && action;

  const handleTypeSelect = (t) => {
    setSelectedType(t);
    setAction(null);
    setResult(null);
    setVal1(''); setVal2('');
    const u = UNITS[t];
    setUnit1(u[0]); setUnit2(u[0]); setTgtUnit(u[0]);
  };

  const handleAction = (a) => {
    if (!selectedType) return;
    setAction(a);
    if (!['add','subtract','divide'].includes(a)) setArithOpen(false);
    setResult(null);
  };

  const handleRun = async () => {
    if (!canRun) return;
    const mt = TMAP[selectedType];
    const body = {
      thisQuantity: { value: parseFloat(val1)||0, unit: unit1, measurementType: mt },
      thatQuantity: { value: parseFloat(val2)||0, unit: unit2, measurementType: mt },
    };
    if ((action === 'add' || action === 'subtract') && tgtUnit)
      body.targetUnit = { value: 0, unit: tgtUnit, measurementType: mt };

    setLoading(true);
    try {
      const res = await runMeasurement(action, body, user?.token || null);
      const data = res.data;
      setResult({ data, isErr: false });
      if (user) {
        onAddHistory({
          op:     data.operation || action.toUpperCase(),
          type:   data.measureType || selectedType,
          o1:     data.operandOne || '—',
          o2:     data.operandTwo || '—',
          result: data.result     || '—',
          isErr:  data.isError    || false,
          err:    data.errorMessage || '',
        });
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Cannot connect to API. Make sure ASP.NET Core is running on port 5000.';
      setResult({ data: { result: msg }, isErr: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="measure-wrap">
      {/* Guest banner */}
      {!user && (
        <div className="guest-banner">
          <i className="fas fa-info-circle" />
          <span>Using as guest — operations work freely. <a href="/auth" onClick={e=>{e.preventDefault();navigate('/auth');}}>Sign in</a> to save history.</span>
          <button className="gb-btn" onClick={() => navigate('/auth')}>Sign In Free →</button>
        </div>
      )}

      {/* Type selector — equal size grid */}
      <div className="type-grid">
        {TYPES.map(t => {
          const c = TYPE_COLORS[t];
          const active = selectedType === t;
          return (
            <button
              key={t}
              className={`type-card ${active ? 'active' : ''}`}
              onClick={() => handleTypeSelect(t)}
              style={active ? { background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`, borderColor: c.color } : {}}
            >
              <i className={`fas ${TYPE_ICONS[t]}`} style={{ color: active ? '#fff' : c.color }} />
              <span style={{ color: active ? '#fff' : 'var(--muted)' }}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main area: form left, history right */}
      <div className="measure-main">
        {/* Left: actions + form */}
        <div className="form-col">

          {/* Action row */}
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
                onClick={() => { if(selectedType) setArithOpen(o => !o); }}
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

          {/* Inputs */}
          <div className="inputs-card">
            <div className="inputs-row">
              {/* Value 1 */}
              <div className="inp-grp">
                <label>Value 1</label>
                <input
                  className="inp" type="number" placeholder="0.0" step="any"
                  value={val1} onChange={e => setVal1(e.target.value)}
                  disabled={!selectedType}
                />
                <select className="inp sel" value={unit1} onChange={e => setUnit1(e.target.value)} disabled={!selectedType}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              {/* Op circle */}
              <div className="op-circle">{action ? (OPS[action] || '?') : '?'}</div>

              {/* Value 2 */}
              <div className="inp-grp">
                <label>{action ? LBL2[action] : 'Value 2'}</label>
                <input
                  className="inp" type="number" placeholder="0.0" step="any"
                  value={val2} onChange={e => setVal2(e.target.value)}
                  disabled={!selectedType}
                />
                <select className="inp sel" value={unit2} onChange={e => setUnit2(e.target.value)} disabled={!selectedType}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Target unit row */}
            {(action === 'add' || action === 'subtract') && (
              <div className="tgt-row">
                <label>Result Unit</label>
                <select className="inp sel" value={tgtUnit} onChange={e => setTgtUnit(e.target.value)}>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )}

            {/* Run button */}
            <button className="run-btn" onClick={handleRun} disabled={!canRun || loading}>
              {loading
                ? <><span className="spin" /> Processing...</>
                : canRun
                  ? `Run ${action.charAt(0).toUpperCase() + action.slice(1)}`
                  : selectedType ? 'Select an action' : 'Select type and action'}
            </button>

            {/* Result */}
            {result && (
              <div className={`result-box ${result.isErr ? 'err' : 'ok'}`}>
                <div className="result-hdr">
                  <div className={`result-ico ${result.isErr ? 'err' : 'ok'}`}>
                    <i className={`fas fa-${result.isErr ? 'times' : 'check'}`} />
                  </div>
                  <div>
                    <div className="result-ttl">{result.isErr ? 'Operation Failed' : `${action?.toUpperCase()} Result`}</div>
                    <div className="result-sub">{result.isErr ? '' : `${selectedType} · ${action}`}</div>
                  </div>
                </div>
                <div className={`result-val ${result.isErr ? 'err' : 'ok'}`}>{result.data.result || result.data.message || '—'}</div>
                {!result.isErr && result.data.operandOne && (
                  <div className="result-meta">{result.data.operandOne} {OPS[action]} {result.data.operandTwo}</div>
                )}
                {!user && !result.isErr && (
                  <div className="result-save-hint">
                    <i className="fas fa-lock" />
                    <a href="/auth" onClick={e=>{e.preventDefault();navigate('/auth');}}>Sign in to save history →</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: history panel */}
        <HistoryPanel history={history} user={user} onSignIn={() => navigate('/auth')} />
      </div>
    </div>
  );
}
