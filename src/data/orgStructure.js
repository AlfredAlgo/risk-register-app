// Organisational structure - Branch -> Chief Directorate -> Business Unit.
//
// "Resource Management" and its four business units are REAL EGOV structure,
// taken directly from the client's 2025-26 Compliance Risk Management Plan
// (the compliance risks in data/risks.js are real content from that same
// source, so they live here). Its parent branch name was not confirmed by
// the client, so it's still marked placeholder - everything else in the org
// (the branches/chief directorates covering the operational-risk demo data)
// is also still placeholder. Swap any "(placeholder)" name for the real one
// once confirmed; nothing else in the app needs to change when that happens,
// every other file reads this data rather than hardcoding names.
export const ORG_STRUCTURE = [
  {
    branch: "Branch 1 (placeholder)",
    chiefDirectorates: [
      {
        name: "Chief Directorate 1.2 (placeholder)",
        businessUnits: ["Business Unit 1.2.1 (placeholder)", "Business Unit 1.2.2 (placeholder)"]
      },
      {
        // Real chief directorate - confirmed by the client.
        name: "Resource Management",
        businessUnits: ["Human Resource", "Security & Auxiliary Services", "HRD", "DRMC"]
      }
    ]
  },
  {
    branch: "Branch 2 (placeholder)",
    chiefDirectorates: [
      {
        name: "Chief Directorate 2.1 (placeholder)",
        businessUnits: ["Business Unit 2.1.1 (placeholder)", "Business Unit 2.1.2 (placeholder)"]
      }
    ]
  }
]

// Every helper below takes the org structure explicitly (defaulting to the
// static seed) rather than always reading ORG_STRUCTURE directly, so callers
// holding the live, Administrator-editable copy (App.jsx state) get answers
// that reflect actual edits instead of the frozen seed.

// Look up a business unit's parent chief directorate and branch. Risks only ever
// store the business unit name - this is the single source of truth for the
// hierarchy above it, so there's nothing to keep in sync when the org changes.
export function findOrgPath(businessUnit, structure = ORG_STRUCTURE) {
  for (const b of structure) {
    for (const cd of b.chiefDirectorates) {
      if (cd.businessUnits.includes(businessUnit)) {
        return { branch: b.branch, chiefDirectorate: cd.name, businessUnit }
      }
    }
  }
  return { branch: null, chiefDirectorate: null, businessUnit }
}

export function allBusinessUnits(structure = ORG_STRUCTURE) {
  return structure.flatMap(b => b.chiefDirectorates.flatMap(cd => cd.businessUnits))
}

export function allChiefDirectorates(structure = ORG_STRUCTURE) {
  return structure.flatMap(b => b.chiefDirectorates.map(cd => cd.name))
}

export function chiefDirectoratesInBranch(branchName, structure = ORG_STRUCTURE) {
  const b = structure.find(b => b.branch === branchName)
  return b ? b.chiefDirectorates.map(cd => cd.name) : allChiefDirectorates(structure)
}

export function businessUnitsInChiefDirectorate(chiefDirectorateName, structure = ORG_STRUCTURE) {
  for (const b of structure) {
    const cd = b.chiefDirectorates.find(cd => cd.name === chiefDirectorateName)
    if (cd) return cd.businessUnits
  }
  return allBusinessUnits(structure)
}

// Business units don't get system access (licensing) - a Risk Capturer in
// the CRO office captures on their behalf, so it has no fixed org scope of
// its own (it picks a business unit per risk, see RiskFormModal). Director
// sits at the start of the approval chain (owns the action plans, must see
// what's agreed); CRO sits near the end (recommends on Strategic risks,
// acknowledges and is terminal on every other type) - it is a fresh role,
// not a revival of the "cro" key this app used before the five-role rebuild
// (that one was renamed to "hod" and still means something different).
// `stage` is this role's key in the per-risk approval chain (see
// utils/approvalChain.js), or null for roles that don't approve.
export const ROLES = {
  riskcapturer: { label: "Risk Capturer", stage: null },
  director: { label: "Director", stage: "director" },
  chiefdirector: { label: "Chief Director", stage: "chiefdirector" },
  ddg: { label: "DDG", stage: "ddg" },
  cro: { label: "CRO", stage: "cro" },
  hod: { label: "HOD", stage: "hod" },
  administrator: { label: "Administrator", stage: null }
}

// One named demo persona per role. Distinct names (not one shared identity
// relabeled) so a demo doesn't show one person approving their own
// submission as they switch roles. Director and Chief Director sit in the
// real Resource Management chief directorate so the main demo thread walks
// through real EGOV names.
export const ROLE_PERSONAS = {
  riskcapturer: { name: "Freddy Mahlangu" },
  director: { name: "Lindiwe Ngwenya", businessUnit: "Human Resource" },
  chiefdirector: { name: "Nomvula Khumalo", chiefDirectorate: "Resource Management" },
  ddg: { name: "Sipho Radebe" },
  cro: { name: "Palesa Mokoena" },
  hod: { name: "Zanele Dube" },
  administrator: { name: "Thabo Sithole" }
}
