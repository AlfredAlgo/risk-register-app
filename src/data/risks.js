export const CATEGORIES = [
  "Project and programme management", "ICT infrastructure", "Compliance",
  "Financial management", "Human resources", "Service delivery", "Governance"
]

export const RESPONSES = ["Mitigate", "Accept", "Transfer", "Avoid"]

export const OUTCOMES = [
  "Modernised provincial ICT infrastructure and connectivity",
  "Improved risk and governance maturity across departments"
]

const OPS_BU1 = "Business Unit 1.2.1 (placeholder)"
const OPS_BU2 = "Business Unit 1.2.2 (placeholder)"
const OPS_BU3 = "Business Unit 2.1.1 (placeholder)"
const OPS_BU4 = "Business Unit 2.1.2 (placeholder)"

// Real EGOV business units under the confirmed "Resource Management" chief
// directorate (see data/orgStructure.js).
const BU_HR = "Human Resource"
const BU_SECURITY = "Security & Auxiliary Services"
const BU_HRD = "HRD"
const BU_DRMC = "DRMC"

export const RISKS = [
  {
    riskType: "Operational",
    outcome: "Modernised provincial ICT infrastructure and connectivity",
    nr: 1, businessUnit: OPS_BU1, category: "Project and programme management",
    risk: "Failure to modernise and innovate infrastructure services",
    rootCauses: [
      { category: "Process", text: "Lack of asset lifecycle and equipment management" },
      { category: "Process", text: "Failure to procure current/up to date equipment" },
      { category: "Process", text: "Insufficient budget/funding to replace obsolete equipment" }
    ],
    controls: [
      { category: "Preventive", text: "Lifecycle roadmaps on Microsoft products" },
      { category: "Preventive", text: "Asset register" },
      { category: "Preventive", text: "Asset management policy" },
      { category: "Preventive", text: "e-Waste policy" }
    ],
    consequences: ["Continued service outages and rising maintenance costs on end-of-life equipment; potential non-compliance with GPG server standards."],
    irLikelihood: 5, irImpact: 5, rrLikelihood: 3, rrImpact: 5,
    ir: 25, rr: 15, response: "Mitigate",
    actionPlan: [
      { plan: "Allocate a portion of the budget to the replacement of capital equipment.", progress: "An amount of R241M has been allocated to networking equipment.", target: "2027/2028 FY", status: "atrisk" },
      { plan: "Develop a standard for computer operating systems (N-1).", progress: "The OS (N-1) is incorporated on the GPG server standard.", target: "31 Dec 2026", status: "atrisk" },
      { plan: "Contribute to the review of the asset management policy.", progress: "Asset management policy was reviewed.", target: "15 Feb 2027", status: "implemented" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU1, responsiblePersons: ["Acting DDG: ICT — Mr L. Canca"] },
    targetDate: "31 Jul 2026", status: "amber", progressPct: 55,
    assessmentDate: "2026-05-14",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h1-1", timestamp: "2026-02-10T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h1-2", timestamp: "2026-02-12T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "proposed", summary: "Submitted for approval." },
      { id: "h1-3", timestamp: "2026-02-14T10:00:00.000Z", actor: "Chief Director", actorRole: "chiefdirector", action: "approved", summary: "Authorised — moved to DDG." },
      { id: "h1-4", timestamp: "2026-02-18T10:00:00.000Z", actor: "DDG", actorRole: "ddg", action: "approved", summary: "Authorised — moved to HOD." },
      { id: "h1-5", timestamp: "2026-05-14T11:30:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved and applied to the register.", diff: [
        { field: "Residual risk (RR)", label: "Residual risk (RR)", before: "18", after: "15" },
        { field: "progressPct", label: "Overall progress", before: "40%", after: "55%" }
      ] }
    ],
    scoreHistory: [
      { date: "2026-02-10", ir: 25, rr: 20 },
      { date: "2026-04-01", ir: 25, rr: 18 },
      { date: "2026-05-14", ir: 25, rr: 15 }
    ],
    comments: [],
    pendingChange: null,
    kriToleranceStatement: "The department has a low–medium risk tolerance for delays in the roll out of GPN targets.",
    kriSummary: "Based on Q1 performance, the planned targets for the roll out of GPN were not achieved due to long lead times on wayleave applications and failed sites. The acceptable threshold has therefore been exceeded, which poses high risk, with the exception of KRI 3 (number of sites provided with VoIP) which is planned for Q2 & Q3. Management should explore and implement solutions to mitigate the delays; risk exposure should be monitored over subsequent quarters.",
    kris: [
      {
        id: "kri1-1", indicator: "Number of sites provided with WAN (160)", quarterlyTarget: "40",
        thresholds: { baseline: "100% achievement per quarter", low: "98%", medium: "90 – 97%", high: "80 - 89%", veryHigh: "<80%" },
        results: [
          { id: "kri1-1r1", period: "April 2026", value: "5%", band: "veryHigh" },
          { id: "kri1-1r2", period: "May 2026", value: "12.5%", band: "veryHigh" },
          { id: "kri1-1r3", period: "June 2026", value: "32.5%", band: "veryHigh" }
        ]
      },
      {
        id: "kri1-2", indicator: "Number of sites provided with LAN (120)", quarterlyTarget: "30",
        thresholds: { baseline: "100% achievement per quarter", low: "98%", medium: "90 – 97%", high: "80 - 89%", veryHigh: "<80%" },
        results: [
          { id: "kri1-2r1", period: "April 2026", value: "10%", band: "veryHigh" },
          { id: "kri1-2r2", period: "May 2026", value: "6.67%", band: "veryHigh" },
          { id: "kri1-2r3", period: "June 2026", value: "30%", band: "veryHigh" }
        ]
      },
      {
        id: "kri1-3", indicator: "Number of sites provided with VoIP (100) — planned Q2 & Q3", quarterlyTarget: "50",
        thresholds: { baseline: "100% achievement per quarter", low: "98%", medium: "90 – 97%", high: "80 - 89%", veryHigh: "<80%" },
        results: [
          { id: "kri1-3r1", period: "April 2026", value: "Not yet started (planned Q2/Q3)", band: "baseline" }
        ]
      },
      {
        id: "kri1-4", indicator: "Number of Wi-Fi hotspots provided (150) — Q2 to Q4", quarterlyTarget: "50",
        thresholds: { baseline: "100% achievement per quarter", low: "98%", medium: "90 – 97%", high: "80 - 89%", veryHigh: "<80%" },
        results: [
          { id: "kri1-4r1", period: "April 2026", value: "2%", band: "veryHigh" },
          { id: "kri1-4r2", period: "May 2026", value: "10%", band: "veryHigh" },
          { id: "kri1-4r3", period: "June 2026", value: "34%", band: "veryHigh" }
        ]
      }
    ]
  },
  {
    riskType: "Operational",
    outcome: "Modernised provincial ICT infrastructure and connectivity",
    nr: 2, businessUnit: OPS_BU2, category: "ICT infrastructure",
    risk: "Network downtime at facility level affecting service delivery",
    rootCauses: [
      { category: "Systems", text: "Ageing switches at clinic sites" },
      { category: "Systems", text: "No redundant links at priority facilities" }
    ],
    controls: [
      { category: "Preventive", text: "GPN service level agreement" },
      { category: "Preventive", text: "Incident management process" }
    ],
    consequences: ["Service delivery disruption at affected facilities; reputational damage and citizen complaints."],
    irLikelihood: 4, irImpact: 5, rrLikelihood: 3, rrImpact: 4,
    ir: 20, rr: 12, response: "Mitigate",
    actionPlan: [
      { plan: "Prioritise GPN link replacement at top 20 facilities.", progress: "8 of 20 sites completed.", target: "25 Sep 2026", status: "atrisk" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU2, responsiblePersons: ["Chief Director: Infrastructure — Mr M. Ludwig"] },
    targetDate: "30 Nov 2026", status: "green", progressPct: 40,
    assessmentDate: "2026-06-02",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h2-1", timestamp: "2026-03-01T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h2-2", timestamp: "2026-06-02T10:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved after site rollout progress review." }
    ],
    scoreHistory: [
      { date: "2026-03-01", ir: 20, rr: 16 },
      { date: "2026-06-02", ir: 20, rr: 12 }
    ],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Improved risk and governance maturity across departments",
    nr: 3, businessUnit: OPS_BU1, category: "Compliance",
    risk: "Departmental risk registers maintained manually outside BarnOwl",
    rootCauses: [
      { category: "Process", text: "Only one BarnOwl licence per department" },
      { category: "Process", text: "Managers without licences default to spreadsheets" },
      { category: "Process", text: "No single source of truth for risk status" }
    ],
    controls: [
      { category: "Preventive", text: "Manual risk register templates" },
      { category: "Preventive", text: "Quarterly risk committee review" }
    ],
    consequences: ["Inconsistent risk visibility across the department; risks going unreported until they materialise."],
    irLikelihood: 4, irImpact: 4, rrLikelihood: 3, rrImpact: 3,
    ir: 16, rr: 9, response: "Mitigate",
    actionPlan: [
      { plan: "Roll out the new risk register system to unlicensed managers.", progress: "Prototype in review with the business unit.", target: "31 Mar 2027", status: "inprogress" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU1, responsiblePersons: ["Business Unit lead"] },
    targetDate: "31 Mar 2027", status: "green", progressPct: 20,
    assessmentDate: "2026-04-21",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h3-1", timestamp: "2026-01-15T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h3-2", timestamp: "2026-04-21T09:30:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved at Q4 risk committee review." }
    ],
    scoreHistory: [
      { date: "2026-01-15", ir: 16, rr: 12 },
      { date: "2026-04-21", ir: 16, rr: 9 }
    ],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Improved risk and governance maturity across departments",
    nr: 4, businessUnit: OPS_BU3, category: "Financial management",
    risk: "Delayed reporting of emerging risks to the HOD",
    rootCauses: [
      { category: "Process", text: "No formal escalation route for business units" },
      { category: "Process", text: "Risk assessments requested ad hoc" }
    ],
    controls: [
      { category: "Preventive", text: "Risk assessment request form (manual)" }
    ],
    consequences: ["Risks reach the HOD's office too late for proactive mitigation; audit findings on reporting timeliness."],
    irLikelihood: 4, irImpact: 3, rrLikelihood: 4, rrImpact: 2,
    ir: 12, rr: 8, response: "Accept",
    actionPlan: [
      { plan: "Introduce a standard request-for-assessment workflow.", progress: "Workflow mapped; system build in progress.", target: "20 Aug 2026", status: "overdue" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU3, responsiblePersons: ["Risk Champion"] },
    targetDate: "28 Feb 2027", status: "red", progressPct: 10,
    assessmentDate: "2026-07-09",
    approvalStatus: "Changes Required", approvalStage: null,
    history: [
      { id: "h4-1", timestamp: "2026-05-01T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h4-2", timestamp: "2026-07-09T15:15:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "proposed", summary: "Submitted for approval." },
      { id: "h4-3", timestamp: "2026-07-15T09:30:00.000Z", actor: "Chief Director", actorRole: "chiefdirector", action: "changes-requested", summary: "Requested changes: target date has slipped twice — please confirm a realistic build date and update the action plan before resubmitting." }
    ],
    scoreHistory: [
      { date: "2026-05-01", ir: 12, rr: 10 },
      { date: "2026-07-09", ir: 12, rr: 8 }
    ],
    comments: [],
    pendingChange: {
      submittedBy: "Business Unit lead", submittedByRole: "businessunit", submittedAt: "2026-07-09T15:15:00.000Z",
      data: {
        riskType: "Operational",
        outcome: "Improved risk and governance maturity across departments",
        businessUnit: OPS_BU3, category: "Financial management",
        risk: "Delayed reporting of emerging risks to the HOD",
        rootCauses: [
      { category: "Process", text: "No formal escalation route for business units" },
      { category: "Process", text: "Risk assessments requested ad hoc" }
    ],
        controls: [
      { category: "Preventive", text: "Risk assessment request form (manual)" }
    ],
        consequences: ["Risks reach the HOD's office too late for proactive mitigation; audit findings on reporting timeliness."],
        irLikelihood: 4, irImpact: 3, rrLikelihood: 4, rrImpact: 2, ir: 12, rr: 8, response: "Accept",
        actionPlan: [{ plan: "Introduce a standard request-for-assessment workflow.", progress: "Workflow mapped; system build in progress.", target: "20 Aug 2026", status: "overdue" }],
        act: "", provisionReference: "",
        ownership: { accountableUnit: OPS_BU3, responsiblePersons: ["Risk Champion"] },
        targetDate: "28 Feb 2027", status: "red", progressPct: 10, assessmentDate: "2026-07-09"
      }
    }
  },

  // --- Compliance risks, from the client's real 2025/26 Compliance Risk
  // Management Plan (Q4), all under the confirmed "Resource Management"
  // chief directorate. Root causes/controls are trimmed for length in a few
  // places but the content is the client's own, not invented.
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 5, businessUnit: BU_HR, category: "Compliance",
    risk: "Non-compliance to the Occupational Health, Safety Act and Covid-19 regulations",
    rootCauses: [
      { category: "Process", text: "Building inspections not documented" },
      { category: "Process", text: "Lack of monitoring of the OHS risk register" },
      { category: "Process", text: "Emergency drill not conducted due representatives not accepting appointments" },
      { category: "Process", text: "Lack of awareness on emergency evacuation processes" },
      { category: "Process", text: "Nominated officials not accepting appointment letters after training has been provided" },
      { category: "People", text: "Officials not accepting nomination for OHS as they are working from home" }
    ],
    controls: [
      { category: "Directive", text: "SHEQ Policy" },
      { category: "Preventive", text: "OHS Committee" },
      { category: "Directive", text: "Occupational Health and Safety Committee charter" },
      { category: "Preventive", text: "OHS compliance checklist" },
      { category: "Preventive", text: "Awareness on health and safety measures" },
      { category: "Preventive", text: "Scheduled/unscheduled Department of Labour inspections" },
      { category: "Preventive", text: "DID conducts a health risk assessment (bi-annual)" },
      { category: "Detective", text: "Incident reporting" },
      { category: "Detective", text: "Injury on duty report" },
      { category: "Preventive", text: "Departmental OHS risk register" },
      { category: "Preventive", text: "Assembly points" },
      { category: "Preventive", text: "Monthly inspections" },
      { category: "Preventive", text: "Emergency evacuation plan" },
      { category: "Preventive", text: "Continuous training of OHS representatives" }
    ],
    consequences: ["Injury on duty, regulatory penalties, and reputational harm if an incident occurs during an unaddressed hazard."],
    irLikelihood: 5, irImpact: 5, rrLikelihood: 2, rrImpact: 5,
    ir: 25, rr: 10, response: "Mitigate",
    actionPlan: [
      { plan: "Conduct inspections to identify hazards.", progress: "Weekly inspections were carried out during the fourth quarter, tabled in the weekly inspection presentation and communicated to relevant stakeholders for corrective measures. Inspections are also conducted at the new building and reported to the Wellness and OHS relocation committee.", target: "Monthly", status: "inprogress" }
    ],
    act: "Occupational Health and Safety Act, 1995 (incl. Covid-19 Health and Safety Directions)",
    provisionReference: "Section 8(1) of the OHS Act — every employer shall provide and maintain, as far as is reasonably practicable, a working environment that is safe and without risk to the health of his employees.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management (Ms Nomsa Makhubele)", "Director: Human Resource"] },
    targetDate: "Monthly", status: "green", progressPct: 70,
    assessmentDate: "2026-04-10",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h5-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Director: Human Resource", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h5-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q4 progress reviewed and approved." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 25, rr: 15 },
      { date: "2026-04-10", ir: 25, rr: 10 }
    ],
    comments: [],
    pendingChange: null,
    kriToleranceStatement: "The Gauteng Department of e-Government strives to maintain a moderate tolerance level for late reporting of Injury on Duty claims.",
    kriSummary: "IoD claims were reported within the moderate tolerance threshold throughout Q1. Continue monitoring reporting timelines to the Compensation Commissioner.",
    kris: [
      {
        id: "kri5-1", indicator: "% of IoD liabilities reported late to the Compensation Commissioner", quarterlyTarget: "90%",
        thresholds: { baseline: "90%", low: "90%", medium: "85%-89%", high: "80%-85%", veryHigh: "<70%" },
        results: [
          { id: "kri5-1r1", period: "April 2026", value: "98%", band: "baseline" },
          { id: "kri5-1r2", period: "May 2026", value: "90%", band: "baseline" },
          { id: "kri5-1r3", period: "June 2026", value: "100%", band: "baseline" }
        ]
      }
    ]
  },
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 6, businessUnit: BU_SECURITY, category: "Compliance",
    risk: "Poor maintenance programme on specific building's systems & programs",
    rootCauses: [
      { category: "Process", text: "HVAC: Terms of Reference (ToR) for Imbumba House not aligned to current challenges" },
      { category: "Process", text: "Non-active participation/engagement of Imbumba House's HVAC artisans by GDID, leading to partial or no supervision of the contractor" },
      { category: "Process", text: "Performance evaluation of the appointed service provider is not administratively structured" },
      { category: "Process", text: "No Integrated Building HVAC Monitoring & Management System" },
      { category: "Process", text: "Ageing water system & plumbing infrastructure" },
      { category: "Process", text: "General maintenance ToR not aligned to current challenges" },
      { category: "Process", text: "Timeous appointment of the service provider by GDID" },
      { category: "Process", text: "Maintenance of the fire equipment & suppression system similarly affected" }
    ],
    controls: [
      { category: "Preventive", text: "Weekly update meetings between GDID, e-Gov and GPT with written reports" },
      { category: "Preventive", text: "e-Gov's HVAC artisans tasked with operational oversight" },
      { category: "Preventive", text: "On-site HVAC technicians from the appointed service provider always on site" },
      { category: "Preventive", text: "Department has appointed its own service provider to assess, install and maintain the Integrated Building HVAC Monitoring & Management System for the 6th floor server room" },
      { category: "Preventive", text: "Scheduled weekly inter-departmental meetings on water system & plumbing, with minutes and action plans" },
      { category: "Preventive", text: "Maintenance & repairs programme" },
      { category: "Preventive", text: "Weekly OHS inspections (e-Government and GPT) for building-related deficiencies with OHSA/SANS/ISO implications" }
    ],
    consequences: ["Building systems failure affecting server room cooling and staff working conditions; costly emergency repairs."],
    irLikelihood: 5, irImpact: 5, rrLikelihood: 2, rrImpact: 5,
    ir: 25, rr: 10, response: "Mitigate",
    actionPlan: [
      { plan: "Obtain the Terms of Reference currently used for the scheduled maintenance of Imbumba House's HVAC system.", progress: "DID is still reviewing the ToR to align it with current challenges; the aim is a ToR that is responsive to the building's current ventilation architecture.", target: "30 Sep 2025", status: "atrisk" }
    ],
    act: "Occupational Health and Safety Act, 1995 (incl. Covid-19 Health and Safety Directions)",
    provisionReference: "Section 8(1) of the OHS Act — every employer shall provide and maintain, as far as is reasonably practicable, a working environment that is safe and without risk to the health of his employees.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management", "Director: Security & Auxiliary Services"] },
    targetDate: "30 Sep 2025", status: "amber", progressPct: 35,
    assessmentDate: "2026-04-10",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h6-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Director: Security & Auxiliary Services", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h6-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q4 progress reviewed and approved." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 25, rr: 15 },
      { date: "2026-04-10", ir: 25, rr: 10 }
    ],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 7, businessUnit: BU_HR, category: "Compliance",
    risk: "Non-compliance to leave management processes",
    rootCauses: [
      { category: "Process", text: "Late application of leave by officials" },
      { category: "Process", text: "Late approval of leave by line managers" },
      { category: "Process", text: "Lack of consequence management" },
      { category: "Process", text: "Lack of discussion between manager and applicant prior to applying for leave" },
      { category: "Process", text: "Disputes between officials and line managers" },
      { category: "Process", text: "Poor management of leave by line managers" },
      { category: "Systems", text: "Delayed update of transactions on SAP-ERP" },
      { category: "Systems", text: "Interface issues between SAP and PERSAL" },
      { category: "Process", text: "HR not informed of changes in reporting lines" },
      { category: "Process", text: "Inability to receive notifications to change passwords for officials working remotely" },
      { category: "Process", text: "Inaccurate leave statistics generated by the system (duplications)" }
    ],
    controls: [
      { category: "Directive", text: "Leave Policy and DPSA leave directive" },
      { category: "Preventive", text: "Application of vacation and emergency leave before first day of absence" },
      { category: "Preventive", text: "Approval of leave within 2 days of application" },
      { category: "Preventive", text: "Awareness on leave application and approval process" },
      { category: "Preventive", text: "Manual leave forms (for ESS downtime and employees who can't apply on ESS)" },
      { category: "Detective", text: "Monthly non-compliance reports" },
      { category: "Preventive", text: "Induction of newly appointed officials on leave management" },
      { category: "Preventive", text: "Discussion between line manager and applicant before leave is applied for" },
      { category: "Corrective", text: "Escalation to HR/labour relations" },
      { category: "Preventive", text: "Utilisation of the ESS app to apply for leave" },
      { category: "Detective", text: "Monthly interface reports (PERSAL and SAP)" }
    ],
    consequences: ["Inaccurate leave liability on the books; unfair treatment of staff and possible labour disputes."],
    irLikelihood: 5, irImpact: 5, rrLikelihood: 1, rrImpact: 4,
    ir: 25, rr: 4, response: "Mitigate",
    actionPlan: [
      { plan: "Escalate any non-compliance and implement consequence management to heads of the branches.", progress: "Outstanding leave items report submitted weekly to managers. Non-compliance for March 2026: Application = 4.04%, Approval = 8.72%.", target: "As and when non-compliance is identified", status: "atrisk" }
    ],
    act: "Public Service Act / Public Service Regulations",
    provisionReference: "PSR 48 — a head of department shall (a) encourage an employee to fully utilise their annual leave entitlement in the leave cycle; (b) ensure that all leave taken is recorded accurately and in full; and (c) ensure that an employee does not abuse sick leave.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management"] },
    targetDate: "As and when non-compliance is identified", status: "amber", progressPct: 60,
    assessmentDate: "2026-08-20",
    approvalStatus: "Submitted", approvalStage: "chiefdirector",
    history: [
      { id: "h7-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Freddy Mahlangu", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h7-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q3 progress reviewed and approved." },
      { id: "h7-3", timestamp: "2026-08-20T10:15:00.000Z", actor: "Freddy Mahlangu", actorRole: "businessunit", action: "proposed", summary: "Submitted Q4 progress update for approval." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 25, rr: 8 },
      { date: "2026-04-10", ir: 25, rr: 4 }
    ],
    comments: [
      { id: "c7-1", author: "Nomvula Khumalo", role: "chiefdirector", text: "Please include the interface-error rate between SAP and PERSAL in next quarter's progress note — it keeps coming up as a root cause.", timestamp: "2026-08-21T08:00:00.000Z" }
    ],
    pendingChange: {
      submittedBy: "Freddy Mahlangu", submittedByRole: "businessunit", submittedAt: "2026-08-20T10:15:00.000Z",
      data: {
        riskType: "Compliance",
        outcome: "Improved risk and governance maturity across departments",
        businessUnit: BU_HR, category: "Compliance",
        risk: "Non-compliance to leave management processes",
        rootCauses: [
      { category: "Process", text: "Late application of leave by officials" },
      { category: "Process", text: "Late approval of leave by line managers" },
      { category: "Process", text: "Lack of consequence management" },
      { category: "Process", text: "Lack of discussion between manager and applicant prior to applying for leave" },
      { category: "Process", text: "Disputes between officials and line managers" },
      { category: "Process", text: "Poor management of leave by line managers" },
      { category: "Systems", text: "Delayed update of transactions on SAP-ERP" },
      { category: "Systems", text: "Interface issues between SAP and PERSAL" },
      { category: "Process", text: "HR not informed of changes in reporting lines" },
      { category: "Process", text: "Inability to receive notifications to change passwords for officials working remotely" },
      { category: "Process", text: "Inaccurate leave statistics generated by the system (duplications)" }
    ],
        controls: [
      { category: "Directive", text: "Leave Policy and DPSA leave directive" },
      { category: "Preventive", text: "Application of vacation and emergency leave before first day of absence" },
      { category: "Preventive", text: "Approval of leave within 2 days of application" },
      { category: "Preventive", text: "Awareness on leave application and approval process" },
      { category: "Preventive", text: "Manual leave forms (for ESS downtime and employees who can't apply on ESS)" },
      { category: "Detective", text: "Monthly non-compliance reports" },
      { category: "Preventive", text: "Induction of newly appointed officials on leave management" },
      { category: "Preventive", text: "Discussion between line manager and applicant before leave is applied for" },
      { category: "Corrective", text: "Escalation to HR/labour relations" },
      { category: "Preventive", text: "Utilisation of the ESS app to apply for leave" },
      { category: "Detective", text: "Monthly interface reports (PERSAL and SAP)" }
    ],
        consequences: ["Inaccurate leave liability on the books; unfair treatment of staff and possible labour disputes."],
        irLikelihood: 5, irImpact: 5, rrLikelihood: 1, rrImpact: 4, ir: 25, rr: 4, response: "Mitigate",
        actionPlan: [
          { plan: "Escalate any non-compliance and implement consequence management to heads of the branches.", progress: "Outstanding leave items report submitted weekly to managers. Non-compliance for March 2026: Application = 4.04%, Approval = 8.72%. SAP/PERSAL interface error rate now tracked weekly alongside the leave report.", target: "As and when non-compliance is identified", status: "atrisk" }
        ],
        act: "Public Service Act / Public Service Regulations",
        provisionReference: "PSR 48 — a head of department shall (a) encourage an employee to fully utilise their annual leave entitlement in the leave cycle; (b) ensure that all leave taken is recorded accurately and in full; and (c) ensure that an employee does not abuse sick leave.",
        ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management"] },
        targetDate: "As and when non-compliance is identified", status: "amber", progressPct: 65, assessmentDate: "2026-08-20"
      }
    },
    kriToleranceStatement: "The department maintains a low tolerance for leave transactions processed outside the prescribed legislated timeframes.",
    kriSummary: "Leave transactions that were approved outside the prescribed period throughout Q1 fall within the 10% baseline. As the risk is inherent, employees and supervisors should continue to adhere to the stipulated leave procedures in terms of application and approval respectively. From a control perspective, HR should continue to conduct workshops on the leave management policy and issue communiques on reporting lines.",
    kris: [
      {
        id: "kri7-1", indicator: "% of leave applications approved outside legislated period (2 days)", quarterlyTarget: "10%",
        thresholds: { baseline: "10%", low: "10%-20%", medium: "20%-30%", high: "30%-40%", veryHigh: ">40%" },
        results: [
          { id: "kri7-1r1", period: "April 2026", value: "8.87%", band: "baseline" },
          { id: "kri7-1r2", period: "May 2026", value: "6.77%", band: "baseline" },
          { id: "kri7-1r3", period: "June 2026", value: "9.33%", band: "baseline" }
        ]
      },
      {
        id: "kri7-2", indicator: "% of annual leave applied for after it's taken due to unforeseen circumstances", quarterlyTarget: "5%",
        thresholds: { baseline: "5%", low: "5%", medium: "6%-9%", high: "10%-15%", veryHigh: ">15%" },
        results: [
          { id: "kri7-2r1", period: "April 2026", value: "7.58%", band: "medium" },
          { id: "kri7-2r2", period: "May 2026", value: "4.90%", band: "baseline" },
          { id: "kri7-2r3", period: "June 2026", value: "4.00%", band: "baseline" }
        ]
      }
    ]
  },
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 8, businessUnit: BU_SECURITY, category: "Compliance",
    risk: "Security breaches / criminal elements",
    rootCauses: [
      { category: "Process", text: "No security committee (statutory requirement)" },
      { category: "Process", text: "Administrative misalignment to security prescripts" },
      { category: "Process", text: "Security charter not approved" },
      { category: "Process", text: "Ineffective Security Access & Egress Control System (ESAECS) at Imbumba House" },
      { category: "Process", text: "Old hardware, including outdated operating system (Impro IXP 400)" },
      { category: "Process", text: "Inadequate budget allocation for a specific FY/MTEF" },
      { category: "Process", text: "Limited technical skill from technical personnel within the directorate" },
      { category: "People", text: "Opportunistic criminal situations by officials and consultants/contractors" },
      { category: "People", text: "Social & human factors (negligence)" },
      { category: "Process", text: "Lack of security aids, including physical security officers" }
    ],
    controls: [
      { category: "Directive", text: "Security Policy" },
      { category: "Preventive", text: "Scheduled committee meetings" },
      { category: "Preventive", text: "Security structure, with the appointment of a Chief Security officer for the security programme" },
      { category: "Preventive", text: "Access and egress control measures" },
      { category: "Preventive", text: "Deployment of physical security officers at the main entrance zone" },
      { category: "Preventive", text: "3 security system specialists" },
      { category: "Preventive", text: "Roller shutter door and communique" },
      { category: "Preventive", text: "Training and empowerment of security officials" },
      { category: "Preventive", text: "Security awareness maintained within the building" },
      { category: "Preventive", text: "Security sensitisation of all employees" },
      { category: "Preventive", text: "Line supervisory oversight of policy implementation" },
      { category: "Preventive", text: "Security scanners, physical security officers, CCTV systems and patrols" }
    ],
    consequences: ["Unauthorised access to the building and its systems; loss or damage to departmental assets."],
    irLikelihood: 5, irImpact: 5, rrLikelihood: 2, rrImpact: 5,
    ir: 25, rr: 10, response: "Mitigate",
    actionPlan: [
      { plan: "Procurement and installation of a new, modern Integrated ESAECS.", progress: "A service provider has been appointed, and cables have been laid from the server room on the sixth floor to the ground floor and the basement.", target: "30 Jun 2025", status: "atrisk" }
    ],
    act: "Minimum Information Security Standards",
    provisionReference: "Chapter 9 — heads of security, or those tasked with the security responsibility of an institution, must report all instances of a breach of security; breaches must be dealt with using the highest degree of confidentiality.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management", "Director: Security & Auxiliary Services"] },
    targetDate: "30 Jun 2025", status: "amber", progressPct: 45,
    assessmentDate: "2026-04-10",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h8-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Director: Security & Auxiliary Services", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h8-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q4 progress reviewed and approved." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 25, rr: 15 },
      { date: "2026-04-10", ir: 25, rr: 10 }
    ],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 9, businessUnit: BU_HRD, category: "Compliance",
    risk: "Ineffective performance management processes",
    rootCauses: [
      { category: "Process", text: "Late submission of performance contracts" },
      { category: "Process", text: "Late submission of performance reviews and assessments" },
      { category: "External", text: "Amendment of submission date by DPSA/Circular 07 of 2024" }
    ],
    controls: [
      { category: "Directive", text: "Performance Management Development System (PMDS) policy" },
      { category: "Preventive", text: "Intermediate Reviews Committee (IRC)" },
      { category: "Preventive", text: "Departmental Moderation Committee (DMC)" },
      { category: "Preventive", text: "Appeals Committee" },
      { category: "Directive", text: "Communiques and reminders to officials" }
    ],
    consequences: ["Non-compliance with DPSA PMDS timelines; performance bonuses and consequence management decisions made on incomplete records."],
    irLikelihood: 4, irImpact: 5, rrLikelihood: 2, rrImpact: 4,
    ir: 20, rr: 8, response: "Mitigate",
    actionPlan: [
      { plan: "Escalation to the supervisor and official.", progress: "Emails sent to officials and managers who have not yet completed their Performance Agreements for the 2025/26 FY.", target: "As and when non-compliance is identified", status: "atrisk" }
    ],
    act: "Determination and Directive on the Performance Management and Development System (PMDS) for employees other than SMS, w.e.f. 1 April 2018 (Public Service Act, 103 of 1994)",
    provisionReference: "S7.2 — all employees shall conclude and sign their Performance Agreements (PAs) on or before 31 May of each financial year; mid-year reviews and annual assessments are compulsory and must be in writing.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management", "Deputy Director: HRD"] },
    targetDate: "As and when noncompliance is identified", status: "amber", progressPct: 50,
    assessmentDate: "2026-04-10",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h9-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Deputy Director: HRD", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h9-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q4 progress reviewed and approved." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 20, rr: 12 },
      { date: "2026-04-10", ir: 20, rr: 8 }
    ],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Compliance",
    outcome: "Improved risk and governance maturity across departments",
    nr: 10, businessUnit: BU_DRMC, category: "Compliance",
    risk: "Loss of documents and records",
    rootCauses: [
      { category: "Process", text: "Unaccounted waybill bags from point of receipt to acknowledgement by DMC" },
      { category: "Systems", text: "Lack of enterprise content management system" },
      { category: "Process", text: "Security systems not activated in records storage areas" },
      { category: "Process", text: "Lack of surveillance cameras in storage areas (CCTV)" },
      { category: "Process", text: "Kodak software does not prompt some users to log in using their PERSAL numbers" },
      { category: "Process", text: "No access control mechanism to DMC" },
      { category: "Systems", text: "Outdated computer equipment" },
      { category: "People", text: "Lack of knowledge on classification of documents" },
      { category: "People", text: "Theft of records and loss of information" },
      { category: "Process", text: "Misfiling of records" },
      { category: "Process", text: "Misrouting of documents at registration" },
      { category: "People", text: "DMC team leader positions vacant for 6 months" }
    ],
    controls: [
      { category: "Preventive", text: "Two RMC officials present when keys are collected and handed to Security" },
      { category: "Preventive", text: "Utilisation of an enterprise content management system for current records" },
      { category: "Preventive", text: "File plan" },
      { category: "Detective", text: "Quality checks by RMC management" },
      { category: "Preventive", text: "Register maintained for outgoing and incoming records" }
    ],
    consequences: ["Inability to produce records for audit or POPIA subject access requests; regulatory penalties."],
    irLikelihood: 4, irImpact: 5, rrLikelihood: 1, rrImpact: 4,
    ir: 20, rr: 4, response: "Mitigate",
    actionPlan: [
      { plan: "Continuous monitoring of controls.", progress: "Controls are monitored on a monthly basis. A business case has been submitted to the ICT Steerco to acquire an electronic records management system, including back-scanning of physical records. Disposal of records is carried out in accordance with policies and procedures governing records management.", target: "Monthly", status: "inprogress" }
    ],
    act: "Protection of Personal Information Act (POPIA), 2013",
    provisionReference: "Condition 7, S19(1)(a,b) of POPIA — a responsible party must ensure the integrity and confidentiality of personal information by taking reasonable measures to prevent loss, damage, unauthorised destruction, access or processing.",
    ownership: { accountableUnit: "Resource Management", responsiblePersons: ["Chief Director: Resource Management (Ms Nomsa Makhubele)", "Director: DRMC"] },
    targetDate: "Monthly", status: "green", progressPct: 65,
    assessmentDate: "2026-04-10",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h10-1", timestamp: "2025-10-01T09:00:00.000Z", actor: "Director: DRMC", actorRole: "businessunit", action: "created", summary: "Compliance risk captured from the 2025/26 Compliance Risk Management Plan." },
      { id: "h10-2", timestamp: "2026-04-10T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — Q4 progress reviewed and approved." }
    ],
    scoreHistory: [
      { date: "2025-10-01", ir: 20, rr: 8 },
      { date: "2026-04-10", ir: 20, rr: 4 }
    ],
    comments: [],
    pendingChange: null
  },

  // --- Dummy demo risks, filling out the still-placeholder branches so
  // there's something to see for every business unit, not just Resource
  // Management. Clearly generic content, not client data.
  {
    riskType: "Operational",
    outcome: "Modernised provincial ICT infrastructure and connectivity",
    nr: 11, businessUnit: OPS_BU2, category: "Service delivery",
    risk: "Backlog in citizen service request resolution",
    rootCauses: [
      { category: "Process", text: "Manual ticket triage" },
      { category: "Process", text: "No SLA tracking dashboard" },
      { category: "Process", text: "Understaffed frontline support team" }
    ],
    controls: [
      { category: "Preventive", text: "Weekly backlog review meeting" },
      { category: "Preventive", text: "Escalation matrix for aged tickets" }
    ],
    consequences: ["Growing citizen dissatisfaction and reputational damage from unresolved service requests."],
    irLikelihood: 4, irImpact: 4, rrLikelihood: 3, rrImpact: 3,
    ir: 16, rr: 9, response: "Mitigate",
    actionPlan: [
      { plan: "Deploy a ticket triage dashboard with SLA ageing indicators.", progress: "Vendor shortlisted; procurement in progress.", target: "30 Nov 2026", status: "atrisk" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU2, responsiblePersons: ["Business Unit lead"] },
    targetDate: "30 Nov 2026", status: "amber", progressPct: 30,
    assessmentDate: "2026-06-15",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h11-1", timestamp: "2026-03-10T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h11-2", timestamp: "2026-06-15T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved." }
    ],
    scoreHistory: [{ date: "2026-03-10", ir: 16, rr: 12 }, { date: "2026-06-15", ir: 16, rr: 9 }],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Improved risk and governance maturity across departments",
    nr: 12, businessUnit: OPS_BU4, category: "Human resources",
    risk: "High staff turnover in critical support roles",
    rootCauses: [
      { category: "External", text: "Non-competitive scarce-skills allowance" },
      { category: "People", text: "Limited internal career progression pathways" }
    ],
    controls: [
      { category: "Preventive", text: "Exit interview process" },
      { category: "Preventive", text: "Quarterly retention risk review" }
    ],
    consequences: ["Loss of institutional knowledge and continuity risk in critical support functions."],
    irLikelihood: 3, irImpact: 4, rrLikelihood: 2, rrImpact: 4,
    ir: 12, rr: 8, response: "Mitigate",
    actionPlan: [
      { plan: "Submit a scarce-skills allowance business case to HR.", progress: "Draft business case with finance for costing.", target: "31 Jan 2027", status: "atrisk" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU4, responsiblePersons: ["Business Unit lead"] },
    targetDate: "31 Jan 2027", status: "amber", progressPct: 25,
    assessmentDate: "2026-05-20",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h12-1", timestamp: "2026-02-01T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h12-2", timestamp: "2026-05-20T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved." }
    ],
    scoreHistory: [{ date: "2026-02-01", ir: 12, rr: 9 }, { date: "2026-05-20", ir: 12, rr: 8 }],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Improved risk and governance maturity across departments",
    nr: 13, businessUnit: OPS_BU4, category: "Governance",
    risk: "Inconsistent record-keeping of committee resolutions",
    rootCauses: [
      { category: "Process", text: "No standard minute template across committees" },
      { category: "Process", text: "Resolutions tracked in disconnected spreadsheets" }
    ],
    controls: [
      { category: "Preventive", text: "Committee secretariat function" },
      { category: "Preventive", text: "Central resolutions log (manual)" }
    ],
    consequences: ["Committee decisions cannot be reliably tracked or actioned; governance and audit exposure."],
    irLikelihood: 3, irImpact: 3, rrLikelihood: 2, rrImpact: 3,
    ir: 9, rr: 6, response: "Mitigate",
    actionPlan: [
      { plan: "Adopt a standard minute and resolution-tracking template across all committees.", progress: "Template drafted, not yet circulated.", target: "28 Feb 2027", status: "inprogress" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU4, responsiblePersons: ["Business Unit lead"] },
    targetDate: "28 Feb 2027", status: "green", progressPct: 15,
    assessmentDate: new Date().toISOString().slice(0, 10),
    approvalStatus: "Draft", approvalStage: null,
    history: [
      { id: "h13-1", timestamp: "2026-09-01T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured as draft." }
    ],
    scoreHistory: [{ date: "2026-09-01", ir: 9, rr: 6 }],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Modernised provincial ICT infrastructure and connectivity",
    nr: 14, businessUnit: OPS_BU3, category: "ICT infrastructure",
    risk: "Insufficient after-hours IT support coverage",
    rootCauses: [
      { category: "Process", text: "No standby roster outside business hours" },
      { category: "Process", text: "Single point of contact for critical incidents" }
    ],
    controls: [
      { category: "Preventive", text: "Vendor SLA for P1 incidents" },
      { category: "Preventive", text: "On-call escalation to service provider" }
    ],
    consequences: ["Extended downtime for critical incidents outside business hours; breach of internal service expectations."],
    irLikelihood: 3, irImpact: 4, rrLikelihood: 2, rrImpact: 3,
    ir: 12, rr: 6, response: "Transfer",
    actionPlan: [
      { plan: "Establish an internal standby roster to reduce reliance on the vendor for after-hours P2 incidents.", progress: "Roster proposal with union for consultation.", target: "31 Mar 2027", status: "inprogress" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU3, responsiblePersons: ["Risk Champion"] },
    targetDate: "31 Mar 2027", status: "green", progressPct: 20,
    assessmentDate: "2026-06-01",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h14-1", timestamp: "2026-03-01T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h14-2", timestamp: "2026-06-01T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved." }
    ],
    scoreHistory: [{ date: "2026-03-01", ir: 12, rr: 8 }, { date: "2026-06-01", ir: 12, rr: 6 }],
    comments: [],
    pendingChange: null
  },
  {
    riskType: "Operational",
    outcome: "Modernised provincial ICT infrastructure and connectivity",
    nr: 15, businessUnit: OPS_BU1, category: "ICT infrastructure",
    risk: "Inadequate patch management",
    rootCauses: [
      { category: "Systems", text: "Unsupported software and operating systems still in use across the estate" },
      { category: "Process", text: "No standardised patch cycle across all server and endpoint fleets" }
    ],
    controls: [
      { category: "Preventive", text: "GPG patch compliance monitoring" },
      { category: "Detective", text: "Monthly patch compliance reporting" }
    ],
    consequences: ["Increased exposure to known vulnerabilities and potential security incidents on unpatched systems."],
    irLikelihood: 4, irImpact: 5, rrLikelihood: 2, rrImpact: 4,
    ir: 20, rr: 8, response: "Mitigate",
    actionPlan: [
      { plan: "Roll out standardised patch cycles across the server and endpoint fleet, prioritising unsupported operating systems.", progress: "GPG patch compliance holding at 90%-95% through Q1.", target: "31 Mar 2027", status: "inprogress" }
    ],
    act: "", provisionReference: "",
    ownership: { accountableUnit: OPS_BU1, responsiblePersons: ["Acting DDG: ICT — Mr L. Canca"] },
    targetDate: "31 Mar 2027", status: "amber", progressPct: 45,
    assessmentDate: "2026-06-15",
    approvalStatus: "Approved", approvalStage: null,
    history: [
      { id: "h15-1", timestamp: "2026-03-10T09:00:00.000Z", actor: "Business Unit lead", actorRole: "businessunit", action: "created", summary: "Risk captured for the business unit." },
      { id: "h15-2", timestamp: "2026-06-15T09:00:00.000Z", actor: "HOD", actorRole: "hod", action: "approved", summary: "Authorised — approved after Q1 patch compliance review." }
    ],
    scoreHistory: [{ date: "2026-03-10", ir: 20, rr: 12 }, { date: "2026-06-15", ir: 20, rr: 8 }],
    comments: [],
    pendingChange: null,
    kriToleranceStatement: "Low risk tolerance for inadequate patch management due to unsupported softwares and operating systems.",
    kriSummary: "The risk of inadequate patch management is within the acceptable thresholds. Management should continue monitoring controls related to patch management.",
    kris: [
      {
        id: "kri15-1", indicator: "Percentage of compliance to patch management (eGov)", quarterlyTarget: "100%",
        thresholds: { baseline: "100%", low: "80% - 90%", medium: "-", high: "-", veryHigh: "<80%" },
        results: [
          { id: "kri15-1r1", period: "April 2026", value: "GPG Patch compliance is at 90%-95%", band: "low" },
          { id: "kri15-1r2", period: "May 2026", value: "GPG Patch compliance is at 90%-95%", band: "low" },
          { id: "kri15-1r3", period: "June 2026", value: "GPG Patch compliance is at 90%-95%", band: "low" }
        ]
      }
    ]
  }
]

