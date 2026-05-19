import { useStory } from '../engine/useStoryState'

export function EntityChip({ id, label }: { id: string; label: string }) {
  const { dispatch, state } = useStory()
  const active = state.hoveredEntityId === id
  return (
    <span
      role="button"
      tabIndex={0}
      onMouseEnter={() => dispatch({ type: 'setHovered', entityId: id })}
      onMouseLeave={() => dispatch({ type: 'setHovered', entityId: null })}
      onFocus={() => dispatch({ type: 'setHovered', entityId: id })}
      onBlur={() => dispatch({ type: 'setHovered', entityId: null })}
      className={[
        'inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md border text-[0.95em] font-medium transition-colors cursor-pointer',
        active
          ? 'bg-accent-info/20 border-accent-info text-white'
          : 'bg-ink-700/50 border-ink-500/40 text-ink-100 hover:bg-accent-info/15 hover:border-accent-info/60',
      ].join(' ')}
    >
      {label}
    </span>
  )
}
