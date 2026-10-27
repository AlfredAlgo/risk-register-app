import { useState } from 'react'
import { scoreClass, formatDateShort, formatDateTime, actionPlanStatusLabel, actionPlanStatusTone } from '../utils/helpers.jsx'
import { ROLES } from '../data/orgStructure.js'
import { complianceActByName } from '../data/complianceUniverse.js'
import { approverStageForRole, canEditRisk, canRequestRemoval, canValidateRemoval, isReviewWindowOpen } from '../utils/permissions.js'
import { daysInStage, isStageOverdue } from '../utils/sla.js'
import { stageLabelForRisk } from '../utils/approvalChain.js'
import TrendChart from './TrendChart.jsx'
import DiffList from './DiffList.jsx'

const ACTION_ICON = {
  created: '＋', edited: '✎', proposed: '⇢', 'changes-requested': '↩', approved: '✓', rejected: '✕',
  'removal-requested': '🗑', removed: '🗑', 'removal-denied': '↩'
}

const STATUS_TONE = {
  Draft: 'neutral', Submitted: 'info', 'Changes Required': 'warn', Rejected: 'bad', Approved: 'good', Removed: 'bad'
}

const EDIT_LABEL = {
  Draft: 'Continue draft',
  'Changes Required': 'Rework & resubmit',
  Rejected: 'Rework & resubmit',
  Approved: 'Propose reassessment'
}

function HistoryItem({ entry }) {
  const [open, setOpen] = useState(false)
  const hasDiff = entry.diff && entry.diff.length > 0
  return (
    <div className="history-item">
      <div className="history-icon">{ACTION_ICON[entry.action] || '•'}</div>
      <div className="history-body">
        <div className="history-line">
          <strong>{entry.actor}</strong> · {entry.summary}
        </div>
        <div className="history-meta">
          {formatDateTime(entry.timestamp)}
          {hasDiff && (
            <button type="button" className="link-btn" onClick={() => setOpen(o => !o)}>
              {open ? 'Hide changes' : 'Show changes'}
            </button>
          )}
          {entry.attachment && (
            <a className="link-btn" href={entry.attachment.dataUrl} download={entry.attachment.name}>📎 {entry.attachment.name}</a>
          )}
        </div>
        {hasDiff && open && <DiffList diffs={entry.diff} />}
      </div>
    </div>
  )
}

