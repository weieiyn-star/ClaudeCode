import type { Beat, ChartState, Annotation } from '../types/story'
import type { Metrics } from '../data/mockMetrics'
import { relations } from '../data/relations'
import { computeExpectedBand } from './relationBand'

// 共用调色
const C = {
  gmv: '#5b8def',
  uv: '#3bc28b',
  bandFill: 'rgba(91, 141, 239, 0.10)',
  bandFillBroken: 'rgba(225, 84, 87, 0.16)',
  bandLine: 'rgba(91, 141, 239, 0.35)',
  axisLine: 'rgba(154, 163, 194, 0.25)',
  axisLabel: '#9aa3c2',
  text: '#e5e8f2',
  bad: '#e15457',
  warn: '#f0a23a',
  good: '#3bc28b',
  grid: 'rgba(154, 163, 194, 0.10)',
}

const baseGrid = {
  left: 56,
  right: 56,
  top: 56,
  bottom: 56,
  containLabel: false,
}

const baseTooltip = {
  trigger: 'axis' as const,
  backgroundColor: 'rgba(13, 17, 38, 0.92)',
  borderColor: 'rgba(154, 163, 194, 0.25)',
  borderWidth: 1,
  textStyle: { color: C.text, fontSize: 12 },
}

const baseAxisLabel = { color: C.axisLabel, fontSize: 11 }
const baseAxisLine = { lineStyle: { color: C.axisLine } }
const baseSplitLine = { lineStyle: { color: C.grid } }

function pairView(state: ChartState, beat: Beat, metrics: Metrics) {
  const range = state.range ?? ['W1', 'W26']
  const startIdx = metrics.weekLabels.indexOf(range[0])
  const endIdx = metrics.weekLabels.indexOf(range[1])
  const sliceWeeks = metrics.weekLabels.slice(startIdx, endIdx + 1)
  const sliceGmv = metrics.gmvHistory.slice(startIdx, endIdx + 1).map((d) => d.value)
  const sliceUv = metrics.uvHistory.slice(startIdx, endIdx + 1).map((d) => d.value)

  // 计算预期带
  let bandSeries: any[] = []
  let bandBrokenMarkArea: any = null
  if (state.expectedBand) {
    const rel = relations[state.expectedBand]
    const band = computeExpectedBand(rel, metrics)
    if (band) {
      const expectedLow = band.expectedLow.slice(startIdx, endIdx + 1)
      const expectedHigh = band.expectedHigh.slice(startIdx, endIdx + 1)
      bandSeries = [
        {
          name: '预期下沿',
          type: 'line',
          data: expectedLow,
          lineStyle: { opacity: 0 },
          stack: 'expected-band',
          symbol: 'none',
          silent: true,
          z: 0,
        },
        {
          name: '预期共行区',
          type: 'line',
          data: expectedHigh.map((h, i) => +(h - expectedLow[i]).toFixed(1)),
          lineStyle: { opacity: 0 },
          areaStyle: { color: C.bandFill },
          stack: 'expected-band',
          symbol: 'none',
          silent: true,
          z: 0,
        },
      ]
      // 偏离区域：以 markArea 在最后一段染色
      const breakStarts = band.divergenceIndices.filter(
        (i) => i >= startIdx && i <= endIdx,
      )
      if (breakStarts.length) {
        const firstBreak = breakStarts[0]
        bandBrokenMarkArea = {
          silent: true,
          itemStyle: { color: C.bandFillBroken },
          data: [
            [
              { xAxis: metrics.weekLabels[firstBreak] },
              { xAxis: metrics.weekLabels[endIdx] },
            ],
          ],
        }
      }
    }
  }

  const focusIndex =
    state.focus?.x !== undefined ? sliceWeeks.indexOf(state.focus.x) : -1

  const markPoints: any[] = []
  const markLines: any[] = []
  ;(beat.annotations ?? []).forEach((a: Annotation) => {
    if (a.kind === 'divergence' && a.anchor.x) {
      markPoints.push({
        coord: [a.anchor.x, sliceGmv[sliceWeeks.indexOf(a.anchor.x)] ?? null],
        symbol: 'pin',
        symbolSize: 56,
        itemStyle: { color: C.bad },
        label: {
          show: true,
          formatter: a.text ?? '分叉',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600 as const,
        },
      })
    }
    if (a.kind === 'label' && a.anchor.x) {
      markLines.push({
        xAxis: a.anchor.x,
        lineStyle: { color: C.warn, type: 'dashed' as const },
        label: { formatter: a.text ?? '', color: C.warn, fontSize: 11 },
      })
    }
  })

  return {
    backgroundColor: 'transparent',
    grid: baseGrid,
    tooltip: baseTooltip,
    legend: {
      top: 12,
      right: 16,
      textStyle: { color: C.text, fontSize: 12 },
      data: ['GMV', 'UV', '预期共行区'],
    },
    xAxis: {
      type: 'category',
      data: sliceWeeks,
      axisLine: baseAxisLine,
      axisLabel: baseAxisLabel,
      axisTick: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: 'GMV (万)',
        nameTextStyle: { color: C.axisLabel, fontSize: 11 },
        axisLine: baseAxisLine,
        axisLabel: baseAxisLabel,
        splitLine: baseSplitLine,
      },
      {
        type: 'value',
        name: 'UV (万)',
        nameTextStyle: { color: C.axisLabel, fontSize: 11 },
        axisLine: baseAxisLine,
        axisLabel: baseAxisLabel,
        splitLine: { show: false },
      },
    ],
    series: [
      ...bandSeries,
      {
        id: 'gmv',
        name: 'GMV',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2.5, color: C.gmv },
        itemStyle: { color: C.gmv },
        data: sliceGmv.map((v, i) => ({
          value: v,
          itemStyle:
            i === focusIndex
              ? { color: C.bad, borderColor: '#fff', borderWidth: 2 }
              : undefined,
          symbolSize: i === focusIndex ? 14 : 6,
        })),
        markPoint: markPoints.length ? { data: markPoints } : undefined,
        markLine: markLines.length ? { data: markLines } : undefined,
        markArea: bandBrokenMarkArea ?? undefined,
        universalTransition: true,
        animationDurationUpdate: 700,
      },
      {
        id: 'uv',
        name: 'UV',
        type: 'line',
        smooth: true,
        symbolSize: 6,
        yAxisIndex: 1,
        lineStyle: { width: 2.5, color: C.uv, type: 'solid' as const },
        itemStyle: { color: C.uv },
        data: sliceUv.map((v, i) => ({
          value: v,
          symbolSize: i === focusIndex ? 14 : 6,
        })),
        universalTransition: true,
        animationDurationUpdate: 700,
      },
    ],
  }
}

