// v5: added revisedTargetDate/removalRequest/approvalStageEnteredAt and the
// 'Removed' approvalStatus value, for the type/org-dependent approval chain
// rework (Risk Capturer/Director/CRO roles, removal requests, review windows).
const RISKS_KEY = "grr.risks.v5"
const BOARD_KEY = "grr.board.v2"
const PERIOD_KEY = "grr.period.v2"
// v2: bumped alongside the move to the five-role approval chain (Business
// Unit/Chief Director/DDG/HOD/Administrator) - a browser holding org
// structure or personas from the earlier two-role model would otherwise
// crash the app when switching to a role that didn't exist yet back then.
const ORG_KEY = "grr.org.v2"
// v3: businessunit renamed to riskcapturer (no longer tied to one business
// unit), added director and cro roles.
const PERSONAS_KEY = "grr.personas.v3"
const CD_OVERRIDES_KEY = "grr.cdOverrides.v1"
const BU_CHAIN_OVERRIDES_KEY = "grr.buChainOverrides.v1"
const SLA_KEY = "grr.sla.v1"
const NOTIFICATIONS_KEY = "grr.notifications.v1"
const REVIEW_WINDOW_KEY = "grr.reviewWindow.v1"

function load(key, seed) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : seed
  } catch {
    return seed
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage unavailable (private mode, quota) - state still holds in memory
  }
}

export const loadRisks = seed => load(RISKS_KEY, seed)
export const saveRisks = risks => save(RISKS_KEY, risks)

export const loadBoardCards = seed => load(BOARD_KEY, seed)
export const saveBoardCards = cards => save(BOARD_KEY, cards)

export const loadPeriod = seed => load(PERIOD_KEY, seed)
export const savePeriod = period => save(PERIOD_KEY, period)

export const loadOrgStructure = seed => load(ORG_KEY, seed)
export const saveOrgStructure = org => save(ORG_KEY, org)

export const loadPersonas = seed => load(PERSONAS_KEY, seed)
export const savePersonas = personas => save(PERSONAS_KEY, personas)

export const loadCdOverrides = seed => load(CD_OVERRIDES_KEY, seed)
export const saveCdOverrides = v => save(CD_OVERRIDES_KEY, v)

export const loadBuChainOverrides = seed => load(BU_CHAIN_OVERRIDES_KEY, seed)
export const saveBuChainOverrides = v => save(BU_CHAIN_OVERRIDES_KEY, v)

export const loadSla = seed => load(SLA_KEY, seed)
export const saveSla = v => save(SLA_KEY, v)

export const loadNotifications = seed => load(NOTIFICATIONS_KEY, seed)
export const saveNotifications = v => save(NOTIFICATIONS_KEY, v)

export const loadReviewWindow = seed => load(REVIEW_WINDOW_KEY, seed)
export const saveReviewWindow = v => save(REVIEW_WINDOW_KEY, v)
