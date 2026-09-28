import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import NavTabs from './components/NavTabs.jsx'
import DashboardView from './components/DashboardView.jsx'
import RegisterView from './components/RegisterView.jsx'
import BoardView from './components/BoardView.jsx'
import ReportsView from './components/ReportsView.jsx'
import AdminView from './components/AdminView.jsx'
import RiskPanel from './components/RiskPanel.jsx'
import RiskFormModal from './components/RiskFormModal.jsx'
import RequestUpdateModal from './components/RequestUpdateModal.jsx'
import RequestDetailModal from './components/RequestDetailModal.jsx'
import ProposalReviewModal from './components/ProposalReviewModal.jsx'
import KriModal from './components/KriModal.jsx'
import AdHocRequestModal from './components/AdHocRequestModal.jsx'
import { RISKS, BOARD_CARDS } from './data/risks.js'
import { ORG_STRUCTURE, ROLE_PERSONAS, APPROVAL_CHAIN, ROLES } from './data/orgStructure.js'
import {
  loadRisks, saveRisks, loadBoardCards, saveBoardCards,
  loadPeriod, savePeriod, loadOrgStructure, saveOrgStructure, loadPersonas, savePersonas
} from './utils/storage.js'
import { nextNr, uid, nowIso, appendScoreHistory } from './utils/helpers.jsx'
import { diffRisk } from './utils/audit.js'
import { defaultPeriod } from './utils/period.js'
import { approverStageForRole } from './utils/permissions.js'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [role, setRole] = useState('businessunit')
  const [risks, setRisks] = useState(() => loadRisks(RISKS))
  const [boardCards, setBoardCards] = useState(() => loadBoardCards(BOARD_CARDS))
  const [period, setPeriod] = useState(() => loadPeriod(defaultPeriod()))
  const [orgStructure, setOrgStructure] = useState(() => loadOrgStructure(ORG_STRUCTURE))
  const [personas, setPersonas] = useState(() => loadPersonas(ROLE_PERSONAS))
  const [selectedNr, setSelectedNr] = useState(null)
  const [formModal, setFormModal] = useState(null) // { mode: 'new' | 'edit', risk }
  const [requestModal, setRequestModal] = useState(null) // risk
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [proposalReviewNr, setProposalReviewNr] = useState(null)
  const [kriModalNr, setKriModalNr] = useState(null)
  const [adHocRequestNr, setAdHocRequestNr] = useState(null)

  useEffect(() => { saveRisks(risks) }, [risks])
  useEffect(() => { saveBoardCards(boardCards) }, [boardCards])
  useEffect(() => { savePeriod(period) }, [period])
  useEffect(() => { saveOrgStructure(orgStructure) }, [orgStructure])
  useEffect(() => { savePersonas(personas) }, [personas])

  // Administrator manages the org and doesn't work risks day to day - land
  // there by default, and don't leave a stranded Admin tab open for anyone
  // else if the role switch moves away from it.
  useEffect(() => {
    if (role === 'administrator') setView('admin')
    else setView(v => (v === 'admin' ? 'dashboard' : v))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const persona = personas[role]
  const selectedRisk = risks.find(r => r.nr === selectedNr) || null
  const selectedCard = boardCards.find(c => c.id === selectedCardId) || null
  const proposalReviewRisk = risks.find(r => r.nr === proposalReviewNr) || null
  const kriModalRisk = risks.find(r => r.nr === kriModalNr) || null
  const adHocRequestRisk = risks.find(r => r.nr === adHocRequestNr) || null

  // Only one overlay-style modal is ever shown at a time - stacking two of them
  // pushed the second one out of view under the old in-flow overlay layout, so
  // keep that invariant explicit here rather than relying on CSS alone.
  const anyModalOpen = Boolean(formModal || requestModal || selectedCardId || proposalReviewNr || kriModalNr || adHocRequestNr)

  function historyEntry(patch) {
    return { id: uid(), timestamp: nowIso(), actor: persona.name, actorRole: role, ...patch }
  }

  // A risk being edited may have an in-flight draft (Changes Required /
  // Rejected / a fresh reassessment on an Approved risk) that differs from
  // its last-published fields - the form should always edit that draft when
  // one exists, never the stale published values underneath it.
  function baseForEdit(risk) {
    return risk.pendingChange ? { ...risk.pendingChange.data, nr: risk.nr } : risk
  }

  // The form passes `dateChangeReason` (and optionally `dateChangeAttachment`,
  // a small { name, type, dataUrl } - demo-only, no backend to store files
  // properly) as transient fields whenever a target date moved. Both are
  // logged to history, never stored as permanent fields on the risk.
  function splitDateReason(data) {
    const { dateChangeReason, dateChangeAttachment, ...cleanData } = data
    return { cleanData, dateChangeReason, dateChangeAttachment }
  }

  function dateChangeEntry(reason, attachment) {
    if (!reason) return []
    return [historyEntry({ action: 'edited', summary: `Target date changed: ${reason}`, attachment })]
  }

  function saveDraft(nr, rawData) {
    const { cleanData: data, dateChangeReason, dateChangeAttachment } = splitDateReason(rawData)
    if (nr == null) {
      const newNr = nextNr(risks)
      const risk = {
        ...data, nr: newNr,
        history: [historyEntry({ action: 'created', summary: 'Risk captured as draft.' })],
        scoreHistory: appendScoreHistory([], data),
        comments: [],
        approvalStatus: 'Draft', approvalStage: null,
        pendingChange: null
      }
      setRisks(rs => [...rs, risk])
      setFormModal(null)
      setSelectedNr(newNr)
      return
    }
    setRisks(rs => rs.map(r => {
      if (r.nr !== nr) return r
      const editingDirectly = !r.pendingChange && r.approvalStatus === 'Draft'
      const base = r.pendingChange ? r.pendingChange.data : r
      const diff = diffRisk(base, data)
      if (editingDirectly) {
        const scoreChanged = r.ir !== data.ir || r.rr !== data.rr
        return {
          ...r, ...data, nr,
          approvalStatus: 'Draft',
          history: [...r.history, historyEntry({ action: 'edited', summary: 'Draft updated.', diff }), ...dateChangeEntry(dateChangeReason, dateChangeAttachment)],
          scoreHistory: scoreChanged ? appendScoreHistory(r.scoreHistory, data) : r.scoreHistory,
          updateRequests: fulfillUpdateRequests(r)
        }
      }
      // Reworking after Changes Required / Rejected, or starting a fresh
      // reassessment on an Approved risk - the published fields stay put
      // until this new round is itself approved.
      return {
        ...r,
        approvalStatus: 'Draft',
        pendingChange: { data, submittedBy: null, submittedByRole: null, submittedAt: null },
        history: [...r.history, historyEntry({ action: 'edited', summary: r.approvalStatus === 'Approved' ? 'Started a new reassessment.' : 'Draft updated.', diff }), ...dateChangeEntry(dateChangeReason, dateChangeAttachment)],
        updateRequests: fulfillUpdateRequests(r)
      }
    }))
    setFormModal(null)
  }

  function submitForApproval(nr, rawData) {
    const { cleanData: data, dateChangeReason, dateChangeAttachment } = splitDateReason(rawData)
    if (nr == null) {
      const newNr = nextNr(risks)
      const risk = {
        ...data, nr: newNr,
        history: [
          historyEntry({ action: 'created', summary: 'Risk captured as draft.' }),
          historyEntry({ action: 'proposed', summary: 'Submitted for approval.' })
        ],
        scoreHistory: appendScoreHistory([], data),
        comments: [],
        approvalStatus: 'Submitted', approvalStage: APPROVAL_CHAIN[0],
        pendingChange: { data, submittedBy: persona.name, submittedByRole: role, submittedAt: nowIso() }
      }
      setRisks(rs => [...rs, risk])
      setFormModal(null)
      setSelectedNr(newNr)
      return
    }
    setRisks(rs => rs.map(r => {
      if (r.nr !== nr) return r
      const base = r.pendingChange ? r.pendingChange.data : r
      const diff = diffRisk(base, data)
      return {
        ...r,
        approvalStatus: 'Submitted', approvalStage: APPROVAL_CHAIN[0],
        pendingChange: { data, submittedBy: persona.name, submittedByRole: role, submittedAt: nowIso() },
        history: [...r.history, historyEntry({ action: 'proposed', summary: 'Submitted for approval.', diff }), ...dateChangeEntry(dateChangeReason, dateChangeAttachment)],
        updateRequests: fulfillUpdateRequests(r)
      }
    }))
    setFormModal(null)
  }

  function authoriseStage(nr, note) {
    setRisks(rs => rs.map(r => {
      if (r.nr !== nr || !r.pendingChange || r.approvalStage !== approverStageForRole(role)) return r
      const stageIdx = APPROVAL_CHAIN.indexOf(r.approvalStage)
      const isFinal = stageIdx === APPROVAL_CHAIN.length - 1
      const noteSuffix = note ? ` Note for the next reviewer: ${note}` : ''
      if (!isFinal) {
        const nextStage = APPROVAL_CHAIN[stageIdx + 1]
        return {
          ...r,
          approvalStage: nextStage,
          history: [...r.history, historyEntry({ action: 'approved', summary: `Authorised — moved to ${ROLES[nextStage].label}.${noteSuffix}` })]
        }
      }
      const data = r.pendingChange.data
      const diff = diffRisk(r, data)
      const scoreChanged = r.ir !== data.ir || r.rr !== data.rr
      return {
        ...data, nr,
        history: [...r.history, historyEntry({ action: 'approved', summary: `Authorised — approved and applied to the register.${noteSuffix}`, diff })],
        scoreHistory: scoreChanged ? appendScoreHistory(r.scoreHistory, data) : r.scoreHistory,
        comments: r.comments,
        // `data` is a snapshot from whenever this was submitted - KRIs and
        // update requests can change on the live risk while a proposal sits
        // in review, so carry the *current* ones forward, not the stale copy.
        kriToleranceStatement: r.kriToleranceStatement, kriSummary: r.kriSummary, kris: r.kris,
        updateRequests: r.updateRequests,
        approvalStatus: 'Approved', approvalStage: null,
        pendingChange: null
      }
    }))
    setProposalReviewNr(null)
  }

  function requestChanges(nr, comment) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      approvalStatus: 'Changes Required', approvalStage: null,
      history: [...r.history, historyEntry({ action: 'changes-requested', summary: `Requested changes: ${comment}` })]
    } : r))
    setProposalReviewNr(null)
  }

  function rejectSubmission(nr, reason) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      approvalStatus: 'Rejected', approvalStage: null,
      history: [...r.history, historyEntry({ action: 'rejected', summary: `Rejected: ${reason}` })]
    } : r))
    setProposalReviewNr(null)
  }

  function addComment(nr, text) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      comments: [...(r.comments || []), { id: uid(), author: persona.name, role, text: text.trim(), timestamp: nowIso() }]
    } : r))
  }

  function submitAssessmentRequest(risk, note) {
    setBoardCards(cards => [
      ...cards,
      {
        id: uid(),
        stage: 'Request submitted',
        businessUnit: risk.businessUnit,
        risk: risk.risk,
        riskNr: risk.nr,
        date: `Submitted ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}`,
        note,
        mgmtNotes: ''
      }
    ])
    setRequestModal(null)
  }

  function advanceCardStage(id, stage) {
    setBoardCards(cards => cards.map(c => (c.id === id ? { ...c, stage } : c)))
  }

  function saveCardNotes(id, mgmtNotes) {
    setBoardCards(cards => cards.map(c => (c.id === id ? { ...c, mgmtNotes } : c)))
  }

  function extendPeriod(reason) {
    setPeriod(p => ({
      ...p,
      open: true,
      history: [...(p.history || []), { id: uid(), actor: persona.name, role, reason, timestamp: nowIso() }]
    }))
  }

  function openRiskFromCard(nr) {
    setSelectedCardId(null)
    setSelectedNr(nr)
  }

  function updateKris(nr, data) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      kriToleranceStatement: data.kriToleranceStatement,
      kriSummary: data.kriSummary,
      kris: data.kris,
      history: [...r.history, historyEntry({ action: 'edited', summary: 'Key risk indicators updated.' })]
    } : r))
    setKriModalNr(null)
  }

  // Any approver can ask a specific business unit for an update on a
  // specific risk even while the capture period is closed - e.g. ahead of
  // an ad-hoc ESMT meeting. It stays open for editing on just that risk
  // until the business unit acts on it.
  function requestAdHocUpdate(nr, reason) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      updateRequests: [...(r.updateRequests || []), { id: uid(), requestedBy: persona.name, requestedByRole: role, reason, timestamp: nowIso(), fulfilled: false }],
      history: [...r.history, historyEntry({ action: 'edited', summary: `Requested an ad-hoc update: ${reason}` })]
    } : r))
    setAdHocRequestNr(null)
  }

  function fulfillUpdateRequests(risk) {
    if (!risk.updateRequests?.some(r => !r.fulfilled)) return risk.updateRequests || []
    return risk.updateRequests.map(r => ({ ...r, fulfilled: true }))
  }

  return (
    <>
      <Header role={role} setRole={setRole} />
      <NavTabs view={view} setView={setView} role={role} />

      <div className="wrap">
        {view === 'dashboard' && (
          <DashboardView
            risks={risks}
            boardCards={boardCards}
            role={role}
            persona={persona}
            orgStructure={orgStructure}
            period={period}
            onTogglePeriod={() => setPeriod(p => ({ ...p, open: !p.open }))}
            onExtendPeriod={extendPeriod}
            onNavigate={setView}
            onOpenRisk={setSelectedNr}
            onOpenProposalReview={setProposalReviewNr}
            onOpenCard={c => setSelectedCardId(c.id)}
            onQuickAdd={() => setFormModal({ mode: 'new', risk: null })}
          />
        )}
        {view === 'register' && (
          <RegisterView
            risks={risks}
            role={role}
            persona={persona}
            orgStructure={orgStructure}
            periodOpen={period.open}
            onSelectRisk={r => setSelectedNr(r.nr)}
            onAddRisk={() => setFormModal({ mode: 'new', risk: null })}
          />
        )}
        {view === 'board' && (
          <BoardView boardCards={boardCards} onSelectCard={c => setSelectedCardId(c.id)} />
        )}
        {view === 'reports' && <ReportsView risks={risks} />}
        {view === 'admin' && (
          <AdminView
            orgStructure={orgStructure}
            onChangeOrgStructure={setOrgStructure}
            personas={personas}
            onChangePersonas={setPersonas}
          />
        )}
      </div>

      {selectedRisk && !anyModalOpen && (
        <RiskPanel
          risk={selectedRisk}
          role={role}
          periodOpen={period.open}
          onClose={() => setSelectedNr(null)}
          onOpenForm={() => setFormModal({ mode: 'edit', risk: baseForEdit(selectedRisk) })}
          onRequestUpdate={() => setRequestModal(selectedRisk)}
          onReviewProposal={() => setProposalReviewNr(selectedRisk.nr)}
          onAddComment={addComment}
          onOpenKri={() => setKriModalNr(selectedRisk.nr)}
          onOpenAdHocRequest={() => setAdHocRequestNr(selectedRisk.nr)}
        />
      )}

      {formModal && (
        <RiskFormModal
          mode={formModal.mode}
          risk={formModal.risk}
          defaultBusinessUnit={persona.businessUnit}
          orgStructure={orgStructure}
          onCancel={() => setFormModal(null)}
          onSaveDraft={data => saveDraft(formModal.risk ? formModal.risk.nr : null, data)}
          onSubmit={data => submitForApproval(formModal.risk ? formModal.risk.nr : null, data)}
        />
      )}

      {requestModal && (
        <RequestUpdateModal
          risk={requestModal}
          onCancel={() => setRequestModal(null)}
          onSubmit={note => submitAssessmentRequest(requestModal, note)}
        />
      )}

      {selectedCard && (
        <RequestDetailModal
          card={selectedCard}
          role={role}
          linkedRisk={risks.find(r => r.nr === selectedCard.riskNr) || null}
          onClose={() => setSelectedCardId(null)}
          onAdvanceStage={stage => advanceCardStage(selectedCard.id, stage)}
          onSaveNotes={notes => saveCardNotes(selectedCard.id, notes)}
          onViewRisk={openRiskFromCard}
        />
      )}

      {proposalReviewRisk && (
        <ProposalReviewModal
          risk={proposalReviewRisk}
          canAct={proposalReviewRisk.approvalStage === approverStageForRole(role)}
          onClose={() => setProposalReviewNr(null)}
          onAuthorise={note => authoriseStage(proposalReviewRisk.nr, note)}
          onRequestChanges={comment => requestChanges(proposalReviewRisk.nr, comment)}
          onReject={reason => rejectSubmission(proposalReviewRisk.nr, reason)}
        />
      )}

      {kriModalRisk && (
        <KriModal
          risk={kriModalRisk}
          canEdit={role === 'businessunit' && kriModalRisk.businessUnit === persona.businessUnit}
          onClose={() => setKriModalNr(null)}
          onSave={data => updateKris(kriModalRisk.nr, data)}
        />
      )}

      {adHocRequestRisk && (
        <AdHocRequestModal
          risk={adHocRequestRisk}
          onCancel={() => setAdHocRequestNr(null)}
          onSubmit={reason => requestAdHocUpdate(adHocRequestRisk.nr, reason)}
        />
      )}
    </>
  )
}
