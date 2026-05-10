import * as React from 'react'
import { format } from 'date-fns'
import { useGlobalData } from 'src/context'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { MENA_COUNTRIES, MIDDLE_EAST_COUNTRIES, NORTH_AFRICA_COUNTRIES } from '../../canstants/filterDrawer'
import { EventsByYearChart, EventTypeChart, RegionCountryChart, StatsSummary, SubEventBreakdownChart } from '../charts'

const regionByCountry = (country: string) => {
  if (NORTH_AFRICA_COUNTRIES.includes(country)) {
    return 'Northern Africa'
  }

  if (MIDDLE_EAST_COUNTRIES.includes(country)) {
    return 'Middle East'
  }

  return 'Northern Africa'
}

const formatDateForApi = (date: Date | null) => (date ? format(date, 'yyyy-MM-dd') : undefined)

export default function Analysis() {
  const { eventFilters } = useGlobalData()
  const [selectedCountry, setSelectedCountry] = React.useState(() => {
    return eventFilters.country !== 'All' ? eventFilters.country : 'Iran'
  })

  React.useEffect(() => {
    if (selectedCountry && MENA_COUNTRIES.includes(selectedCountry)) {
      return
    }

    setSelectedCountry('Iran')
  }, [selectedCountry])

  const analysisCountry = selectedCountry
  const analysisRegion = regionByCountry(selectedCountry)
  const start = formatDateForApi(eventFilters.startDate)
  const end = formatDateForApi(eventFilters.endDate)

  return (
    <div className="flex h-fit w-full flex-col items-center gap-8 py-8">
      <div className="w-[95%] space-y-4">
        <h1 className="mb-2 text-3xl font-bold text-slate-100">Analysis Dashboard</h1>

        <div className="max-w-sm space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Choose your target country
          </label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="h-10 border-slate-800 bg-slate-950/80 text-slate-100">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-950 text-slate-100">
              {MENA_COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-[95%] space-y-6">
        <StatsSummary country={selectedCountry} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EventsByYearChart country={analysisCountry} start={start} end={end} />
          <EventTypeChart country={analysisCountry} start={start} end={end} />
          <RegionCountryChart region={analysisRegion} />
          <div className="lg:col-span-2">
            <SubEventBreakdownChart country={analysisCountry} start={start} end={end} />
          </div>
        </div>
      </div>
    </div>
  )
}