export const BOARD_STAGES = [
  "Identified",
  "Request submitted",
  "Assessment scheduled",
  "Assessment conducted",
  "Report prepared"
]

export const BOARD_CARDS = [
  { id: "seed-1", stage: "Identified", businessUnit: OPS_BU3, risk: "Delayed reporting of emerging risks", date: "—", riskNr: 4, note: "", mgmtNotes: "" },
  { id: "seed-2", stage: "Request submitted", businessUnit: OPS_BU2, risk: "Network downtime at facility level", date: "Submitted 12 Aug", riskNr: 2, note: "", mgmtNotes: "" },
  { id: "seed-3", stage: "Assessment scheduled", businessUnit: BU_HRD, risk: "Ineffective performance management processes", date: "Scheduled 2 Sep", riskNr: 9, note: "", mgmtNotes: "Site visit confirmed with programme manager." },
  { id: "seed-4", stage: "Assessment conducted", businessUnit: OPS_BU1, risk: "Manual risk registers outside BarnOwl", date: "Conducted 25 Aug", riskNr: 3, note: "", mgmtNotes: "Assessment conducted with the business unit's risk champion; report in drafting." },
  { id: "seed-5", stage: "Report prepared", businessUnit: OPS_BU1, risk: "Failure to modernise infrastructure", date: "Report issued 30 Jul", riskNr: 1, note: "", mgmtNotes: "Final report issued to Acting DDG: ICT." },
  { id: "seed-6", stage: "Identified", businessUnit: OPS_BU4, risk: "Inconsistent record-keeping of committee resolutions", date: "—", riskNr: 13, note: "", mgmtNotes: "" }
]
