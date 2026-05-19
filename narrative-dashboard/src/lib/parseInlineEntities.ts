// 解析 "[[entityId|显示文本]]" 语法。
// 输出 token 数组：text 段或 entity 段。
export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'entity'; id: string; label: string }

const PATTERN = /\[\[([^\]|]+)\|([^\]]+)\]\]/g

export function parseInlineEntities(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0
  for (const match of text.matchAll(PATTERN)) {
    const start = match.index ?? 0
    if (start > lastIndex) {
      tokens.push({ kind: 'text', value: text.slice(lastIndex, start) })
    }
    tokens.push({ kind: 'entity', id: match[1], label: match[2] })
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push({ kind: 'text', value: text.slice(lastIndex) })
  }
  return tokens
}

// 实体 id 到图表 series/cell 的映射（demo 内置）
export const entityToFocus: Record<
  string,
  { series?: string; row?: string; col?: string }
> = {
  gmv: { series: 'gmv' },
  uv: { series: 'uv' },
  'cat-apparel': { series: 'cat-apparel' },
  'cat-appliance': { series: 'cat-appliance' },
  'new-user': { row: '新客' },
  'old-user': { row: '老客 6M+' },
  'sku-a': { row: 'SKU-A · 服饰主推', col: '周二' },
  'sku-b': { row: 'SKU-B · 家电主推', col: '周二' },
}
