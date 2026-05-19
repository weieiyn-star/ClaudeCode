import { useCallback } from 'react'
import { BeatCard } from './BeatCard'
import { useStory } from '../engine/useStoryState'
import { useBeatObserver } from '../lib/useInViewBeat'

export function StoryCanvas() {
  const { state, currentBeat, inBranch, dispatch } = useStory()
  const onActivate = useCallback(
    (id: string) => {
      if (!inBranch && id !== state.currentMainBeatId) {
        dispatch({ type: 'goto', beatId: id })
      }
    },
    [dispatch, state.currentMainBeatId, inBranch],
  )
  const { register } = useBeatObserver(onActivate, !inBranch)

  const branchTop = state.branchStack[state.branchStack.length - 1]

  return (
    <div
      data-story-scroll
      className="h-full overflow-y-auto px-6 py-12 pb-[40vh]"
    >
      <header className="mb-10">
        <div className="text-xs uppercase tracking-widest text-ink-300 mb-2">
          Narrative Dashboard · Demo
        </div>
        <h1 className="text-2xl font-semibold text-ink-100 mb-2">
          {state.story.title}
        </h1>
        <p className="text-sm text-ink-300">{state.story.subtitle}</p>
      </header>

      {!inBranch && (
        <>
          {state.story.beats.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              index={i}
              total={state.story.beats.length}
              active={beat.id === currentBeat.id}
              registerRef={register}
              fromBeatIdForBranch={beat.id}
            />
          ))}
          <div className="text-center text-xs text-ink-500 pt-6">— 故事完 —</div>
        </>
      )}

      {inBranch && branchTop && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-ink-300">
              <span className="text-ink-500">分支：</span>
              <span className="text-accent-info font-medium">{branchTop.branch.trigger}</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'exitBranch' })}
              className="text-sm text-ink-300 hover:text-ink-100 underline-offset-4 hover:underline"
            >
              ← 返回主线
            </button>
          </div>
          {branchTop.branch.beats.map((beat, i) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              index={i}
              total={branchTop.branch.beats.length}
              active={i === branchTop.subIndex}
            />
          ))}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => dispatch({ type: 'exitBranch' })}
              className="text-sm text-ink-300 hover:text-ink-100"
            >
              ← 返回主线
            </button>
            {branchTop.subIndex < branchTop.branch.beats.length - 1 ? (
              <button
                onClick={() => dispatch({ type: 'subAdvance' })}
                className="px-4 py-2 rounded-lg text-sm bg-accent-info/20 border border-accent-info/40 text-ink-100 hover:bg-accent-info/30"
              >
                继续下一节拍 →
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'exitBranch' })}
                className="px-4 py-2 rounded-lg text-sm bg-accent-good/20 border border-accent-good/40 text-ink-100 hover:bg-accent-good/30"
              >
                分支结束 · 返回主线 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
