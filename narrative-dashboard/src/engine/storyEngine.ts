import type { Beat, Story, Branch } from '../types/story'

export type EngineState = {
  story: Story
  // 主线节拍 id 列表
  mainBeatIds: string[]
  // 当前主线节拍 id
  currentMainBeatId: string
  // 分支栈：每一层是 (branch, subBeatIndex)
  branchStack: { branch: Branch; subIndex: number }[]
  // 文中实体悬停广播
  hoveredEntityId: string | null
}

export function initialState(story: Story): EngineState {
  return {
    story,
    mainBeatIds: story.beats.map((b) => b.id),
    currentMainBeatId: story.beats[0].id,
    branchStack: [],
    hoveredEntityId: null,
  }
}

export function getCurrentBeat(state: EngineState): Beat {
  if (state.branchStack.length > 0) {
    const top = state.branchStack[state.branchStack.length - 1]
    return top.branch.beats[top.subIndex]
  }
  return (
    state.story.beats.find((b) => b.id === state.currentMainBeatId) ??
    state.story.beats[0]
  )
}

export type EngineAction =
  | { type: 'goto'; beatId: string }
  | { type: 'enterBranch'; branchId: string; fromBeatId: string }
  | { type: 'subAdvance' }
  | { type: 'exitBranch' }
  | { type: 'setHovered'; entityId: string | null }

export function reduce(state: EngineState, action: EngineAction): EngineState {
  switch (action.type) {
    case 'goto':
      // 主线跳转时，清空分支栈
      if (state.mainBeatIds.includes(action.beatId)) {
        return { ...state, currentMainBeatId: action.beatId, branchStack: [] }
      }
      return state
    case 'enterBranch': {
      const fromBeat = state.story.beats.find((b) => b.id === action.fromBeatId)
      const branch = fromBeat?.branches?.find((br) => br.id === action.branchId)
      if (!branch) return state
      return {
        ...state,
        currentMainBeatId: action.fromBeatId,
        branchStack: [...state.branchStack, { branch, subIndex: 0 }],
      }
    }
    case 'subAdvance': {
      if (!state.branchStack.length) return state
      const stack = [...state.branchStack]
      const top = stack[stack.length - 1]
      if (top.subIndex < top.branch.beats.length - 1) {
        stack[stack.length - 1] = { ...top, subIndex: top.subIndex + 1 }
        return { ...state, branchStack: stack }
      }
      return state
    }
    case 'exitBranch':
      return { ...state, branchStack: state.branchStack.slice(0, -1) }
    case 'setHovered':
      return { ...state, hoveredEntityId: action.entityId }
  }
}
