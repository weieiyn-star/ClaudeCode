import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE_FILE=1 → 把 JS/CSS 全部内联成一个自包含 index.html（可离线、双击打开）。
const single = process.env.SINGLE_FILE === '1'

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  // 单文件模式用相对路径，便于以 file:// 直接打开；
  // CI 部署用 VITE_BASE（GitHub Pages 项目站点）；本地 dev 为 "/"。
  base: single ? './' : process.env.VITE_BASE ?? '/',
  server: { port: 5173, host: true },
})
