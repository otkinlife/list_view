import { createApp } from 'vue';
import App from './App.vue';
import 'element-plus/theme-chalk/index.css'; // 更新样式路径
import ElementPlus from 'element-plus'; // 引入Element Plus
import zhCn from 'element-plus/es/locale/lang/zh-cn';


const app = createApp(App);

app.use(ElementPlus, { locale: zhCn}); // 使用Element Plus

app.mount('#app');
