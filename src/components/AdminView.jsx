import { useState } from 'react'
import { ROLES, allBusinessUnits, chiefDirectoratesInBranch, allChiefDirectorates } from '../data/orgStructure.js'

const STAGE_ROLES = Object.entries(ROLES).filter(([, r]) => r.stage).map(([key]) => key)

function renameBranch(structure, index, name) {
  return structure.map((b, i) => (i === index ? { ...b, branch: name } : b))
}
function removeBranch(structure, index) {
  return structure.filter((_, i) => i !== index)
}
function addBranch(structure, name) {
  return [...structure, { branch: name, chiefDirectorates: [] }]
}
function addChiefDirectorate(structure, branchIndex, name) {
  return structure.map((b, i) => (i === branchIndex ? { ...b, chiefDirectorates: [...b.chiefDirectorates, { name, businessUnits: [] }] } : b))
}
function renameChiefDirectorate(structure, branchIndex, cdIndex, name) {
  return structure.map((b, i) => (i === branchIndex ? {
    ...b, chiefDirectorates: b.chiefDirectorates.map((cd, j) => (j === cdIndex ? { ...cd, name } : cd))
  } : b))
}
function removeChiefDirectorate(structure, branchIndex, cdIndex) {
  return structure.map((b, i) => (i === branchIndex ? { ...b, chiefDirectorates: b.chiefDirectorates.filter((_, j) => j !== cdIndex) } : b))
}
function addBusinessUnit(structure, branchIndex, cdIndex, name) {
  return structure.map((b, i) => (i === branchIndex ? {
    ...b, chiefDirectorates: b.chiefDirectorates.map((cd, j) => (j === cdIndex ? { ...cd, businessUnits: [...cd.businessUnits, name] } : cd))
  } : b))
}
function renameBusinessUnit(structure, branchIndex, cdIndex, buIndex, name) {
  return structure.map((b, i) => (i === branchIndex ? {
    ...b, chiefDirectorates: b.chiefDirectorates.map((cd, j) => (j === cdIndex ? {
      ...cd, businessUnits: cd.businessUnits.map((bu, k) => (k === buIndex ? name : bu))
    } : cd))
  } : b))
}
function removeBusinessUnit(structure, branchIndex, cdIndex, buIndex) {
  return structure.map((b, i) => (i === branchIndex ? {
    ...b, chiefDirectorates: b.chiefDirectorates.map((cd, j) => (j === cdIndex ? { ...cd, businessUnits: cd.businessUnits.filter((_, k) => k !== buIndex) } : cd))
  } : b))
}

function AddInline({ placeholder, onAdd }) {
  const [value, setValue] = useState('')
  return (
    <div className="list-row">
      <input type="text" placeholder={placeholder} value={value} onChange={e => setValue(e.target.value)} />
      <button
        type="button" className="btn ghost sm"
        onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue('') } }}
      >
        + Add
      </button>
    </div>
  )
}

