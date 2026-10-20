import { useState } from 'react'
import { CATEGORIES, RESPONSES, OUTCOMES } from '../data/risks.js'
import { allBusinessUnits, allChiefDirectorates } from '../data/orgStructure.js'
import { COMPLIANCE_UNIVERSE, COMPLIANCE_CATEGORIES, complianceActByName } from '../data/complianceUniverse.js'
import {
  emptyRisk, computeScore, scoreClass, LIKELIHOOD_LABELS, IMPACT_LABELS, RISK_TYPES,
  ROOT_CAUSE_CATEGORIES, CONTROL_CATEGORIES
} from '../utils/helpers.jsx'
import ActionPlanField from './ActionPlanField.jsx'

function ListField({ label, items, onChange, placeholder }) {
  function setItem(i, value) {
    const next = [...items]
    next[i] = value
    onChange(next)
  }
  function addItem() {
    onChange([...items, ''])
  }
  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div className="form-field">
      <label>{label}</label>
      {items.map((v, i) => (
        <div className="list-row" key={i}>
          <input
            type="text"
            value={v}
            placeholder={placeholder}
            onChange={e => setItem(i, e.target.value)}
          />
          <button type="button" className="btn ghost sm" onClick={() => removeItem(i)} disabled={items.length <= 1}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn ghost sm" onClick={addItem}>+ Add</button>
    </div>
  )
}

// Root causes and controls both carry a classification alongside the text -
// source (people/process/systems/external) for causes, control type
// (preventive/detective/corrective/directive) for controls.
function CategoryListField({ label, items, categories, onChange, placeholder, emptyItem }) {
  function setItem(i, patch) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }
  function addItem() {
    onChange([...items, emptyItem()])
  }
  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div className="form-field">
      <label>{label}</label>
      {items.map((it, i) => (
        <div className="list-row cat-row" key={i}>
          <select value={it.category} onChange={e => setItem(i, { category: e.target.value })}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={it.text}
            placeholder={placeholder}
            onChange={e => setItem(i, { text: e.target.value })}
          />
          <button type="button" className="btn ghost sm" onClick={() => removeItem(i)} disabled={items.length <= 1}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn ghost sm" onClick={addItem}>+ Add</button>
    </div>
  )
}

const TITLES = { new: 'Add risk', edit: 'Edit risk' }

function ScorePicker({ title, likelihood, impact, onLikelihood, onImpact }) {
  const score = computeScore(likelihood, impact)
  return (
    <div className="score-picker">
      <div className="score-picker-head">
        <span>{title}</span>
        <span className={'score ' + scoreClass(score)}>{score}</span>
      </div>
      <div className="field-row">
        <div className="form-field">
          <label>Likelihood</label>
          <select value={likelihood} onChange={e => onLikelihood(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{LIKELIHOOD_LABELS[v]}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label>Impact</label>
          <select value={impact} onChange={e => onImpact(Number(e.target.value))}>
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{IMPACT_LABELS[v]}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function RiskFormModal({ mode, risk, defaultBusinessUnit, orgStructure, onCancel, onSaveDraft, onSubmit }) {
  // Merge over emptyRisk() rather than trusting `risk` outright - older seed/
  // persisted risks captured before a field existed (e.g. revisedTargetDate)
  // would otherwise leave that input uncontrolled until first keystroke.
  const [form, setForm] = useState(() => risk ? { ...emptyRisk(), ...risk } : emptyRisk({ businessUnit: defaultBusinessUnit }))
  const [dateChangeReason, setDateChangeReason] = useState('')
  const [dateChangeAttachment, setDateChangeAttachment] = useState(null)
  const [attachError, setAttachError] = useState('')
  const [error, setError] = useState('')
  const businessUnits = allBusinessUnits(orgStructure)
  const accountableUnitOptions = [...businessUnits, ...allChiefDirectorates(orgStructure)]
  const isCompliance = form.riskType === 'Compliance'
  const selectedAct = complianceActByName(form.act)

  // Progress tracking only makes sense once a risk has been through approval
  // at least once - before that there's nothing to have progressed against.
  // Once it's been approved a first time, it stays a live, editable figure
  // even while a later reassessment is in Draft/Submitted.
  const everApproved = mode === 'edit' && (risk?.approvalStatus === 'Approved' || (risk?.history || []).some(h => h.action === 'approved'))

  // A target-date change (the risk's own, or any action-plan item's) needs a
  // written reason on record - compare against the values the form opened
  // with, not against every keystroke. Once a risk has been approved once,
  // its original target date is locked (see the Target date field below) -
  // the revised date is the one that can actually change from here on.
  const originalTargetDate = mode === 'edit' ? (risk?.targetDate ?? '') : null
  const originalRevisedTargetDate = mode === 'edit' ? (risk?.revisedTargetDate ?? '') : null
  const originalActionTargets = mode === 'edit' ? (risk?.actionPlan || []).map(a => a.target) : null
  const datesChanged = mode === 'edit' && (
    (everApproved ? form.revisedTargetDate !== originalRevisedTargetDate : form.targetDate !== originalTargetDate) ||
    JSON.stringify(form.actionPlan.map(a => a.target)) !== JSON.stringify(originalActionTargets)
  )

  function set(patch) {
    setForm(f => ({ ...f, ...patch }))
  }

  function setOwnership(patch) {
    setForm(f => ({ ...f, ownership: { ...f.ownership, ...patch } }))
  }

  // Demo-only: reads the file straight into a base64 data URL so it can live
  // in localStorage alongside the risk's history entry. There's no backend
  // in this prototype to store files properly - capped small on purpose.
  function handleAttachFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setAttachError('Keep supporting documents under 2MB for this demo.')
      e.target.value = ''
      return
    }
    setAttachError('')
    const reader = new FileReader()
    reader.onload = () => setDateChangeAttachment({ name: file.name, type: file.type, dataUrl: reader.result })
    reader.readAsDataURL(file)
  }

  function clean() {
    // nr / history / scoreHistory / comments / approvalStatus / approvalStage /
    // pendingChange are managed by the caller (App.jsx), not by this form -
    // drop whatever snapshot of them we picked up from `risk`.
    const {
      nr: _nr, history: _h, scoreHistory: _sh, comments: _c, approvalStatus: _as, approvalStage: _ag, pendingChange: _pc,
      kriToleranceStatement: _kt, kriSummary: _ks, kris: _kr, updateRequests: _ur,
      ...formFields
    } = form
    return {
      ...formFields,
      ir: computeScore(form.irLikelihood, form.irImpact),
      rr: computeScore(form.rrLikelihood, form.rrImpact),
      progressPct: everApproved ? Number(form.progressPct) : 0,
      rootCauses: form.rootCauses.filter(x => x.text.trim()),
      controls: form.controls.filter(x => x.text.trim()),
      consequences: form.consequences.filter(x => x.trim()),
      actionPlan: form.actionPlan.filter(a => a.plan.trim()),
      act: isCompliance ? form.act : '',
      provisionReference: isCompliance ? form.provisionReference : '',
      ownership: {
        accountableUnit: form.ownership.accountableUnit,
        responsiblePersons: form.ownership.responsiblePersons.filter(x => x.trim())
      },
      // Transient - App.jsx logs these to history and never stores them as
      // permanent fields on the risk.
      dateChangeReason: datesChanged ? dateChangeReason.trim() : undefined,
      dateChangeAttachment: datesChanged ? (dateChangeAttachment || undefined) : undefined
    }
  }

  function validate() {
    if (!form.risk.trim() || !form.businessUnit || !form.category || !form.outcome.trim()) {
      setError('Please complete risk description, outcome, business unit and category.')
      return false
    }
    if (!form.ownership.accountableUnit || !form.ownership.responsiblePersons.some(x => x.trim())) {
      setError('Please set an accountable unit and at least one responsible person.')
      return false
    }
    if (isCompliance && !form.act) {
      setError('Please select the Act/Regulation this compliance risk relates to.')
      return false
    }
    if (datesChanged && !dateChangeReason.trim()) {
      setError('A target date has changed - please give a reason, for the audit trail.')
      return false
    }
    return true
  }

  function handleSaveDraft() {
    if (!validate()) return
    onSaveDraft(clean())
  }

  function handleSubmit() {
    if (!validate()) return
    onSubmit(clean())
  }

  return (
    <div className="overlay open">
      <div className="panel form-panel">
        <div className="panel-head">
          <div>
            <h3>{TITLES[mode]}</h3>
            <div className="meta">{mode === 'new' ? 'New entry in the risk register' : `Nr ${risk.nr} · ${risk.businessUnit}`}</div>
          </div>
          <button className="x" onClick={onCancel} aria-label="Close">&times;</button>
        </div>

        <div className="panel-body">
          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label>Risk type</label>
            <select value={form.riskType} onChange={e => set({ riskType: e.target.value })}>
              {RISK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-field">
            <label>Outcome</label>
            <input
              type="text" list="outcome-options" value={form.outcome}
              onChange={e => set({ outcome: e.target.value })}
              placeholder="Strategic outcome this risk relates to"
            />
            <datalist id="outcome-options">
              {OUTCOMES.map(o => <option key={o} value={o} />)}
            </datalist>
          </div>

          <div className="field-row">
            <div className="form-field">
              <label>Business unit</label>
              <select
                value={form.businessUnit}
                onChange={e => set({ businessUnit: e.target.value })}
              >
                <option value="">Select…</option>
                {businessUnits.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Category</label>
              <input
                type="text" list="category-options" value={form.category}
                onChange={e => set({ category: e.target.value })}
                placeholder="e.g. Projects, ICT infrastructure…"
              />
              <datalist id="category-options">
                {CATEGORIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>

          <div className="form-field">
            <label>Risk description</label>
            <textarea
              rows={2} value={form.risk}
              onChange={e => set({ risk: e.target.value })}
              placeholder="Describe the risk"
            />
          </div>

          {isCompliance && (
            <div className="compliance-fields">
              <div className="form-field">
                <label>Act / Regulation</label>
                <select value={form.act} onChange={e => set({ act: e.target.value })}>
                  <option value="">Select from the Compliance Universe…</option>
                  {COMPLIANCE_CATEGORIES.map(cat => (
                    <optgroup label={cat} key={cat}>
                      {COMPLIANCE_UNIVERSE.filter(a => a.category === cat).map(a => (
                        <option key={a.name} value={a.name}>{a.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              {selectedAct && (
                <div className="field-row">
                  <div className="field">
                    <label>Category</label>
                    <div className="val"><span className={'approval-pill tone-' + (selectedAct.category === 'Core' ? 'bad' : selectedAct.category === 'Topical' ? 'warn' : 'neutral')}>{selectedAct.category}</span></div>
                  </div>
                  <div className="field">
                    <label>Purpose of the Act/Regulation</label>
                    <div className="val sub">{selectedAct.purpose}</div>
                  </div>
                </div>
              )}
              <div className="form-field">
                <label>Provision reference &amp; regulatory requirement</label>
                <textarea
                  rows={2} value={form.provisionReference}
                  onChange={e => set({ provisionReference: e.target.value })}
                  placeholder="The specific section/clause this risk relates to"
                />
              </div>
            </div>
          )}

          <CategoryListField
            label="Root causes" items={form.rootCauses} categories={ROOT_CAUSE_CATEGORIES}
            onChange={v => set({ rootCauses: v })} placeholder="Root cause"
            emptyItem={() => ({ category: 'Process', text: '' })}
          />
          <CategoryListField
            label="Current controls" items={form.controls} categories={CONTROL_CATEGORIES}
            onChange={v => set({ controls: v })} placeholder="Control"
            emptyItem={() => ({ category: 'Preventive', text: '' })}
          />
          <ListField label="Consequences" items={form.consequences} onChange={v => set({ consequences: v })} placeholder="What could actually happen" />

          <div className="field-row">
            <ScorePicker
              title="Inherent risk"
              likelihood={form.irLikelihood} impact={form.irImpact}
              onLikelihood={v => set({ irLikelihood: v })} onImpact={v => set({ irImpact: v })}
            />
            <ScorePicker
              title="Residual risk"
              likelihood={form.rrLikelihood} impact={form.rrImpact}
              onLikelihood={v => set({ rrLikelihood: v })} onImpact={v => set({ rrImpact: v })}
            />
          </div>

          <div className="field-row">
            <div className="form-field">
              <label>Risk response</label>
              <select value={form.response} onChange={e => set({ response: e.target.value })}>
                {RESPONSES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Overall status</label>
              <select value={form.status} onChange={e => set({ status: e.target.value })}>
                <option value="green">On track</option>
                <option value="amber">At risk</option>
                <option value="red">Overdue</option>
              </select>
              <div className="field-caption">Reflects whether the business unit is hitting its own targets.</div>
            </div>
          </div>

          <ActionPlanField items={form.actionPlan} onChange={v => set({ actionPlan: v })} />

          {datesChanged && (
            <div className="form-field date-change-field">
              <label>Reason for the target date change</label>
              <textarea
                rows={2} value={dateChangeReason} onChange={e => setDateChangeReason(e.target.value)}
                placeholder="Required whenever a target date moves — kept on the audit trail"
              />
              <label style={{ marginTop: 10 }}>Supporting document (optional)</label>
              <input type="file" onChange={handleAttachFile} />
              {attachError && <div className="form-error" style={{ marginTop: 8 }}>{attachError}</div>}
              {dateChangeAttachment && (
                <div className="attach-preview">
                  📎 {dateChangeAttachment.name}
                  <button type="button" className="link-btn" onClick={() => setDateChangeAttachment(null)}>Remove</button>
                </div>
              )}
            </div>
          )}

          <div className="form-field">
            <label>Accountable unit</label>
            <select value={form.ownership.accountableUnit} onChange={e => setOwnership({ accountableUnit: e.target.value })}>
              <option value="">Select…</option>
              {accountableUnitOptions.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <ListField
            label="Responsible person(s)"
            items={form.ownership.responsiblePersons}
            onChange={v => setOwnership({ responsiblePersons: v })}
            placeholder="Title and name, e.g. Director: Human Resource"
          />

          <div className="field-row">
            <div className="form-field">
              <label>Overall progress (%)</label>
              <input
                type="number" min={0} max={100} value={everApproved ? form.progressPct : 0}
                disabled={!everApproved}
                onChange={e => set({ progressPct: e.target.value })}
              />
              {!everApproved && <div className="field-caption">Not applicable until this risk has been through approval once.</div>}
            </div>
            <div className="form-field">
              <label>Target date</label>
              <input
                type="text" value={form.targetDate} disabled={everApproved}
                onChange={e => set({ targetDate: e.target.value })} placeholder="e.g. 31 Mar 2027"
              />
              {everApproved && <div className="field-caption">Locked once approved — see Revised target date below.</div>}
            </div>
          </div>

          {everApproved && (
            <div className="form-field">
              <label>Revised target date</label>
              <input
                type="text" value={form.revisedTargetDate}
                onChange={e => set({ revisedTargetDate: e.target.value })}
                placeholder="e.g. 30 Jun 2027"
              />
            </div>
          )}

          <div className="form-field">
            <label>Assessment date (drives FY / month in reports)</label>
            <input type="date" value={form.assessmentDate} onChange={e => set({ assessmentDate: e.target.value })} />
          </div>
        </div>

        <div className="panel-foot">
          <div className="spacer" />
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn ghost" onClick={handleSaveDraft}>Save as draft</button>
          <button type="button" className="btn" onClick={handleSubmit}>Submit for approval</button>
        </div>
      </div>
    </div>
  )
}
