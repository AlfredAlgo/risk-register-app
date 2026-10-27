import { useMemo, useState } from 'react'
import { ROLES } from '../data/orgStructure.js'
import { BOARD_STAGES } from '../data/risks.js'
import { formatDateShort, formatDateTime, computePortfolioTrend } from '../utils/helpers.jsx'
import { getReminders } from '../utils/reminders.js'
import { scopeRisksForRole, approverStageForRole, isReviewWindowOpen, isReviewWindowEscalating } from '../utils/permissions.js'
import { daysInStage, isStageOverdue } from '../utils/sla.js'
import { StatTile, AnimatedBar } from './StatWidgets.jsx'
import RiskHeatmap from './RiskHeatmap.jsx'
import TrendChart from './TrendChart.jsx'

function ReminderRow({ item, onOpenRisk }) {
  return (
    <div className={'reminder-row ' + item.severity} onClick={() => onOpenRisk(item.riskNr)}>
      <div className="reminder-main">
        <div className="reminder-label">{item.label}</div>
        <div className="sub">{item.businessUnit} · {item.kind}</div>
      </div>
      <div className="reminder-when">
        {item.severity === 'overdue' ? `${Math.abs(item.days)}d overdue` : item.days === 0 ? 'Due today' : `Due in ${item.days}d`}
      </div>
    </div>
  )
}

const HERO_COPY = {
  riskcapturer: () => ({ eyebrow: 'EGOV · Risk Capturer', body: 'Risks captured on behalf of business units across EGOV.' }),
  director: p => ({ eyebrow: `${p.businessUnit} · Director`, body: `Here's what needs your attention in ${p.businessUnit}.` }),
  chiefdirector: p => ({ eyebrow: `${p.chiefDirectorate} · Chief Director`, body: `Submissions awaiting your review across ${p.chiefDirectorate}.` }),
  ddg: () => ({ eyebrow: 'EGOV · DDG', body: 'Submissions awaiting your review across every chief directorate.' }),
  cro: () => ({ eyebrow: 'EGOV · CRO', body: 'Recommendations, acknowledgements, and review-window monitoring across EGOV.' }),
  hod: () => ({ eyebrow: 'EGOV · HOD', body: 'Final sign-off on strategic risks, and capture-period control across EGOV.' }),
  administrator: () => ({ eyebrow: 'EGOV · Administrator', body: 'Organisational structure and demo personas for the risk register.' })
}

