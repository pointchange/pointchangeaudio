<script setup>
import { useSongList } from '@/store/musicList';
import { useSetting } from '@/store/setting';
import { computed } from 'vue';
    const props=defineProps(['src','isScaleImg']);
    const store=useSongList();
    const storeSetting=useSetting();
    let second=computed(()=>{
        if(!store.audioInfo.pic)return '0s';
        if(props.isScaleImg){
            return store.audioInfo.d+'s';
        }
    })
</script>
<template>
    <!-- 此div 为了响应el-image为加载失败时click不能触发click事件 -->
    <div class="img-box">
        <el-image class="img-container-1" :style="{'animation-duration':second}" :src="src?
            `local-img://picture${store.audioInfo.path}`
        :''" :fit="store.audioInfo.pic?'fill':storeSetting.imgFit" >
            <template #error v-if="storeSetting.imagePath">
                <img :src="storeSetting.imagePath?`local-img://cover${storeSetting.imagePath}`:''" :style="{'object-fit':storeSetting.imgFit}" alt="加载失败">
            </template>
        </el-image>
    </div>
</template>
<style scoped>
    .img-box{
        overflow: hidden;
    }
    .img-container-1,
    img{
        width: 100%;
        height: 100%;
    }
    .img-container-1{
        transform-origin: center;
        animation-name: imgScaleAnimation;
    }
</style>