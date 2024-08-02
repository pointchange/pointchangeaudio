<script setup>
import { UploadFilled,Right } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue';
import { ElMessage} from 'element-plus'
import { useTheme } from '@/store/theme';
import { storeToRefs } from 'pinia';
import { useSongList } from '@/store/musicList';
import { useFormat } from '@/store/format';
import getImageColor from '@/util/getImageColor';
import FontOption from '@/components/FontOption.vue';
import Image from '@/components/Image.vue';
import { useSetting } from '@/store/setting';
import { useDrop } from '@/util/drop';
//#409eff --el-color-primary  --el-slider-main-bg-color  --el-tag-text-color
//#67c23a --el-color-success #f0f9eb --el-color-success-light-9 #b3e19d--el-color-success-light-5
//#95d475 --el-color-success-light-3
    const storeSetting=useSetting();
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
        img.src = `local-img://background`;
        img.addEventListener('error',function errorHandler(){
            ElMessage({
                message: '取消了',
                type: 'warning',
            })
            this.removeEventListener('error',errorHandler)
        })
        let rgb='';
        
        rgb=await new Promise((resolve,reject)=>{
            img.addEventListener('load',function getColor(){
                resolve(getImageColor(this));
                this.removeEventListener('load',getColor);
            });
        });
        const el = document.documentElement;
        settingCssVar(el,rgb)
    }
    function setTimeoutHandle(){
        return new Promise((resolve,reject)=>{
            let id=null;
            id=setTimeout(() => {
                resolve(false);
                clearTimeout(id);
                id=null;
            }, 1000);
        })
    }
    const reset=ref(false);
    async function resetHandler(){
        selectTheme.value='light';
        selectBtnColor('#409EFF');
        selectColor.value='#409EFF';
        store.switchTheme();

        reset.value= await setTimeoutHandle()
    }
    const resetAngthing=ref(false);
    const storeSongs=useSongList();
    const sotreFormat=useFormat();
    async function resetAll(){
        storeSongs.pause();
        storeSongs.audio.removeEventListener('timeupdate', storeSongs.timeupdateHandler);
        storeSongs.$reset();

        store.$reset();
        store.switchTheme();
        sotreFormat.$reset();

        resetAngthing.value= await setTimeoutHandle()
    }
    let resetFont=ref(false);
    async function resetFontHandler(){
        store.resetFont();
        resetFont.value = await setTimeoutHandle()
    }
    let fontText=computed(()=>option=>{
        switch (option) {
            case 'fontFamily':
                return '类型：'
            case 'fontSize':
                return '大小：';
            case 'fontWeight':
                return '粗细：';
            case 'letterSpacing':
                return '间隔：';
            default:
                return;
        }
    });
    function selectionImage(e){
        for (const f of e.target.files) {
            storeSetting.imagePath= f.path;
        }
    }
    const {
        dropHandler,
        dragenterHandler,
        dragleaveHandler,
        isBGActive
    }=useDrop(storeSetting,'image');
    let resetImage=ref(false);
    async function resetImageHandler(){
        storeSetting.$reset();
        resetImage.value= await setTimeoutHandle();
    }
    const imgFitList=['fill','contain','cover','none','scale-down',];
    function changeImgFit(v){
        storeSetting.imgFit=v;
    }
</script>
<template>
    <el-scrollbar >
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
                        <el-radio value="followSystem" size="large">
                            跟随系统
                        </el-radio>
                    </el-radio-group>

                    <div class="theme-color" :key="store.selectColor">
                        <el-text size="small">主题色：</el-text>
                        <el-popover :width="400" trigger="click"  >
                            <template #reference>
                                <el-button  :color="store.selectColor" plain >{{ store.selectColor }}</el-button>
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
                    </div>
                    
                    <el-switch
                        v-model="reset"
                        inline-prompt
                        inactive-text="重置"
                        @click="resetHandler"
                    />
                </div>
                <el-divider />
                <div class="el-space-define">
                    <div class="setting-header">
                    <el-text size="small">字体</el-text>
                    <div class="selected-font" >
                        <el-text size="small" v-for="{option} in store.fontOptionList" :key="option">
                            {{ fontText(option) }}{{ store[option] }}
                        </el-text>
                    </div>
                    <el-switch
                            v-model="resetFont"
                            inline-prompt
                            inactive-text="重置"
                            @click="resetFontHandler"
                        />
                    </div>
                    <FontOption v-for="{option} in store.fontOptionList" :option="option" :key="option" />
                </div>
                <el-divider />
                <div class="change-error-image">
                    <div class="image-header">
                        <el-segmented v-model="storeSetting.imgFit" :options="imgFitList"  />
                    </div>
                    <div class="change-error-image-container">
                        <div class="image-file" 
                        @dragover.prevent.stop="" 
                        @dragenter="dragenterHandler" 
                        @dragleave="dragleaveHandler" 
                        @drop.prevent.stop="dropHandler" 
                        :class="{'image-border-active':isBGActive}"
                        >
                            <input type="file" @change="selectionImage" accept="image/*">
                            <div class="image-file-container">
                                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                                <el-text size="small">拖动文件或者点击添加图片</el-text>
                            </div>
                            <el-text size="small">推荐规格：300 X 300 (单位：px)</el-text>
                        </div>
                        <div class="center">
                            <el-switch
                            v-model="resetImage"
                            inline-prompt
                            inactive-text="重置"
                            @click="resetImageHandler"
                            />
                            <el-tag type="primary">自定义音频无封面时的图片</el-tag>
                        </div>

                        <Image class="right"/>
                    </div>
                </div>
            </div>
            <el-text style="color:var(--el-color-primary-light-4);" size="small">©point change audio 仅用于学习与交流</el-text>
        </div>
    </el-scrollbar>
</template>
<style scoped>
    .image-header{
        margin-bottom: 1rem;
        display: flex;
        justify-content: center;
    }
   [type="file"]{
        position: relative;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: 20;
    }
    .change-error-image-container{
        display: flex;
        justify-content: space-evenly;
        align-items: center;
    }
    .image-file,
    .change-error-image-container .right{
        width: 200px;
        height: 200px;
        border: 1px solid var(--el-color-primary-light-6);
        border-radius: 1rem;
    }
    .change-error-image-container .right{
        overflow: hidden;
    }
    .change-error-image-container .center{
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .image-file{
        position: relative;
        border: 1px dashed var(--el-color-primary-light-6);
    }
    .image-file:hover,
    .image-border-active{
        border-color:var(--el-color-primary);
    }
    .el-icon--upload{
        font-size: 4rem;
        color: var(--el-color-primary-light-6);
    }
    .image-file-container{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 10;
    }
    .image-file-container .el-text{
        text-wrap: nowrap;
    }
    .theme-color-leave-active{
        position: absolute;
    }
    .test{
        right:-1rem;
    }
    /* .el-scrollbar__bar{
        right:-1rem !important;
    } */
    .selected-font{
        flex:1;
        display: flex;
        justify-content: space-around;
    }
    .el-space-define{
        display: grid;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box; 
    }
    .setting{
        /* margin-right: 1rem; */
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