import { useMemo, useState } from 'react'
import sourcesData from '../data/sources.json'
import { SOURCE_GROUP_LABELS, SOURCE_GROUP_ORDER } from 'src/canstants/stats'
import { SourcesSkeleton } from './loaders'
import { useGlobalData } from 'src/context'

export default function Sources() {
  const { isLoading } = useGlobalData()

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const groupedSources = useMemo(() => {
    return SOURCE_GROUP_ORDER.map((groupKey) => ({
      groupName: SOURCE_GROUP_LABELS[groupKey],
      sources: sourcesData[groupKey as keyof typeof sourcesData] || [],
    })).filter((group) => group.sources.length > 0)
  }, [])

  const totalSources = useMemo(
    () => groupedSources.reduce((total, group) => total + group.sources.length, 0),
    [groupedSources],
  )

  const isGroupOpen = (groupName: string) => openGroups[groupName] ?? false

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !(prev[groupName] ?? true),
    }))
  }

  if (isLoading) {
    return <SourcesSkeleton />
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-4 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-slate-200 text-xs font-semibold uppercase tracking-wider">Sources</h3>
        <span className="text-[10px] text-slate-300 font-mono">
          <span className="text-emerald-500">{totalSources}</span> SOURCES
        </span>
      </div>

      <div className="space-y-4 text-[11px]">
        {groupedSources.map((group) => (
          <div key={group.groupName} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleGroup(group.groupName)}
              className="flex w-full items-center gap-2 text-left text-slate-100 font-semibold"
              aria-expanded={isGroupOpen(group.groupName)}
              aria-label={`Toggle ${group.groupName} sources`}
            >
              <span className="text-slate-400">{isGroupOpen(group.groupName) ? '⌄' : '›'}</span>
              <span>{group.groupName}</span>
            </button>

            {isGroupOpen(group.groupName) ? (
              <div className="ml-4 border-l border-slate-800 pl-4 space-y-2 text-slate-300">
                {group.sources.map((sourceName) => (
                  <div key={sourceName} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    <span>{sourceName}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}

        {groupedSources.length === 0 ? <div className="text-slate-400">No sources available</div> : null}
      </div>
    </div>
  )
}
