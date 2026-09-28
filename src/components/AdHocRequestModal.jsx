import { useState } from 'react'

// Lets an approver (Chief Director / DDG / HOD) ask a specific Business Unit
// to update a specific risk right now, even while the capture period is
// closed - e.g. ahead of an ad-hoc ESMT meeting. It reopens editing on just
// that one risk until the Business Unit acts on it.
export default function AdHocRequestModal({ risk, onCancel, onSubmit }) {
  const [reason, setReason] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit(reason.trim())
  }

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 480 }}>
        <div className="panel-head">
          <div>
            <h3>Request an ad-hoc update</h3>
            <div className="meta">{risk.risk}</div>
          </div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="panel-body">
            <p style={{ marginTop: 0, color: 'var(--ink-muted)', fontSize: 12.5 }}>
              This opens <strong>{risk.businessUnit}</strong> back up to edit just this risk, even if the capture period is closed — useful ahead of a meeting where you need current progress. It stays open on this risk until they act on it.
            </p>
            <div className="form-field">
              <label>Reason (required, kept for audit purposes)</label>
              <textarea
                rows={3} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g. Need current progress ahead of Friday's ESMT"
                autoFocus
              />
            </div>
          </div>
          <div className="panel-foot">
            <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn" disabled={!reason.trim()}>Send request</button>
          </div>
        </form>
      </div>
    </div>
  )
}
