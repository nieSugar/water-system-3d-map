/**
 * Vite 配置文件
 *
 * 配置项说明：
 * 1. 插件配置：Vue、TailwindCSS、自动导入等
 * 2. 路径别名：简化导入路径
 * 3. 开发服务器：代理配置，解决跨域问题
 * 4. 构建优化：生产环境打包配置
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'                                    // Vue3 支持
import tailwindcss from '@tailwindcss/vite'                           // TailwindCSS 集成
import AutoImport from 'unplugin-auto-import/vite'                    // 自动导入 API
import Components from 'unplugin-vue-components/vite'                 // 自动导入组件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' // ElementPlus 解析器
import { fileURLToPath, URL } from 'node:url'

// Vite 配置 - https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),                                    // 启用 Vue3 支持
    tailwindcss(),                           // 启用 TailwindCSS

    // 自动导入 Vue API（ref, reactive, computed 等）
    AutoImport({
      resolvers: [ElementPlusResolver()],    // 自动导入 ElementPlus API
    }),

    // 自动导入 Vue 组件
    Components({
      resolvers: [ElementPlusResolver()],    // 自动导入 ElementPlus 组件
    }),
  ],

  // 路径解析配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))  // 设置 @ 为 src 目录别名
    },
  },

  // 开发服务器配置
  server: {
    proxy: {
      // API 代理配置，解决开发环境跨域问题
      '/api': {
        target: 'http://10.1.8.126:30908',   // 后端服务地址
        changeOrigin: true,                   // 改变请求头中的 origin
        rewrite: (path) => path.replace(/^\/api/, '')  // 重写路径，移除 /api 前缀
      }
    }
  }
})
