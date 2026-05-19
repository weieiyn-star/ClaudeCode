import { useStory } from '../engine/useStoryState'

const ACT_DOT: Record<string, string> = {
  hook: 'bg-accent-info',
  contradiction: 'bg-accent-bad',
  question: 'bg-accent-warn',
  explore: 'bg-ink-500',
  turn: 'bg-accent-warn',
  insight: 'bg-accent-good',
  action: 'bg-accent-good',
}

export function ProgressRail() {
  const { state, currentBeat, inBranch, dispatch } = useStory()
  return (
    <div className="border-t border-ink-700/50 bg-ink-900/95 backdrop-blur px-3 md:px-6 py-2.5 md:py-3 flex items-center gap-2 md:gap-3">
      <div className="hidden md:block text-xs text-ink-500 uppercase tracking-widest font-mono">
        Story Progress
      </div>
      <div className="flex-1 flex items-center gap-1 md:gap-1.5 justify-between md:justify-start">
        {state.story.beats.map((beat, i) => {
          const active = !inBranch && beat.id === currentBeat.id
          const passed =
            !inBranch &&
            state.story.beats.findIndex((b) => b.id === currentBeat.id) > i
          return (
            <button
              key={beat.id}
              onClick={() => {
                const el = document.querySelector(
                  `[data-beat-id="${beat.id}"]`,
                ) as HTMLElement | null
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                dispatch({ type: 'goto', beatId: beat.id })
              }}
              title={`${i + 1}. ${beat.act}`}
              className="group flex items-center"
            >
              <span
                className={[
                  'block rounded-full transition-all',
                  ACT_DOT[beat.act] ?? 'bg-ink-500',
                  active
                    ? 'w-3 h-3 md:w-3.5 md:h-3.5 ring-2 ring-white/40'
                    : passed
                      ? 'w-2 h-2 opacity-70'
                      : 'w-2 h-2 opacity-40 group-hover:opacity-80',
                ].join(' ')}
              />
              {i < state.story.beats.length - 1 && (
                <span
                  className={[
                    'block h-px w-3 md:w-8 mx-0.5 transition-colors',
                    passed ? 'bg-ink-500' : 'bg-ink-700',
                  ].join(' ')}
                />
              )}
            </button>
          )
        })}
      </div>
      {inBranch ? (
        <button
          onClick={() => dispatch({ type: 'exitBranch' })}
          className="text-xs text-accent-info hover:text-white px-2 py-1 border border-accent-info/40 rounded-md whitespace-nowrap"
        >
          退出分支
        </button>
      ) : (
        <div className="text-[10px] md:text-xs text-ink-500 font-mono">{currentBeat.id}</div>
      )}
    </div>
  )
}
