import type { Story } from '../types/story'
import { relations } from './relations'

export const mainStory: Story = {
  id: 'gmv-anomaly-w26',
  title: '本周 GMV 异动归因',
  subtitle: '一个由"指标矛盾"驱动的归因故事',
  relations: Object.values(relations),
  beats: [
    {
      id: 'b1',
      act: 'hook',
      text: '过去 6 个月里，[[gmv|GMV]] 和 [[uv|访问量]] 几乎贴着走——它们的相关系数高达 0.87。换句话说，只要流量来，钱就来。',
      reveals: 'R1',
      chartState: {
        view: 'pair',
        metrics: ['gmv', 'uv'],
        expectedBand: 'R1',
        range: ['W1', 'W25'],
        caption: '历史共行：GMV ↔ UV',
      },
    },
    {
      id: 'b2',
      act: 'contradiction',
      text: '但本周第一次出现明显分叉：[[uv|UV]] 涨了 +8%，[[gmv|GMV]] 却跌了 −18%。流量在涨，钱反而少了——历史关系破了。',
      reveals: 'R1',
      chartState: {
        view: 'pair',
        metrics: ['gmv', 'uv'],
        expectedBand: 'R1',
        range: ['W1', 'W26'],
        focus: { x: 'W26' },
        caption: '末端分叉：共行关系破裂',
      },
      annotations: [
        { anchor: { x: 'W26', series: 'gmv' }, kind: 'divergence', text: 'GMV −18% / UV +8%' },
      ],
    },
    {
      id: 'b3',
      act: 'question',
      text: '矛盾不在流量，那只能在转化。问题是：是谁、买什么时掉了链子？',
      chartState: {
        view: 'pair',
        metrics: ['gmv', 'uv'],
        expectedBand: 'R1',
        range: ['W20', 'W26'],
        focus: { x: 'W26' },
        caption: '聚焦近期，准备切视角',
      },
    },
    {
      id: 'b4',
      act: 'explore',
      text: '按品类拆开看，跌幅几乎完全集中在两个品类：[[cat-apparel|服饰]] −28% 与 [[cat-appliance|家电]] −22%，其它品类基本持平。',
      chartState: {
        view: 'bar',
        caption: '品类视角：贡献集中在两个品类',
        focus: { series: 'cat-apparel' },
      },
      annotations: [
        { anchor: { series: 'cat-apparel' }, kind: 'label', text: '主跌幅' },
        { anchor: { series: 'cat-appliance' }, kind: 'label', text: '次跌幅' },
      ],
      branches: [
        {
          id: 'br-appliance',
          trigger: '那家电呢？',
          beats: [
            {
              id: 'br-appliance-s1',
              act: 'explore',
              text: '家电品类放大来看，跌幅同样集中在 [[old-user|老客]]——和服饰是同一种"老客撤退"的形状。',
              chartState: {
                view: 'cohort',
                expectedBand: 'R2',
                filters: { category: ['cat-appliance'] },
                caption: '家电子线 · 同样的 cohort 偏离',
              },
            },
            {
              id: 'br-appliance-s2',
              act: 'insight',
              text: '家电的断货 SKU 是 [[sku-b|SKU-B]]，周二同样开始无货——这不是品类问题，是供给问题。',
              chartState: {
                view: 'heatmap',
                expectedBand: 'R3',
                filters: { sku: ['SKU-B 家电主推'] },
                caption: '家电子线 · SKU-B 同步断货',
                focus: { cell: { row: 'SKU-B 家电主推', col: '周二' } },
              },
            },
          ],
        },
      ],
    },
    {
      id: 'b5',
      act: 'turn',
      text: '再换个切法，反直觉的事来了：[[new-user|新客]]的转化率反而 +12%——真正在崩的是 [[old-user|老客]]复购，越老的客群跌得越狠（老客 6M+ −22%）。',
      reveals: 'R2',
      chartState: {
        view: 'cohort',
        expectedBand: 'R2',
        focus: { cell: { row: '老客 6M+', col: '复购率' } },
        caption: '新客 ↔ 老客复购的预期同步关系破了',
      },
      annotations: [
        { anchor: { y: 0 }, kind: 'band', text: '健康预期：新老同向' },
      ],
    },
    {
      id: 'b6',
      act: 'insight',
      text: '把时间和 SKU 摊开：周二开始，[[sku-a|SKU-A]]（服饰主推）库存可得率从 98% 掉到 12%，没再恢复。老客没等到替代品，直接退出——"库存可得 ↔ 老客复购"的同向关系断了。',
      reveals: 'R3',
      chartState: {
        view: 'heatmap',
        expectedBand: 'R3',
        focus: { cell: { row: 'SKU-A 服饰主推', col: '周二' } },
        caption: '根因：周二开始的库存断点',
      },
      annotations: [
        { anchor: {}, kind: 'marker', text: '断货时点' },
      ],
    },
    {
      id: 'b7',
      act: 'action',
      text: '建议：① 紧急补货 [[sku-a|SKU-A]]/[[sku-b|SKU-B]]，② 对受影响老客发定向召回券（基于近 30 天浏览过断货 SKU 的人群）。预计未来 4 周回收 GMV 约 +8%（置信区间 ±2%）。',
      chartState: {
        view: 'projection',
        caption: '若立即采取行动：未来 4 周投影',
      },
      annotations: [
        { anchor: { x: 'W30' }, kind: 'label', text: '回到正轨' },
      ],
    },
  ],
}
