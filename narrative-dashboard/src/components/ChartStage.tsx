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

  // 跨 view 切换时，强制重建实例（fade 效果），同 view 内则 setOption merge 触发原生 morph。
  useEffect(() => {
    const view = currentBeat.chartState.view
    if (lastViewRef.current && lastViewRef.current !== view) {
      setFadeKey((k) => k + 1)
    }
    lastViewRef.current = view
  }, [currentBeat.chartState.view])

  // 实体 hover → 触发图上 highlight
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
      // 找到对应品类的 index
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
        // heatmap 无内建 row highlight；用 axisPointer 替代
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
      <div className="px-6 pt-6 pb-2 flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-500">
            {currentBeat.chartState.view.toUpperCase()} VIEW
          </div>
          <div className="text-lg text-ink-100 font-medium">
            {currentBeat.chartState.caption ?? state.story.title}
          </div>
        </div>
        {expectedBandRel && (
          <div className="text-xs text-ink-300 max-w-[50%] text-right leading-relaxed">
            <span className="inline-block w-2 h-2 rounded-sm bg-accent-info/40 mr-1.5 align-middle" />
            预期：{expectedBandRel.description}
            {expectedBandRel.break && (
              <span className="ml-2 text-accent-bad">
                · 本期 {expectedBandRel.break.kind} ({expectedBandRel.break.severity})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 px-2 pb-4 relative">
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
