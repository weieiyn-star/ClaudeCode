// 26 周（约 6 个月）模拟数据。最后一周（W26）是"本周"。
// 设计要点：
//   - GMV 与 UV 在 W1-W25 高度共行（ρ≈0.87）
//   - W26 出现强分叉：UV +8%，GMV -18%
//   - 根因：服饰/家电品类的老客复购在周二（W26 Tue）某 SKU 断货后骤降

const weekLabels = Array.from({ length: 26 }, (_, i) => `W${i + 1}`)

// 共享的"市场节律"基准（让 GMV 和 UV 看上去高度相关）
const baseRhythm = (i: number) => {
  const trend = i * 0.6
  const wave = Math.sin((i / 26) * Math.PI * 2.2) * 18
  const noise = Math.sin(i * 1.7) * 4 + Math.cos(i * 2.3) * 3
  return trend + wave + noise
}

const gmvHistory = weekLabels.map((label, i) => {
  if (i < 25) {
    return { week: label, value: Math.round(420 + baseRhythm(i) * 5) }
  }
  // W26：本应在 ~560 左右，实际跌到 ~460（-18%）
  return { week: label, value: 460 }
})

const uvHistory = weekLabels.map((label, i) => {
  if (i < 25) {
    return { week: label, value: Math.round(9.6 + baseRhythm(i) * 0.07) }
  }
  // W26：UV 反而上涨到 11.8（+8%）
  return { week: label, value: 11.8 }
})

// 上一周（W25）作为对照基线
const lastWeekGmv = gmvHistory[24].value
const thisWeekGmv = gmvHistory[25].value
const gmvDeltaPct = ((thisWeekGmv - lastWeekGmv) / lastWeekGmv) * 100

const lastWeekUv = uvHistory[24].value
const thisWeekUv = uvHistory[25].value
const uvDeltaPct = ((thisWeekUv - lastWeekUv) / lastWeekUv) * 100

// 品类（按本周相对上周的贡献变化排序）
const categoryDelta = [
  { id: 'cat-apparel', name: '服饰', deltaPct: -28, contribution: -42 },
  { id: 'cat-appliance', name: '家电', deltaPct: -22, contribution: -31 },
  { id: 'cat-beauty', name: '美妆', deltaPct: -3, contribution: -4 },
  { id: 'cat-digital', name: '数码', deltaPct: -1, contribution: -2 },
  { id: 'cat-food', name: '食品', deltaPct: 1, contribution: 2 },
  { id: 'cat-home', name: '家居', deltaPct: 2, contribution: 3 },
]

// Cohort × 指标矩阵（值为本周相对历史的偏离 %）
const cohorts = ['新客', '老客 0–3M', '老客 3–6M', '老客 6M+']
const cohortMetrics = ['转化率', '客单价', '复购率', '退货率']
//   行=cohort，列=指标，值=偏离 %
const cohortMatrix: number[][] = [
  [12, 4, 6, -1], //  新客
  [-8, -2, -10, 2], // 老客 0-3M
  [-15, -3, -18, 3], // 老客 3-6M
  [-22, -4, -26, 5], // 老客 6M+
]

// SKU × Weekday 热图（W26 那一周内每个工作日 × 关键 SKU 的库存可得率 %）
const skus = ['SKU-A 服饰主推', 'SKU-B 家电主推', 'SKU-C 服饰新品', 'SKU-D 通用']
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
//   行=SKU，列=weekday，值=库存可得率 %
const skuAvailability: number[][] = [
  [98, 12, 8, 10, 14, 18, 22], // SKU-A 周二断货后未恢复
  [96, 22, 14, 12, 16, 20, 24], // SKU-B 同样受影响
  [92, 88, 86, 88, 90, 91, 92],
  [99, 98, 98, 97, 98, 99, 99],
]

// 未来 4 周投影（采取建议措施后）
const projection = [
  { week: 'W27', mid: 510, low: 495, high: 525 },
  { week: 'W28', mid: 540, low: 520, high: 560 },
  { week: 'W29', mid: 562, low: 540, high: 584 },
  { week: 'W30', mid: 578, low: 555, high: 600 },
]

export const metrics = {
  weekLabels,
  gmvHistory,
  uvHistory,
  lastWeekGmv,
  thisWeekGmv,
  gmvDeltaPct,
  lastWeekUv,
  thisWeekUv,
  uvDeltaPct,
  categoryDelta,
  cohorts,
  cohortMetrics,
  cohortMatrix,
  skus,
  weekdays,
  skuAvailability,
  projection,
}

export type Metrics = typeof metrics
