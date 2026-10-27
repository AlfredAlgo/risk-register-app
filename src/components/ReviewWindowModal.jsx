import { useState } from 'react'
import { formatDateShort } from '../utils/helpers.jsx'

export const FIELD_OPTIONS = [
  { key: 'targetDate', label: 'Due date' },
  { key: 'progressPct', label: 'Overall progress %' },
  { key: 'actionPlan', label: 'Action plan & progress' },
  { key: 'controls', label: 'Controls' }
]

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// CRO opens this any time, scheduled like a meeting with a start and end
// date - not quarter-locked like the capture period. While open, it unlocks
// only the fields the risk team chooses (mainly action plan progress) on
// Approved risks, and those edits save immediately - the CRO's role here is
// to monitor and report, not to re-run the approval chain.
export default function ReviewWindowModal({ reviewWindow, onCancel, onOpen, onCloseWindow }) {
  const [opensAt, setOpensAt] = useState(todayIso())
  const [closesAt, setClosesAt] = useState('')
  const [reason, setReason] = useState('')
  const [fieldWhitelist, setFieldWhitelist] = useState(['progressPct', 'actionPlan'])

  function toggleField(key) {
    setFieldWhitelist(fw => fw.includes(key) ? fw.filter(k => k !== key) : [...fw, key])
  }

  const canOpen = reason.trim() && fieldWhitelist.length > 0 && opensAt && closesAt && closesAt >= opensAt

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 480 }}>
        <div className="panel-head">
          <div><h3>Review window</h3></div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          {reviewWindow ? (
            <>
              <p style={{ marginTop: 0 }}>
                Opened by <strong>{reviewWindow.openedBy}</strong> — {reviewWindow.reason}
              </p>
              <p className="sub">
                {formatDateShort(reviewWindow.opensAt)} – {formatDateShort(reviewWindow.closesAt)}. Unlocked: {reviewWindow.fieldWhitelist.map(k => FIELD_OPTIONS.find(f => f.key === k)?.label || k).join(', ')}.
              </p>
            </>
          ) : (
            <>
              <div className="field-row">
                <div className="form-field">
                  <label>From</label>
                  <input type="date" value={opensAt} onChange={e => setOpensAt(e.target.value)} />
                </div>
                <div className="form-field">
                  <label>To</label>
                  <input type="date" value={closesAt} min={opensAt} onChange={e => setClosesAt(e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label>Reason</label>
                <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Quarterly progress check-in" />
              </div>
              <div className="form-field">
                <label>Which fields unlock</label>
                {FIELD_OPTIONS.map(f => (
                  <label key={f.key} className="checkbox-row">
                    <input type="checkbox" checked={fieldWhitelist.includes(f.key)} onChange={() => toggleField(f.key)} />
                    {f.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="panel-foot">
          <button className="btn ghost" onClick={onCancel}>Close</button>
          {reviewWindow ? (
            <button className="btn danger" onClick={onCloseWindow}>Close window early</button>
          ) : (
            <button
              className="btn" disabled={!canOpen}
              onClick={() => onOpen(opensAt, closesAt, reason.trim(), fieldWhitelist)}
            >
              Open review window
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
