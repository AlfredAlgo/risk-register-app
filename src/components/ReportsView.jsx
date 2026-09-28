import { useMemo, useState } from 'react'
import { fyFromDate, monthKeyFromDate, monthLabelFromKey, computePortfolioTrend } from '../utils/helpers.jsx'
import { exportReportPdf } from '../utils/pdfExport.js'
import { exportReportCsv } from '../utils/csvExport.js'
import { CountUp, AnimatedBar } from './StatWidgets.jsx'
import RiskHeatmap from './RiskHeatmap.jsx'
import TrendChart from './TrendChart.jsx'

export default function ReportsView({ risks }) {
  const [filters, setFilters] = useState({ fy: '', month: '', bu: '' })
  const [heatmapType, setHeatmapType] = useState('ir')

  const fys = useMemo(() => [...new Set(risks.map(r => fyFromDate(r.assessmentDate)).filter(Boolean))].sort(), [risks])
  const monthKeys = useMemo(() => [...new Set(risks.map(r => monthKeyFromDate(r.assessmentDate)).filter(Boolean))].sort(), [risks])
  const businessUnits = useMemo(() => [...new Set(risks.map(r => r.businessUnit))].sort(), [risks])

  const filtered = useMemo(() => risks.filter(r =>
    (!filters.fy || fyFromDate(r.assessmentDate) === filters.fy) &&
    (!filters.month || monthKeyFromDate(r.assessmentDate) === filters.month) &&
    (!filters.bu || r.businessUnit === filters.bu)
  ), [risks, filters])

  const isOverall = !filters.fy && !filters.month && !filters.bu

  const total = filtered.length
  const highRisk = filtered.filter(r => r.ir >= 20).length

  const counts = useMemo(() => {
    const c = { green: 0, amber: 0, red: 0 }
    filtered.forEach(r => c[r.status]++)
    return c
  }, [filtered])

  const byBU = useMemo(() => {
    const o = {}
    filtered.forEach(r => { o[r.businessUnit] = (o[r.businessUnit] || 0) + 1 })
    return o
  }, [filtered])
  const maxBU = Math.max(1, ...Object.values(byBU))

  const byOutcome = useMemo(() => {
    const o = {}
    filtered.forEach(r => {
      if (!o[r.outcome]) o[r.outcome] = { ir: [], rr: [] }
      o[r.outcome].ir.push(r.ir)
      o[r.outcome].rr.push(r.rr)
    })
    return o
  }, [filtered])

  const portfolioTrend = useMemo(() => computePortfolioTrend(filtered), [filtered])

  const statusOrder = [['On track', 'green'], ['At risk', 'amber'], ['Overdue', 'red']]

  const filterLabel = isOverall
    ? 'Overall report — all business units, all financial years'
    : [
        filters.bu || 'All business units',
        filters.fy ? `FY ${filters.fy}` : 'All financial years',
        filters.month ? monthLabelFromKey(filters.month) : 'All months'
      ].join(' · ')

  const [exportingPdf, setExportingPdf] = useState(false)

  async function handleExportPdf() {
    setExportingPdf(true)
    try {
      await exportReportPdf({
        risks: filtered,
        filterLabel,
        summary: { total, highIr: highRisk, green: counts.green, amber: counts.amber, red: counts.red },
        byBU,
        byStatus: counts
      })
    } finally {
      setExportingPdf(false)
    }
  }

  function handleExportCsv() {
    exportReportCsv({ risks: filtered, filterLabel })
  }

  return (
    <div className="view-enter">
      <div className="toolbar">
        <select value={filters.fy} onChange={e => setFilters(f => ({ ...f, fy: e.target.value }))}>
          <option value="">All financial years</option>
          {fys.map(fy => <option key={fy} value={fy}>FY {fy}</option>)}
        </select>
        <select value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
          <option value="">All months</option>
          {monthKeys.map(mk => <option key={mk} value={mk}>{monthLabelFromKey(mk)}</option>)}
        </select>
        <select value={filters.bu} onChange={e => setFilters(f => ({ ...f, bu: e.target.value }))}>
          <option value="">All business units</option>
          {businessUnits.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button
          className="btn ghost" disabled={isOverall}
          onClick={() => setFilters({ fy: '', month: '', bu: '' })}
        >
          Overall report
        </button>
        <div className="spacer" />
        <button className="btn ghost" onClick={handleExportCsv} disabled={total === 0}>Export CSV</button>
        <button className="btn" onClick={handleExportPdf} disabled={total === 0 || exportingPdf}>
          {exportingPdf ? 'Preparing PDF…' : 'Export PDF'}
        </button>
      </div>
      <div className="report-scope">{filterLabel} · {total} risk{total === 1 ? '' : 's'}</div>

      {total === 0 ? (
        <div className="outcome">
          <div style={{ padding: 20, color: 'var(--ink-muted)' }}>No risks match these filters.</div>
        </div>
      ) : (
        <>
          <div className="metrics">
            <div className="metric"><div className="num"><CountUp target={total} /></div><div className="lbl">Total risks logged</div></div>
            <div className="metric"><div className="num"><CountUp target={highRisk} /></div><div className="lbl">High inherent risk (IR ≥ 20)</div></div>
            <div className="metric"><div className="num"><CountUp target={counts.green} /></div><div className="lbl">On track</div></div>
            <div className="metric"><div className="num"><CountUp target={counts.red} /></div><div className="lbl">Overdue</div></div>
          </div>

          <div className="report-grid">
            <div className="report-card">
              <div className="report-card-head">
                <h4>Risk heat map</h4>
                <div className="seg">
                  <button className={heatmapType === 'ir' ? 'active' : ''} onClick={() => setHeatmapType('ir')}>Inherent</button>
                  <button className={heatmapType === 'rr' ? 'active' : ''} onClick={() => setHeatmapType('rr')}>Residual</button>
                </div>
              </div>
              <RiskHeatmap
                risks={filtered}
                likelihoodKey={heatmapType === 'ir' ? 'irLikelihood' : 'rrLikelihood'}
                impactKey={heatmapType === 'ir' ? 'irImpact' : 'rrImpact'}
              />
            </div>

            <div className="report-card">
              <h4>Inherent vs residual risk trend</h4>
              {portfolioTrend.length >= 2 ? (
                <TrendChart data={portfolioTrend} height={190} />
              ) : (
                <div className="sub">Not enough reassessment history yet for this selection.</div>
              )}
            </div>

            <div className="report-card">
              <h4>Risks by business unit</h4>
              {Object.entries(byBU).map(([bu, n]) => (
                <div className="bar-row" key={bu}>
                  <div className="lbl2">{bu}</div>
                  <AnimatedBar pct={(n / maxBU) * 100} />
                  <div className="val2">{n}</div>
                </div>
              ))}
            </div>

            <div className="report-card">
              <h4>Status mix</h4>
              {statusOrder.map(([label, key]) => (
                <div className="bar-row" key={key}>
                  <div className="lbl2">{label}</div>
                  <AnimatedBar pct={(counts[key] / total) * 100} className={key} />
                  <div className="val2">{counts[key]}</div>
                </div>
              ))}
            </div>

            <div className="report-card">
              <h4>Inherent vs residual risk, by outcome</h4>
              {Object.entries(byOutcome).map(([oc, v]) => {
                const avgIr = v.ir.reduce((a, b) => a + b, 0) / v.ir.length
                const avgRr = v.rr.reduce((a, b) => a + b, 0) / v.rr.length
                const shortOc = oc.length > 28 ? oc.slice(0, 26) + '…' : oc
                return (
                  <div key={oc}>
                    <div className="bar-row">
                      <div className="lbl2">{shortOc} (IR)</div>
                      <AnimatedBar pct={(avgIr / 25) * 100} className="red" />
                      <div className="val2">{avgIr.toFixed(0)}</div>
                    </div>
                    <div className="bar-row">
                      <div className="lbl2">{shortOc} (RR)</div>
                      <AnimatedBar pct={(avgRr / 25) * 100} className="green" />
                      <div className="val2">{avgRr.toFixed(0)}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="report-card">
              <h4>Upcoming target dates</h4>
              {filtered.map(r => (
                <div className="deadline-row" key={r.nr}>
                  <span className="r">{r.risk.length > 40 ? r.risk.slice(0, 38) + '…' : r.risk}</span>
                  <span className="d">{r.targetDate}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
