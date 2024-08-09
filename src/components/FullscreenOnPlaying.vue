<script setup>
import { CaretRight } from '@element-plus/icons-vue';
import { useSongList } from '@/store/musicList';
import ControlBtn from './ControlBtn.vue';
import ProgressBar from './ProgressBar.vue';
import PicAndSong from './PicAndSong.vue';
import { computed, onMounted, ref ,watch } from 'vue';
import { useTheme } from '@/store/theme';
import { useGradient } from '@/util/grandientColorChange';
import { useSetting } from '@/store/setting';
    defineProps(['fullscreenHandler']);
    const store=useSongList();
    const storeTheme=useTheme();
    const storeSetting=useSetting();
    const isLrcEmpty=computed(()=>store.currentSongLrc.length>0?true:false);
    const lrcRef=ref(null);
    const lrcContainerRef=ref(null);
    const pRefs=ref(null);
    let top =ref('50%');
    let isStopTopMove=ref(false);
    let mousedownY=ref(0);
    let offset=ref(0);
    let isStopTopAnimate=ref(false);
    function mousedownHandler(e){
        isStopTopMove.value=true;
        isStopTopAnimate.value=true;
        mousedownY.value=e.clientY;
        offset.value=top.value?top.value:0;
    }
    function mousemoveHandler(e){
        if(isStopTopMove.value){
           top.value = offset.value + e.clientY - mousedownY.value;
        }
    }
    function mouseupHandler(){
        isStopTopMove.value=false;
        isStopTopAnimate.value=false;
    }
    watch(()=>store.currentSongLrc,()=>{
        top.value = lrcRef.value.clientHeight / 2;
    })
    watch(()=>store.currentTimeLrc,()=>{
        if(!isLrcEmpty.value)return;
        if(isStopTopMove.value)return;
        if(!lrcRef.value)return;
        if(!pRefs.value)return;
        // 位移： (store.audioInfo.c/store.audioInfo.d)*lrcContainerRef.value.scrollHeight
        pRefs.value.forEach((item,index)=>{
            if(item.classList.contains("current_lrc_active")){
                top.value = lrcRef.value.clientHeight / 2-((item.clientHeight+16*2)*(index+1));
            }
        })
    },{immediate:true});
    const {gradientColor}=useGradient(storeTheme);
</script>
<template>
    <div class="fullScreen" :style="{
        'background-image': `radial-gradient( circle farthest-corner at 10% 70%,  ${gradientColor} 8.3%, ${storeSetting.isPictureColor?storeTheme.controlColor:'var(--el-color-primary-light-6)'} 79.4%  )`
    }" >
        <div class="lrc" ref="lrcRef">
            <div class="lrc-container" ref="lrcContainerRef" :style="[
                {'top':top+'px'},
                isStopTopAnimate?'transition: none':'transition: top 1s ease'
            ]" v-if="isLrcEmpty"
            @mousedown="mousedownHandler"
            @mousemove="mousemoveHandler"
            @mouseup="mouseupHandler"
            >
                <p ref="pRefs"
                :class="{'current_lrc_active':item.hasOwnProperty('isActive')?item.isActive:''}"
                v-for="item in store.currentSongLrc" :key="item.time" 
                >
                    {{ item.text }}
                    <el-icon :style="{'background-color':storeTheme.controlColor}"
                    @click="()=>store.changeProgress(item.time)"><CaretRight /></el-icon>
                </p>
            </div>
            <div class="empty" v-else>暂无歌词</div>
            <p class="pos_current_time">
            </p>
        </div>
        <div class="controls">
            <ProgressBar class="progress_bar"/>
            <ControlBtn class="control_btn" fontSize="2rem"/>
        </div>
        <PicAndSong :fullscreenHandler="fullscreenHandler"  />
    </div>
</template>
<style scoped>
    .fullscreen-test{
        position: relative;
    }
    .fullScreen{
        width: 100%;
        height: 100%;
    }
    .image{
        width: 300px;
        height: 300px;
    }
    .lrc{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 60%;
        overflow: hidden;
    }
    .lrc-container{
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: top 1s ease;
        z-index: 6;
    }
    p{
        display: flex;
        align-items: center;
        opacity: .4;
        user-select: none;
    }
    p .el-icon{
        display: none;
    }
    p:hover .el-icon{
        display: block;
        cursor: pointer;
    }
    p:hover{
        opacity: 1;
    }
    .pos_current_time{
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        background-color: rebeccapurple;
        opacity: .4;
        z-index: 4;
    }
    .controls{
        position: absolute;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    .control_btn{
        margin-top: 2%;
    }
    .progress_bar{
        position: relative;
        width: 100%;
    }
    .current_lrc_active{
        opacity: 1;
    }
</style>