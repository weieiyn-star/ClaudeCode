import { useEffect, useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsInstance } from 'echarts-for-react'
import { useStory } from '../engine/useStoryState'
import { metrics } from '../data/mockMetrics'
import { chartStateToOption } from '../engine/chartStateToOption'
import { entityToFocus } from '../lib/parseInlineEntities'
import { relations } from '../data/relations'

export function ChartStage() {
  const { currentBeat, state } = useStory()
  const chartRef = useRef<EChartsInstance | null>(null)
  const lastViewRef = useRef<string | null>(null)
  const [fadeKey, setFadeKey] = useState(0)

  const option = useMemo(
    () => chartStateToOption(currentBeat, metrics),
    [currentBeat],
  )

  useEffect(() => {
    const view = currentBeat.chartState.view
    if (lastViewRef.current && lastViewRef.current !== view) {
      setFadeKey((k) => k + 1)
    }
    lastViewRef.current = view
  }, [currentBeat.chartState.view])

  useEffect(() => {
    if (!chartRef.current) return
    const ec = chartRef.current
    const hoveredId = state.hoveredEntityId
    if (!hoveredId) {
      ec.dispatchAction({ type: 'downplay' })
      return
    }
    const focus = entityToFocus[hoveredId]
    if (!focus) return
    const view = currentBeat.chartState.view
    if ((view === 'pair' || view === 'line') && focus.series) {
      ec.dispatchAction({ type: 'highlight', seriesId: focus.series })
    } else if (view === 'bar' && focus.series) {
      const idx = metrics.categoryDelta.findIndex((c) => c.id === focus.series)
      if (idx >= 0) {
        ec.dispatchAction({
          type: 'highlight',
          seriesId: 'category-delta',
          dataIndex: idx,
        })
      }
    } else if (view === 'cohort' && focus.row) {
      const rowIdx = metrics.cohorts.indexOf(focus.row)
      if (rowIdx >= 0) {
        ec.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: rowIdx * metrics.cohortMetrics.length,
        })
      }
    } else if (view === 'heatmap' && focus.row && focus.col) {
      const rowIdx = metrics.skus.indexOf(focus.row)
      const colIdx = metrics.weekdays.indexOf(focus.col)
      if (rowIdx >= 0 && colIdx >= 0) {
        ec.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: rowIdx * metrics.weekdays.length + colIdx,
        })
      }
    }
  }, [state.hoveredEntityId, currentBeat.chartState.view])

  const expectedBandRel = currentBeat.chartState.expectedBand
    ? relations[currentBeat.chartState.expectedBand]
    : null

  return (
    <div className="h-full flex flex-col bg-ink-900">
      <div className="px-4 md:px-6 pt-3 md:pt-6 pb-1 md:pb-2 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] md:text-xs uppercase tracking-widest text-ink-500">
            {currentBeat.chartState.view.toUpperCase()} VIEW
          </div>
          <div className="text-sm md:text-lg text-ink-100 font-medium truncate">
            {currentBeat.chartState.caption ?? state.story.title}
          </div>
        </div>
        {expectedBandRel && (
          <div className="hidden md:block text-xs text-ink-300 max-w-[50%] text-right leading-relaxed shrink-0">
            <span className="inline-block w-2 h-2 rounded-sm bg-accent-info/40 mr-1.5 align-middle" />
            预期：{expectedBandRel.description}
            {expectedBandRel.break && currentBeat.act !== 'hook' && (
              <span className="ml-2 text-accent-bad">
                · 本期 {expectedBandRel.break.kind}（{expectedBandRel.break.severity}）
              </span>
            )}
          </div>
        )}
        {expectedBandRel && (
          <div
            className={[
              'md:hidden text-[10px] shrink-0',
              currentBeat.act === 'hook' ? 'text-accent-info' : 'text-accent-bad',
            ].join(' ')}
          >
            {currentBeat.act === 'hook' ? '预期关系' : '关系破裂'}
          </div>
        )}
      </div>
      <div className="flex-1 px-1 md:px-2 pb-2 md:pb-4 relative">
        <ReactECharts
          key={fadeKey}
          option={option}
          notMerge={false}
          lazyUpdate={false}
          style={{ height: '100%', width: '100%' }}
          theme={undefined}
          opts={{ renderer: 'canvas' }}
          onChartReady={(ec) => {
            chartRef.current = ec
          }}
        />
      </div>
    </div>
  )
}
