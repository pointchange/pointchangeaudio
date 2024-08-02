<script setup>
import { useSongList } from '@/store/musicList';
import Image from '@/components/Image.vue';
import { usePosition } from '@/store/position';
import { nextTick, ref, watch } from 'vue';
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
    })
</script>
<template>
    <div style="position: relative;overflow: hidden;">
        <Transition
        name="playing"
        enter-active-class="animate__animated animate__slideInRight"
        leave-active-class="animate__animated animate__slideOutLeft playing-leave-active"
        >
            <div class="playing" :key="store.audioInfo.path">
                <Image  class="el-image-class" />
                <div class="song">
                    <el-space class="space" direction="vertical">
                        <div class="title">{{store.audioInfo.title}}</div>
                        <div class="name">{{store.audioInfo.artist}}</div>
                    </el-space>
                </div>
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
    .playing{
        display: flex;
        align-items: flex-end;
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