<script setup>
import { ref,watch } from 'vue';
import { useSongList } from '@/store/musicList';
    const store = useSongList();
    const {changeProgress,countTime}=store;
    let progressValue = ref(0);
    let stopCurrentTime = ref(false);
    function changeH(value) {
        changeProgress(value);
        stopCurrentTime.value = false;
    }
    function inputH(value) {
        stopCurrentTime.value = true;
    }
    function formatTooltip(value) {
        return countTime(value)
    }
        //性能有问题
    watch(() => store.audioInfo.c, () => {
        if (stopCurrentTime.value) return;
        progressValue.value = store.audioInfo.c;
    }, { immediate: true });
</script>
<template>
    <div>
        <el-slider :disabled="!store.isPlay" class="progress-slider" v-model="progressValue" :max="store.audioInfo.d"
            @change="changeH" :format-tooltip="formatTooltip" @input="inputH" />
        <div class="mx-1">
            <el-space spacer="|">
            <el-text size="small">{{ store.audioInfo.currentTime }}</el-text>
            <el-text size="small">{{ store.audioInfo.duration }}</el-text>
            </el-space>
        </div>
    </div>
</template>
<style scoped>
.progress-slider {
  margin: 0;
}   
.mx-1 {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;
}
</style>