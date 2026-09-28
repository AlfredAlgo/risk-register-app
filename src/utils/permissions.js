import { ROLES, findOrgPath } from '../data/orgStructure.js'

export function approverStageForRole(role) {
  return ROLES[role]?.stage || null
}

// Which risks a role can see on the register/dashboard, regardless of a
// risk's current approval status - visibility is by org scope, the "pending
// on me" action queues (see DashboardView) filter separately by stage.
export function scopeRisksForRole(risks, role, persona, orgStructure) {
  if (role === 'businessunit') {
    return risks.filter(r => r.businessUnit === persona.businessUnit)
  }
  if (role === 'chiefdirector') {
    return risks.filter(r => findOrgPath(r.businessUnit, orgStructure).chiefDirectorate === persona.chiefDirectorate)
  }
  // ddg, cro, administrator: whole of EGOV
  return risks
}

// Can this role open the risk form (create, or edit/rework) for this risk
// right now? Business Unit only, own business unit only, only while the
// capture period is open. A risk is off-limits only while it's actively
// mid-review ('Submitted') - Approved is still editable because a risk
// (unlike a one-off procurement submission) needs recurring reassessment;
// starting a rework cycle there just opens a fresh draft, it never touches
// the published fields until the new cycle is itself approved.
export function canEditRisk(risk, role, persona, periodOpen) {
  if (role !== 'businessunit') return false
  if (risk && risk.businessUnit !== persona.businessUnit) return false
  // The capture period being closed normally blocks editing - unless an
  // approver has explicitly asked this specific risk for an ad-hoc update
  // (e.g. ahead of an ESMT meeting), which opens just that one risk back up.
  const hasOpenUpdateRequest = risk?.updateRequests?.some(r => !r.fulfilled)
  if (!periodOpen && !hasOpenUpdateRequest) return false
  return !risk || risk.approvalStatus !== 'Submitted'
}

export function canCreateRisk(role, periodOpen) {
  return role === 'businessunit' && periodOpen
}
