<script setup>
import { useSongList } from '@/store/musicList';
import Image from '@/components/Image.vue';
import { usePosition } from '@/store/position';
import { nextTick, ref, watch } from 'vue';
import { useTheme } from '@/store/theme';
import { useSetting } from '@/store/setting';
    const store=useSongList();
    const {getName,countTime,playCurrentMusic}=store;
    const storePos=usePosition();
    const storeTheme=useTheme();
    const storeSetting=useSetting();
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
    const btnType=ref('primary');
    // let isPictureColor=ref(false);
    function changeColor(){
        storeSetting.isPictureColor=!storeSetting.isPictureColor;
        if(storeSetting.isPictureColor){
            btnType.value='';
        }else{
            btnType.value='primary';
        }
    }
    // const playingRef=ref(null);
    // let isFullscreen=ref(false);
    // async function fullscreenHandler(){
    //     playingRef.value.requestFullscreen();
    //     isFullscreen.value = document.fullscreenElement !== null;
    //     if(isFullscreen.value){
    //         document.exitFullscreen();
    //     }
    // }
</script>
<template>
    <div style="position: relative;overflow: hidden;">
        <Transition
        name="playing"
        enter-active-class="animate__animated animate__slideInRight"
        leave-active-class="animate__animated animate__slideOutLeft playing-leave-active"
        >
            <div class="playing" ref="playingRef" :key="store.audioInfo.path" :style="{'background-image':` linear-gradient( 109.6deg,  rgba(255,255,255,.8) 11.2%, ${storeSetting.isPictureColor?storeTheme.controlColor:'var(--el-color-primary-light-6)'})`}">
                <div class="playing-container">
                    <Image  class="el-image-class" :src="store.audioInfo.pic" />
                    <div class="song">
                        <el-space class="space" direction="vertical">
                            <div class="title">{{store.audioInfo.title}}</div>
                            <div class="name">{{store.audioInfo.artist}}</div>
                        </el-space>
                    </div>
                </div>
                <el-button type="primary" :color="storeSetting.isPictureColor?storeTheme.controlColor:''"  @click="changeColor">{{storeSetting.isPictureColor?'主题色':'封面色'}}</el-button>
                <!-- <el-button type="primary" @click="fullscreenHandler">点击</el-button> -->
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
    .playing-leave-active {
        position: absolute;
    }
    .playing-container{
        display: flex;
        align-items: flex-end;
    }
    .playing{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
        /* background-color: var(--el-color-primary-light-6); */
        background-image: linear-gradient( 109.6deg,  rgba(255,255,255,.8) 11.2%, var(--el-color-primary-light-6));
    }
    .el-image-class{
        width: 300px;
        height: 300px;
    }
    .space{
        font-family:'PingFang SC';
        font-weight: 100;
        font-size: 2rem;
        letter-spacing: .1rem;
    }
    .name{
        font-size: 1rem;
    }
</style>