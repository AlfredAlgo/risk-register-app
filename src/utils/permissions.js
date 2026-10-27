import { ROLES, findOrgPath } from '../data/orgStructure.js'

export function approverStageForRole(role) {
  return ROLES[role]?.stage || null
}

// Which risks a role can see on the register/dashboard, regardless of a
// risk's current approval status - visibility is by org scope, the "pending
// on me" action queues (see DashboardView) filter separately by stage.
export function scopeRisksForRole(risks, role, persona, orgStructure) {
  if (role === 'director') {
    return risks.filter(r => r.businessUnit === persona.businessUnit)
  }
  if (role === 'chiefdirector') {
    return risks.filter(r => findOrgPath(r.businessUnit, orgStructure).chiefDirectorate === persona.chiefDirectorate)
  }
  // riskcapturer (captures on behalf of any business unit, no fixed scope),
  // ddg, cro, administrator: whole of EGOV
  return risks
}

// Can this role open the risk form (create, or edit/rework) for this risk
// right now? Risk Capturer only (business units don't get capture access -
// the capturer picks which unit a risk belongs to, so there's no own-unit
// check here), only while the capture period is open. A risk is off-limits
// while it's actively mid-review ('Submitted'), has a pending removal
// request, or has already been removed - Approved is still editable because
// a risk (unlike a one-off procurement submission) needs recurring
// reassessment; starting a rework cycle there just opens a fresh draft, it
// never touches the published fields until the new cycle is itself approved.
export function canEditRisk(risk, role, periodOpen) {
  if (role !== 'riskcapturer') return false
  if (risk?.approvalStatus === 'Removed') return false
  if (risk?.removalRequest?.status === 'Pending') return false
  // The capture period being closed normally blocks editing - unless an
  // approver has explicitly asked this specific risk for an ad-hoc update
  // (e.g. ahead of an ESMT meeting), which opens just that one risk back up.
  const hasOpenUpdateRequest = risk?.updateRequests?.some(r => !r.fulfilled)
  if (!periodOpen && !hasOpenUpdateRequest) return false
  return !risk || risk.approvalStatus !== 'Submitted'
}

export function canCreateRisk(role, periodOpen) {
  return role === 'riskcapturer' && periodOpen
}

// HOD's approval is evidenced by the uploaded memo, so HOD doesn't also
// submit the in-system request; Administrator is purely org/persona admin.
export function canRequestRemoval(role) {
  return ['director', 'chiefdirector', 'ddg', 'cro'].includes(role)
}

export function canValidateRemoval(role) {
  return role === 'riskcapturer'
}

// A review window is scheduled with explicit start/end dates (like a
// calendar invite) rather than a duration counted from whenever it was
// created, so it can be set up ahead of time and isn't "live" until its
// own start date arrives.
export function isReviewWindowOpen(reviewWindow) {
  if (!reviewWindow) return false
  const now = new Date()
  return new Date(reviewWindow.opensAt) <= now && now <= new Date(reviewWindow.closesAt)
}

// True in the last 2 days before a window closes (or once it's closed) -
// used to drive the escalation banner up the chain toward HOD.
export function isReviewWindowEscalating(reviewWindow) {
  if (!reviewWindow) return false
  const now = new Date()
  const closes = new Date(reviewWindow.closesAt)
  const msToClose = closes.getTime() - now.getTime()
  return msToClose <= 2 * 86400000
}
