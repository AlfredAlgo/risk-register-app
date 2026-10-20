import { useState } from 'react'

// Lets a Director/Chief Director/DDG/CRO request that a risk be removed from
// the register. HOD's approval of the removal happens off-system - the
// uploaded memo is the evidence of that - so this only captures the reason
// and the memo; the Risk Capturer (risk team) validates it from there.
export default function RemovalRequestModal({ risk, onCancel, onSubmit }) {
  const [reason, setReason] = useState('')
  const [memo, setMemo] = useState(null)
  const [attachError, setAttachError] = useState('')

  function handleAttachFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setAttachError('Keep the memo under 2MB for this demo.')
      e.target.value = ''
      return
    }
    setAttachError('')
    const reader = new FileReader()
    reader.onload = () => setMemo({ name: file.name, type: file.type, dataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim() || !memo) return
    onSubmit(reason.trim(), memo)
  }

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 480 }}>
        <div className="panel-head">
          <div>
            <h3>Request to remove risk</h3>
            <div className="meta">{risk.risk}</div>
          </div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="panel-body">
            <p style={{ marginTop: 0, color: 'var(--ink-muted)', fontSize: 12.5 }}>
              Requires the HOD-approved memo as proof — the risk team validates this before the risk is actually removed.
            </p>
            <div className="form-field">
              <label>Reason (required)</label>
              <textarea
                rows={3} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Why this risk should be removed from the register"
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>HOD-approved memo (required)</label>
              <input type="file" onChange={handleAttachFile} />
              {attachError && <div className="form-error" style={{ marginTop: 8 }}>{attachError}</div>}
              {memo && (
                <div className="attach-preview">
                  📎 {memo.name}
                  <button type="button" className="link-btn" onClick={() => setMemo(null)}>Remove</button>
                </div>
              )}
            </div>
          </div>
          <div className="panel-foot">
            <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn" disabled={!reason.trim() || !memo}>Send request</button>
          </div>
        </form>
      </div>
    </div>
  )
}
