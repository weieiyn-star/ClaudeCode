import { chromium, devices } from 'playwright'
import fs from 'fs/promises'

const URL = process.env.URL ?? 'http://localhost:4173/'
const OUT = './screenshots'

await fs.mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})

const device = devices['iPhone 13']
const context = await browser.newContext({
  ...device,
  // 让中文字体渲染好看一点
  locale: 'zh-CN',
})
const page = await context.newPage()

const shots = [
  { hash: 'b1', name: '01-hook' },
  { hash: 'b2', name: '02-contradiction' },
  { hash: 'b3', name: '03-question' },
  { hash: 'b4', name: '04-explore' },
  { hash: 'b5', name: '05-turn' },
  { hash: 'b6', name: '06-insight' },
  { hash: 'b7', name: '07-action' },
  { hash: 'b4/branch=br-appliance', name: '08-branch-appliance-s1' },
  { hash: 'b4/branch=br-appliance/sub=1', name: '09-branch-appliance-s2' },
]

for (const { hash, name } of shots) {
  await page.goto(`${URL}#${hash}`)
  // 等待图表渲染（ECharts canvas）
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(900)
  const file = `${OUT}/${name}.png`
  await page.screenshot({ path: file, fullPage: false })
  console.log('saved', file)
}

await browser.close()
console.log('done')
