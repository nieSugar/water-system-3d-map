import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-element-plus/resolvers'

export default defineConfig({
  plugins: [
    vue(),
    // Components({
    //   resolvers: [ElementPlusResolver()],
    // }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.1.8.126:30908', // 请将这里替换为您的后端服务地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})