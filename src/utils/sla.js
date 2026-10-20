// Turnaround-time helpers for the configurable per-stage SLA (Admin sets the
// day counts once the risk team provides them - until then every value is
// null and nothing is ever flagged overdue).
export function daysInStage(risk) {
  if (!risk.approvalStageEnteredAt) return null
  const ms = Date.now() - new Date(risk.approvalStageEnteredAt).getTime()
  return Math.floor(ms / 86400000)
}

export function isStageOverdue(risk, stageSla) {
  const sla = risk.approvalStage ? stageSla?.[risk.approvalStage] : null
  if (!sla) return false
  const days = daysInStage(risk)
  return days !== null && days > sla
}
