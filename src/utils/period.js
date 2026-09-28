import { fyFromDate } from './helpers.jsx'

export function currentFy() {
  return fyFromDate(new Date().toISOString().slice(0, 10))
}

export function defaultPeriod() {
  return { fy: currentFy(), open: true, history: [] }
}
