import { useState } from 'react'
import ActionPlanField from './ActionPlanField.jsx'
import CategoryListField from './CategoryListField.jsx'
import { CONTROL_CATEGORIES, emptyControl } from '../utils/helpers.jsx'

// Direct-save edit for the fields a review window has unlocked on an
// Approved risk - no approval re-entry, the CRO monitors the results from
// the dashboard instead.
export default function ReviewWindowEditModal({ risk, fieldWhitelist, onCancel, onSave }) {
  const [targetDate, setTargetDate] = useState(risk.revisedTargetDate || risk.targetDate)
  const [progressPct, setProgressPct] = useState(risk.progressPct)
  const [actionPlan, setActionPlan] = useState(risk.actionPlan)
  const [controls, setControls] = useState(risk.controls)

  function handleSave() {
    const patch = {}
    if (fieldWhitelist.includes('targetDate')) patch.revisedTargetDate = targetDate
    if (fieldWhitelist.includes('progressPct')) patch.progressPct = Number(progressPct)
    if (fieldWhitelist.includes('actionPlan')) patch.actionPlan = actionPlan.filter(a => a.plan.trim())
    if (fieldWhitelist.includes('controls')) patch.controls = controls.filter(c => c.text.trim())
    onSave(patch)
  }

  return (
    <div className="overlay open">
      <div className="panel form-panel">
        <div className="panel-head">
          <div>
            <h3>Update during review window</h3>
            <div className="meta">{risk.risk}</div>
          </div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <div className="panel-body">
          <p style={{ marginTop: 0, color: 'var(--ink-muted)', fontSize: 12.5 }}>
            Only the fields unlocked for this review window are shown — this saves immediately and does not re-enter the approval chain.
          </p>
          {fieldWhitelist.includes('targetDate') && (
            <div className="form-field">
              <label>Due date</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            </div>
          )}
          {fieldWhitelist.includes('progressPct') && (
            <div className="form-field">
              <label>Overall progress (%)</label>
              <input type="number" min={0} max={100} value={progressPct} onChange={e => setProgressPct(e.target.value)} />
            </div>
          )}
          {fieldWhitelist.includes('actionPlan') && (
            <ActionPlanField items={actionPlan} onChange={setActionPlan} />
          )}
          {fieldWhitelist.includes('controls') && (
            <CategoryListField
              label="Current controls" items={controls} categories={CONTROL_CATEGORIES}
              onChange={setControls} placeholder="Control" emptyItem={emptyControl}
            />
          )}
        </div>
        <div className="panel-foot">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}
