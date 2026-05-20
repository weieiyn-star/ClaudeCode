import { useEffect, useRef } from 'react'

// 监听某个 DOM 元素是否处于视口中心带，并在进入时回调。
// 通过单一 IntersectionObserver 监听多个元素，按最接近视口中心的元素回调。
export function useBeatObserver(
  onActivate: (id: string) => void,
  enabled: boolean = true,
) {
  const elsRef = useRef<Map<string, HTMLElement>>(new Map())
  const lastActiveRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const handler = () => {
      if (!elsRef.current.size) return
      const viewportCenter = window.innerHeight / 2
      let bestId: string | null = null
      let bestDist = Infinity
      elsRef.current.forEach((el, id) => {
        const rect = el.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const dist = Math.abs(center - viewportCenter)
        if (dist < bestDist) {
          bestDist = dist
          bestId = id
        }
      })
      if (bestId && bestId !== lastActiveRef.current) {
        lastActiveRef.current = bestId
        onActivate(bestId)
      }
    }
    handler()
    const scrollContainer = document.querySelector('[data-story-scroll]') as HTMLElement | null
    const target: Window | HTMLElement = scrollContainer ?? window
    target.addEventListener('scroll', handler, { passive: true } as any)
    window.addEventListener('resize', handler)
    return () => {
      target.removeEventListener('scroll', handler as any)
      window.removeEventListener('resize', handler)
    }
  }, [onActivate, enabled])

  return {
    register: (id: string, el: HTMLElement | null) => {
      if (el) elsRef.current.set(id, el)
      else elsRef.current.delete(id)
    },
  }
}
