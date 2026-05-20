import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  type ReactNode,
  createElement,
} from 'react'
import type { Beat, Story } from '../types/story'
import {
  initialState,
  reduce,
  getCurrentBeat,
  type EngineAction,
  type EngineState,
} from './storyEngine'

type StoryContextValue = {
  state: EngineState
  currentBeat: Beat
  inBranch: boolean
  dispatch: (a: EngineAction) => void
}

const StoryContext = createContext<StoryContextValue | null>(null)

export function StoryProvider({ story, children }: { story: Story; children: ReactNode }) {
  const [state, dispatch] = useReducer(reduce, story, initialState)

  // URL hash 同步：#b3 / #b4/branch=br-appliance/sub=1
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace(/^#/, '')
      if (!h) return
      const parts = h.split('/')
      const beatId = parts[0]
      if (story.beats.find((b) => b.id === beatId)) {
        dispatch({ type: 'goto', beatId })
        const branchPart = parts.find((p) => p.startsWith('branch='))
        const subPart = parts.find((p) => p.startsWith('sub='))
        if (branchPart) {
          const branchId = branchPart.slice('branch='.length)
          dispatch({ type: 'enterBranch', branchId, fromBeatId: beatId })
          if (subPart) {
            const sub = parseInt(subPart.slice('sub='.length), 10)
            for (let i = 0; i < sub; i++) dispatch({ type: 'subAdvance' })
          }
        }
      }
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [story])

  useEffect(() => {
    let hash = `${state.currentMainBeatId}`
    if (state.branchStack.length) {
      const top = state.branchStack[state.branchStack.length - 1]
      hash += `/branch=${top.branch.id}`
      if (top.subIndex > 0) hash += `/sub=${top.subIndex}`
    }
    if (window.location.hash.replace(/^#/, '') !== hash) {
      history.replaceState(null, '', `#${hash}`)
    }
  }, [state.currentMainBeatId, state.branchStack])

  const value = useMemo<StoryContextValue>(() => {
    const currentBeat = getCurrentBeat(state)
    return { state, currentBeat, inBranch: state.branchStack.length > 0, dispatch }
  }, [state])

  return createElement(StoryContext.Provider, { value }, children)
}

export function useStory() {
  const ctx = useContext(StoryContext)
  if (!ctx) throw new Error('useStory must be used within StoryProvider')
  return ctx
}
