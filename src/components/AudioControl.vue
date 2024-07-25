<script setup>
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  VideoPause,
  VideoPlay,
  Microphone,
} from '@element-plus/icons-vue';
import {  ref , onMounted,watch, computed} from 'vue';
import { useSongList } from '@/store/musicList';

const store=useSongList();
const {nextSong,preSong,play,pause,changeVolume,addDirectory,countTime,changeProgress}=store;
const volumeValue = ref(100);
let progressValue=ref(0);
const isEmpty=computed(()=>store.songs.length);
const classStr=ref('loop-all');
function changePlayOrderHandler(){
  switch (store.playOrder) {
    case 0:
        classStr.value='loop-all'
      break;
    case 1:
        classStr.value='random'
      break;  
    case 2:
        classStr.value='loop-one'
      break;
    default:
        store.playOrder=0;
        classStr.value='loop-all'
      break;
  }
}
function changePlayOrder(){
  store.playOrder++;
  changePlayOrderHandler();
}
const isSaveEmpty=computed(()=>JSON.stringify(store.save)==='{}')
const isDisabled=computed(()=>!isEmpty.value||isSaveEmpty.value);
onMounted(()=>{
    electron.mainControlPlay((e, bool) => {
      if (bool) {
          play();
      } else {
          pause();
      }
    });
    electron.onSwitchSong((e,str)=>{
      if(str==='pre'){
        store.preSong(store.audioInfo.path)
      }else{
        store.nextSong(store.audioInfo.path)
      }
    });
    changePlayOrderHandler();
    if(!isEmpty.value){
      store.audioInfo={};
      store.save={};
    }
    if(isSaveEmpty.value)return;
    const {currentSong,duration,currentTime,c,d,path}=store.save;
    store.audioInfo={
      currentSong,
      duration,
      currentTime,
      c,
      d,
      // progressPresent:store.save.progressPresent,
      // title:store.save.title,
      path,
    }
});

let stopCurrentTime=ref(false);
function formatTooltip (value) {
  return countTime(value)
}
function changeH(value){
  changeProgress(value);
  stopCurrentTime.value=false;
}
function inputH(value){
  stopCurrentTime.value=true;
}

//性能有问题
watch(()=>store.audioInfo.c,()=>{
  if(stopCurrentTime.value)return;
  progressValue.value=store.audioInfo.c;
},{immediate:true});

function isPlayHandler(){
  if(store.isPlaying){
    pause();
  }else{
    play();
  }
}



