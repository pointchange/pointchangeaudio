import './assets/main.css'
import {
    ElButton,
    ElTable,
    ElAlert,
    ElAside,
    ElContainer,
    ElHeader,
    ElPageHeader,
    ElMenu,
    ElIcon,
    ElMenuItem,
    ElMain,
    ElPopover,
    ElSlider,
    ElTooltip,
    ElSpace,
    ElText,
    ElTableColumn,
    ElDescriptions,
    ElDescriptionsItem,
    ElTag,
    ElSwitch,
    ElRadioGroup,
    ElRadio,
    ElCard,
    ElDivider,
    ElRow,
    ElCol,
} from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createApp } from 'vue'
import { router } from './router'
import pinia from './store'
import App from './App.vue'

const app = createApp(App)
const components = [
    ElButton,
    ElTable,
    ElAlert,
    ElAside,
    ElContainer,
    ElHeader,
    ElPageHeader,
    ElMenu,
    ElIcon,
    ElMenuItem,
    ElMain,
    ElPopover,
    ElSlider,
    ElTooltip,
    ElSpace,
    ElText,
    ElTableColumn,
    ElDescriptions,
    ElDescriptionsItem,
    ElTag,
    ElSwitch,
    ElRadioGroup,
    ElRadio,
    ElCard,
    ElDivider,
    ElRow,
    ElCol,
];
for (const [key, component] of Object.entries(components)) {
    app.component(key, component)
}
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router).use(pinia).mount('#app');