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
import RemovalRequestModal from './components/RemovalRequestModal.jsx'
import RemovalValidationModal from './components/RemovalValidationModal.jsx'
import ReviewWindowModal from './components/ReviewWindowModal.jsx'
import ReviewWindowEditModal from './components/ReviewWindowEditModal.jsx'
import { RISKS, BOARD_CARDS } from './data/risks.js'
import { ORG_STRUCTURE, ROLE_PERSONAS, ROLES } from './data/orgStructure.js'
import {
  loadRisks, saveRisks, loadBoardCards, saveBoardCards,
  loadPeriod, savePeriod, loadOrgStructure, saveOrgStructure, loadPersonas, savePersonas,
  loadCdOverrides, saveCdOverrides, loadBuChainOverrides, saveBuChainOverrides,
  loadSla, saveSla, loadNotifications, saveNotifications, loadReviewWindow, saveReviewWindow
} from './utils/storage.js'
import { nextNr, uid, nowIso, appendScoreHistory } from './utils/helpers.jsx'
import { diffRisk } from './utils/audit.js'
import { defaultPeriod } from './utils/period.js'
import { approverStageForRole, isReviewWindowOpen } from './utils/permissions.js'
import { computeApprovalChain, stageLabelForRisk, stageVerbForRisk } from './utils/approvalChain.js'

const DEFAULT_SLA = { director: null, chiefdirector: null, ddg: null, cro: null, hod: null }

