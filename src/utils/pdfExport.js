import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { statusLabel } from "./helpers.jsx"
import logoUrl from "../assets/gpg-logo.png"

// Brand palette, mirrored from src/index.css so the PDF reads as an
// extension of the app rather than a generic autoTable export.
const NAVY = [18, 42, 78]
const BLUE = [30, 90, 160]
const GOLD = [143, 122, 62]
const INK_MUTED = [91, 100, 112]
const LINE = [221, 227, 234]
const STATUS_FILL = { green: [234, 243, 222], amber: [250, 238, 218], red: [252, 235, 235] }
const STATUS_TEXT = { green: [59, 109, 17], amber: [133, 79, 11], red: [163, 45, 45] }

const HEADER_H = 100
const FOOTER_H = 40

let cachedLogo = null
async function loadLogoDataUrl() {
  if (cachedLogo !== null) return cachedLogo
  try {
    const res = await fetch(logoUrl)
    const blob = await res.blob()
    cachedLogo = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    cachedLogo = false
  }
  return cachedLogo
}

function groupByOutcome(risks) {
  const groups = new Map()
  risks.forEach(r => {
    if (!groups.has(r.outcome)) groups.set(r.outcome, [])
    groups.get(r.outcome).push(r)
  })
  return groups
}

export async function exportReportPdf({ risks, filterLabel, summary, byBU, byStatus }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 40
  const logoDataUrl = await loadLogoDataUrl()

  function drawLetterhead() {
    doc.setFillColor(...NAVY)
    doc.rect(0, 0, pageW, 6, "F")

    let textX = marginX
    if (logoDataUrl) {
      const logoH = 34
      const logoW = logoH * 1.9
      doc.addImage(logoDataUrl, "PNG", marginX, 20, logoW, logoH)
      textX = marginX + logoW + 14
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(...NAVY)
    doc.text("Gauteng Department of e-Government", textX, 36)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)
    doc.setTextColor(...INK_MUTED)
    doc.text("Risk Register Report", textX, 52)

    doc.setDrawColor(...GOLD)
    doc.setLineWidth(1.5)
    doc.line(marginX, 68, pageW - marginX, 68)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...INK_MUTED)
    doc.text(`Scope: ${filterLabel}`, marginX, 82)
    doc.text(`Generated: ${new Date().toLocaleString("en-ZA")}`, pageW - marginX, 82, { align: "right" })
  }

  // Only draws the parts that are correct regardless of when they're called.
  // The page number ("Page X of N") needs the final page count, which isn't
  // known until generation finishes - see finalizePageNumbers() below.
  function drawFooter() {
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.75)
    doc.line(marginX, pageH - 30, pageW - marginX, pageH - 30)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...INK_MUTED)
    doc.text("Confidential — Gauteng Department of e-Government", marginX, pageH - 16)
  }

  function finalizePageNumbers() {
    const total = doc.internal.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
      doc.setPage(p)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(...INK_MUTED)
      doc.text(`Page ${p} of ${total}`, pageW - marginX, pageH - 16, { align: "right" })
    }
  }

  function decoratePage() {
    drawLetterhead()
    drawFooter()
  }

  decoratePage()
  let y = HEADER_H + 6

  // Summary metrics as coloured tiles rather than a bare grid table.
  const tiles = [
    { label: "Total risks", value: summary.total, accent: BLUE },
    { label: "High inherent risk (IR 20+)", value: summary.highIr, accent: NAVY },
    { label: "On track", value: summary.green, accent: STATUS_TEXT.green },
    { label: "At risk", value: summary.amber, accent: STATUS_TEXT.amber },
    { label: "Overdue", value: summary.red, accent: STATUS_TEXT.red }
  ]
  const tileGap = 12
  const tileW = (pageW - marginX * 2 - tileGap * (tiles.length - 1)) / tiles.length
  const tileH = 52
  tiles.forEach((t, i) => {
    const x = marginX + i * (tileW + tileGap)
    doc.setFillColor(250, 251, 252)
    doc.setDrawColor(...LINE)
    doc.roundedRect(x, y, tileW, tileH, 4, 4, "FD")
    doc.setDrawColor(...t.accent)
    doc.setLineWidth(2.5)
    doc.line(x, y + 2, x, y + tileH - 2)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(...t.accent)
    doc.text(String(t.value), x + 12, y + 26)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...INK_MUTED)
    doc.text(t.label, x + 12, y + 40, { maxWidth: tileW - 20 })
  })
  y += tileH + 22

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: pageW / 2 + 6, top: HEADER_H, bottom: FOOTER_H },
    head: [["Business unit", "Risks"]],
    body: Object.entries(byBU),
    theme: "striped",
    headStyles: { fillColor: BLUE, fontSize: 9 },
    styles: { fontSize: 9 },
    didDrawPage: decoratePage
  })
  const afterBuY = doc.lastAutoTable.finalY

  autoTable(doc, {
    startY: y,
    margin: { left: pageW / 2 + 6, right: marginX, top: HEADER_H, bottom: FOOTER_H },
    head: [["Status", "Risks"]],
    body: [
      ["On track", byStatus.green],
      ["At risk", byStatus.amber],
      ["Overdue", byStatus.red]
    ],
    theme: "striped",
    headStyles: { fillColor: BLUE, fontSize: 9 },
    styles: { fontSize: 9 },
    didParseCell: data => {
      if (data.section === "body" && data.column.index === 0) {
        const key = ["green", "amber", "red"][data.row.index]
        data.cell.styles.textColor = STATUS_TEXT[key]
        data.cell.styles.fontStyle = "bold"
      }
    },
    didDrawPage: decoratePage
  })

  y = Math.max(afterBuY, doc.lastAutoTable.finalY) + 26

  const grouped = groupByOutcome(risks)
  let firstGroup = true
  for (const [outcome, groupRisks] of grouped) {
    if (!firstGroup) y += 18
    firstGroup = false

    if (y > pageH - FOOTER_H - 90) {
      doc.addPage()
      decoratePage()
      y = HEADER_H + 6
    }
    doc.setFillColor(...NAVY)
    doc.rect(marginX, y, 4, 14, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(...NAVY)
    doc.text(outcome.toUpperCase(), marginX + 10, y + 11)
    y += 20

    autoTable(doc, {
      startY: y,
      margin: { left: marginX, right: marginX, top: HEADER_H, bottom: FOOTER_H },
      head: [["Nr", "Business unit", "Risk", "Category", "IR", "RR", "Response", "Status", "Progress", "Target date", "Owner"]],
      body: groupRisks.map(r => [
        r.nr,
        r.businessUnit,
        r.risk,
        r.category,
        r.ir,
        r.rr,
        r.response,
        statusLabel[r.status] || r.status,
        `${r.progressPct}%`,
        r.revisedTargetDate || r.targetDate,
        r.ownership?.accountableUnit || ""
      ]),
      theme: "grid",
      headStyles: { fillColor: NAVY, fontSize: 8.5 },
      styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak", lineColor: LINE },
      columnStyles: {
        2: { cellWidth: 165 },
        10: { cellWidth: 125 }
      },
      didParseCell: data => {
        if (data.section === "body" && data.column.index === 7) {
          const r = groupRisks[data.row.index]
          data.cell.styles.fillColor = STATUS_FILL[r.status]
          data.cell.styles.textColor = STATUS_TEXT[r.status]
          data.cell.styles.fontStyle = "bold"
        }
      },
      didDrawPage: decoratePage
    })
    y = doc.lastAutoTable.finalY
  }

  finalizePageNumbers()

  const fileSafeLabel = filterLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
  doc.save(`risk-register-report-${fileSafeLabel}-${Date.now()}.pdf`)
}
