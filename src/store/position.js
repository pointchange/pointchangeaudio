import { defineStore } from 'pinia';
export const usePosition = defineStore('usePosition', {
    state: () => ({
        clientHeight: 0,
        offsetTop: 0,
        position: [360, 145],
        size: [1200, 750]
    }),
    persist: {
        paths: ['position', 'size']
    }
})