function barView(state: ChartState, _beat: Beat, metrics: Metrics) {
  const cats = metrics.categoryDelta
  const focusId = state.focus?.series
  return {
    backgroundColor: 'transparent',
    grid: { ...baseGrid, left: 92, right: 80 },
    tooltip: {
      ...baseTooltip,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/>本周变化: <b>${p.value > 0 ? '+' : ''}${p.value}%</b>`
      },
    },
    xAxis: {
      type: 'value',
      axisLine: baseAxisLine,
      axisLabel: { ...baseAxisLabel, formatter: '{value}%' },
      splitLine: baseSplitLine,
    },
    yAxis: {
      type: 'category',
      data: cats.map((c) => c.name),
      axisLine: baseAxisLine,
      axisLabel: { ...baseAxisLabel, fontSize: 12 },
      axisTick: { show: false },
      inverse: true,
    },
    series: [
      {
        id: 'category-delta',
        name: '本周变化 %',
        type: 'bar',
        data: cats.map((c) => ({
          value: c.deltaPct,
          itemStyle: {
            color:
              c.id === focusId
                ? C.bad
                : c.deltaPct < -10
                  ? C.bad
                  : c.deltaPct < 0
                    ? C.warn
                    : C.good,
            borderRadius: [0, 6, 6, 0] as [number, number, number, number],
            opacity: focusId && c.id !== focusId ? 0.45 : 1,
          },
        })),
        label: {
          show: true,
          position: 'right' as const,
          color: C.text,
          fontSize: 11,
          formatter: (p: any) => `${p.value > 0 ? '+' : ''}${p.value}%`,
        },
        barWidth: 22,
        universalTransition: true,
        animationDurationUpdate: 700,
      },
    ],
  }
}

function cohortView(state: ChartState, _beat: Beat, metrics: Metrics) {
  // 二维矩阵渲染成 heatmap
  const focusCell = state.focus?.cell
  const data: [number, number, number][] = []
  metrics.cohortMatrix.forEach((row, i) => {
    row.forEach((v, j) => data.push([j, metrics.cohorts.length - 1 - i, v]))
  })
  const max = Math.max(...metrics.cohortMatrix.flat().map((v) => Math.abs(v)))
  return {
    backgroundColor: 'transparent',
    grid: { ...baseGrid, left: 96, right: 80, top: 64, bottom: 56 },
    tooltip: {
      ...baseTooltip,
      trigger: 'item' as const,
      formatter: (p: any) => {
        const cohort = metrics.cohorts[metrics.cohorts.length - 1 - p.value[1]]
        const metric = metrics.cohortMetrics[p.value[0]]
        const v = p.value[2]
        return `${cohort} · ${metric}<br/>偏离: <b>${v > 0 ? '+' : ''}${v}%</b>`
      },
    },
    xAxis: {
      type: 'category',
      data: metrics.cohortMetrics,
      position: 'top' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...baseAxisLabel, fontSize: 12, color: C.text },
    },
    yAxis: {
      type: 'category',
      data: [...metrics.cohorts].reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...baseAxisLabel, fontSize: 12, color: C.text },
    },
    visualMap: {
      min: -max,
      max: max,
      calculable: false,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: 8,
      textStyle: { color: C.axisLabel, fontSize: 11 },
      inRange: { color: [C.bad, '#2a3050', C.good] },
      formatter: (v: any) => `${v > 0 ? '+' : ''}${v}%`,
    },
    series: [
      {
        id: 'cohort',
        name: 'Cohort 偏离',
        type: 'heatmap',
        data: data.map(([x, y, v]) => {
          const cohort = metrics.cohorts[metrics.cohorts.length - 1 - y]
          const metric = metrics.cohortMetrics[x]
          const focused =
            focusCell && focusCell.row === cohort && focusCell.col === metric
          return {
            value: [x, y, v],
            itemStyle: focused
              ? { borderColor: '#fff', borderWidth: 2 }
              : undefined,
          }
        }),
        label: {
          show: true,
          color: C.text,
          fontSize: 11,
          formatter: (p: any) => `${p.value[2] > 0 ? '+' : ''}${p.value[2]}%`,
        },
        universalTransition: true,
        animationDurationUpdate: 700,
      },
    ],
  }
}

function heatmapView(state: ChartState, _beat: Beat, metrics: Metrics) {
  const focusCell = state.focus?.cell
  const skuFilter = state.filters?.sku
  const visibleSkus = skuFilter ? metrics.skus.filter((s) => skuFilter.includes(s)) : metrics.skus
  const skuIndexMap = new Map(visibleSkus.map((s, i) => [s, i]))
  const data: [number, number, number][] = []
  visibleSkus.forEach((sku) => {
    const origIdx = metrics.skus.indexOf(sku)
    const row = metrics.skuAvailability[origIdx]
    row.forEach((v, j) => {
      const y = visibleSkus.length - 1 - skuIndexMap.get(sku)!
      data.push([j, y, v])
    })
  })
  return {
    backgroundColor: 'transparent',
    grid: { ...baseGrid, left: 168, right: 80, top: 60, bottom: 56 },
    tooltip: {
      ...baseTooltip,
      trigger: 'item' as const,
      formatter: (p: any) => {
        const sku = visibleSkus[visibleSkus.length - 1 - p.value[1]]
        const day = metrics.weekdays[p.value[0]]
        return `${sku} · ${day}<br/>库存可得率: <b>${p.value[2]}%</b>`
      },
    },
    xAxis: {
      type: 'category',
      data: metrics.weekdays,
      position: 'top' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...baseAxisLabel, fontSize: 12, color: C.text },
    },
    yAxis: {
      type: 'category',
      data: [...visibleSkus].reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { ...baseAxisLabel, fontSize: 12, color: C.text },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: false,
      orient: 'horizontal' as const,
      left: 'center',
      bottom: 8,
      textStyle: { color: C.axisLabel, fontSize: 11 },
      inRange: { color: [C.bad, C.warn, C.good] },
      formatter: '{value}%',
    },
    series: [
      {
        id: 'heatmap',
        name: '库存可得率',
        type: 'heatmap',
        data: data.map(([x, y, v]) => {
          const sku = visibleSkus[visibleSkus.length - 1 - y]
          const day = metrics.weekdays[x]
          const focused =
            focusCell && focusCell.row === sku && focusCell.col === day
          return {
            value: [x, y, v],
            itemStyle: focused
              ? { borderColor: '#fff', borderWidth: 2 }
              : undefined,
          }
        }),
        label: {
          show: true,
          color: C.text,
          fontSize: 11,
          formatter: (p: any) => `${p.value[2]}%`,
        },
        universalTransition: true,
        animationDurationUpdate: 700,
      },
    ],
  }
}

function projectionView(_state: ChartState, _beat: Beat, metrics: Metrics) {
  // 拼接：历史最后 6 周 + 未来 4 周
  const histTail = metrics.gmvHistory.slice(-6)
  const histWeeks = histTail.map((d) => d.week)
  const histVals = histTail.map((d) => d.value)
  const futWeeks = metrics.projection.map((p) => p.week)
  const futMid = metrics.projection.map((p) => p.mid)
  const futLow = metrics.projection.map((p) => p.low)
  const futHigh = metrics.projection.map((p) => p.high)

  const allWeeks = [...histWeeks, ...futWeeks]
  const histPadded = [...histVals, ...futWeeks.map(() => null)]
  // 用最后一个历史点把投影衔接上
  const lastHist = histVals[histVals.length - 1]
  const midPadded = [
    ...histWeeks.map(() => null),
    ...[lastHist, ...futMid.slice(1)],
  ]
  // 用 stack 画置信带
  const lowPadded = [...histWeeks.map(() => null), ...[lastHist, ...futLow.slice(1)]]
  const bandHeight = [
    ...histWeeks.map(() => null),
    ...futHigh.map((h, i) => h - (i === 0 ? lastHist : futLow[i])),
  ]
  // 把 lowPadded 的第一个 null 区段去掉
  midPadded[histWeeks.length - 1] = lastHist
  lowPadded[histWeeks.length - 1] = lastHist
  bandHeight[histWeeks.length - 1] = 0

  return {
    backgroundColor: 'transparent',
    grid: baseGrid,
    tooltip: baseTooltip,
    legend: {
      top: 12,
      right: 16,
      textStyle: { color: C.text, fontSize: 12 },
      data: ['实际 GMV', '行动后预期', '置信区间'],
    },
    xAxis: {
      type: 'category',
      data: allWeeks,
      axisLine: baseAxisLine,
      axisLabel: baseAxisLabel,
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'GMV (万)',
      nameTextStyle: { color: C.axisLabel, fontSize: 11 },
      axisLine: baseAxisLine,
      axisLabel: baseAxisLabel,
      splitLine: baseSplitLine,
    },
    series: [
      {
        name: '置信下沿',
        type: 'line',
        data: lowPadded,
        stack: 'band',
        lineStyle: { opacity: 0 },
        symbol: 'none',
        silent: true,
        z: 0,
      },
      {
        name: '置信区间',
        type: 'line',
        data: bandHeight,
        stack: 'band',
        lineStyle: { opacity: 0 },
        areaStyle: { color: 'rgba(59, 194, 139, 0.18)' },
        symbol: 'none',
        silent: true,
        z: 0,
      },
      {
        id: 'gmv-hist',
        name: '实际 GMV',
        type: 'line',
        smooth: true,
        data: histPadded,
        lineStyle: { width: 2.5, color: C.gmv },
        itemStyle: { color: C.gmv },
        symbolSize: 6,
        animationDurationUpdate: 700,
      },
      {
        id: 'gmv-proj',
        name: '行动后预期',
        type: 'line',
        smooth: true,
        data: midPadded,
        lineStyle: { width: 2.5, color: C.good, type: 'dashed' as const },
        itemStyle: { color: C.good },
        symbolSize: 6,
        animationDurationUpdate: 700,
      },
    ],
  }
}

export function chartStateToOption(beat: Beat, metrics: Metrics) {
  const state = beat.chartState
  switch (state.view) {
    case 'pair':
    case 'line':
      return pairView(state, beat, metrics)
    case 'bar':
      return barView(state, beat, metrics)
    case 'cohort':
      return cohortView(state, beat, metrics)
    case 'heatmap':
      return heatmapView(state, beat, metrics)
    case 'projection':
      return projectionView(state, beat, metrics)
    default:
      return pairView(state, beat, metrics)
  }
}
