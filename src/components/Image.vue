<script setup>
import { useSongList } from '@/store/musicList';

    const store=useSongList();
</script>
<template>
    <!-- 此div 为了响应el-image为加载失败时click不能触发click事件 -->
    <div>
        <el-image class="img-container-1" :src="store.audioInfo.pic?
            `local-img://picture${store.audioInfo.path}`
        :''" fit="fill" /> 
    </div>
</template>
<style scoped>
    .img-container-1{
        width: 100%;
        height: 100%;
    }
</style>