import type { AcledEvent } from '../types/events'

export type RangeOption = '24h' | '7 days' | 'Two weeks' | 'All'

export function filterEventsClientSide(events: AcledEvent[], category: string, range: RangeOption): AcledEvent[] {
  let filtered = events

  if (category && category.toLowerCase() !== 'all') {
    const cat = category.trim().toLowerCase()
    filtered = filtered.filter((e) => (e.eventType || '').trim().toLowerCase() === cat)
  }

  if (range && range !== 'All') {
    const now = new Date()
    let cutoff: Date | null = null

    if (range === '24h') {
      cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    } else if (range === '7 days') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === 'Two weeks') {
      cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    }

    if (cutoff) {
      filtered = filtered.filter((e) => {
        const d = new Date(e.week)
        if (Number.isNaN(d.getTime())) return false
        return d >= cutoff
      })
    }
  }

  return filtered
}
