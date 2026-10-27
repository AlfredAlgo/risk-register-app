import { statusLabel, actionPlanStatusLabel } from "./helpers.jsx"

function csvCell(v) {
  const s = String(v ?? "")
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csvRow(cells) {
  return cells.map(csvCell).join(",")
}

function joinCategoryList(items) {
  return (items || []).map(x => `[${x.category}] ${x.text}`).join("; ")
}

function joinActionPlan(items) {
  return (items || []).map(a => `${a.plan} (${actionPlanStatusLabel[a.status] || a.status}, target ${a.target || "–"})`).join("; ")
}

function joinProgress(items) {
  return (items || []).map(a => a.progress).filter(Boolean).join("; ")
}

export function exportReportCsv({ risks, filterLabel }) {
  const headers = [
    "Nr", "Risk type", "Outcome", "Business unit", "Category", "Risk",
    "Root causes", "Consequence",
    "Inherent risk (IR)", "Inherent L×I",
    "Controls",
    "Residual risk (RR)", "Residual L×I",
    "Action plan", "Progress", "Status", "Owner", "Response",
    "Approval status", "Target date", "Assessment date"
  ]

  const rows = risks.map(r => [
    r.nr, r.riskType, r.outcome, r.businessUnit, r.category, r.risk,
    joinCategoryList(r.rootCauses), (r.consequences || []).join("; "),
    r.ir, `L${r.irLikelihood}×I${r.irImpact}`,
    joinCategoryList(r.controls),
    r.rr, `L${r.rrLikelihood}×I${r.rrImpact}`,
    joinActionPlan(r.actionPlan), joinProgress(r.actionPlan),
    statusLabel[r.status] || r.status,
    r.ownership?.accountableUnit,
    r.response,
    r.approvalStatus, r.revisedTargetDate || r.targetDate, r.assessmentDate
  ])

  const lines = [
    csvRow(["Gauteng Department of e-Government — Risk Register Report"]),
    csvRow([`Scope: ${filterLabel}`]),
    csvRow([`Generated: ${new Date().toLocaleString("en-ZA")}`]),
    csvRow([`Total risks: ${risks.length}`]),
    "",
    csvRow(headers),
    ...rows.map(csvRow)
  ]

  // A UTF-8 BOM keeps Excel from mangling the em dashes and en dashes that
  // appear throughout the register text (e.g. in Act names) into mojibake.
  const csv = "﻿" + lines.join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const fileSafeLabel = filterLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  a.href = url
  a.download = `risk-register-report-${fileSafeLabel}-${Date.now()}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
