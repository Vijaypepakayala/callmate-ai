// In-memory store for demo
export interface CallLog {
  id: string
  callerNumber: string
  calledNumber: string
  status: string
  duration: number | null
  summary: string | null
  startedAt: string
}

export const callLogs: CallLog[] = []

export function addCallLog(log: CallLog) {
  callLogs.push(log)
}

export function getCallLogs() {
  return callLogs
}
