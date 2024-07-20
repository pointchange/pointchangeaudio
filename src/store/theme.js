import { defineStore } from 'pinia';
export const useTheme = defineStore('theme', {
    state: () => ({
        selectTheme: 'light',
        selectColor: '#409EFF'
    }),
    actions: {
        init() {
            this.switchTheme();
            const res = this.hexTransformRGB(this.selectColor);
            const el = document.documentElement;
            this.settingCssVar(el, res);
        },
        switchTheme() {
            const html = document.querySelector('html');
            if (this.selectTheme === 'light' || this.selectTheme === 'dark') {
                html.className = this.selectTheme;
            }
            if (this.selectTheme === 'followSystem') {
                if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                    html.className = 'light';
                } else {
                    html.className = 'dark';
                }
                window.matchMedia("(prefers-color-scheme: light)").addEventListener('change', e => {
                    if (e.matches) {
                        html.className = 'light';
                    } else {
                        html.className = 'dark';
                    }
                })
            }
        },
        alphabetTransformNumber(value) {
            value = String(value).toUpperCase();
            let initNum = 10;
            if (value === "A") {
                return initNum;
            } else if (value === "B") {
                return initNum + 1;
            } else if (value === "C") {
                return initNum + 2;
            } else if (value === "D") {
                return initNum + 3;
            } else if (value === "E") {
                return initNum + 4;
            } else if (value === "F") {
                return initNum + 5;
            } else {
                return Number(value);
            }
        },

        hexTransformRGB(hex) {
            if (!hex) return;
            const list = hex.split('#')[1].split('');
            const res = list.reduce((pre, cur, index, array) => {
                if (index === 0 || index === 2 || index === 4) {
                    let tem1 = cur;
                    tem1 = this.alphabetTransformNumber(tem1);
                    let tem2 = array[index + 1];
                    tem2 = this.alphabetTransformNumber(tem2);
                    if (index === 4) {
                        return pre += (tem1 * 16 + tem2)
                    } else {
                        return pre += (tem1 * 16 + tem2) + ','
                    }

                } else {
                    return pre;
                }
            }, '');
            return res;
        },

        settingCssVar(el, res) {
            // 设置 css 变量
            el.style.setProperty('--el-color-primary', `rgb(${res})`)
            let j = 9;
            for (let i = 0; i < 9; i++) {
                el.style.setProperty(`--el-color-primary-light-${i + 1}`, `rgba(${res},0.${j})`)
                j--;
            }
        }
    },
    persist: true,
})