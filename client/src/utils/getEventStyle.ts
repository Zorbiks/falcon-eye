import eventThemeRegistry from 'src/data/eventThemeRegistry.json'

type EventTheme = (typeof eventThemeRegistry)[keyof typeof eventThemeRegistry]
const eventThemeRegistryByKey = eventThemeRegistry as Record<string, EventTheme>

export const getEventStyle = (eventType: string, subEventType: string) => {
  const key = `${eventType}|${subEventType}`
  return eventThemeRegistryByKey[key] ?? eventThemeRegistry.default
}