export default function RiskPanel({
  risk, role, periodOpen, stageSla, reviewWindow, orgStructure, chiefDirectorateOverrides,
  onClose, onOpenForm, onRequestUpdate, onReviewProposal, onAddComment,
  onOpenKri, onOpenAdHocRequest, onOpenRemovalRequest, onOpenRemovalValidation, onOpenReviewWindowEdit
}) {
  const [commentText, setCommentText] = useState('')
  const [showAllHistory, setShowAllHistory] = useState(false)

  if (!risk) return null
  const myStage = approverStageForRole(role)
  const isMyStage = myStage && risk.approvalStage === myStage
  const iCanEdit = canEditRisk(risk, role, periodOpen)
  const history = [...(risk.history || [])].reverse()
  const visibleHistory = showAllHistory ? history : history.slice(0, 3)
  const scoreHistory = risk.scoreHistory || []
  const everApproved = risk.approvalStatus === 'Approved' || (risk.history || []).some(h => h.action === 'approved')
  const openUpdateRequest = (risk.updateRequests || []).find(r => !r.fulfilled)
  const isApprover = ['director', 'chiefdirector', 'ddg', 'cro', 'hod'].includes(role)
  const pendingRemoval = risk.removalRequest?.status === 'Pending'
  const daysHere = daysInStage(risk)
  const overdue = isStageOverdue(risk, stageSla)
  // The director (owns the business unit's action plans) makes review-window
  // updates, not the risk capturer - the capturer's edit rights are for the
  // normal capture/approval cycle only.
  const canEditDuringReviewWindow = role === 'director' && risk.approvalStatus === 'Approved' && isReviewWindowOpen(reviewWindow)

  function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    onAddComment(risk.nr, commentText)
    setCommentText('')
  }

  return (
    <div className="overlay open">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>{risk.risk}{risk.riskType === 'Compliance' && <span className="type-badge on-dark">Compliance</span>}</h3>
            <div className="meta">{risk.businessUnit} · {risk.category} · Target date {risk.revisedTargetDate || risk.targetDate}</div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          <div className={'approval-banner tone-' + STATUS_TONE[risk.approvalStatus]}>
            <div>
              <strong>{risk.approvalStatus}</strong>
              {risk.approvalStatus === 'Submitted' && ` — awaiting ${stageLabelForRisk(risk.approvalStage, risk, orgStructure, chiefDirectorateOverrides)} review`}
              {risk.pendingChange?.submittedAt && risk.approvalStatus === 'Submitted' && ` · submitted by ${risk.pendingChange.submittedBy} on ${formatDateShort(risk.pendingChange.submittedAt)}`}
              {risk.approvalStatus === 'Submitted' && daysHere !== null && (
                <span className={overdue ? ' sub tone-bad' : ' sub'}> · in this stage for {daysHere}d{overdue ? ` (SLA ${stageSla?.[risk.approvalStage]}d exceeded)` : ''}</span>
              )}
            </div>
            {isMyStage && (
              <button type="button" className="btn sm" onClick={onReviewProposal}>Review submission</button>
            )}
          </div>

          {openUpdateRequest && (
            <div className="approval-banner tone-warn">
              <div>
                <strong>Ad-hoc update requested</strong> by {openUpdateRequest.requestedBy} ({ROLES[openUpdateRequest.requestedByRole]?.label}) — {openUpdateRequest.reason}
                {role === 'riskcapturer' && periodOpen === false && ' · this risk is editable until you act on it, even though the capture period is closed.'}
              </div>
            </div>
          )}

          {risk.removalRequest && (
            <div className={'approval-banner tone-' + (risk.removalRequest.status === 'Pending' ? 'warn' : risk.removalRequest.status === 'Approved' ? 'bad' : 'neutral')}>
              <div>
                <strong>Removal {risk.removalRequest.status.toLowerCase()}</strong> — requested by {risk.removalRequest.requestedBy} ({ROLES[risk.removalRequest.requestedByRole]?.label}): {risk.removalRequest.reason}
                {' '}<a className="link-btn" href={risk.removalRequest.memo.dataUrl} download={risk.removalRequest.memo.name}>📎 {risk.removalRequest.memo.name}</a>
              </div>
              {pendingRemoval && canValidateRemoval(role) && (
                <button type="button" className="btn sm" onClick={onOpenRemovalValidation}>Validate</button>
              )}
            </div>
          )}

          <div className="field-row">
            <div className="field">
              <label>Inherent risk (IR)</label>
              <div className="val">
                <span className={'score ' + scoreClass(risk.ir)}>{risk.ir}</span>
                <span className="sub" style={{ marginLeft: 8 }}>L{risk.irLikelihood} × I{risk.irImpact}</span>
              </div>
            </div>
            <div className="field">
              <label>Residual risk (RR)</label>
              <div className="val">
                <span className={'score ' + scoreClass(risk.rr)}>{risk.rr}</span>
                <span className="sub" style={{ marginLeft: 8 }}>L{risk.rrLikelihood} × I{risk.rrImpact}</span>
              </div>
            </div>
          </div>

          <div className="block-title">Root causes</div>
          <ul className="plain tagged">{risk.rootCauses.map((x, i) => (
            <li key={i}><span className="tag-pill">{x.category}</span>{x.text}</li>
          ))}</ul>

          <div className="block-title">Current controls</div>
          <ul className="plain tagged">{risk.controls.map((x, i) => (
            <li key={i}><span className="tag-pill">{x.category}</span>{x.text}</li>
          ))}</ul>

          {risk.consequences?.length > 0 && (
            <>
              <div className="block-title">Consequences</div>
              <ul className="plain">{risk.consequences.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          )}

          {risk.riskType === 'Compliance' && (
            <>
              <div className="block-title">Legislative reference</div>
              <div className="field-row">
                <div className="field"><label>Act / Regulation</label><div className="val">{risk.act}</div></div>
                <div className="field"><label>Category</label><div className="val">{complianceActByName(risk.act)?.category}</div></div>
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Provision reference &amp; regulatory requirement</label>
                <div className="val sub">{risk.provisionReference}</div>
              </div>
            </>
          )}

          <div className="block-title">Action plan &amp; progress</div>
          {risk.actionPlan.map((a, i) => (
            <div className="ap-item" key={i}>
              <div className="ap-plan">{a.plan}</div>
              <div className="ap-progress">{a.progress}</div>
              <div className="ap-meta"><span>Target: {a.target}</span><span className={'approval-pill tone-' + actionPlanStatusTone[a.status]}>{actionPlanStatusLabel[a.status]}</span></div>
            </div>
          ))}

          <div className="field-row" style={{ marginTop: 6 }}>
            <div className="field"><label>Accountable unit</label><div className="val">{risk.ownership?.accountableUnit}</div></div>
            <div className="field"><label>Risk response</label><div className="val">{risk.response}</div></div>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Responsible person(s)</label>
            <ul className="plain">{(risk.ownership?.responsiblePersons || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>

          {scoreHistory.length >= 2 && (
            <>
              <div className="block-title">Score history</div>
              <TrendChart data={scoreHistory} height={140} />
            </>
          )}

          {everApproved && (
            <>
              <div className="block-title">Key risk indicators</div>
              <div className="approval-row" style={{ marginBottom: 14 }}>
                <div className="sub">
                  {risk.kris?.length > 0 ? `${risk.kris.length} indicator${risk.kris.length > 1 ? 's' : ''} tracked` : 'No indicators recorded yet.'}
                </div>
                <button type="button" className="btn ghost sm" onClick={onOpenKri}>
                  {role === 'riskcapturer' ? 'Update indicators' : 'View indicators'}
                </button>
              </div>
            </>
          )}

          <div className="block-title">History</div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="sub">No history recorded.</div>
            ) : (
              visibleHistory.map(h => <HistoryItem key={h.id} entry={h} />)
            )}
          </div>
          {history.length > 3 && (
            <button type="button" className="link-btn" onClick={() => setShowAllHistory(s => !s)}>
              {showAllHistory ? 'Show fewer' : `Show all ${history.length} entries`}
            </button>
          )}

          <div className="block-title">Discussion</div>
          <div className="comment-list">
            {(risk.comments || []).length === 0 ? (
              <div className="sub">No comments yet.</div>
            ) : (
              risk.comments.map(c => (
                <div className="comment-item" key={c.id}>
                  <div className="comment-head">
                    <strong>{c.author}</strong>
                    <span className="sub">{ROLES[c.role]?.label || c.role} · {formatDateTime(c.timestamp)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              ))
            )}
          </div>
          <form className="comment-form" onSubmit={submitComment}>
            <textarea
              rows={2} value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment for the other party to see…"
            />
            <button type="submit" className="btn ghost sm" disabled={!commentText.trim()}>Post comment</button>
          </form>
        </div>
        <div className="panel-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          {canEditDuringReviewWindow && (
            <button className="btn ghost" onClick={onOpenReviewWindowEdit}>Update during review window</button>
          )}
          {canRequestRemoval(role) && !risk.removalRequest && risk.approvalStatus !== 'Removed' && (
            <button className="btn ghost" onClick={onOpenRemovalRequest}>Request to remove risk</button>
          )}
          {isApprover && (
            <button className="btn ghost" onClick={onOpenAdHocRequest} title="Ask the risk capturer to update this risk now, even if the capture period is closed">
              Request ad-hoc update
            </button>
          )}
          {role === 'riskcapturer' && (
            <>
              <button className="btn ghost" onClick={onRequestUpdate}>Request assessment update</button>
              <button
                className="btn" onClick={onOpenForm} disabled={!iCanEdit}
                title={iCanEdit ? undefined : (!periodOpen ? 'The capture period is closed' : 'Not editable while under review')}
              >
                {EDIT_LABEL[risk.approvalStatus] || 'Edit'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
