import { useState } from 'react'

// The Risk Capturer's validation step for a pending removal request -
// mirrors ProposalReviewModal's reject flow (a required note to deny,
// optional note to approve).
export default function RemovalValidationModal({ risk, onCancel, onApprove, onDeny }) {
  const [denying, setDenying] = useState(false)
  const [note, setNote] = useState('')
  const request = risk.removalRequest

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 520 }}>
        <div className="panel-head">
          <div>
            <h3>Validate removal request</h3>
            <div className="meta">{risk.risk}</div>
          </div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          <p style={{ marginTop: 0, fontSize: 12.5, color: 'var(--ink-muted)' }}>
            Requested by <strong>{request.requestedBy}</strong> — {request.reason}
          </p>
          <a className="link-btn" href={request.memo.dataUrl} download={request.memo.name}>📎 {request.memo.name}</a>

          <div className="form-field" style={{ marginTop: 16 }}>
            <label>{denying ? 'Reason for denial (required)' : 'Note (optional)'}</label>
            <textarea
              rows={2} value={note} onChange={e => setNote(e.target.value)}
              placeholder="Kept on the audit trail" autoFocus={denying}
            />
          </div>
        </div>
        <div className="panel-foot">
          {denying ? (
            <>
              <button className="btn ghost" onClick={() => { setDenying(false); setNote('') }}>Back</button>
              <button className="btn danger" disabled={!note.trim()} onClick={() => onDeny(note.trim())}>Confirm denial</button>
            </>
          ) : (
            <>
              <button className="btn ghost" onClick={onCancel}>Cancel</button>
              <button className="btn danger" onClick={() => setDenying(true)}>Deny</button>
              <button className="btn" onClick={() => onApprove(note.trim())}>Approve removal</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
