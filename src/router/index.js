import { createRouter, createWebHashHistory } from "vue-router";
import MusicList from "@/pages/MusicList.vue";
import TransformAudio from "@/pages/TransformAudio.vue";
import Setting from "@/pages/Setting.vue";
import Playing from "@/pages/Playing.vue";
const routes = [
    {
        path: '/',
        redirect: '/musicList'
    },
    {
        path: '/musicList',
        component: MusicList
    },
    {
        path: '/transformAudio',
        component: TransformAudio
    },
    {
        path: '/playing',
        component: Playing
    },
    {
        path: '/setting',
        component: Setting
    },
];
export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})