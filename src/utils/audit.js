// Field-level diffing used by the audit trail and the proposed-changes review modal.

export const FIELD_LABELS = {
  riskType: "Risk type",
  outcome: "Outcome",
  businessUnit: "Business unit",
  category: "Category",
  risk: "Risk description",
  rootCauses: "Root causes",
  controls: "Current controls",
  irLikelihood: "Inherent likelihood",
  irImpact: "Inherent impact",
  rrLikelihood: "Residual likelihood",
  rrImpact: "Residual impact",
  response: "Risk response",
  actionPlan: "Action plan",
  consequences: "Consequences",
  act: "Act / regulation",
  provisionReference: "Provision reference",
  ownership: "Ownership",
  targetDate: "Target date",
  status: "Overall status",
  progressPct: "Overall progress",
  assessmentDate: "Assessment date"
}

function stringifyField(field, v) {
  if (field === "ownership") {
    if (!v) return "—"
    const people = (v.responsiblePersons || []).filter(Boolean).join("; ")
    return [v.accountableUnit, people].filter(Boolean).join(" · ") || "—"
  }
  if (Array.isArray(v)) {
    if (!v.length) return "—"
    if (field === "actionPlan") return v.map(a => a.plan).filter(Boolean).join("; ") || "—"
    if (field === "rootCauses" || field === "controls") return v.map(x => `[${x.category}] ${x.text}`).filter(Boolean).join("; ") || "—"
    return v.filter(Boolean).join("; ") || "—"
  }
  if (v === "" || v === null || v === undefined) return "—"
  if (field === "progressPct") return `${v}%`
  return String(v)
}

export function diffRisk(before, after) {
  const diffs = []
  for (const field of Object.keys(FIELD_LABELS)) {
    const a = JSON.stringify(before[field])
    const b = JSON.stringify(after[field])
    if (a !== b) {
      diffs.push({
        field,
        label: FIELD_LABELS[field],
        before: stringifyField(field, before[field]),
        after: stringifyField(field, after[field])
      })
    }
  }
  return diffs
}
