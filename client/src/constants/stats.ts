export const SOURCE_GROUP_ORDER = ['western', 'regional', 'real-time'] as const

export const SOURCE_GROUP_LABELS: Record<string, string> = {
  western: 'Western',
  regional: 'Regional',
  'real-time': 'Real-time',
}

import eventThemeRegistry from '../data/eventThemeRegistry.json'
import type { EventTheme } from '../types/categories'

export const rawThemes = eventThemeRegistry as Record<string, EventTheme>

export const categoryColorMap = Object.entries(rawThemes)
  .filter(([key]) => key !== 'default' && key.includes('|'))
  .reduce<Record<string, string>>((acc, [key, value]) => {
    const [category] = key.split('|')
    const normalizedCategory = category.trim()

    if (!acc[normalizedCategory]) {
      acc[normalizedCategory] = value.color
    }
    return acc
  }, {})

export const registryCategories = Object.keys(categoryColorMap)

export const DEFAULT_CATEGORY_COLOR = rawThemes.default?.color ?? '#7F8C8D'
