export interface TimelineTagStyle {
  color: string
  bgColor: string
  borderColor: string
}

export type TimelineTopic = 'Military' | 'Diplomatic' | 'Political' | 'Economic' | 'Humanitarian' | 'General'

export const getRelativeTime = (publishedAt: string): string => {
  const published = new Date(publishedAt)
  const now = new Date()
  const diffMs = now.getTime() - published.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return 'Just now'
  }

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute))
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  const days = Math.floor(diffMs / day)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

const getCombinedText = (title: string, description?: string) => `${title} ${description ?? ''}`.toLowerCase()

export const getTimelineTopic = (title: string, description?: string): TimelineTopic => {
  const text = getCombinedText(title, description)

  if (
    text.includes('ceasefire') ||
    text.includes('talks') ||
    text.includes('negotiation') ||
    text.includes('diplomatic') ||
    text.includes('summit')
  ) {
    return 'Diplomatic'
  }

  if (
    text.includes('war') ||
    text.includes('strike') ||
    text.includes('attack') ||
    text.includes('missile') ||
    text.includes('bomb') ||
    text.includes('military')
  ) {
    return 'Military'
  }

  if (
    text.includes('election') ||
    text.includes('government') ||
    text.includes('parliament') ||
    text.includes('president') ||
    text.includes('political')
  ) {
    return 'Political'
  }

  if (
    text.includes('economy') ||
    text.includes('economic') ||
    text.includes('market') ||
    text.includes('finance') ||
    text.includes('oil') ||
    text.includes('trade')
  ) {
    return 'Economic'
  }

  if (
    text.includes('civilian') ||
    text.includes('refugee') ||
    text.includes('humanitarian') ||
    text.includes('aid') ||
    text.includes('children')
  ) {
    return 'Humanitarian'
  }

  return 'General'
}

export const getTimelineSeverity = (title: string, description?: string): number => {
  const text = getCombinedText(title, description)

  const severeKeywords = ['killed', 'dead', 'death', 'strike', 'attack', 'bomb', 'missile', 'war', 'fire']
  const diplomaticKeywords = ['ceasefire', 'talks', 'negotiation', 'summit', 'meeting']
  const economicKeywords = ['economy', 'economic', 'market', 'finance', 'oil', 'trade', 'tariff']

  let severity = 3

  if (diplomaticKeywords.some((keyword) => text.includes(keyword))) {
    severity = 4
  }

  if (economicKeywords.some((keyword) => text.includes(keyword))) {
    severity = Math.max(severity, 4)
  }

  if (severeKeywords.some((keyword) => text.includes(keyword))) {
    severity = 8
  }

  if (
    text.includes('massacre') ||
    text.includes('genocide') ||
    text.includes('airstrike') ||
    text.includes('invasion')
  ) {
    severity = 9
  }

  return Math.min(10, severity)
}

export const getTimelineSourceStyle = (source: string): TimelineTagStyle => {
  if (source.toLowerCase().includes('guardian')) {
    return {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/50',
    }
  }

  return {
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/50',
  }
}
