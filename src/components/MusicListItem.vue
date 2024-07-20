<script setup>
import { ElDivider } from 'element-plus'
import { useSongList } from '@/store/musicList';
import { h } from 'vue'
import { usePosition } from '@/store/contextMenuPositon';
const store=useSongList();
const {getName,countTime}=store;
defineProps(['songSize','path','duration','bitrate','lossless','sampleRate','title','artist','picture','album','container','isActive','canvasRef']);
const spacer = h(ElDivider, { direction: 'vertical' })
const storePos=usePosition();

function contextmenuHandler(e,path){
    storePos.left=e.clientX;
    storePos.top=e.clientY;
    storePos.path=path;
}
</script>
<template>
    <el-card shadow="hover" @contextmenu="contextmenuHandler($event,path)">
        <el-row  justify="space-between">
            <el-col :span="14">
                <el-text class="songName" size="small" truncated>
                    {{getName(path,title)}}
                </el-text>
            </el-col>
            <el-col :span="2">
                <el-tag type="warning" size="small" v-if="lossless">
                    {{ path.split('.')[1].toUpperCase() }}
                </el-tag>
                <el-tag v-else type="success">{{ path.split('.')[1].toUpperCase() }}</el-tag>
            </el-col>

            <el-col :span="2">{{countTime(duration)}}</el-col>
        </el-row>
        <el-row justify="end">
            <el-space :spacer="spacer">
                <el-text size="small">{{ (sampleRate / 1000).toFixed(0) + 'kHz' }}</el-text>
                <el-text size="small">{{ Math.round(bitrate / 1000) + 'kbps' }}</el-text>
                <el-text size="small">{{(songSize / 1024 / 1024).toFixed(2) + 'MB'}}</el-text>
            </el-space>
        </el-row>
    </el-card>
    
</template>
<style scoped>

.rowChild2{
    font-size: var(--el-font-size-extra-small)
}
.songName{
    font-size: var(--el-font-size-extra-large)
}
</style>