'use client'

import * as React from 'react'
import { DayPicker, DateRange } from '@daypicker/react'
import { isSameYear, format } from 'date-fns'
import { Filter, ListFilter, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from 'src/lib/utils'
import { Button } from 'src/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'src/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Label } from 'src/components/ui/label'
import { useGlobalData } from 'src/context'
import {
  EVENT_TYPES,
  MENA_COUNTRIES,
  MIDDLE_EAST_COUNTRIES,
  NORTH_AFRICA_COUNTRIES,
  filterRegionToUiMap,
  getDefaultAdvancedFilterRange,
  regionUiToFilterMap,
} from '../constants/filterDrawer'
import { slugifyCountry } from '../utils/filterDrawer'

export default function FilterDrawer() {
  const { eventFilters, applyServerFilters, resetEventFilters } = useGlobalData()
  const defaultRange = React.useMemo(() => getDefaultAdvancedFilterRange(), [])
  const [region, setRegion] = React.useState<string>('all')
  const [country, setCountry] = React.useState<string>('all')
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([])
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateMobileState = () => setIsMobile(mediaQuery.matches)

    updateMobileState()

    mediaQuery.addEventListener('change', updateMobileState)

    return () => {
      mediaQuery.removeEventListener('change', updateMobileState)
    }
  }, [])

  const filteredCountries = React.useMemo(() => {
    if (region === 'na') {
      return NORTH_AFRICA_COUNTRIES
    }

    if (region === 'me') {
      return MIDDLE_EAST_COUNTRIES
    }

    return MENA_COUNTRIES
  }, [region])

  const countryBySlug = React.useMemo(() => {
    return new Map(MENA_COUNTRIES.map((name) => [slugifyCountry(name), name]))
  }, [])

  React.useEffect(() => {
    if (country === 'all') {
      return
    }

    const selectedCountryName = countryBySlug.get(country)

    if (!selectedCountryName || !filteredCountries.includes(selectedCountryName)) {
      setCountry('all')
    }
  }, [country, filteredCountries, countryBySlug])

  // Defaulting to 2026 for your Falcon Eye project context
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: defaultRange.from,
    to: defaultRange.to,
  })

  React.useEffect(() => {
    setRegion(filterRegionToUiMap[eventFilters.region])
    setCountry(eventFilters.country === 'All' ? 'all' : slugifyCountry(eventFilters.country))
    setSelectedEvents(eventFilters.eventTypes)

    if (eventFilters.startDate && eventFilters.endDate) {
      setRange({
        from: eventFilters.startDate,
        to: eventFilters.endDate,
      })
      return
    }

    setRange({
      from: defaultRange.from,
      to: defaultRange.to,
    })
  }, [eventFilters, defaultRange])

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) => (prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]))
  }

  // Logic to prevent multi-year queries that could impact HBase performance
  const disabledDays = (date: Date) => {
    if (range?.from && !range?.to) {
      return !isSameYear(date, range.from)
    }
    return false
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-center gap-2 text-slate-400 sm:w-auto sm:justify-start"
        >
          <ListFilter className="h-4 w-4" />
          <p className="text-[10px]">Advanced Filters</p>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-[#020617] border-slate-800 text-slate-100 h-[92vh] max-h-[92vh] overflow-hidden sm:h-[85vh] sm:max-h-[85vh]">
        <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-col pb-0">
          <DrawerHeader className="px-4 sm:px-6">
            <DrawerTitle>Advanced Filter</DrawerTitle>
            <DrawerDescription className="text-slate-500">
              Filter the events by region, country, type, and date range.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4 sm:gap-8 sm:px-6 sm:pb-6">
            <div className="w-full space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-semibold text-slate-400">Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="na">Northern Africa</SelectItem>
                      <SelectItem value="me">Middle East</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label className="text-[10px] uppercase font-semibold text-slate-400">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 h-64">
                      <SelectItem value="all">All</SelectItem>
                      {filteredCountries.map((c) => {
                        const slug = slugifyCountry(c)
                        return (
                          <SelectItem key={c} value={slug}>
                            {c}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                  <Filter className="h-3 w-3" /> Event Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleEvent(type)}
                      className={cn(
                        'px-2.5 py-1 rounded border text-[10px] font-medium transition-colors',
                        selectedEvents.includes(type)
                          ? 'bg-blue-600/20 border-blue-500 text-blue-100'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600',
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Temporal Range
                </Label>
                {range?.from && (
                  <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-slate-900/80 px-3 py-1 rounded-xl sm:rounded-full border border-slate-800">
                    <span>FROM: {format(range.from, 'yyyy-MM-dd')}</span>
                    {range.to && <span>TO: {format(range.to, 'yyyy-MM-dd')}</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-center overflow-x-auto p-2 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/20">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={isMobile ? 1 : 2}
                  disabled={disabledDays}
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="sticky bottom-0 z-[2002] mt-0 flex-col sm:flex-row gap-3 border-t border-slate-800/50 bg-[#020617]/95 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 backdrop-blur-sm">
            <DrawerClose asChild>
              <Button
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 font-bold tracking-wide"
                onClick={async () => {
                  const selectedCountryName = country === 'all' ? 'All' : countryBySlug.get(country) ?? 'All'

                  await applyServerFilters({
                    region: regionUiToFilterMap[region] ?? 'All',
                    country: selectedCountryName,
                    eventTypes: selectedEvents,
                    startDate: range?.from ?? null,
                    endDate: range?.to ?? null,
                  })
                }}
              >
                Apply
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="w-full sm:w-auto"
                onClick={async () => {
                  setRegion('all')
                  setCountry('all')
                  setSelectedEvents([])
                  setRange({
                    from: defaultRange.from,
                    to: defaultRange.to,
                  })
                  await resetEventFilters()
                }}
              >
                RESET
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
