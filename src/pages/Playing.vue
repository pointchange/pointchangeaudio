<script setup>
import { useSongList } from '@/store/musicList';
import { usePosition } from '@/store/position';
import { computed, nextTick, ref, watch } from 'vue';

import FullscreenOnPlaying from '@/components/FullscreenOnPlaying.vue';
import PicAndSong from '@/components/PicAndSong.vue';
    const store=useSongList();
    const {getName,countTime,playCurrentMusic}=store;
    const storePos=usePosition();
    const elTableRef=ref(null);
    watch(()=>store.audioInfo.path,async(path)=>{
        const data=elTableRef.value.data.filter(item=>item.path===path);
        elTableRef.value.setCurrentRow(data[0]);
        await nextTick();
        const row= document.querySelector('.current-row');
        if(!row)return;
        
        row.classList.add('animate__animated','animate__pulse')

        let listTop = document.querySelector('.el-table__body').getBoundingClientRect().top;
        elTableRef.value.setScrollTop(row.getBoundingClientRect().top-listTop-(storePos.clientHeight-160-300-40)/2)
    });
 
    const playingRef=ref(null);
    let isFullscreen=ref(false);
    function fullscreenHandler(){
        if (!document.fullscreenElement) {
            playingRef.value.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    let isMaxH=computed(()=>isFullscreen.value?{height:'100%'}:{height:'auto'})
</script>
<template>
    <div ref="playingRef" class="play" @fullscreenchange="isFullscreen=!isFullscreen" >
        <Transition
        name="playing"
        enter-active-class="animate__animated animate__slideInRight"
        leave-active-class="animate__animated animate__slideOutLeft playing-leave-active"
        appear
        >
            <div class="playing" :style="isMaxH" :key="store.audioInfo.path">
                <PicAndSong v-if="!isFullscreen" :fullscreenHandler="fullscreenHandler" :isShowBg="true" />
                <FullscreenOnPlaying v-else :fullscreenHandler="fullscreenHandler" />
            </div>
        </Transition>
    </div>
    <el-table ref="elTableRef" :data="store.songs" stripe style="width: 100%" highlight-current-row :max-height="storePos.clientHeight-160-300"
    @row-click="({path})=>playCurrentMusic(path)">
        <el-table-column label="" >
            <template #default="props">
                {{ getName(props.row.path,props.row.title) }}
            </template>
        </el-table-column>
        <el-table-column align="right" width="100">
            <template #default="scope">
                {{ countTime(scope.row.duration) }}
            </template>
        </el-table-column>
    </el-table>
</template>
<style scoped>
    .play{
        position: relative;
        overflow: hidden; 
        width: 100%;
    }
    .playing{
        width: 100%;
    }
    .playing-leave-active {
        position: absolute;
    }
</style>