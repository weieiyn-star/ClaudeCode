import { Fragment, useEffect, useRef } from 'react'
import type { Beat } from '../types/story'
import { parseInlineEntities } from '../lib/parseInlineEntities'
import { EntityChip } from './EntityChip'
import { useStory } from '../engine/useStoryState'

const ACT_LABELS: Record<Beat['act'], { label: string; tone: string }> = {
  hook: { label: '引子', tone: 'bg-accent-info/15 text-accent-info border-accent-info/30' },
  contradiction: { label: '矛盾', tone: 'bg-accent-bad/15 text-accent-bad border-accent-bad/30' },
  question: { label: '设问', tone: 'bg-accent-warn/15 text-accent-warn border-accent-warn/30' },
  explore: { label: '展开', tone: 'bg-ink-500/15 text-ink-100 border-ink-500/30' },
  turn: { label: '转折', tone: 'bg-accent-warn/15 text-accent-warn border-accent-warn/30' },
  insight: { label: '洞察', tone: 'bg-accent-good/15 text-accent-good border-accent-good/30' },
  action: { label: '行动', tone: 'bg-accent-good/15 text-accent-good border-accent-good/30' },
}

export function BeatCard({
  beat,
  index,
  total,
  active,
  registerRef,
  fromBeatIdForBranch,
}: {
  beat: Beat
  index: number
  total: number
  active: boolean
  registerRef?: (id: string, el: HTMLElement | null) => void
  fromBeatIdForBranch?: string
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const { dispatch } = useStory()
  const tokens = parseInlineEntities(beat.text)
  const meta = ACT_LABELS[beat.act]

  useEffect(() => {
    registerRef?.(beat.id, cardRef.current)
    return () => registerRef?.(beat.id, null)
  }, [beat.id, registerRef])

  return (
    <div
      ref={cardRef}
      data-beat-id={beat.id}
      className={[
        'relative rounded-xl p-5 mb-6 border transition-all duration-300',
        active
          ? 'bg-ink-800/90 border-ink-500/50 shadow-[0_0_0_1px_rgba(91,141,239,0.25),0_8px_30px_rgba(0,0,0,0.35)]'
          : 'bg-ink-800/40 border-ink-700/40 opacity-70',
      ].join(' ')}
    >
      <div className="flex items-center gap-2 text-xs text-ink-300 mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border ${meta.tone}`}>
          {meta.label}
        </span>
        <span className="font-mono">
          {index + 1} / {total}
        </span>
        {beat.reveals && (
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-md border border-accent-bad/40 bg-accent-bad/10 text-accent-bad">
            关系破裂 · {beat.reveals}
          </span>
        )}
      </div>
      <p className="text-base leading-relaxed text-ink-100">
        {tokens.map((t, i) =>
          t.kind === 'text' ? (
            <Fragment key={i}>{t.value}</Fragment>
          ) : (
            <EntityChip key={i} id={t.id} label={t.label} />
          ),
        )}
      </p>
      {beat.branches && beat.branches.length > 0 && fromBeatIdForBranch && (
        <div className="mt-4 flex flex-wrap gap-2">
          {beat.branches.map((br) => (
            <button
              key={br.id}
              onClick={() =>
                dispatch({
                  type: 'enterBranch',
                  branchId: br.id,
                  fromBeatId: fromBeatIdForBranch,
                })
              }
              className="px-3 py-1.5 rounded-lg text-sm bg-ink-700/60 border border-ink-500/30 text-ink-100 hover:bg-accent-info/20 hover:border-accent-info/50 transition-colors"
            >
              {br.trigger} →
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
