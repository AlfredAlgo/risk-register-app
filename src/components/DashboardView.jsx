import { useMemo, useState } from 'react'
import { ROLES } from '../data/orgStructure.js'
import { BOARD_STAGES } from '../data/risks.js'
import { formatDateShort, computePortfolioTrend } from '../utils/helpers.jsx'
import { getReminders } from '../utils/reminders.js'
import { scopeRisksForRole, approverStageForRole } from '../utils/permissions.js'
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
  businessunit: p => ({ eyebrow: `${p.businessUnit} · Business Unit`, body: `Here's what needs your attention in ${p.businessUnit}.` }),
  chiefdirector: p => ({ eyebrow: `${p.chiefDirectorate} · Chief Director`, body: `Submissions awaiting your review across ${p.chiefDirectorate}.` }),
  ddg: () => ({ eyebrow: 'EGOV · DDG', body: 'Submissions awaiting your review across every chief directorate.' }),
  hod: () => ({ eyebrow: 'EGOV · HOD', body: 'Final sign-off and capture-period control across EGOV.' }),
  administrator: () => ({ eyebrow: 'EGOV · Administrator', body: 'Organisational structure and demo personas for the risk register.' })
}

export default function DashboardView({ risks, boardCards, role, persona, orgStructure, period, onTogglePeriod, onExtendPeriod, onNavigate, onOpenRisk, onOpenProposalReview, onOpenCard, onQuickAdd }) {
  const isBusinessUnit = role === 'businessunit'
  const isHod = role === 'hod'
  const isDdg = role === 'ddg'
  const isAdmin = role === 'administrator'
  const myStage = approverStageForRole(role)
  const [showExtendForm, setShowExtendForm] = useState(false)
  const [extendReason, setExtendReason] = useState('')

  function submitExtend() {
    if (!extendReason.trim()) return
    onExtendPeriod(extendReason.trim())
    setExtendReason('')
    setShowExtendForm(false)
  }

  const scope = useMemo(() => scopeRisksForRole(risks, role, persona, orgStructure), [risks, role, persona, orgStructure])
  const scopeBusinessUnits = new Set(scope.map(r => r.businessUnit))
  const scopeCards = isBusinessUnit || role === 'chiefdirector'
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
    () => (isBusinessUnit ? scope.filter(r => r.approvalStatus !== 'Approved') : []),
    [scope, isBusinessUnit]
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

  return (
    <div className="view-enter">
      <div className="dash-hero">
        <div>
          <div className="dash-hero-eyebrow">{hero.eyebrow}</div>
          <h2>Welcome back, {persona.name}</h2>
          <p>{hero.body}</p>
        </div>
        {isBusinessUnit && (
          <button className="btn hero-btn" onClick={onQuickAdd}>+ Add risk</button>
        )}
        {isHod && (
          <button className="btn hero-btn" onClick={onTogglePeriod}>
            {period.open ? `Close FY ${period.fy} capture period` : `Open FY ${period.fy} capture period`}
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
            <StatTile label={isBusinessUnit ? 'Risks in my business unit' : role === 'chiefdirector' ? 'Risks in my chief directorate' : 'Total risks (EGOV)'} value={scope.length} />
            <StatTile label="High inherent risk (IR ≥ 20)" value={highRisk} />
            <StatTile label="On track" value={counts.green} />
            <StatTile label="Needs attention (at risk + overdue)" value={counts.amber + counts.red} />
          </div>

          {(isHod || isDdg) && (
            <div className="period-banner">
              <div>
                Capture period for FY {period.fy}: <strong>{period.open ? 'Open' : 'Closed'}</strong>
                {!period.open && ' — business units cannot capture or edit risks until this reopens.'}
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
                  <div className="extend-form-actions">
                    <button type="button" className="btn ghost sm" onClick={() => { setShowExtendForm(false); setExtendReason('') }}>Cancel</button>
                    <button type="button" className="btn sm" disabled={!extendReason.trim()} onClick={submitExtend}>Extend period</button>
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
                </div>
              ))}
            </div>
          )}

          <div className="report-grid">
            <div className="report-card">
              <h4>{isBusinessUnit ? 'My submissions' : `Pending approvals${myStage ? ' — ' + ROLES[role].label : ''}`}</h4>
              {isBusinessUnit ? (
                mySubmissions.length === 0 ? (
                  <div className="sub">Nothing awaiting your attention.</div>
                ) : (
                  <div className="approval-list">
                    {mySubmissions.map(r => (
                      <div className="approval-row" key={r.nr}>
                        <div>
                          <div className="approval-title">{r.risk}</div>
                          <div className="sub">{r.approvalStatus}{r.approvalStage ? ` · with ${ROLES[r.approvalStage].label}` : ''}</div>
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
                  {pendingAtMyStage.map(r => (
                    <div className="approval-row" key={r.nr}>
                      <div>
                        <div className="approval-title">{r.risk}</div>
                        <div className="sub">{r.businessUnit} · submitted by {r.pendingChange?.submittedBy} · {formatDateShort(r.pendingChange?.submittedAt)}</div>
                      </div>
                      <button className="btn sm" onClick={() => onOpenProposalReview(r.nr)}>Review</button>
                    </div>
                  ))}
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

            {!isBusinessUnit && role !== 'chiefdirector' && (
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
            {isBusinessUnit || role === 'chiefdirector' ? 'View my risks' : 'Open full risk register'}
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
