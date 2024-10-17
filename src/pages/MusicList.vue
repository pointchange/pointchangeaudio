<script setup>
import {
  Promotion,Loading
} from '@element-plus/icons-vue';
import { ElMessage,ElMessageBox } from 'element-plus'
import { ref,computed, watch } from 'vue';
import { useSongList } from '@/store/musicList';
import { usePosition } from '@/store/position';
import { useDrop } from '@/util/drop';
import { useRouter } from 'vue-router';
const storePos=usePosition();
const store=useSongList();
const {getName,countTime,playCurrentMusic,find}=store;

const search = ref('');

function openFileHandler({row:{path}}){
  electron.openFilePlace(path)
}
const {isBGActive,
    dropHandler,
    dragenterHandler,
    dragleaveHandler
}=useDrop(store);
function deleteHandler(row){
  ElMessageBox.confirm(
    `确定要从列表移除：${getName(row.path,'',true)}`,
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      store.songs=store.songs.filter(item=>item.path!==row.path);
      ElMessage({
        type: 'success',
        message: '移除成功',
      })
    }).catch(() => {
      ElMessage({
        type: 'info',
        message: '取消了',
      })
    })
}
const fileAndlen=computed(()=>{
  // '文件 '+store.songs.length
  const n= store.songs.reduce((pre,cur,i,arr)=>{
    pre=pre+cur.duration;
    if(i===arr.length-1){
      pre=store.countTime(pre)
    }
    return pre;
  },0);
  return '文件：'+store.songs.length+' 总时长：'+n;
});
const elTableRef=ref(null);
//el-scrollbar__view
watch(()=>store.audioInfo.path,(path)=>{
  const data=elTableRef.value.data.filter(item=>item.path===path);
  elTableRef.value.setCurrentRow(data[0]);
})
const route=useRouter()
function scrollToCurrentSong(){
  route.push('/musicList');
  const row= document.querySelector('.current-row');
  if(!row)return;
  let listTop = document.querySelector('.el-table__body').getBoundingClientRect().top
  elTableRef.value.setScrollTop(-(listTop-row.getBoundingClientRect().top))
}
async function accurateGetAudioInfo(path){
  const res=await electron.accurateGetAudioInfo([path]);
  for (let index = 0; index < store.songs.length; index++) {
    if(store.songs[index].path===path){
      // store.songs[index]={...store.songs[index],...res[0]}
      for (const key in store.songs[index]) {
        if(!store.songs[index][key]&&res[0][key]){
          store.songs[index][key]=res[0][key];
        }
      }
    }
  }
}

function openLrcDir(path){
  if(path){
    electron.openFilePlace(path)
  }
} 

async function addAndSetLrc(path){
  const res=await electron.addAndSetLrc();
  //增加/修改当前path lrc
  store.songs.map(v=>{
    if(v.path===path){
      v.lrc=res;
    }
  })
}
</script>
<template>
  <el-table ref="elTableRef" :data="find(search)"  highlight-current-row
  style="width: 100%;" size="large" empty-text="点击右下角 '+' 添加文件夹"
  @row-dblclick="({path})=>playCurrentMusic(path)"
  :max-height="storePos.clientHeight-160"
  @drop.prevent="dropHandler"
  @dragover.prevent=""
  @dragenter="dragenterHandler"
  @dragleave ="dragleaveHandler"
  :class="{'table-list-bg':isBGActive}"
  @row-contextmenu="deleteHandler"
  >
    <el-table-column type="expand">
      <template #default="props">
        <el-descriptions title="" border>
          <el-descriptions-item label="歌名">
            {{ props.row.title?props.row.title:'未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否无损">
            {{ props.row.lossless?'是':'否' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否有封面/插图">
            {{props.row.picture?'有':'未知'}}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ props.row.artist?props.row.artist:'未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="持续时间（秒）">{{ props.row.duration }}</el-descriptions-item>
          <el-descriptions-item label="文件大小（字节）">{{props.row.songSize}}</el-descriptions-item>

          <el-descriptions-item label="专辑">
            {{ props.row.album?props.row.album:'未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="音频编码格式">
            {{props.row.container?props.row.container:'未知'}}
          </el-descriptions-item>
          <el-descriptions-item label="采样率，单位为每秒采样数（S/s）">
            {{ props.row.sampleRate }}
          </el-descriptions-item>
          <el-descriptions-item label="歌词" :span="3">
            <el-space wrap>
              <el-link type="success" @click="openLrcDir(props.row.lrc)">{{ props.row.lrc||'暂无歌词' }}</el-link>
              <el-button type="primary" plain @click="addAndSetLrc(props.row.path)">增加 / 修改</el-button>
            </el-space>
          </el-descriptions-item>
          <el-descriptions-item label="路径" :span="3">
            <el-link type="success" @click="openFileHandler(props)">{{ props.row.path }}</el-link>
          </el-descriptions-item>
          <el-descriptions-item label="操作" >
            <el-button type="warning" plain @click="accurateGetAudioInfo(props.row.path)">数据是否有错误？可精确获取数据</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-table-column>
    <el-table-column  show-overflow-tooltip >
      <template #header>
        <el-space wrap style="flex-wrap: nowrap;">
          <el-icon v-if="store.loading" class="loading"><Loading /></el-icon>
          <span>{{ fileAndlen }}</span>
        </el-space>
      </template>
      <template #default="scope">
        {{ getName(scope.row.path,'',true) }}
      </template>
    </el-table-column>
    <!-- <el-table-column label="歌名" >
      <template #default="scope">
        {{scope.row.title?scope.row.title:'未知' }}
      </template>
    </el-table-column> -->
    <el-table-column label="作者" >
      <template #default="scope">
        {{scope.row.artist?scope.row.artist:'未知' }}
      </template>
    </el-table-column>
    <!-- <el-table-column label="专辑" >
      <template #default="scope">
        {{scope.row.album?scope.row.album:'未知' }}
      </template>
    </el-table-column> -->
    <el-table-column align="right" width="180">
      <template #header>
        <el-input v-model="search" placeholder="搜索" clearable />
      </template>
      <template #default="scope">
        <el-space wrap>
          <el-tag size="small" type="info" effect="plain">{{ countTime(scope.row.duration) }}</el-tag>
          <el-tag size="small" :type="scope.row.lossless?'warning':'success'">{{ scope.row.path.split('.')[scope.row.path.split('.').length-1].toUpperCase() }}</el-tag>
        </el-space>
      </template>
    </el-table-column>
  </el-table>
  <Teleport to="body">
    <div class="position-song">
      <el-button :icon="Promotion" circle @click="scrollToCurrentSong" />
    </div>
  </Teleport>
</template>
<style scoped>
    .loading{
      transform-origin: center;
      animation: imgAnimation 2s infinite;
    }
    .artist{
      width: fit-content;
    }
    .position-song{
      position: absolute;
      right: 20px;
      bottom: 150px;
      z-index: 100;
    }
    .el-space{
      width: 100%;
    }
    .table-list-bg{
      border:1px solid var(--el-color-primary-light-4);
    }
    .right-container{
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap
    }
    .el-descriptions{
      user-select: text;
    }
</style>