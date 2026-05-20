export type Act =
  | 'hook'
  | 'contradiction'
  | 'question'
  | 'explore'
  | 'turn'
  | 'insight'
  | 'action'

export type RelationKind = 'co-move' | 'inverse' | 'ratio-stable' | 'lead-lag'
export type BreakKind = 'diverge' | 'flip' | 'decouple'
export type BreakSeverity = 'mild' | 'strong'

export type MetricRelation = {
  id: string
  metrics: string[]
  expected: RelationKind
  description: string
  break?: { kind: BreakKind; severity: BreakSeverity }
}

export type AnnotationKind = 'arrow' | 'label' | 'band' | 'marker' | 'divergence'

export type Annotation = {
  anchor: { x?: string; series?: string; y?: number }
  kind: AnnotationKind
  text?: string
  color?: string
}

export type ChartView = 'pair' | 'line' | 'bar' | 'cohort' | 'heatmap' | 'projection'

export type ChartState = {
  view: ChartView
  metrics?: string[]
  expectedBand?: string
  filters?: Record<string, string[]>
  focus?: { x?: string; series?: string; cell?: { row: string; col: string } }
  range?: [string, string]
  transition?: 'morph' | 'fade'
  caption?: string
}

export type Entity = {
  id: string
  label: string
  kind: 'metric' | 'category' | 'cohort' | 'sku'
  seriesName?: string
}

export type Branch = {
  id: string
  trigger: string
  beats: Beat[]
}

export type Beat = {
  id: string
  act: Act
  text: string
  reveals?: string
  chartState: ChartState
  annotations?: Annotation[]
  branches?: Branch[]
}

export type Story = {
  id: string
  title: string
  subtitle?: string
  relations: MetricRelation[]
  beats: Beat[]
}
