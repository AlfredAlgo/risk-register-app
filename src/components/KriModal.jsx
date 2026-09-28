import { useState } from 'react'
import { emptyKri, emptyKriResult, KRI_BANDS, kriBandLabel, kriBandTone } from '../utils/helpers.jsx'

function IndicatorEditor({ kri, onChange, onRemove }) {
  function setThreshold(band, value) {
    onChange({ ...kri, thresholds: { ...kri.thresholds, [band]: value } })
  }
  function setResult(i, patch) {
    onChange({ ...kri, results: kri.results.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) })
  }
  function addResult() {
    onChange({ ...kri, results: [...kri.results, emptyKriResult()] })
  }
  function removeResult(i) {
    onChange({ ...kri, results: kri.results.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="kri-indicator">
      <div className="list-row">
        <input type="text" value={kri.indicator} placeholder="Key risk indicator" onChange={e => onChange({ ...kri, indicator: e.target.value })} />
        <input type="text" value={kri.quarterlyTarget} placeholder="Quarterly target" style={{ maxWidth: 130 }} onChange={e => onChange({ ...kri, quarterlyTarget: e.target.value })} />
        <button type="button" className="btn ghost sm" onClick={onRemove}>Remove indicator</button>
      </div>
      <div className="kri-thresholds">
        {KRI_BANDS.map(band => (
          <div className="kri-threshold-field" key={band}>
            <label>{kriBandLabel[band]}</label>
            <input type="text" value={kri.thresholds[band]} onChange={e => setThreshold(band, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="kri-results">
        <label className="kri-results-label">Period results</label>
        {kri.results.map((r, i) => (
          <div className="list-row kri-result-row" key={r.id}>
            <input type="text" value={r.period} placeholder="e.g. April 2026" onChange={e => setResult(i, { period: e.target.value })} />
            <input type="text" value={r.value} placeholder="Result" onChange={e => setResult(i, { value: e.target.value })} />
            <select value={r.band} onChange={e => setResult(i, { band: e.target.value })}>
              {KRI_BANDS.map(b => <option key={b} value={b}>{kriBandLabel[b]}</option>)}
            </select>
            <button type="button" className="btn ghost sm" onClick={() => removeResult(i)} disabled={kri.results.length <= 1}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn ghost sm" onClick={addResult}>+ Add period result</button>
      </div>
    </div>
  )
}

function IndicatorView({ kri }) {
  return (
    <div className="kri-indicator kri-indicator-view">
      <div className="kri-indicator-head">
        <strong>{kri.indicator}</strong>
        {kri.quarterlyTarget && <span className="sub">Target: {kri.quarterlyTarget}</span>}
      </div>
      <table className="ref kri-table">
        <thead><tr>{KRI_BANDS.map(b => <th key={b}>{kriBandLabel[b]}</th>)}</tr></thead>
        <tbody><tr>{KRI_BANDS.map(b => <td key={b} className="sub">{kri.thresholds[b] || '—'}</td>)}</tr></tbody>
      </table>
      <div className="kri-result-list">
        {kri.results.filter(r => r.period || r.value).map(r => (
          <div className="kri-result-pill-row" key={r.id}>
            <span className="sub">{r.period}</span>
            <span className={'approval-pill tone-' + kriBandTone[r.band]}>{r.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KriModal({ risk, canEdit, onClose, onSave }) {
  const [toleranceStatement, setToleranceStatement] = useState(risk.kriToleranceStatement || '')
  const [summary, setSummary] = useState(risk.kriSummary || '')
  const [kris, setKris] = useState(risk.kris?.length ? risk.kris : [emptyKri()])

  function updateKri(i, next) {
    setKris(kris.map((k, idx) => (idx === i ? next : k)))
  }
  function addKri() {
    setKris([...kris, emptyKri()])
  }
  function removeKri(i) {
    setKris(kris.filter((_, idx) => idx !== i))
  }
  function handleSave() {
    onSave({
      kriToleranceStatement: toleranceStatement,
      kriSummary: summary,
      kris: kris.filter(k => k.indicator.trim())
    })
  }

  return (
    <div className="overlay open">
      <div className="panel form-panel">
        <div className="panel-head">
          <div>
            <h3>Key risk indicators</h3>
            <div className="meta">{risk.risk}</div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          {canEdit ? (
            <>
              <div className="form-field">
                <label>Tolerance statement</label>
                <textarea rows={2} value={toleranceStatement} onChange={e => setToleranceStatement(e.target.value)} placeholder="e.g. The department has a low–medium risk tolerance for…" />
              </div>
              {kris.map((k, i) => (
                <IndicatorEditor key={k.id} kri={k} onChange={next => updateKri(i, next)} onRemove={() => removeKri(i)} />
              ))}
              <button type="button" className="btn ghost sm" onClick={addKri}>+ Add indicator</button>
              <div className="form-field" style={{ marginTop: 14 }}>
                <label>Summary</label>
                <textarea rows={3} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Narrative summary for this quarter's results" />
              </div>
            </>
          ) : (
            <>
              {toleranceStatement && <p className="sub" style={{ marginTop: 0 }}>{toleranceStatement}</p>}
              {kris.filter(k => k.indicator.trim()).length === 0 ? (
                <div className="sub">No indicators recorded yet.</div>
              ) : (
                kris.filter(k => k.indicator.trim()).map(k => <IndicatorView key={k.id} kri={k} />)
              )}
              {summary && (<><div className="block-title">Summary</div><p className="sub">{summary}</p></>)}
            </>
          )}
        </div>
        <div className="panel-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          {canEdit && <button className="btn" onClick={handleSave}>Save indicators</button>}
        </div>
      </div>
    </div>
  )
}
