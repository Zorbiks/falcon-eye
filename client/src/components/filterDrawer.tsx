import { useEffect, useState } from 'react'
import { RotateCcw, Filter, ChevronDown } from 'lucide-react'
import { format, getYear, startOfYear, endOfYear } from 'date-fns'
import { useGlobalData } from 'src/context'
import { Button } from 'src/components/pages/ui/button'
import { Calendar } from 'src/components/pages/ui/calendar'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'src/components/pages/ui/drawer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'src/components/ui/collapsible'
import { cn } from 'src/lib/utils'
import eventTypesRegistry from 'src/data/events-types.json'
import type { EventFilters, EventRegionFilter } from 'src/types/events'

const regionOptions: Array<{ label: EventRegionFilter; value: EventRegionFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Middle East', value: 'Middle East' },
  { label: 'North Africa', value: 'North Africa' },
]

const countryOptions = [
  'All',
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
  'Mauritania',
  'Morocco',
  'Oman',
  'Palestine',
  'Qatar',
  'Saudi Arabia',
  'Sudan',
  'Syria',
  'Tunisia',
  'Turkey',
  'United Arab Emirates',
  'Western Sahara',
  'Yemen',
]

const eventTypeOptions = Array.from(
  new Set((eventTypesRegistry as Array<{ EVENT_TYPE: string }>).map((item) => item.EVENT_TYPE.trim()).filter(Boolean)),
).sort((left, right) => left.localeCompare(right))

const formatDateLabel = (date: Date | null) => (date ? format(date, 'MMM d, yyyy') : 'Pick a date')

const defaultDrawerFilters: EventFilters = {
  region: 'All',
  country: 'All',
  eventTypes: [],
  startDate: null,
  endDate: null,
}

