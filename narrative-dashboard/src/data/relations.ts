import type { MetricRelation } from '../types/story'

export const relations: Record<string, MetricRelation> = {
  R1: {
    id: 'R1',
    metrics: ['gmv', 'uv'],
    expected: 'co-move',
    description: 'GMV 与 UV 历史相关系数 0.87，过去 6 个月几乎贴着走',
    break: { kind: 'diverge', severity: 'strong' },
  },
  R2: {
    id: 'R2',
    metrics: ['new_user_conv', 'old_user_repurchase'],
    expected: 'co-move',
    description: '健康范式：新客增长应带动老客复购同步增长',
    break: { kind: 'decouple', severity: 'strong' },
  },
  R3: {
    id: 'R3',
    metrics: ['stock_availability', 'old_user_repurchase'],
    expected: 'co-move',
    description: '库存可得性与老客复购应同向，老客对替代品容忍度低',
    break: { kind: 'diverge', severity: 'strong' },
  },
}
