<script setup>
import { FullScreen } from '@element-plus/icons-vue';
import { useSetting } from '@/store/setting';
import { useTheme } from '@/store/theme';
import Image from './Image.vue';
import { useSongList } from '@/store/musicList';
import { computed, ref } from 'vue';
import { useEmpty } from '@/util/empty';

    const storeSetting=useSetting();
    const storeTheme=useTheme();
    const store=useSongList();
    const props=defineProps(['fullscreenHandler','isShowBg']);
    const btnType=ref('primary');
    const {isEmpty}=useEmpty(store);
    function changeColor(){
        storeSetting.isPictureColor=!storeSetting.isPictureColor;
        if(storeSetting.isPictureColor){
            btnType.value='';
        }else{
            btnType.value='primary';
        }
    }
    const isShowBg=computed(()=>props.isShowBg?{'background-image':` linear-gradient( 109.6deg,  rgba(255,255,255,.8) 11.2%, ${storeSetting.isPictureColor?storeTheme.controlColor:'var(--el-color-primary-light-6)'})`}:{});
    const isClickHandler=computed(()=>isEmpty.value?'':props.fullscreenHandler)
</script>
<template>
     <div class="exitFullscreen" :style="isShowBg">
        <div class="playing-container">
            <Image  class="el-image-class" :src="store.audioInfo.pic" :isScaleImg="true" />
            <div class="song">
                <el-space class="space" direction="vertical" wrap>
                    <div class="title">{{store.audioInfo.title}}</div>
                    <div class="name">{{store.audioInfo.artist}}</div>
                </el-space>
            </div>
        </div>
        <el-button class="changeColor_btn" type="primary" :color="storeSetting.isPictureColor?storeTheme.controlColor:''"  @click="changeColor">{{storeSetting.isPictureColor?'主题色':'封面色'}}</el-button>
        <el-button type="primary" class="fullScreen-btn" :color="storeSetting.isPictureColor?storeTheme.controlColor:''" :icon="FullScreen"  @click="isClickHandler"></el-button>
    </div>
</template>
<style scoped>
.exitFullscreen{
    display: flex;
    /* justify-content: space-between; */
    /* align-items: flex-start; */
    width: 100%;
    /* background-color: var(--el-color-primary-light-6); */
    /* background-image: linear-gradient( 109.6deg,  rgba(255,255,255,.8) 11.2%, var(--el-color-primary-light-6)); */
}
.playing-container{
    display: flex;
    align-items: flex-end;
    width: 100%;
    box-sizing: border-box;
}
.el-image-class{
    min-width: 300px;
    width: 300px;
    height: 300px;
}
.space{
    font-family:'PingFang SC';
    font-weight: 100;
    font-size: 2rem;
    letter-spacing: .1rem;
    box-sizing: border-box;
}
.title{
    text-wrap: wrap;
}
/* :-webkit-full-screen{
    .title{
        color:red;
    }
} */

.name{
    font-size: 1rem;
}
.changeColor_btn{
    position: absolute;
    top: 0;
    right: 0;   
}
.fullScreen-btn{
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 1.2rem;
}
</style>