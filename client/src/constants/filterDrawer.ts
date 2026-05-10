import { addDays } from 'date-fns'
import type { EventRegionFilter } from 'src/types/events'

export const NORTH_AFRICA_COUNTRIES = ['Algeria', 'Egypt', 'Libya', 'Morocco', 'Tunisia']

export const MIDDLE_EAST_COUNTRIES = [
  'Bahrain',
  'Iran',
  'Iraq',
  'Israel',
  'Jordan',
  'Kuwait',
  'Lebanon',
  'Oman',
  'Qatar',
  'Saudi Arabia',
  'Syria',
  'United Arab Emirates',
  'Yemen',
]

export const MENA_COUNTRIES = [
  'Algeria',
  'Bahrain',
  'Egypt',
  'Iran',
  'Iraq',
  'Israel',
  'Jordan',
  'Kuwait',
  'Lebanon',
  'Libya',
  'Morocco',
  'Oman',
  'Qatar',
  'Saudi Arabia',
  'Syria',
  'Tunisia',
  'United Arab Emirates',
  'Yemen',
]

export const EVENT_TYPES = [
  'Battles',
  'Explosions/Remote violence',
  'Protests',
  'Riots',
  'Strategic developments',
  'Violence against civilians',
]

export const regionUiToFilterMap: Record<string, EventRegionFilter> = {
  all: 'All',
  me: 'Middle East',
  na: 'Northern Africa',
}

export const filterRegionToUiMap: Record<EventRegionFilter, string> = {
  All: 'all',
  'Middle East': 'me',
  'Northern Africa': 'na',
}

export const getDefaultAdvancedFilterRange = () => ({
  from: new Date(2026, 3, 1),
  to: addDays(new Date(2026, 3, 1), 14),
})