</script>
<template>
  <!-- <el-affix target="#app" position="bottom" > -->
    <Teleport to="body">
      <div class="control-container">
        <el-page-header class="el-page-header-ele" title=" ">
          <template #icon>
            <!-- <el-image style="width: 80px; height: 80px" 
            :src="store.audioInfo.pic?`data:${store.audioInfo.pic[0].format};base64,${store.audioInfo.pic[0].data.toString('base64')}`:''" 
            fit="fill" /> -->
            <!-- 按需加载 播放时加载 -->
           <el-image style="width: 80px; height: 80px" :src="store.audioInfo.pic?
            `local-img://picture${store.audioInfo.path}`
            :''" fit="fill" /> 
            <!-- <el-image style="width: 80px; height: 80px" src="" fit="fill" /> -->
          </template>
          <template #content>
            <el-button :disabled="isDisabled" class="el-button-icon" circle size="large" type="" text="" plain :icon="ArrowLeft" @click="()=>preSong(store.audioInfo.path)"></el-button>
            <el-button :disabled="isDisabled" class="el-button-icon" circle size="large" type="" text="" plain :icon="store.isPlaying?VideoPause:VideoPlay"
            @click="isPlayHandler"></el-button>
            <!-- <el-button :disabled="isDisabled" class="el-button-icon" circle size="large" type="" text="" plain :icon="VideoPause"
            @click="pause"></el-button> -->
            <el-button :disabled="isDisabled" class="el-button-icon" circle size="large" type="" text="" plain :icon="ArrowRight"
            @click="()=>nextSong(store.audioInfo.path)"></el-button>
            <el-popover placement="right" trigger="click">
              <template #reference>
                <el-button :disabled="isDisabled" class="el-button-icon" circle size="large" type="" text="" plain :icon="Microphone"></el-button>
              </template>
              <el-slider v-model="volumeValue" @input="()=>changeVolume(volumeValue)" />
            </el-popover>
            <el-button :disabled="isDisabled" class="el-button-icon" type="" text="" size="large" circle @click="changePlayOrder">
              <template #icon>
                <svg v-show="classStr==='loop-one'" t="1721291671314" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1946" width="16" height="16"><path d="M361.5 727.8c-119.1 0-215.9-96.9-215.9-215.9 0-119.1 96.9-215.9 215.9-215.9 2.3 0 4.6-0.2 6.8-0.6v58.3c0 12.3 14 19.4 23.9 12.1l132.6-97.6c8.1-6 8.1-18.2 0-24.2l-132.6-97.6c-9.9-7.3-23.9-0.2-23.9 12.1v58.1c-2.2-0.4-4.5-0.6-6.8-0.6-39.8 0-78.5 7.9-115 23.4-35.2 15-66.8 36.3-94 63.5s-48.6 58.8-63.5 94c-15.5 36.5-23.4 75.2-23.4 115s7.9 78.5 23.4 115c15 35.2 36.3 66.8 63.5 94s58.8 48.6 94 63.5c36.5 15.5 75.2 23.4 115 23.4 22.1 0 40-17.9 40-40s-17.9-40-40-40z m576.7-330.9c-15-35.2-36.3-66.8-63.5-94s-58.8-48.6-94-63.5c-36.5-15.5-75.2-23.4-115-23.4-22.1 0-40 17.9-40 40s17.9 40 40 40c119.1 0 215.9 96.9 215.9 215.9 0 119.1-96.9 215.9-215.9 215.9-4.1 0-8.1 0.6-11.8 1.8v-60.8c0-12.3-14-19.4-23.9-12.1l-132.6 97.6c-8.1 6-8.1 18.2 0 24.2L629.9 876c9.9 7.3 23.9 0.2 23.9-12.1V806c3.7 1.2 7.7 1.8 11.8 1.8 39.8 0 78.5-7.9 115-23.4 35.2-15 66.8-36.3 94-63.5s48.6-58.8 63.5-94c15.5-36.5 23.4-75.2 23.4-115s-7.8-78.5-23.3-115z" p-id="1947"></path><path d="M512.8 660.6c22.1-0.1 39.9-18.1 39.8-40.2l-1.2-214.1c-0.1-22-18-39.8-40-39.8h-0.2c-22.1 0.1-39.9 18.1-39.8 40.2l1.2 214.1c0.1 22 18 39.8 40 39.8h0.2z" p-id="1948"></path></svg>

                <svg v-show="classStr==='loop-all'"  t="1721291786389" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2385" width="16" height="16"><path d="M361.5 727.8c-119.1 0-215.9-96.9-215.9-215.9 0-119.1 96.9-215.9 215.9-215.9 2.3 0 4.6-0.2 6.8-0.6v58.3c0 12.3 14 19.4 23.9 12.1l132.6-97.6c8.1-6 8.1-18.2 0-24.2l-132.6-97.6c-9.9-7.3-23.9-0.2-23.9 12.1v58.1c-2.2-0.4-4.5-0.6-6.8-0.6-39.8 0-78.5 7.9-115 23.4-35.2 15-66.8 36.3-94 63.5s-48.6 58.8-63.5 94c-15.5 36.5-23.4 75.2-23.4 115s7.9 78.5 23.4 115c15 35.2 36.3 66.8 63.5 94s58.8 48.6 94 63.5c36.5 15.5 75.2 23.4 115 23.4 22.1 0 40-17.9 40-40s-17.9-40-40-40z m576.7-330.9c-15-35.2-36.3-66.8-63.5-94s-58.8-48.6-94-63.5c-36.5-15.5-75.2-23.4-115-23.4-22.1 0-40 17.9-40 40s17.9 40 40 40c119.1 0 215.9 96.9 215.9 215.9 0 119.1-96.9 215.9-215.9 215.9-4.1 0-8.1 0.6-11.8 1.8v-60.8c0-12.3-14-19.4-23.9-12.1l-132.6 97.6c-8.1 6-8.1 18.2 0 24.2L629.9 876c9.9 7.3 23.9 0.2 23.9-12.1V806c3.7 1.2 7.7 1.8 11.8 1.8 39.8 0 78.5-7.9 115-23.4 35.2-15 66.8-36.3 94-63.5s48.6-58.8 63.5-94c15.5-36.5 23.4-75.2 23.4-115s-7.8-78.5-23.3-115z" p-id="2386" fill="#696b6f"></path></svg>

                <svg  v-show="classStr==='random'"  t="1721291826632" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2661" width="16" height="16"><path d="M914.2 705L796.4 596.8c-8.7-8-22.7-1.8-22.7 10V688c-69.5-1.8-134-39.7-169.3-99.8l-45.1-77 47-80.2c34.9-59.6 98.6-97.4 167.4-99.8v60.1c0 11.8 14 17.9 22.7 10l117.8-108.1c5.8-5.4 5.8-14.6 0-19.9L796.4 165c-8.7-8-22.7-1.8-22.7 10v76H758c-4.7 0-9.3 0.8-13.5 2.3-36.5 4.7-72 16.6-104.1 35-42.6 24.4-78.3 59.8-103.1 102.2L513 432l-24.3-41.5c-24.8-42.4-60.5-77.7-103.1-102.2C343 263.9 294.5 251 245.3 251H105c-22.1 0-40 17.9-40 40s17.9 40 40 40h140.3c71.4 0 138.3 38.3 174.4 99.9l47 80.2-45.1 77c-36.2 61.7-103 99.9-174.4 99.9H105c-22.1 0-40 17.9-40 40s17.9 40 40 40l142 0.1h0.2c49.1 0 97.6-12.9 140.2-37.3 42.7-24.4 78.3-59.8 103.2-102.2l22.4-38.3 22.4 38.3c24.8 42.4 60.5 77.8 103.2 102.2 33.1 18.9 69.6 30.9 107.3 35.4 3.8 1.2 7.8 1.8 11.9 1.8l15.9 0.1v55c0 11.8 14 17.9 22.7 10L914.2 725c5.9-5.5 5.9-14.7 0-20z" p-id="2662" fill="#696b6f"></path></svg>
              </template>
            </el-button>
          </template>
          <template #extra>
            <el-tooltip
              effect="dark"
              content="添加文件夹"
            >
              <el-button class="add-btn" type="success" plain :icon="Plus" @click="addDirectory"></el-button>
            </el-tooltip>
          </template>
        </el-page-header>
        <div class="progress-container" >
              <el-slider :disabled="!store.isPlay" class="progress-slider"  v-model="progressValue" :max="store.audioInfo.d" @change="changeH" :format-tooltip="formatTooltip" @input="inputH"  />
              <div class="mx-1" >
                    <el-space spacer="|">
                      <el-text size="small">{{store.audioInfo.currentTime}}</el-text>
                      <el-text size="small">{{store.audioInfo.duration}}</el-text>
                    </el-space>
              </div>
        </div>
      </div>
    </Teleport>
  <!-- </el-affix> -->

</template>
<style scoped>
.control-container{
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100;
}
.el-button-icon{
  font-size: 1.4rem;
}

.progress-slider{
  margin: 0;
}
.progress-container{
  padding: 0 5rem;
  position: absolute;
  bottom: 60px;
  width: 100%;
  box-sizing: border-box;
}
.mx-1{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;;
}
.add-btn{
  margin-right: 1rem;
}
</style>