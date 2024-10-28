import type { InlineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { build } from 'vite'

// 获取 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 全量打包
const buildAll = async () => {
  await build()
  const srcDir = path.resolve(__dirname, '../src') // 这里不需要重复拼接
  console.log('srcDir:', srcDir)

  // 检查 srcDir 是否存在
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory does not exist: ${srcDir}`)
    return
  }

  fs.readdirSync(srcDir)
    .filter((name) => {
      const componentDir = path.resolve(srcDir, name)
      const isDir = fs.lstatSync(componentDir).isDirectory()
      return isDir && fs.readdirSync(componentDir).includes('index.ts')
    })
    .forEach(async (name) => {
      const outDir = path.resolve('./dist', name)
      const custom = {
        lib: {
          entry: path.resolve(srcDir, name, 'index.ts'), // 确保指向正确的入口文件
          name, // 导出模块名
          fileName: `index`,
          formats: [`es`, `umd`],
        },
        outDir,
      }

      await build({
        build: custom,
      } as InlineConfig)
    })
}

buildAll()
