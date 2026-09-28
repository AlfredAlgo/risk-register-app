import { statusLabel } from "./helpers.jsx"

function csvCell(v) {
  const s = String(v ?? "")
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function csvRow(cells) {
  return cells.map(csvCell).join(",")
}

export function exportReportCsv({ risks, filterLabel }) {
  const headers = [
    "Nr", "Risk type", "Outcome", "Business unit", "Category", "Risk",
    "Inherent risk (IR)", "Residual risk (RR)", "Response", "Status", "Approval status",
    "Progress %", "Target date", "Accountable unit", "Responsible person(s)", "Assessment date"
  ]

  const rows = risks.map(r => [
    r.nr, r.riskType, r.outcome, r.businessUnit, r.category, r.risk,
    r.ir, r.rr, r.response, statusLabel[r.status] || r.status, r.approvalStatus,
    r.progressPct, r.targetDate,
    r.ownership?.accountableUnit, (r.ownership?.responsiblePersons || []).filter(Boolean).join("; "),
    r.assessmentDate
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
