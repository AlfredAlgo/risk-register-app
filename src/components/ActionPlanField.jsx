import { ACTION_PLAN_STATUSES, actionPlanStatusLabel } from '../utils/helpers.jsx'

export default function ActionPlanField({ items, onChange }) {
  function setItem(i, patch) {
    const next = items.map((a, idx) => (idx === i ? { ...a, ...patch } : a))
    onChange(next)
  }
  function addItem() {
    onChange([...items, { plan: '', progress: '', target: '', status: 'inprogress' }])
  }
  function removeItem(i) {
    onChange(items.filter((_, idx) => idx !== i))
  }
  return (
    <div className="form-field">
      <label>Action plan &amp; progress</label>
      {items.map((a, i) => (
        <div className="ap-form-item" key={i}>
          <input
            type="text" placeholder="Action / plan"
            value={a.plan} onChange={e => setItem(i, { plan: e.target.value })}
          />
          <input
            type="text" placeholder="Progress to date"
            value={a.progress} onChange={e => setItem(i, { progress: e.target.value })}
          />
          <div className="ap-form-row">
            <input
              type="date"
              value={a.target} onChange={e => setItem(i, { target: e.target.value })}
            />
            <select value={a.status} onChange={e => setItem(i, { status: e.target.value })}>
              {ACTION_PLAN_STATUSES.map(s => <option key={s} value={s}>{actionPlanStatusLabel[s]}</option>)}
            </select>
            <button type="button" className="btn ghost sm" onClick={() => removeItem(i)} disabled={items.length <= 1}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="btn ghost sm" onClick={addItem}>+ Add action</button>
    </div>
  )
}
