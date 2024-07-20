<script setup>
import { ref } from 'vue';
import { ElMessage} from 'element-plus'
import { useTheme } from '@/store/theme';
import { storeToRefs } from 'pinia';
import { useSongList } from '@/store/musicList';
import { useFormat } from '@/store/format';

//#409eff --el-color-primary  --el-slider-main-bg-color  --el-tag-text-color
//#67c23a --el-color-success #f0f9eb --el-color-success-light-9 #b3e19d--el-color-success-light-5
//#95d475 --el-color-success-light-3
    const store=useTheme();
    const {selectTheme,selectColor}=storeToRefs(store);
    const {hexTransformRGB,settingCssVar}=store;
    const colorList=[
        '#E63415',
        '#FF6600',
        '#FFDE0A',
        '#1EC79D',
        '#14CCCC',
        '#409EFF',
        '#6222C9',
    ];
    function radioChangeHandler(){
        const html= document.querySelector('html');
        if(selectTheme.value==='light'||selectTheme.value==='dark'){
           html.className=selectTheme.value;
        }
        if(selectTheme.value==='followSystem'){
            if(window.matchMedia('(prefers-color-scheme: light)').matches){
                html.className='light';
            }else{
                html.className='dark';
            }
            window.matchMedia("(prefers-color-scheme: light)").addEventListener('change',e=>{
                if(e.matches){
                   html.className='light';
                }else{
                   html.className='dark';
                }
            })
        }
    }

    function selectBtnColor(color){
        const el = document.documentElement;
        const res=hexTransformRGB(color);
        settingCssVar(el,res);
        selectColor.value=color;
    }
    function activeChangeHandler(e){
        selectColor.value=e.target.value;
        if(selectColor.value==='')return;
        selectBtnColor(selectColor.value)
    }
    async function selectImg(){
        let img=new Image();
        img.src = `local-img://456`;
        img.addEventListener('error',function errorHandler(){
            ElMessage({
                message: '取消了',
                type: 'warning',
            })
            this.removeEventListener('error',errorHandler)
        })

        const canvas = document.createElement('canvas');
        function getImageColor(canvas, img) {
            canvas.width = img.width;
            canvas.height = img.height;

            const context = canvas.getContext("2d");

            context.drawImage(img, 0, 0,canvas.width,canvas.height);

            // 获取像素数据
            const data = context.getImageData(0, 0, img.width, img.height).data;
            let r=1,g=1,b=1;
            // 取所有像素的平均值
            for (var row = 0; row < img.height; row++) {
                for (var col = 0; col < img.width; col++) {
            // console.log(data[((img.width * row) + col) * 4])
                    if(row==0){
                        r += data[((img.width * row) + col)];
                        g += data[((img.width * row) + col) + 1];
                        b += data[((img.width * row) + col) + 2];
                    }else{
                        r += data[((img.width * row) + col) * 4];
                        g += data[((img.width * row) + col) * 4 + 1];
                        b += data[((img.width * row) + col) * 4 + 2];
                    }
                }
            }
            // 求取平均值
            r /= (img.width * img.height);
            g /= (img.width * img.height);
            b /= (img.width * img.height);

            // 将最终的值取整
            r = Math.round(r);
            g = Math.round(g);
            b = Math.round(b);
            // return "rgb(" + r + "," + g + "," + b + ")";
            return `${r},${g},${b}`;
        }
        let rgb='';
        
        rgb=await new Promise((resolve,reject)=>{
            img.addEventListener('load',function getColor(){
                resolve(getImageColor(canvas,this));
                this.removeEventListener('load',getColor);
            });
        });
        const el = document.documentElement;
        settingCssVar(el,rgb)
    }
    const reset=ref(false);
    function resetHandler(){
        selectTheme.value='light';
        selectBtnColor('#409EFF');
        selectColor.value='#409EFF'

        let id=null;
        id=setTimeout(() => {
            reset.value=false;
            clearTimeout(id);
            id=null;
        }, 1000);
    }
    const resetAngthing=ref(false);
    const storeSongs=useSongList();
    const sotreFormat=useFormat();
    function resetAll(){
        resetAngthing.value=true;
        selectTheme.value='light';
        store.switchTheme();
        selectBtnColor('#409EFF');
        selectColor.value='#409EFF';

        storeSongs.pause();
        storeSongs.songs=[];
        storeSongs.notPlaySongs=[];
        storeSongs.audioInfo={};
        storeSongs.visualClose={};
        storeSongs.isPlay=false;
        storeSongs.isPlaying=false;

        sotreFormat.formatList=[
            'AAC',
            'APE',
            'FLAC',
            'OGG',
            'WAV',
            'WMA',
            'MP3',
            'M4A',
        ];

        let id=null;
        id=setTimeout(() => {
            resetAngthing.value=false;
            clearTimeout(id);
            id=null;
        }, 1000);

    }

</script>
<template>
    <div class="setting">
        <div class="setting-contain">
            <div class="setting-header">
                <el-text size="small">设置</el-text>
                <el-switch
                        v-model="resetAngthing"
                        inline-prompt
                        inactive-text="一键重置"
                        @click="resetAll"
                    />
            </div>
            <el-divider />
            <div class="theme-container">
                <el-radio-group v-model="selectTheme" @change="radioChangeHandler">
                    <el-radio value="light" size="large">白天</el-radio>
                    <el-radio value="dark" size="large">黑夜</el-radio>
    
                    <el-popover :width="400" trigger="click"  >
                        <template #reference>
                            <el-radio value="auto" size="large" >自定义</el-radio>
                        </template>
                        <el-card shadow="never" >
                            <template #header>
                            <div class="card-header">
                                <el-button  :color="color" plain v-for="color in colorList" :key="color" @click="selectBtnColor(color)"></el-button>
                            </div>
                            </template>
                            <el-card class="card-pic" shadow="hover" @click="selectImg">
                                选取一张图片
                            </el-card>
                            <template #footer>
                                <div class="footer">
                                    <!-- <el-color-picker v-model="selectColor" size="large" @active-change="activeChangeHandler" /> -->
                                     <input type="color" v-model="selectColor" @input="activeChangeHandler">
                                </div>
                            </template>
                        </el-card>
                    </el-popover>
                    <el-radio value="followSystem" size="large">
                        跟随系统
                    </el-radio>
                </el-radio-group>
                <el-switch
                    v-model="reset"
                    inline-prompt
                    inactive-text="重置"
                    @click="resetHandler"
                />
            </div>
            <el-divider />
        </div>
        <el-text style="color:var(--el-color-primary-light-4);" size="small">©point change audio 仅用于学习与交流</el-text>
    </div>
</template>
<style scoped>
    .setting{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
    .setting-header{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .theme-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .card-pic{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 150px;
        font-size: 1.4rem;
        cursor: pointer;
    }
    .footer{
        display: flex; 
        justify-content: space-around;
    }
</style>