import { ROLES, findOrgPath } from '../data/orgStructure.js'

// Strategic risks go all the way to HOD; every other type stops at CRO.
// Keeping both as ordered arrays (not hardcoded per-stage branches
// elsewhere) means a future change to either sequence is one line here.
export const CHAIN_STANDARD = ['director', 'chiefdirector', 'ddg', 'cro']
export const CHAIN_STRATEGIC = ['director', 'chiefdirector', 'ddg', 'cro', 'hod']

export function defaultChainForType(riskType) {
  return riskType === 'Strategic' ? CHAIN_STRATEGIC : CHAIN_STANDARD
}

// Precedence: a business unit's own custom chain (set in Admin, for cases
// like the CRO office's own unit that the client hasn't finalised routing
// for yet) wins outright; otherwise the type-based default chain, truncated
// early if the risk's chief directorate is configured to end before the
// full sequence (e.g. no DDG, so it stops at Chief Director).
export function computeApprovalChain(risk, orgStructure, cdOverrides = {}, buChainOverrides = {}) {
  const customChain = buChainOverrides[risk.businessUnit]
  if (customChain && customChain.length > 0) return customChain

  const chain = defaultChainForType(risk.riskType)
  const { chiefDirectorate } = findOrgPath(risk.businessUnit, orgStructure)
  const endsAt = cdOverrides[chiefDirectorate]?.endsAt
  if (endsAt) {
    const cutIdx = chain.indexOf(endsAt)
    if (cutIdx !== -1) return chain.slice(0, cutIdx + 1)
  }
  return chain
}

// A chief directorate without a DDG can relabel that stage (e.g. "CFO")
// without changing which stage key actually approves it.
export function stageLabelForRisk(stageKey, risk, orgStructure, cdOverrides = {}) {
  if (stageKey === 'ddg') {
    const { chiefDirectorate } = findOrgPath(risk.businessUnit, orgStructure)
    const override = cdOverrides[chiefDirectorate]?.ddgLabel
    if (override) return override
  }
  return ROLES[stageKey]?.label || stageKey
}

export function stageVerbForRisk(stageKey, risk) {
  if (stageKey === 'director') return 'acknowledge ownership of'
  if (stageKey === 'cro') return risk.riskType === 'Strategic' ? 'recommend' : 'acknowledge'
  return 'authorise'
}
