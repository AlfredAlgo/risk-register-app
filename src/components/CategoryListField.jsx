// Root causes and controls both carry a classification alongside the text -
// source (people/process/systems/external) for causes, control type
// (preventive/detective/corrective/directive) for controls.
export default function CategoryListField({ label, items, categories, onChange, placeholder, emptyItem }) {
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
