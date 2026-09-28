import { useState } from 'react'
import { ROLES, allBusinessUnits, chiefDirectoratesInBranch } from '../data/orgStructure.js'

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

export default function AdminView({ orgStructure, onChangeOrgStructure, personas, onChangePersonas }) {
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

      <div className="block-title">Demo personas</div>
      <p className="sub" style={{ marginBottom: 14 }}>
        There's no real login in this prototype — each role is played by one named person. Rename them, or reassign the Business Unit / Chief Director persona to a different part of the org.
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
                {key === 'businessunit' && (
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
                    {orgStructure.flatMap(b => chiefDirectoratesInBranch(b.branch, orgStructure)).map(cd => <option key={cd} value={cd}>{cd}</option>)}
                  </select>
                )}
                {(key === 'ddg' || key === 'hod' || key === 'administrator') && <span className="sub">EGOV-wide</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
