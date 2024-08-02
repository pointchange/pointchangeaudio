import { defineStore } from 'pinia';
export const useSetting = defineStore('setting', {
    state: () => ({
        imagePath: '',
        imgFit: 'fill'
    }),
    persist: true,
})