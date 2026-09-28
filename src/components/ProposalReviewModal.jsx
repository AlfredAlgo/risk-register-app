import { useState } from 'react'
import DiffList from './DiffList.jsx'
import { diffRisk } from '../utils/audit.js'
import { formatDateTime, actionPlanStatusLabel } from '../utils/helpers.jsx'
import { ROLES, APPROVAL_CHAIN } from '../data/orgStructure.js'

const STAGE_TRACK = ['Draft', ...APPROVAL_CHAIN.map(k => ROLES[k].label), 'Approved']

export default function ProposalReviewModal({ risk, canAct, onClose, onAuthorise, onRequestChanges, onReject }) {
  const [action, setAction] = useState(null) // null | 'changes' | 'reject'
  const [note, setNote] = useState('')
  const [authoriseNote, setAuthoriseNote] = useState('')
  const submission = risk.pendingChange.data
  const diffs = diffRisk(risk, submission)
  const currentStageIndex = 1 + APPROVAL_CHAIN.indexOf(risk.approvalStage)

  function submitNote(handler) {
    if (!note.trim()) return
    handler(note.trim())
  }

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 660 }}>
        <div className="panel-head">
          <div>
            <h3>{canAct ? 'Review submission' : 'Submission in review'}</h3>
            <div className="meta">{submission.risk}</div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          <div className="stage-track">
            {STAGE_TRACK.map((label, i) => (
              <div key={label} className={'stage-pip' + (i === currentStageIndex ? ' current' : i < currentStageIndex ? ' done' : '')}>
                {label}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 0, fontSize: 12.5, color: 'var(--ink-muted)' }}>
            Submitted by <strong>{risk.pendingChange.submittedBy}</strong> on {formatDateTime(risk.pendingChange.submittedAt)}.
          </p>

          <div className="block-title">Full risk, as submitted</div>
          <div className="field-row">
            <div className="field"><label>Business unit</label><div className="val">{submission.businessUnit}</div></div>
            <div className="field"><label>Category</label><div className="val">{submission.category}</div></div>
          </div>
          <div className="block-title">Root causes</div>
          <ul className="plain tagged">{submission.rootCauses.map((x, i) => <li key={i}><span className="tag-pill">{x.category}</span>{x.text}</li>)}</ul>
          <div className="block-title">Current controls</div>
          <ul className="plain tagged">{submission.controls.map((x, i) => <li key={i}><span className="tag-pill">{x.category}</span>{x.text}</li>)}</ul>
          {submission.consequences?.length > 0 && (
            <>
              <div className="block-title">Consequences</div>
              <ul className="plain">{submission.consequences.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          )}
          <div className="block-title">Action plan &amp; progress</div>
          {submission.actionPlan.map((a, i) => (
            <div className="ap-item" key={i}>
              <div className="ap-plan">{a.plan}</div>
              <div className="ap-progress">{a.progress}</div>
              <div className="ap-meta"><span>Target: {a.target}</span><span>{actionPlanStatusLabel[a.status]}</span></div>
            </div>
          ))}

          <div className="block-title">What changed</div>
          {diffs.length === 0 ? (
            <p style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>No field changes were detected in this submission.</p>
          ) : (
            <DiffList diffs={diffs} />
          )}

          {canAct && action === null && (
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>Note for the next reviewer (optional)</label>
              <textarea
                rows={2} value={authoriseNote} onChange={e => setAuthoriseNote(e.target.value)}
                placeholder="Visible in this risk's history once you authorise"
              />
            </div>
          )}

          {canAct && action && (
            <div className="form-field" style={{ marginTop: 16 }}>
              <label>{action === 'reject' ? 'Reason for rejection (required)' : 'Comment for the business unit (required)'}</label>
              <textarea
                rows={2} value={note} onChange={e => setNote(e.target.value)}
                placeholder={action === 'reject' ? 'Explain why this is being rejected' : 'Explain what needs to change'}
                autoFocus
              />
            </div>
          )}
        </div>
        <div className="panel-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          {canAct && (
            action === null ? (
              <>
                <button className="btn danger" onClick={() => setAction('reject')}>Reject</button>
                <button className="btn ghost" onClick={() => setAction('changes')}>Request changes</button>
                <button className="btn" onClick={() => onAuthorise(authoriseNote.trim())}>Authorise</button>
              </>
            ) : (
              <>
                <button className="btn ghost" onClick={() => { setAction(null); setNote('') }}>Back</button>
                <button
                  className={action === 'reject' ? 'btn danger' : 'btn'}
                  disabled={!note.trim()}
                  onClick={() => submitNote(action === 'reject' ? onReject : onRequestChanges)}
                >
                  {action === 'reject' ? 'Confirm rejection' : 'Send back for changes'}
                </button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}
