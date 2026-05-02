'use client'

import * as React from 'react'
import { DayPicker, DateRange } from '@daypicker/react'
import { isSameYear, format, addDays } from 'date-fns'
import { Globe, Filter, ListFilter, Calendar as CalendarIcon } from 'lucide-react'
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

const MENA_COUNTRIES = [
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

const EVENT_TYPES = [
  'Battles',
  'Explosions/Remote violence',
  'Protests',
  'Riots',
  'Strategic developments',
  'Violence against civilians',
]

export default function FilterDrawer() {
  const [region, setRegion] = React.useState<string>('all')
  const [country, setCountry] = React.useState<string>('all')
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>([])

  // Defaulting to 2026 for your Falcon Eye project context
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 3, 1),
    to: addDays(new Date(2026, 3, 1), 14),
  })

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
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-400">
          <ListFilter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-[#020617] border-slate-800 text-slate-100 h-[85vh] max-h-[85vh] overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-col pb-0">
          <DrawerHeader className="px-6">
            <DrawerTitle>Advanced Filter</DrawerTitle>
            <DrawerDescription className="text-slate-500">
              Filter the events by region, country, type, and date range.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-6 pb-6">
            <div className="w-full space-y-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase font-semibold text-slate-400">Region</Label>
                  <Select defaultValue={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9">
                      <SelectValue placeholder="Region" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="na">North Africa</SelectItem>
                      <SelectItem value="me">Middle East</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label className="text-[10px] uppercase font-semibold text-slate-400">Country</Label>
                  <Select defaultValue={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-800 h-9">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 h-64">
                      <SelectItem value="all">All</SelectItem>
                      {MENA_COUNTRIES.map((c) => {
                        const slug = c
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z-]/g, '')
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
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Temporal Range
                </Label>
                {range?.from && (
                  <div className="text-[10px] font-mono text-slate-400 flex gap-4 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                    <span>FROM: {format(range.from, 'yyyy-MM-dd')}</span>
                    {range.to && <span>TO: {format(range.to, 'yyyy-MM-dd')}</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-center p-4 rounded-xl border border-slate-800 bg-slate-900/20">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  numberOfMonths={2}
                  disabled={disabledDays}
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="sticky bottom-0 z-[2002] mt-0 flex-row gap-3 border-t border-slate-800/50 bg-[#020617]/95 px-6 pt-6 backdrop-blur-sm">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500 font-bold tracking-wide">Apply</Button>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                onClick={() => {
                  setRegion('all')
                  setCountry('all')
                  setSelectedEvents([])
                  setRange({
                    from: new Date(2026, 3, 1),
                    to: addDays(new Date(2026, 3, 1), 14),
                  })
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
