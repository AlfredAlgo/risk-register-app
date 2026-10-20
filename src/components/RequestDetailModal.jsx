import { useState } from 'react'
import { BOARD_STAGES } from '../data/risks.js'
import { formatOwnership } from '../utils/helpers.jsx'

export default function RequestDetailModal({ card, role, linkedRisk, onClose, onAdvanceStage, onSaveNotes, onViewRisk }) {
  const [mgmtNotes, setMgmtNotes] = useState(card.mgmtNotes || '')
  const isRiskMgmt = role !== 'riskcapturer'
  const stageIndex = BOARD_STAGES.indexOf(card.stage)
  const notesDirty = mgmtNotes !== (card.mgmtNotes || '')

  return (
    <div className="overlay open">
      <div className="panel" style={{ width: 560 }}>
        <div className="panel-head">
          <div>
            <h3>{card.risk}</h3>
            <div className="meta">{card.businessUnit} · {card.date}</div>
          </div>
          <button className="x" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="panel-body">
          <div className="block-title">Stage</div>
          <div className="stage-track">
            {BOARD_STAGES.map((s, i) => (
              <div key={s} className={'stage-pip' + (i === stageIndex ? ' current' : i < stageIndex ? ' done' : '')}>
                {s}
              </div>
            ))}
          </div>

          {card.note && (
            <>
              <div className="block-title">Note from business unit</div>
              <p style={{ margin: 0, fontSize: 12.5 }}>{card.note}</p>
            </>
          )}

          {isRiskMgmt ? (
            <>
              <div className="block-title">Risk management office notes</div>
              <div className="form-field">
                <textarea
                  rows={3} value={mgmtNotes}
                  onChange={e => setMgmtNotes(e.target.value)}
                  placeholder="Assessment scheduling detail, findings, next steps…"
                />
              </div>
              {notesDirty && (
                <button className="btn ghost sm" type="button" onClick={() => onSaveNotes(mgmtNotes)}>
                  Save notes
                </button>
              )}
            </>
          ) : card.mgmtNotes ? (
            <>
              <div className="block-title">Risk management office notes</div>
              <p style={{ margin: 0, fontSize: 12.5 }}>{card.mgmtNotes}</p>
            </>
          ) : null}

          {linkedRisk && (
            <>
              <div className="block-title">Linked risk register entry</div>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: 'var(--ink-muted)' }}>
                Nr {linkedRisk.nr} · IR {linkedRisk.ir} · RR {linkedRisk.rr} · {formatOwnership(linkedRisk.ownership)}
              </p>
              <button type="button" className="btn ghost sm" onClick={() => onViewRisk(linkedRisk.nr)}>
                Open in risk register
              </button>
            </>
          )}
        </div>

        <div className="panel-foot">
          <button className="btn ghost" onClick={onClose}>Close</button>
          {isRiskMgmt && stageIndex < BOARD_STAGES.length - 1 && (
            <button className="btn" onClick={() => onAdvanceStage(BOARD_STAGES[stageIndex + 1])}>
              Move to "{BOARD_STAGES[stageIndex + 1]}"
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
