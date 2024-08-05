<script setup>
import { useSongList } from '@/store/musicList';
import { useSetting } from '@/store/setting';
    defineProps(['src']);
    const store=useSongList();
    const storeSetting=useSetting();
</script>
<template>
    <!-- 此div 为了响应el-image为加载失败时click不能触发click事件 -->
    <div>
        <el-image class="img-container-1" :src="src?
            `local-img://picture${store.audioInfo.path}`
        :''" :fit="store.audioInfo.pic?'fill':storeSetting.imgFit" >
            <template #error v-if="storeSetting.imagePath">
                <img :src="storeSetting.imagePath?`local-img://cover${storeSetting.imagePath}`:''" :style="{'object-fit':storeSetting.imgFit}" alt="加载失败">
            </template>
        </el-image>
    </div>
</template>
<style scoped>
    .img-container-1,
    img{
        width: 100%;
        height: 100%;
    }
</style>