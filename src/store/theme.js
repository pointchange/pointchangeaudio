import { defineStore } from 'pinia';
export const useTheme = defineStore('theme', {
    state: () => ({
        selectTheme: 'light',
        selectColor: '#409EFF',
        controlColor: 'var(--el-color-primary-light-6)',
        picColor: '',//00,00,00 
        isPicColorActive: false,
        fontFamily: 'Microsoft YaHei',
        fontSize: 'medium',
        fontWeight: 400,
        letterSpacing: 'normal',
        fontFn: {
            fontFamily: v => `Inter,${v}, Arial, sans-serif`,
            fontSize: v => `var(--el-font-size-${v})`,
            fontWeight: v => v,
            letterSpacing: v => {
                if (v === 'normal') {
                    return v;
                } else {
                    return v + 'px';
                }
            },
        },
        fontOptionList: [
            {
                option: 'fontFamily',
                init: 'Microsoft YaHei',
            },
            {
                option: 'fontSize',
                init: 'medium',
            },
            {
                option: 'fontWeight',
                init: 400,
            },
            {
                option: 'letterSpacing',
                init: 'normal',
            },
        ]

    }),
    actions: {
        init() {
            this.switchTheme();
            const res = this.hexTransformRGB(this.selectColor);
            const el = document.documentElement;
            this.settingCssVar(el, res);
            for (let i = 0; i < this.fontOptionList.length; i++) {
                let prop = Object.values(this.fontOptionList[i])[0];
                this.changeFont(Object.values(this[prop])[0], prop)
            }
        },
        switchTheme(e) {
            const html = document.querySelector('html');
            if (e) {
                const transition = document.startViewTransition(() => {
                    html.className = this.selectTheme;
                });
                transition.ready.then(() => {
                    const { clientX, clientY } = e;
                    const r = Math.hypot(Math.max(clientX, innerWidth - clientX), Math.max(clientY, innerHeight - clientY));
                    const clipPath = [
                        `circle(0% at ${clientX}px ${clientY}px )`,
                        `circle(${r}px at ${clientX}px ${clientY}px )`
                    ]
                    html.animate(
                        { clipPath: this.selectTheme === 'dark' ? clipPath.reverse() : clipPath },
                        {
                            duration: 500,
                            pseudoElement: this.selectTheme === 'dark' ? '::view-transition-old(root)' : '::view-transition-new(root)'
                        }
                    )
                })
            } else {
                html.className = this.selectTheme;
            }
        },
        followSystem() {
            const html = document.querySelector('html');
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
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
        },

        changeFont(v, option) {
            document.documentElement.style[option] = this.fontFn[option](v);
        },

        resetFont() {
            for (let i = 0; i < this.fontOptionList.length; i++) {
                this[Object.values(this.fontOptionList[i])[0]] = Object.values(this.fontOptionList[i])[1];
                this.changeFont(Object.values(this.fontOptionList[i])[1], [Object.values(this.fontOptionList[i])[0]])
            }
        },
        rgbToHex(str) {
            let arr = str.split(',')
            let h = parseInt(arr[0]).toString(16);
            let e = parseInt(arr[1]).toString(16);
            let x = parseInt(arr[2]).toString(16);
            return '#' + h + e + x;
        },
        followPicColor() {
            const el = document.documentElement;
            if (!this.picColor) return;
            this.selectColor = this.rgbToHex(this.picColor);
            this.settingCssVar(el, this.picColor);
        }
    },
    persist: {
        paths: ['selectTheme', 'selectColor', 'controlColor', 'isPicColorActive', 'picColor', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing']
    }
})