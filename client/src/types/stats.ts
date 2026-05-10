export interface CountryStats {
  country: string
  totalEvents: number
  totalFatalities: number
}

export interface YearStats {
  year: number
  totalEvents: number
  totalFatalities: number
}

export interface EventTypeStats {
  eventType: string
  totalEvents: number
  totalFatalities: number
  subEventBreakdown: Record<string, number>
}

export interface AdminRiskStats {
  admin1: string
  totalEvents: number
  totalFatalities: number
  totalPopExposure: number
  riskScore: number
}

export interface RegionCountryStats {
  country: string
  totalEvents: number
  totalFatalities: number
  totalPopExposure: number
}
