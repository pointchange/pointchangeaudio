<script setup>
import {
ArrowLeft,
ArrowRight,
VideoPause,
VideoPlay,
} from '@element-plus/icons-vue';
import { useSongList } from '@/store/musicList';
    defineProps(['isDisabled','fontSize'])
    const store = useSongList();
    const {preSong,nextSong,pause,play}=store;
    function isPlayHandler() {
        if (store.isPlaying) {
            pause();
        } else {
            play();
        }
    }
</script>
<template>
    <span>
        <el-button :disabled="isDisabled" :style="{fontSize}" circle size="large" type="" text="" :icon="ArrowLeft" @click="() => preSong(store.audioInfo.path)"></el-button>
        <el-button :disabled="isDisabled" :style="{fontSize}" circle size="large" type="" text=""
        :icon="store.isPlaying ? VideoPause : VideoPlay" @click="isPlayHandler"></el-button>
        <el-button :disabled="isDisabled" :style="{fontSize}" circle size="large" type="" text=""
        :icon="ArrowRight" @click="() => nextSong(store.audioInfo.path)"></el-button>
    </span>
</template>
<style scoped>
    
</style>