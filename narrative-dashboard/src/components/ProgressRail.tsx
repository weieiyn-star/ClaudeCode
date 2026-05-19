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
    <div className="border-t border-ink-700/50 bg-ink-900/95 backdrop-blur px-6 py-3 flex items-center gap-3">
      <div className="text-xs text-ink-500 uppercase tracking-widest font-mono">
        Story Progress
      </div>
      <div className="flex-1 flex items-center gap-1.5">
        {state.story.beats.map((beat, i) => {
          const active = !inBranch && beat.id === currentBeat.id
          const passed =
            !inBranch &&
            state.story.beats.findIndex((b) => b.id === currentBeat.id) > i
          return (
            <button
              key={beat.id}
              onClick={() => dispatch({ type: 'goto', beatId: beat.id })}
              title={`${i + 1}. ${beat.act}`}
              className="group flex items-center"
            >
              <span
                className={[
                  'block rounded-full transition-all',
                  ACT_DOT[beat.act] ?? 'bg-ink-500',
                  active
                    ? 'w-3.5 h-3.5 ring-2 ring-white/40'
                    : passed
                      ? 'w-2 h-2 opacity-70'
                      : 'w-2 h-2 opacity-40 group-hover:opacity-80',
                ].join(' ')}
              />
              {i < state.story.beats.length - 1 && (
                <span
                  className={[
                    'block h-px w-8 mx-0.5 transition-colors',
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
          className="text-xs text-accent-info hover:text-white px-2 py-1 border border-accent-info/40 rounded-md"
        >
          退出分支
        </button>
      ) : (
        <div className="text-xs text-ink-500 font-mono">{currentBeat.id}</div>
      )}
    </div>
  )
}
