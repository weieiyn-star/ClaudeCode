import { StoryProvider } from './engine/useStoryState'
import { StoryCanvas } from './components/StoryCanvas'
import { ChartStage } from './components/ChartStage'
import { ProgressRail } from './components/ProgressRail'
import { BranchTrail } from './components/BranchTrail'
import { mainStory } from './data/mainStory'

export default function App() {
  return (
    <StoryProvider story={mainStory}>
      <div className="h-screen flex flex-col bg-ink-900 text-ink-100">
        {/* 桌面: 左右两栏。移动: 上下两栏（图固定在顶部，文字在下方滚动）。 */}
        <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-[minmax(360px,42%)_1fr] relative">
          <BranchTrail />
          {/* 图表：移动端在上，占 42vh；桌面端在右 */}
          <main className="order-1 md:order-2 h-[42vh] md:h-auto md:min-h-0 border-b border-ink-700/40 md:border-b-0">
            <ChartStage />
          </main>
          {/* 故事：移动端在下方滚动；桌面端在左 */}
          <aside className="order-2 md:order-1 flex-1 min-h-0 md:border-r md:border-ink-700/40">
            <StoryCanvas />
          </aside>
        </div>
        <ProgressRail />
      </div>
    </StoryProvider>
  )
}
