export function scoreClass(v) {
  return v >= 20 ? "hi" : v >= 11 ? "mid" : "lo"
}

// Gauteng Provincial Government financial year runs 1 Apr - 31 Mar.
export function fyFromDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ""
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  return m >= 4 ? `${y}/${y + 1}` : `${y - 1}/${y}`
}

export function monthKeyFromDate(dateStr) {
  if (!dateStr) return ""
  return dateStr.slice(0, 7) // "YYYY-MM"
}

export function monthLabelFromKey(key) {
  const [y, m] = key.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
}

export function nextNr(risks) {
  return risks.reduce((max, r) => Math.max(max, r.nr), 0) + 1
}

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDateShort(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
}

export function formatDateTime(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("en-ZA", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export const LIKELIHOOD_LABELS = ["", "1 · Rare", "2 · Unlikely", "3 · Possible", "4 · Likely", "5 · Almost certain"]
export const IMPACT_LABELS = ["", "1 · Insignificant", "2 · Minor", "3 · Moderate", "4 · Major", "5 · Severe"]

export function computeScore(likelihood, impact) {
  return Number(likelihood) * Number(impact)
}

// Merge a new (date, ir, rr) reading into a risk's score history, collapsing
// same-day reassessments into one point rather than stacking near-duplicates.
export function appendScoreHistory(history, { assessmentDate, ir, rr }) {
  const list = history || []
  const last = list[list.length - 1]
  const point = { date: assessmentDate, ir, rr }
  if (last && last.date === assessmentDate) {
    return [...list.slice(0, -1), point]
  }
  return [...list, point].sort((a, b) => a.date.localeCompare(b.date))
}

// Portfolio-level trend: for each date any risk was reassessed, average the
// most-recent-known IR/RR of every risk that had a reading by then (carrying
// each risk's last known score forward between its own reassessment dates).
export function computePortfolioTrend(risks) {
  const allDates = [...new Set(risks.flatMap(r => (r.scoreHistory || []).map(p => p.date)))].sort()
  return allDates.map(date => {
    let irSum = 0, rrSum = 0, count = 0
    risks.forEach(r => {
      const points = (r.scoreHistory || []).filter(p => p.date <= date)
      if (points.length) {
        const latest = points[points.length - 1]
        irSum += latest.ir
        rrSum += latest.rr
        count++
      }
    })
    return { date, ir: count ? irSum / count : 0, rr: count ? rrSum / count : 0 }
  })
}

export const RISK_TYPES = ["Operational", "Compliance", "Strategic", "Ethics", "Fraud"]

// Root cause / control classification, from the client's own review of the
// register - root causes by source (people/process/systems/external),
// controls by control type (the four COSO-style categories they named).
export const ROOT_CAUSE_CATEGORIES = ["People", "Process", "Systems", "External"]
export const CONTROL_CATEGORIES = ["Preventive", "Detective", "Corrective", "Directive"]

export function emptyRootCause() {
  return { category: "Process", text: "" }
}
export function emptyControl() {
  return { category: "Preventive", text: "" }
}

// Action plan items get their own status set, distinct from the risk's own
// on-track/at-risk/overdue status - "In Progress" replaces "On track" (the
// client's own language) and "Implemented" is a real fourth state, not a
// shade of on-track.
export const ACTION_PLAN_STATUSES = ["notstarted", "inprogress", "atrisk", "overdue", "implemented"]
export const actionPlanStatusLabel = {
  notstarted: "Not started", inprogress: "In Progress", atrisk: "At risk", overdue: "Overdue", implemented: "Implemented"
}
export const actionPlanStatusTone = {
  notstarted: "neutral", inprogress: "good", atrisk: "warn", overdue: "bad", implemented: "info"
}

// Key Risk Indicators - modelled on the client's real ICTSS Risk Appetite
// Statement & KRI template: each risk can carry one shared tolerance
// statement/summary plus several measurable indicators, each with its own
// quarterly target, five threshold bands, and a running list of period
// results. Bands are the same five the client's document uses; the result's
// band is set by whoever records it (matching the source, which is
// hand-classified against free-text threshold ranges, not computed).
export const KRI_BANDS = ["baseline", "low", "medium", "high", "veryHigh"]
export const kriBandLabel = {
  baseline: "Baseline", low: "Low risk", medium: "Medium risk", high: "High risk", veryHigh: "Very high risk"
}
export const kriBandTone = {
  baseline: "good", low: "good", medium: "warn", high: "bad", veryHigh: "bad"
}

export function emptyKriResult() {
  return { id: uid(), period: "", value: "", band: "baseline" }
}
export function emptyKri() {
  return {
    id: uid(), indicator: "", quarterlyTarget: "",
    thresholds: { baseline: "", low: "", medium: "", high: "", veryHigh: "" },
    results: [emptyKriResult()]
  }
}

// Applies to every risk type, not just Compliance - an accountable org unit
// plus the named people actually responsible, rather than one free-text
// "owner" string.
export function emptyOwnership(defaults = {}) {
  return { accountableUnit: defaults.accountableUnit || "", responsiblePersons: [""] }
}

export function formatOwnership(ownership) {
  if (!ownership) return ""
  const people = (ownership.responsiblePersons || []).filter(Boolean).join("; ")
  return people || ownership.accountableUnit || ""
}

export function emptyRisk(defaults = {}) {
  return {
    nr: null,
    riskType: "Operational",
    outcome: "",
    businessUnit: defaults.businessUnit || "",
    category: "",
    risk: "",
    rootCauses: [emptyRootCause()],
    controls: [emptyControl()],
    consequences: [""],
    irLikelihood: 4,
    irImpact: 3,
    rrLikelihood: 3,
    rrImpact: 3,
    ir: 12,
    rr: 9,
    response: "Mitigate",
    actionPlan: [{ plan: "", progress: "", target: "", status: "inprogress" }],
    act: "",
    provisionReference: "",
    ownership: emptyOwnership({ accountableUnit: defaults.businessUnit }),
    targetDate: "",
    revisedTargetDate: "",
    status: "amber",
    progressPct: 0,
    assessmentDate: new Date().toISOString().slice(0, 10),
    history: [],
    scoreHistory: [],
    comments: [],
    approvalStatus: "Draft",
    approvalStage: null,
    approvalStageEnteredAt: null,
    pendingChange: null,
    removalRequest: null,
    kriToleranceStatement: "",
    kriSummary: "",
    kris: [],
    updateRequests: []
  }
}

export const statusLabel = { green: "On track", amber: "At risk", red: "Overdue" }

const FACE_COLORS = {
  green: { fg: "#3B6D11", bg: "#EAF3DE" },
  amber: { fg: "#854F0B", bg: "#FAEEDA" },
  red: { fg: "#A32D2D", bg: "#FCEBEB" }
}

export function StatusFace({ status }) {
  const { fg, bg } = FACE_COLORS[status]
  return (
    <svg className="face" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill={bg} stroke={fg} strokeWidth="1" />
      <circle cx="7" cy="8" r="1" fill={fg} />
      <circle cx="13" cy="8" r="1" fill={fg} />
      {status === "green" && (
        <path d="M7 13 Q10 16 13 13" stroke={fg} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}
      {status === "amber" && (
        <line x1="7" y1="13.5" x2="13" y2="13.5" stroke={fg} strokeWidth="1.4" strokeLinecap="round" />
      )}
      {status === "red" && (
        <path d="M7 14.5 Q10 11.5 13 14.5" stroke={fg} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  )
}
