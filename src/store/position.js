import { defineStore } from 'pinia';
export const usePosition = defineStore('usePosition', {
    state: () => ({
        clientHeight: 0,
        offsetTop: 0,
        position: [],
    }),
    persist: {
        paths: ['position']
    }
})