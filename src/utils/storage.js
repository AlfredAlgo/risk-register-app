// v4: added Key Risk Indicators (kris/kriToleranceStatement/kriSummary) and
// ad-hoc update requests (updateRequests) to each risk.
const RISKS_KEY = "grr.risks.v4"
const BOARD_KEY = "grr.board.v2"
const PERIOD_KEY = "grr.period.v2"
// v2: bumped alongside the move to the five-role approval chain (Business
// Unit/Chief Director/DDG/HOD/Administrator) - a browser holding org
// structure or personas from the earlier two-role model would otherwise
// crash the app when switching to a role that didn't exist yet back then.
const ORG_KEY = "grr.org.v2"
const PERSONAS_KEY = "grr.personas.v2"

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
