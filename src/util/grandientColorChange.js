import { computed } from "vue";


export function useGradient(storeTheme) {
    let gradientColor = computed(() => {
        switch (storeTheme.selectTheme) {
            case 'light':
                return 'rgba(255,255,255,.8)';
            case 'dark':
                return 'rgba(0,0,0,.8)'
            default:
                if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    return 'rgba(255,255,255,.8)';
                } else {
                    return 'rgba(0,0,0,.8)'
                }
        }
    });
    return { gradientColor }

}