import type { MetricRelation } from '../types/story'
import type { Metrics } from '../data/mockMetrics'

// 把 MetricRelation 翻译成视觉层的"预期带"。
// 对于 co-move 关系（如 GMV ~ UV），我们以 UV 为基准、用历史比例换算出 GMV 的"预期范围"，
// 然后把这个带画到 GMV 轴上（上下 ±5% 容差）。
// 实际 GMV 落在带外 = 关系破裂。
export type ExpectedBand = {
  weeks: string[]
  expectedMid: number[]
  expectedLow: number[]
  expectedHigh: number[]
  // 实际 - 预期 的偏离序列（>0 表示高于预期，<0 表示低于预期）
  deviation: number[]
  // 偏离超出阈值的 week 索引（用于 divergence 注解）
  divergenceIndices: number[]
}

const TOLERANCE = 0.05 // 5% 容差

export function computeExpectedBand(
  relation: MetricRelation,
  metrics: Metrics,
): ExpectedBand | null {
  if (relation.id === 'R1') {
    // GMV ~ UV co-move。用 W1-W25 的均值算出比例 k = mean(GMV) / mean(UV)，
    // 然后预期 GMV(t) ≈ k * UV(t)。
    const histGmv = metrics.gmvHistory.slice(0, 25).map((d) => d.value)
    const histUv = metrics.uvHistory.slice(0, 25).map((d) => d.value)
    const k =
      histGmv.reduce((a, b) => a + b, 0) / histUv.reduce((a, b) => a + b, 0)
    const weeks = metrics.weekLabels
    const expectedMid = metrics.uvHistory.map((d) => +(d.value * k).toFixed(1))
    const expectedLow = expectedMid.map((v) => +(v * (1 - TOLERANCE)).toFixed(1))
    const expectedHigh = expectedMid.map((v) => +(v * (1 + TOLERANCE)).toFixed(1))
    const actualGmv = metrics.gmvHistory.map((d) => d.value)
    const deviation = actualGmv.map((v, i) => +(v - expectedMid[i]).toFixed(1))
    const divergenceIndices: number[] = []
    expectedMid.forEach((mid, i) => {
      if (Math.abs(actualGmv[i] - mid) / mid > TOLERANCE) divergenceIndices.push(i)
    })
    return { weeks, expectedMid, expectedLow, expectedHigh, deviation, divergenceIndices }
  }
  // R2 / R3 在矩阵视图（cohort/heatmap）下处理 —— 这里返回 null，由对应 view 自己叠加预期带。
  return null
}
