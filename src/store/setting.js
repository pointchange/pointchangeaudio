import { defineStore } from 'pinia';
export const useSetting = defineStore('setting', {
    state: () => ({
        imagePath: '',
        imgFit: 'fill',
        isPictureColor: false
    }),
    persist: true,
})