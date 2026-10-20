import { useEffect, useMemo, useState } from 'react'
import Toolbar from './Toolbar.jsx'
import OutcomeGroup from './OutcomeGroup.jsx'
import { findOrgPath } from '../data/orgStructure.js'
import { scopeRisksForRole, canCreateRisk } from '../utils/permissions.js'

const EMPTY_FILTERS = { branch: '', chiefDirectorate: '', businessUnit: '', cat: '', status: '', q: '' }

export default function RegisterView({ risks, role, persona, orgStructure, periodOpen, onSelectRisk, onAddRisk }) {
  const lockLevel = role === 'director' ? 'director' : role === 'chiefdirector' ? 'chiefdirector' : null
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showRemoved, setShowRemoved] = useState(false)

  useEffect(() => {
    if (role === 'director') {
      const path = findOrgPath(persona.businessUnit, orgStructure)
      setFilters(f => ({ ...f, branch: path.branch || '', chiefDirectorate: path.chiefDirectorate || '', businessUnit: persona.businessUnit }))
    } else if (role === 'chiefdirector') {
      const branch = orgStructure.find(b => b.chiefDirectorates.some(cd => cd.name === persona.chiefDirectorate))?.branch || ''
      setFilters(f => ({ ...f, branch, chiefDirectorate: persona.chiefDirectorate, businessUnit: '' }))
    } else {
      setFilters(EMPTY_FILTERS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const scopedRisks = useMemo(() => scopeRisksForRole(risks, role, persona, orgStructure), [risks, role, persona, orgStructure])
  const categories = useMemo(() => [...new Set(risks.map(r => r.category))].sort(), [risks])

  const filtered = useMemo(() => scopedRisks.filter(r => {
    const path = findOrgPath(r.businessUnit, orgStructure)
    return (
      (showRemoved || r.approvalStatus !== 'Removed') &&
      (!filters.branch || path.branch === filters.branch) &&
      (!filters.chiefDirectorate || path.chiefDirectorate === filters.chiefDirectorate) &&
      (!filters.businessUnit || r.businessUnit === filters.businessUnit) &&
      (!filters.cat || r.category === filters.cat) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.q ||
        r.risk.toLowerCase().includes(filters.q.toLowerCase()) ||
        r.businessUnit.toLowerCase().includes(filters.q.toLowerCase()))
    )
  }), [scopedRisks, filters, orgStructure, showRemoved])

  const outcomes = useMemo(() => [...new Set(filtered.map(r => r.outcome))], [filtered])

  return (
    <div className="view-enter">
      <Toolbar
        orgStructure={orgStructure}
        categories={categories}
        filters={filters}
        setFilters={setFilters}
        lockLevel={lockLevel}
        canAddRisk={canCreateRisk(role, periodOpen)}
        onAddRisk={onAddRisk}
        showRemoved={showRemoved}
        onToggleShowRemoved={role === 'riskcapturer' || role === 'administrator' ? () => setShowRemoved(s => !s) : undefined}
      />
      {outcomes.length === 0 ? (
        <div className="outcome">
          <div style={{ padding: 20, color: 'var(--ink-muted)' }}>No risks match these filters.</div>
        </div>
      ) : (
        outcomes.map(oc => (
          <OutcomeGroup
            key={oc}
            outcome={oc}
            risks={filtered.filter(r => r.outcome === oc)}
            onSelectRisk={onSelectRisk}
          />
        ))
      )}
    </div>
  )
}