export default function FilterDrawer() {
  const { eventFilters, applyEventFilters, resetEventFilters } = useGlobalData()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<EventFilters>(defaultDrawerFilters)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null)

  // The locked year is derived from the start date, if set
  const lockedYear = draftFilters.startDate ? getYear(draftFilters.startDate) : null

  useEffect(() => {
    if (drawerOpen) {
      setDraftFilters(eventFilters)
    }
  }, [drawerOpen, eventFilters])

  const toggleEventType = (eventType: string) => {
    setDraftFilters((current) => ({
      ...current,
      eventTypes: current.eventTypes.includes(eventType)
        ? current.eventTypes.filter((value) => value !== eventType)
        : [...current.eventTypes, eventType],
    }))
  }

  const handleStartDateSelect = (date: Date | undefined) => {
    const selected = date ?? null
    setDraftFilters((current) => ({
      ...current,
      startDate: selected,
      // Clear end date if it's outside the new year
      endDate: current.endDate && selected && getYear(current.endDate) !== getYear(selected) ? null : current.endDate,
    }))
    setActivePicker(null)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setDraftFilters((current) => ({
      ...current,
      endDate: date ?? null,
    }))
    setActivePicker(null)
  }

  /**
   * For the end-date calendar:
   * - Disabled if no start date (year not known yet)
   * - Only dates within the same year as startDate are selectable
   * - Only dates >= startDate are selectable
   */
  const endDateDisabled = (date: Date): boolean => {
    if (!draftFilters.startDate) return true
    const year = getYear(draftFilters.startDate)
    return getYear(date) !== year || date < draftFilters.startDate
  }

  /**
   * Default month shown for each calendar picker
   */
  const startDefaultMonth = draftFilters.startDate ?? new Date()
  const endDefaultMonth = draftFilters.endDate ?? draftFilters.startDate ?? new Date()

  const handleApplyFilters = async () => {
    await applyEventFilters(draftFilters)
    setDrawerOpen(false)
  }

  const handleClearFilters = async () => {
    setDraftFilters(defaultDrawerFilters)
    setActivePicker(null)
    await resetEventFilters()
    setDrawerOpen(false)
  }

  const hasActiveDateFilters = draftFilters.startDate || draftFilters.endDate

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800"
          aria-label="Open filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="inset-y-0 right-0 left-auto mt-0 h-full w-full max-w-[440px] gap-0 overflow-hidden rounded-none border-l border-slate-800 border-t-0 bg-slate-950 p-0 font-sans text-slate-100 antialiased shadow-2xl sm:max-w-[440px] [&>div:first-child]:hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 px-5 py-4">
            <DrawerHeader className="space-y-2 px-0 text-left">
              <DrawerTitle className="text-xl font-semibold tracking-tight text-slate-50">Filter events</DrawerTitle>
              <DrawerDescription className="text-sm text-slate-400">
                Narrow the event stream by region, country, event type, and date range.
              </DrawerDescription>
            </DrawerHeader>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar">
            <div className="space-y-6">
              {/* Region */}
              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Region</div>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDraftFilters((current) => ({ ...current, region: option.value }))}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs transition-colors',
                        draftFilters.region === option.value
                          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80',
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Country */}
              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Country</div>
                <select
                  value={draftFilters.country}
                  onChange={(e) => setDraftFilters((current) => ({ ...current, country: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-800/80 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </section>

              {/* Event types */}
              <section className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Events</div>
                <div className="flex flex-wrap gap-2">
                  {eventTypeOptions.map((eventType) => {
                    const isActive = draftFilters.eventTypes.includes(eventType)
                    return (
                      <button
                        key={eventType}
                        type="button"
                        onClick={() => toggleEventType(eventType)}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs transition-colors',
                          isActive
                            ? 'border-amber-500/60 bg-amber-500/15 text-amber-200'
                            : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80',
                        )}
                      >
                        {eventType}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Date range */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date range</div>
                  {hasActiveDateFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftFilters((c) => ({ ...c, startDate: null, endDate: null }))
                        setActivePicker(null)
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Clear dates
                    </button>
                  )}
                </div>

                {/* Year lock notice */}
                {lockedYear && (
                  <p className="text-[11px] text-amber-400/80">
                    End date is locked to <span className="font-semibold">{lockedYear}</span> — matching the start date
                    year.
                  </p>
                )}

                {/* Start & End trigger buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Start date */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">From</div>
                    <button
                      type="button"
                      onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                        activePicker === 'start'
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : draftFilters.startDate
                          ? 'border-slate-600 bg-slate-900/60 text-slate-200'
                          : 'border-slate-700 bg-slate-900/60 text-slate-500 hover:bg-slate-800/80',
                      )}
                    >
                      {formatDateLabel(draftFilters.startDate)}
                    </button>
                  </div>

                  {/* End date */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">To</div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!draftFilters.startDate) return
                        setActivePicker(activePicker === 'end' ? null : 'end')
                      }}
                      disabled={!draftFilters.startDate}
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                        !draftFilters.startDate
                          ? 'cursor-not-allowed border-slate-800 bg-slate-900/30 text-slate-600'
                          : activePicker === 'end'
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : draftFilters.endDate
                          ? 'border-slate-600 bg-slate-900/60 text-slate-200'
                          : 'border-slate-700 bg-slate-900/60 text-slate-500 hover:bg-slate-800/80',
                      )}
                    >
                      {draftFilters.startDate ? formatDateLabel(draftFilters.endDate) : 'Set start first'}
                    </button>
                  </div>
                </div>

                {/* Inline calendars */}
                {activePicker === 'start' && (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 shadow-xl">
                    <Calendar
                      mode="single"
                      selected={draftFilters.startDate ?? undefined}
                      onSelect={handleStartDateSelect}
                      defaultMonth={startDefaultMonth}
                      initialFocus
                      classNames={{
                        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                        month: 'space-y-4',
                        caption: 'flex justify-center pt-1 relative items-center',
                        caption_label: 'text-sm font-medium text-slate-200',
                        nav: 'space-x-1 flex items-center',
                        nav_button:
                          'h-7 w-7 bg-transparent p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell: 'text-slate-500 rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-800/50 rounded-md',
                        day: 'h-9 w-9 p-0 font-normal text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-md transition-colors inline-flex items-center justify-center',
                        day_selected:
                          'bg-sky-500 text-white hover:bg-sky-400 hover:text-white focus:bg-sky-500 focus:text-white rounded-md',
                        day_today: 'bg-slate-800 text-slate-100 rounded-md',
                        day_outside: 'text-slate-700',
                        day_disabled: 'text-slate-700 opacity-40 cursor-not-allowed',
                        day_hidden: 'invisible',
                      }}
                    />
                  </div>
                )}

                {activePicker === 'end' && draftFilters.startDate && (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 shadow-xl">
                    <Calendar
                      mode="single"
                      selected={draftFilters.endDate ?? undefined}
                      onSelect={handleEndDateSelect}
                      defaultMonth={endDefaultMonth}
                      disabled={endDateDisabled}
                      // Constrain navigation to the locked year only
                      fromDate={startOfYear(draftFilters.startDate)}
                      toDate={endOfYear(draftFilters.startDate)}
                      initialFocus
                      classNames={{
                        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                        month: 'space-y-4',
                        caption: 'flex justify-center pt-1 relative items-center',
                        caption_label: 'text-sm font-medium text-slate-200',
                        nav: 'space-x-1 flex items-center',
                        nav_button:
                          'h-7 w-7 bg-transparent p-0 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center',
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell: 'text-slate-500 rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-800/50 rounded-md',
                        day: 'h-9 w-9 p-0 font-normal text-slate-300 hover:bg-slate-800 hover:text-slate-100 rounded-md transition-colors inline-flex items-center justify-center',
                        day_selected:
                          'bg-emerald-500 text-white hover:bg-emerald-400 hover:text-white focus:bg-emerald-500 focus:text-white rounded-md',
                        day_today: 'bg-slate-800 text-slate-100 rounded-md',
                        day_outside: 'text-slate-700',
                        day_disabled: 'text-slate-700 opacity-40 cursor-not-allowed',
                        day_hidden: 'invisible',
                      }}
                    />
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-slate-800 bg-slate-950/95 px-5 py-4 backdrop-blur-sm">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 bg-transparent text-slate-200 hover:bg-slate-900"
                onClick={handleClearFilters}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                className="flex-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                onClick={handleApplyFilters}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