export default function DashboardView({
  risks, boardCards, role, persona, orgStructure, period, onTogglePeriod, onExtendPeriod, onNavigate, onOpenRisk, onOpenProposalReview, onOpenCard, onQuickAdd,
  notifications, reviewWindow, onOpenReviewWindowModal, stageSla
}) {
  const isRiskCapturer = role === 'riskcapturer'
  const isHod = role === 'hod'
  const isDdg = role === 'ddg'
  const isCro = role === 'cro'
  const isAdmin = role === 'administrator'
  const myStage = approverStageForRole(role)
  const [showExtendForm, setShowExtendForm] = useState(false)
  const [extendReason, setExtendReason] = useState('')
  const [extendMemo, setExtendMemo] = useState(null)
  const [extendAttachError, setExtendAttachError] = useState('')

  function handleExtendAttach(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setExtendAttachError('Keep the memo under 2MB for this demo.')
      e.target.value = ''
      return
    }
    setExtendAttachError('')
    const reader = new FileReader()
    reader.onload = () => setExtendMemo({ name: file.name, type: file.type, dataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  function submitExtend() {
    if (!extendReason.trim() || !extendMemo) return
    onExtendPeriod(extendReason.trim(), extendMemo)
    setExtendReason('')
    setExtendMemo(null)
    setShowExtendForm(false)
  }

  const scope = useMemo(() => scopeRisksForRole(risks, role, persona, orgStructure), [risks, role, persona, orgStructure])
  const scopeBusinessUnits = new Set(scope.map(r => r.businessUnit))
  const scopeCards = role === 'director' || role === 'chiefdirector'
    ? boardCards.filter(c => scopeBusinessUnits.has(c.businessUnit))
    : boardCards

  const counts = useMemo(() => {
    const c = { green: 0, amber: 0, red: 0 }
    scope.forEach(r => c[r.status]++)
    return c
  }, [scope])
  const highRisk = scope.filter(r => r.ir >= 20).length

  const reminders = useMemo(() => getReminders(scope, { withinDays: 30 }), [scope])
  const overdue = reminders.filter(r => r.severity === 'overdue')
  const dueSoon = reminders.filter(r => r.severity === 'due-soon')

  const pendingAtMyStage = useMemo(
    () => (myStage ? scope.filter(r => r.approvalStage === myStage) : []),
    [scope, myStage]
  )
  const mySubmissions = useMemo(
    () => (isRiskCapturer ? scope.filter(r => r.approvalStatus !== 'Approved' && r.approvalStatus !== 'Removed') : []),
    [scope, isRiskCapturer]
  )

  const byBU = useMemo(() => {
    const o = {}
    scope.forEach(r => { o[r.businessUnit] = (o[r.businessUnit] || 0) + 1 })
    return o
  }, [scope])
  const maxBU = Math.max(1, ...Object.values(byBU))

  const stageCounts = useMemo(() => {
    const o = {}
    BOARD_STAGES.forEach(s => { o[s] = 0 })
    scopeCards.forEach(c => { o[c.stage] = (o[c.stage] || 0) + 1 })
    return o
  }, [scopeCards])

  const activeCards = scopeCards.filter(c => c.stage !== 'Report prepared').slice(0, 5)
  const trend = useMemo(() => computePortfolioTrend(scope), [scope])
  const hero = HERO_COPY[role](persona)

  const myNotifications = useMemo(
    () => notifications?.filter(n => n.toRole === role) || [],
    [notifications, role]
  )
  const reviewWindowActive = isReviewWindowOpen(reviewWindow)
  const touchedDuringWindow = useMemo(() => {
    if (!reviewWindowActive) return []
    const since = new Date(reviewWindow.openedAt).getTime()
    return risks.filter(r => (r.history || []).some(h => h.summary === 'Updated during review window (direct save, no re-approval).' && new Date(h.timestamp).getTime() >= since))
  }, [risks, reviewWindow, reviewWindowActive])

  const metricLabel = role === 'director' ? 'Risks in my business unit' : role === 'chiefdirector' ? 'Risks in my chief directorate' : 'Total risks (EGOV)'

  return (
    <div className="view-enter">
      <div className="dash-hero">
        <div>
          <div className="dash-hero-eyebrow">{hero.eyebrow}</div>
          <h2>Welcome back, {persona.name}</h2>
          <p>{hero.body}</p>
        </div>
        {isRiskCapturer && (
          <button className="btn hero-btn" onClick={onQuickAdd}>+ Add risk</button>
        )}
        {isHod && (
          <button className="btn hero-btn" onClick={onTogglePeriod}>
            {period.open ? `Close FY ${period.fy} capture period` : `Open FY ${period.fy} capture period`}
          </button>
        )}
        {isCro && (
          <button className="btn hero-btn" onClick={onOpenReviewWindowModal}>
            {reviewWindowActive ? 'Manage review window' : 'Open review window'}
          </button>
        )}
      </div>

      {isAdmin ? (
        <div className="metrics">
          <StatTile label="Branches" value={orgStructure.length} />
          <StatTile label="Chief directorates" value={orgStructure.reduce((n, b) => n + b.chiefDirectorates.length, 0)} />
          <StatTile label="Business units" value={orgStructure.reduce((n, b) => n + b.chiefDirectorates.reduce((m, cd) => m + cd.businessUnits.length, 0), 0)} />
          <StatTile label="Total risks (EGOV)" value={risks.length} />
        </div>
      ) : (
        <>
          <div className="metrics">
            <StatTile label={metricLabel} value={scope.length} />
            <StatTile label="High inherent risk (IR ≥ 20)" value={highRisk} />
            <StatTile label="On track" value={counts.green} />
            <StatTile label="Needs attention (at risk + overdue)" value={counts.amber + counts.red} />
          </div>

          {myNotifications.length > 0 && (
            <div className="report-card" style={{ marginBottom: 16 }}>
              <h4>Notifications</h4>
              <div className="approval-list">
                {myNotifications.slice().reverse().map(n => (
                  <div className="approval-row" key={n.id}>
                    <div>
                      <div className="approval-title">{n.message}</div>
                      <div className="sub">{formatDateTime(n.timestamp)}</div>
                    </div>
                    {n.riskNr != null && <button className="btn ghost sm" onClick={() => onOpenRisk(n.riskNr)}>View</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(isCro || isDdg || role === 'director' || role === 'chiefdirector') && reviewWindowActive && (
            <div className={'period-banner' + (isReviewWindowEscalating(reviewWindow) ? ' tone-warn' : '')}>
              <div>
                Review window open — closes {formatDateShort(reviewWindow.closesAt)}. {reviewWindow.reason}
                {touchedDuringWindow.length > 0 && ` · ${touchedDuringWindow.length} risk${touchedDuringWindow.length > 1 ? 's' : ''} updated so far.`}
                {isReviewWindowEscalating(reviewWindow) && ' · Closing soon — risks not yet updated will escalate up the chain.'}
              </div>
            </div>
          )}
          {(isCro || isDdg) && reviewWindowActive && touchedDuringWindow.length > 0 && (
            <div className="approval-list" style={{ marginBottom: 16 }}>
              {touchedDuringWindow.map(r => (
                <div className="approval-row" key={r.nr}>
                  <div><div className="approval-title">{r.risk}</div><div className="sub">{r.businessUnit}</div></div>
                  <button className="btn ghost sm" onClick={() => onOpenRisk(r.nr)}>View</button>
                </div>
              ))}
            </div>
          )}

          {(isHod || isDdg) && (
            <div className="period-banner">
              <div>
                Capture period for FY {period.fy}: <strong>{period.open ? 'Open' : 'Closed'}</strong>
                {!period.open && ' — the risk team cannot capture or edit risks until this reopens.'}
              </div>
              {isDdg && !period.open && !showExtendForm && (
                <button type="button" className="btn ghost sm" onClick={() => setShowExtendForm(true)}>Request period extension</button>
              )}
              {isDdg && !period.open && showExtendForm && (
                <div className="extend-form">
                  <textarea
                    rows={2} value={extendReason} onChange={e => setExtendReason(e.target.value)}
                    placeholder="Reason for extending the period (kept for audit purposes)"
                  />
                  <label className="field-caption">HOD-approved memo/letter (required before this can be sent)</label>
                  <input type="file" onChange={handleExtendAttach} />
                  {extendAttachError && <div className="form-error">{extendAttachError}</div>}
                  {extendMemo && (
                    <div className="attach-preview">
                      📎 {extendMemo.name}
                      <button type="button" className="link-btn" onClick={() => setExtendMemo(null)}>Remove</button>
                    </div>
                  )}
                  <div className="extend-form-actions">
                    <button type="button" className="btn ghost sm" onClick={() => { setShowExtendForm(false); setExtendReason(''); setExtendMemo(null) }}>Cancel</button>
                    <button type="button" className="btn sm" disabled={!extendReason.trim() || !extendMemo} onClick={submitExtend}>Extend period</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {period.history?.length > 0 && (isHod || isDdg) && (
            <div className="period-history">
              {period.history.slice().reverse().slice(0, 3).map(h => (
                <div key={h.id} className="period-history-row">
                  <strong>{h.actor}</strong> ({h.role}) extended the period — {h.reason}
                  {h.attachment && <> · <a className="link-btn" href={h.attachment.dataUrl} download={h.attachment.name}>📎 {h.attachment.name}</a></>}
                </div>
              ))}
            </div>
          )}

          <div className="report-grid">
            <div className="report-card">
              <h4>{isRiskCapturer ? 'Open submissions (EGOV-wide)' : `Pending approvals${myStage ? ' — ' + ROLES[role].label : ''}`}</h4>
              {isRiskCapturer ? (
                mySubmissions.length === 0 ? (
                  <div className="sub">Nothing awaiting your attention.</div>
                ) : (
                  <div className="approval-list">
                    {mySubmissions.map(r => (
                      <div className="approval-row" key={r.nr}>
                        <div>
                          <div className="approval-title">{r.risk}</div>
                          <div className="sub">{r.businessUnit} · {r.approvalStatus}{r.approvalStage ? ` · with ${ROLES[r.approvalStage].label}` : ''}</div>
                        </div>
                        <button className="btn ghost sm" onClick={() => onOpenRisk(r.nr)}>View</button>
                      </div>
                    ))}
                  </div>
                )
              ) : pendingAtMyStage.length === 0 ? (
                <div className="sub">Nothing awaiting your review.</div>
              ) : (
                <div className="approval-list">
                  {pendingAtMyStage.map(r => {
                    const days = daysInStage(r)
                    const overdue = isStageOverdue(r, stageSla)
                    return (
                      <div className="approval-row" key={r.nr}>
                        <div>
                          <div className="approval-title">{r.risk}</div>
                          <div className="sub">
                            {r.businessUnit} · submitted by {r.pendingChange?.submittedBy} · {formatDateShort(r.pendingChange?.submittedAt)}
                            {days !== null && <span className={overdue ? 'tone-bad' : ''}> · {days}d in stage{overdue ? ' (overdue)' : ''}</span>}
                          </div>
                        </div>
                        <button className="btn sm" onClick={() => onOpenProposalReview(r.nr)}>Review</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="report-card">
              <h4>Attention needed</h4>
              {reminders.length === 0 ? (
                <div className="sub">No overdue or upcoming deadlines in the next 30 days.</div>
              ) : (
                <div className="reminder-list">
                  {overdue.slice(0, 4).map(item => <ReminderRow key={item.id} item={item} onOpenRisk={onOpenRisk} />)}
                  {dueSoon.slice(0, 4).map(item => <ReminderRow key={item.id} item={item} onOpenRisk={onOpenRisk} />)}
                </div>
              )}
            </div>

            <div className="report-card">
              <h4>Risk heat map (inherent)</h4>
              <RiskHeatmap risks={scope} likelihoodKey="irLikelihood" impactKey="irImpact" size="sm" />
            </div>

            <div className="report-card">
              <h4>Risk score trend</h4>
              {trend.length >= 2 ? (
                <TrendChart data={trend} height={170} />
              ) : (
                <div className="sub">Not enough reassessment history yet.</div>
              )}
            </div>

            <div className="report-card">
              <h4>Assessment requests</h4>
              <div className="stage-summary">
                {BOARD_STAGES.map(s => (
                  <div key={s} className="stage-summary-item">
                    <div className="stage-summary-count">{stageCounts[s]}</div>
                    <div className="sub">{s}</div>
                  </div>
                ))}
              </div>
              {activeCards.length > 0 && (
                <div className="board-mini-list">
                  {activeCards.map(c => (
                    <div className="board-mini-row" key={c.id} onClick={() => onOpenCard(c)}>
                      <span>{c.risk}</span>
                      <span className="sub">{c.stage}</span>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="link-btn" onClick={() => onNavigate('board')}>Open assessment board →</button>
            </div>

            {role !== 'director' && role !== 'chiefdirector' && (
              <div className="report-card">
                <h4>Risks by business unit</h4>
                {Object.entries(byBU).map(([bu, n]) => (
                  <div className="bar-row" key={bu}>
                    <div className="lbl2">{bu}</div>
                    <AnimatedBar pct={(n / maxBU) * 100} />
                    <div className="val2">{n}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="dash-quicklinks">
        {!isAdmin && (
          <button type="button" className="btn ghost" onClick={() => onNavigate('register')}>
            {role === 'director' || role === 'chiefdirector' ? 'View my risks' : 'Open full risk register'}
          </button>
        )}
        {!isAdmin && (
          <button type="button" className="btn ghost" onClick={() => onNavigate('reports')}>Open reports</button>
        )}
        {isAdmin && (
          <button type="button" className="btn ghost" onClick={() => onNavigate('admin')}>Manage organisation →</button>
        )}
      </div>
    </div>
  )
}
