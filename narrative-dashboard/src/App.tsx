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
        <div className="flex-1 grid grid-cols-[minmax(360px,42%)_1fr] min-h-0 relative">
          <BranchTrail />
          <aside className="border-r border-ink-700/40 min-h-0">
            <StoryCanvas />
          </aside>
          <main className="min-h-0">
            <ChartStage />
          </main>
        </div>
        <ProgressRail />
      </div>
    </StoryProvider>
  )
}
