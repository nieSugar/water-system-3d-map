import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/global.css';
import '../src/assets/css/YouSheBiaoTiHei.css';
import '../src/assets/css/D-DIN.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 引入中文语言包
// 将axios实例挂载到全局

const app = createApp(App)
  app.use(ElementPlus, { locale: zhCn }) // 全局配置中文语言
app.mount('#app')