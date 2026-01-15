export type JournalRecord = {
  id: number
  stress_level: number
  created_at: string
}

export type ExtendedJournalRecord = {
  id: number
  mood: string
  stress_level: number
  summary: string
  advice: string
  created_at: string
}