// An ordered list of approval-chain stages, each a select over the
// stage-bearing roles - an empty list means "use the standard type-based
// chain" for that business unit.
function StageChainField({ value, onChange }) {
  function setStage(i, stage) {
    onChange(value.map((s, idx) => (idx === i ? stage : s)))
  }
  function addStage() {
    onChange([...value, STAGE_ROLES[0]])
  }
  function removeStage(i) {
    onChange(value.filter((_, idx) => idx !== i))
  }
  return (
    <div>
      {value.map((stage, i) => (
        <div className="list-row" key={i}>
          <select value={stage} onChange={e => setStage(i, e.target.value)}>
            {STAGE_ROLES.map(k => <option key={k} value={k}>{ROLES[k].label}</option>)}
          </select>
          <button type="button" className="btn ghost sm" onClick={() => removeStage(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn ghost sm" onClick={addStage}>+ Add stage</button>
    </div>
  )
}

export default function AdminView({
  orgStructure, onChangeOrgStructure, personas, onChangePersonas,
  chiefDirectorateOverrides, onChangeCdOverrides,
  businessUnitChainOverrides, onChangeBuChainOverrides,
  stageSla, onChangeStageSla
}) {
  return (
    <div className="view-enter">
      <div className="block-title" style={{ marginTop: 0 }}>Organisational structure</div>
      <p className="sub" style={{ marginBottom: 14 }}>
        Branch → Chief directorate → Business unit. Editing here updates every filter, dashboard, and the register's cascading scope immediately.
      </p>

      {orgStructure.map((b, bi) => (
        <div className="org-branch" key={bi}>
          <div className="list-row">
            <input
              type="text" value={b.branch}
              onChange={e => onChangeOrgStructure(renameBranch(orgStructure, bi, e.target.value))}
            />
            <button type="button" className="btn ghost sm" onClick={() => onChangeOrgStructure(removeBranch(orgStructure, bi))}>Remove branch</button>
          </div>

          <div className="org-children">
            {b.chiefDirectorates.map((cd, ci) => (
              <div className="org-cd" key={ci}>
                <div className="list-row">
                  <input
                    type="text" value={cd.name}
                    onChange={e => onChangeOrgStructure(renameChiefDirectorate(orgStructure, bi, ci, e.target.value))}
                  />
                  <button type="button" className="btn ghost sm" onClick={() => onChangeOrgStructure(removeChiefDirectorate(orgStructure, bi, ci))}>Remove</button>
                </div>
                <div className="cd-override-row">
                  <input
                    type="text"
                    value={chiefDirectorateOverrides[cd.name]?.ddgLabel || ''}
                    placeholder="DDG label override (e.g. CFO)"
                    onChange={e => onChangeCdOverrides({
                      ...chiefDirectorateOverrides,
                      [cd.name]: { ...chiefDirectorateOverrides[cd.name], ddgLabel: e.target.value || null }
                    })}
                  />
                  <select
                    value={chiefDirectorateOverrides[cd.name]?.endsAt || ''}
                    onChange={e => onChangeCdOverrides({
                      ...chiefDirectorateOverrides,
                      [cd.name]: { ...chiefDirectorateOverrides[cd.name], endsAt: e.target.value || null }
                    })}
                  >
                    <option value="">Chain ends at: full chain</option>
                    <option value="chiefdirector">Chain ends at: Chief Director</option>
                  </select>
                </div>
                <div className="org-bu-list">
                  {cd.businessUnits.map((bu, ui) => (
                    <div className="list-row" key={ui}>
                      <input
                        type="text" value={bu}
                        onChange={e => onChangeOrgStructure(renameBusinessUnit(orgStructure, bi, ci, ui, e.target.value))}
                      />
                      <button type="button" className="btn ghost sm" onClick={() => onChangeOrgStructure(removeBusinessUnit(orgStructure, bi, ci, ui))}>Remove</button>
                    </div>
                  ))}
                  <AddInline placeholder="New business unit" onAdd={name => onChangeOrgStructure(addBusinessUnit(orgStructure, bi, ci, name))} />
                </div>
              </div>
            ))}
            <AddInline placeholder="New chief directorate" onAdd={name => onChangeOrgStructure(addChiefDirectorate(orgStructure, bi, name))} />
          </div>
        </div>
      ))}
      <AddInline placeholder="New branch" onAdd={name => onChangeOrgStructure(addBranch(orgStructure, name))} />

      <div className="block-title">Business unit chain overrides</div>
      <p className="sub" style={{ marginBottom: 14 }}>
        Leave empty to use the standard type-based chain. Set an explicit sequence for a unit whose routing doesn't follow the default (e.g. the CRO office's own submissions) once that's confirmed.
      </p>
      {allBusinessUnits(orgStructure).map(bu => (
        <div className="bu-chain-row" key={bu}>
          <div className="who">{bu}</div>
          <StageChainField
            value={businessUnitChainOverrides[bu] || []}
            onChange={chain => onChangeBuChainOverrides({ ...businessUnitChainOverrides, [bu]: chain })}
          />
        </div>
      ))}

      <div className="block-title">Approval stage SLAs</div>
      <p className="sub" style={{ marginBottom: 14 }}>
        Turnaround time in days per stage. Left blank until the risk team provides real numbers — nothing is flagged overdue without one set.
      </p>
      <table className="ref">
        <thead><tr><th>Stage</th><th>SLA (days)</th></tr></thead>
        <tbody>
          {STAGE_ROLES.map(key => (
            <tr key={key}>
              <td className="who">{ROLES[key].label}</td>
              <td>
                <input
                  type="number" min={1} value={stageSla[key] ?? ''}
                  placeholder="No SLA set"
                  onChange={e => onChangeStageSla({ ...stageSla, [key]: e.target.value ? Number(e.target.value) : null })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="block-title">Demo personas</div>
      <p className="sub" style={{ marginBottom: 14 }}>
        There's no real login in this prototype — each role is played by one named person. Rename them, or reassign the Director / Chief Director persona to a different part of the org.
      </p>
      <table className="ref">
        <thead><tr><th>Role</th><th>Name</th><th>Scope</th></tr></thead>
        <tbody>
          {Object.entries(ROLES).map(([key, r]) => (
            <tr key={key}>
              <td className="who">{r.label}</td>
              <td>
                <input
                  type="text" value={personas[key].name}
                  onChange={e => onChangePersonas({ ...personas, [key]: { ...personas[key], name: e.target.value } })}
                />
              </td>
              <td>
                {key === 'director' && (
                  <select
                    value={personas[key].businessUnit}
                    onChange={e => onChangePersonas({ ...personas, [key]: { ...personas[key], businessUnit: e.target.value } })}
                  >
                    {allBusinessUnits(orgStructure).map(bu => <option key={bu} value={bu}>{bu}</option>)}
                  </select>
                )}
                {key === 'chiefdirector' && (
                  <select
                    value={personas[key].chiefDirectorate}
                    onChange={e => onChangePersonas({ ...personas, [key]: { ...personas[key], chiefDirectorate: e.target.value } })}
                  >
                    {allChiefDirectorates(orgStructure).map(cd => <option key={cd} value={cd}>{cd}</option>)}
                  </select>
                )}
                {(key === 'ddg' || key === 'cro' || key === 'hod' || key === 'administrator') && <span className="sub">EGOV-wide</span>}
                {key === 'riskcapturer' && <span className="sub">EGOV-wide — captures on behalf of any business unit</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
