import { useStory } from '../engine/useStoryState'

export function BranchTrail() {
  const { state, inBranch, dispatch } = useStory()
  if (!inBranch) return null
  const top = state.branchStack[state.branchStack.length - 1]
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-ink-800/90 border border-accent-info/40 rounded-full px-4 py-1.5 text-sm backdrop-blur">
      <button
        onClick={() => dispatch({ type: 'exitBranch' })}
        className="text-ink-300 hover:text-white"
      >
        主线
      </button>
      <span className="text-ink-500">›</span>
      <span className="text-accent-info font-medium">{top.branch.trigger}</span>
      <span className="text-ink-500">·</span>
      <span className="text-ink-300 font-mono text-xs">
        {top.subIndex + 1} / {top.branch.beats.length}
      </span>
    </div>
  )
}