export default function App() {
  const [view, setView] = useState('dashboard')
  const [role, setRole] = useState('riskcapturer')
  const [risks, setRisks] = useState(() => loadRisks(RISKS))
  const [boardCards, setBoardCards] = useState(() => loadBoardCards(BOARD_CARDS))
  const [period, setPeriod] = useState(() => loadPeriod(defaultPeriod()))
  const [orgStructure, setOrgStructure] = useState(() => loadOrgStructure(ORG_STRUCTURE))
  // Merge over the seed rather than trusting persisted data outright - a
  // browser holding personas from before a role was added/renamed would
  // otherwise have `personas[newRole]` come back undefined and crash every
  // screen that reads it.
  const [personas, setPersonas] = useState(() => ({ ...ROLE_PERSONAS, ...loadPersonas(ROLE_PERSONAS) }))
  const [chiefDirectorateOverrides, setChiefDirectorateOverrides] = useState(() => loadCdOverrides({}))
  const [businessUnitChainOverrides, setBusinessUnitChainOverrides] = useState(() => loadBuChainOverrides({}))
  const [stageSla, setStageSla] = useState(() => ({ ...DEFAULT_SLA, ...loadSla(DEFAULT_SLA) }))
  const [notifications, setNotifications] = useState(() => loadNotifications([]))
  const [reviewWindow, setReviewWindow] = useState(() => loadReviewWindow(null))
  const [selectedNr, setSelectedNr] = useState(null)
  const [formModal, setFormModal] = useState(null) // { mode: 'new' | 'edit', risk }
  const [requestModal, setRequestModal] = useState(null) // risk
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [proposalReviewNr, setProposalReviewNr] = useState(null)
  const [kriModalNr, setKriModalNr] = useState(null)
  const [adHocRequestNr, setAdHocRequestNr] = useState(null)
  const [removalRequestNr, setRemovalRequestNr] = useState(null)
  const [removalValidationNr, setRemovalValidationNr] = useState(null)
  const [reviewWindowModalOpen, setReviewWindowModalOpen] = useState(false)
  const [reviewWindowEditNr, setReviewWindowEditNr] = useState(null)

  useEffect(() => { saveRisks(risks) }, [risks])
  useEffect(() => { saveBoardCards(boardCards) }, [boardCards])
  useEffect(() => { savePeriod(period) }, [period])
  useEffect(() => { saveOrgStructure(orgStructure) }, [orgStructure])
  useEffect(() => { savePersonas(personas) }, [personas])
  useEffect(() => { saveCdOverrides(chiefDirectorateOverrides) }, [chiefDirectorateOverrides])
  useEffect(() => { saveBuChainOverrides(businessUnitChainOverrides) }, [businessUnitChainOverrides])
  useEffect(() => { saveSla(stageSla) }, [stageSla])
  useEffect(() => { saveNotifications(notifications) }, [notifications])
  useEffect(() => { saveReviewWindow(reviewWindow) }, [reviewWindow])

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
  const removalRequestRisk = risks.find(r => r.nr === removalRequestNr) || null
  const removalValidationRisk = risks.find(r => r.nr === removalValidationNr) || null
  const reviewWindowEditRisk = risks.find(r => r.nr === reviewWindowEditNr) || null

  const proposalReviewChain = proposalReviewRisk
    ? computeApprovalChain(proposalReviewRisk, orgStructure, chiefDirectorateOverrides, businessUnitChainOverrides)
    : []
  const proposalReviewStageLabels = proposalReviewChain.map(k => stageLabelForRisk(k, proposalReviewRisk, orgStructure, chiefDirectorateOverrides))

  // Only one overlay-style modal is ever shown at a time - stacking two of them
  // pushed the second one out of view under the old in-flow overlay layout, so
  // keep that invariant explicit here rather than relying on CSS alone.
  const anyModalOpen = Boolean(
    formModal || requestModal || selectedCardId || proposalReviewNr || kriModalNr || adHocRequestNr ||
    removalRequestNr || removalValidationNr || reviewWindowModalOpen || reviewWindowEditNr
  )

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
        approvalStatus: 'Draft', approvalStage: null, approvalStageEnteredAt: null,
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
      const startStage = computeApprovalChain(data, orgStructure, chiefDirectorateOverrides, businessUnitChainOverrides)[0]
      const risk = {
        ...data, nr: newNr,
        history: [
          historyEntry({ action: 'created', summary: 'Risk captured as draft.' }),
          historyEntry({ action: 'proposed', summary: 'Submitted for approval.' })
        ],
        scoreHistory: appendScoreHistory([], data),
        comments: [],
        approvalStatus: 'Submitted', approvalStage: startStage, approvalStageEnteredAt: nowIso(),
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
      const startStage = computeApprovalChain(data, orgStructure, chiefDirectorateOverrides, businessUnitChainOverrides)[0]
      return {
        ...r,
        approvalStatus: 'Submitted', approvalStage: startStage, approvalStageEnteredAt: nowIso(),
        pendingChange: { data, submittedBy: persona.name, submittedByRole: role, submittedAt: nowIso() },
        history: [...r.history, historyEntry({ action: 'proposed', summary: 'Submitted for approval.', diff }), ...dateChangeEntry(dateChangeReason, dateChangeAttachment)],
        updateRequests: fulfillUpdateRequests(r)
      }
    }))
    setFormModal(null)
  }

  function authoriseStage(nr, note) {
    // Everything needed to decide "is this final, and do we notify CRO" is
    // computed up front from the current (synchronously readable) `risks`
    // array - a setRisks updater function isn't guaranteed to run before the
    // rest of this function continues, so side effects (like queuing a
    // notification) can't safely depend on what happens inside one.
    const r = risks.find(x => x.nr === nr)
    if (!r || !r.pendingChange || r.approvalStage !== approverStageForRole(role)) {
      setProposalReviewNr(null)
      return
    }
    const chain = computeApprovalChain(r, orgStructure, chiefDirectorateOverrides, businessUnitChainOverrides)
    const stageIdx = chain.indexOf(r.approvalStage)
    const isFinal = stageIdx === -1 || stageIdx === chain.length - 1
    const noteSuffix = note ? ` Note for the next reviewer: ${note}` : ''
    const wasHodFinal = isFinal && r.approvalStage === 'hod'

    setRisks(rs => rs.map(x => {
      if (x.nr !== nr) return x
      if (!isFinal) {
        const nextStage = chain[stageIdx + 1]
        const verb = stageVerbForRisk(nextStage, x)
        return {
          ...x,
          approvalStage: nextStage,
          approvalStageEnteredAt: nowIso(),
          history: [...x.history, historyEntry({ action: 'approved', summary: `Authorised — moved to ${stageLabelForRisk(nextStage, x, orgStructure, chiefDirectorateOverrides)} to ${verb}.${noteSuffix}` })]
        }
      }
      const data = x.pendingChange.data
      const diff = diffRisk(x, data)
      const scoreChanged = x.ir !== data.ir || x.rr !== data.rr
      return {
        ...data, nr,
        history: [...x.history, historyEntry({ action: 'approved', summary: `Authorised — approved and applied to the register.${noteSuffix}`, diff })],
        scoreHistory: scoreChanged ? appendScoreHistory(x.scoreHistory, data) : x.scoreHistory,
        comments: x.comments,
        // `data` is a snapshot from whenever this was submitted - KRIs and
        // update requests can change on the live risk while a proposal sits
        // in review, so carry the *current* ones forward, not the stale copy.
        kriToleranceStatement: x.kriToleranceStatement, kriSummary: x.kriSummary, kris: x.kris,
        updateRequests: x.updateRequests,
        removalRequest: x.removalRequest,
        approvalStatus: 'Approved', approvalStage: null, approvalStageEnteredAt: null,
        pendingChange: null
      }
    }))

    if (wasHodFinal) {
      setNotifications(ns => [...ns, {
        id: uid(), toRole: 'cro', riskNr: nr,
        message: `HOD approved "${r.risk}" — final sign-off complete.`,
        timestamp: nowIso()
      }])
    }
    setProposalReviewNr(null)
  }

  function requestChanges(nr, comment) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      approvalStatus: 'Changes Required', approvalStage: null, approvalStageEnteredAt: null,
      history: [...r.history, historyEntry({ action: 'changes-requested', summary: `Requested changes: ${comment}` })]
    } : r))
    setProposalReviewNr(null)
  }

  function rejectSubmission(nr, reason) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      approvalStatus: 'Rejected', approvalStage: null, approvalStageEnteredAt: null,
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
  // until the risk capturer acts on it.
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

  function requestRemoval(nr, reason, memo) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r,
      removalRequest: { id: uid(), requestedBy: persona.name, requestedByRole: role, reason, memo, requestedAt: nowIso(), status: 'Pending' },
      history: [...r.history, historyEntry({ action: 'removal-requested', summary: `Requested removal: ${reason}`, attachment: memo })]
    } : r))
    setRemovalRequestNr(null)
  }

  function decideRemoval(nr, approve, note) {
    setRisks(rs => rs.map(r => {
      if (r.nr !== nr || !r.removalRequest) return r
      return {
        ...r,
        removalRequest: { ...r.removalRequest, status: approve ? 'Approved' : 'Denied', decidedBy: persona.name, decidedByRole: role, decidedAt: nowIso(), decisionNote: note },
        approvalStatus: approve ? 'Removed' : r.approvalStatus,
        history: [...r.history, historyEntry({
          action: approve ? 'removed' : 'removal-denied',
          summary: approve ? `Removal approved and applied.${note ? ` ${note}` : ''}` : `Removal denied.${note ? ` ${note}` : ''}`
        })]
      }
    }))
    setRemovalValidationNr(null)
  }

  function openReviewWindow(durationDays, reason, fieldWhitelist) {
    const closesAt = new Date(Date.now() + durationDays * 86400000).toISOString()
    setReviewWindow({ id: uid(), openedBy: persona.name, openedByRole: role, openedAt: nowIso(), closesAt, reason, fieldWhitelist })
    setReviewWindowModalOpen(false)
  }

  function closeReviewWindowNow() {
    setReviewWindow(null)
    setReviewWindowModalOpen(false)
  }

  function saveReviewWindowEdit(nr, patch) {
    setRisks(rs => rs.map(r => r.nr === nr ? {
      ...r, ...patch,
      history: [...r.history, historyEntry({ action: 'edited', summary: 'Updated during review window (direct save, no re-approval).' })]
    } : r))
    setReviewWindowEditNr(null)
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
            notifications={notifications}
            reviewWindow={reviewWindow}
            onOpenReviewWindowModal={() => setReviewWindowModalOpen(true)}
            stageSla={stageSla}
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
            chiefDirectorateOverrides={chiefDirectorateOverrides}
            onChangeCdOverrides={setChiefDirectorateOverrides}
            businessUnitChainOverrides={businessUnitChainOverrides}
            onChangeBuChainOverrides={setBusinessUnitChainOverrides}
            stageSla={stageSla}
            onChangeStageSla={setStageSla}
          />
        )}
      </div>

      {selectedRisk && !anyModalOpen && (
        <RiskPanel
          risk={selectedRisk}
          role={role}
          periodOpen={period.open}
          stageSla={stageSla}
          reviewWindow={reviewWindow}
          orgStructure={orgStructure}
          chiefDirectorateOverrides={chiefDirectorateOverrides}
          onClose={() => setSelectedNr(null)}
          onOpenForm={() => setFormModal({ mode: 'edit', risk: baseForEdit(selectedRisk) })}
          onRequestUpdate={() => setRequestModal(selectedRisk)}
          onReviewProposal={() => setProposalReviewNr(selectedRisk.nr)}
          onAddComment={addComment}
          onOpenKri={() => setKriModalNr(selectedRisk.nr)}
          onOpenAdHocRequest={() => setAdHocRequestNr(selectedRisk.nr)}
          onOpenRemovalRequest={() => setRemovalRequestNr(selectedRisk.nr)}
          onOpenRemovalValidation={() => setRemovalValidationNr(selectedRisk.nr)}
          onOpenReviewWindowEdit={() => setReviewWindowEditNr(selectedRisk.nr)}
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
          chain={proposalReviewChain}
          stageLabels={proposalReviewStageLabels}
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
          canEdit={role === 'riskcapturer'}
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

      {removalRequestRisk && (
        <RemovalRequestModal
          risk={removalRequestRisk}
          onCancel={() => setRemovalRequestNr(null)}
          onSubmit={(reason, memo) => requestRemoval(removalRequestRisk.nr, reason, memo)}
        />
      )}

      {removalValidationRisk && (
        <RemovalValidationModal
          risk={removalValidationRisk}
          onCancel={() => setRemovalValidationNr(null)}
          onApprove={note => decideRemoval(removalValidationRisk.nr, true, note)}
          onDeny={note => decideRemoval(removalValidationRisk.nr, false, note)}
        />
      )}

      {reviewWindowModalOpen && (
        <ReviewWindowModal
          reviewWindow={isReviewWindowOpen(reviewWindow) ? reviewWindow : null}
          onCancel={() => setReviewWindowModalOpen(false)}
          onOpen={openReviewWindow}
          onCloseWindow={closeReviewWindowNow}
        />
      )}

      {reviewWindowEditRisk && (
        <ReviewWindowEditModal
          risk={reviewWindowEditRisk}
          fieldWhitelist={reviewWindow?.fieldWhitelist || []}
          onCancel={() => setReviewWindowEditNr(null)}
          onSave={patch => saveReviewWindowEdit(reviewWindowEditRisk.nr, patch)}
        />
      )}
    </>
  )
}
