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

// The five roles from the SCM Procurement Plan manual, mapped onto the risk
// register per the client's change spec. `stage` is this role's key in
// APPROVAL_CHAIN, or null for roles that don't approve (capture / admin).
export const ROLES = {
  businessunit: { label: "Business Unit", stage: null },
  chiefdirector: { label: "Chief Director", stage: "chiefdirector" },
  ddg: { label: "DDG", stage: "ddg" },
  hod: { label: "HOD", stage: "hod" },
  administrator: { label: "Administrator", stage: null }
}

// Stage order a submission moves through after a Business Unit submits it.
// An ordered list (not hardcoded per-stage branches elsewhere) so inserting a
// compliance-review stage later, if the client asks for one, is one line here
// plus a persona - not a rewrite of the approval logic.
export const APPROVAL_CHAIN = ["chiefdirector", "ddg", "hod"]

// One named demo persona per role. Distinct names (not one shared identity
// relabeled) so a demo doesn't show one person approving their own
// submission as they switch roles. Business Unit and Chief Director sit in
// the real Resource Management chief directorate so the main demo thread
// (capture -> Chief Director -> DDG -> HOD) walks through real EGOV names.
export const ROLE_PERSONAS = {
  businessunit: { name: "Freddy Mahlangu", businessUnit: "Human Resource" },
  chiefdirector: { name: "Nomvula Khumalo", chiefDirectorate: "Resource Management" },
  ddg: { name: "Sipho Radebe" },
  hod: { name: "Zanele Dube" },
  administrator: { name: "Thabo Sithole" }
}
