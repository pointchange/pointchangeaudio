<script setup>
import { ElLoading,ElInput} from 'element-plus'

import { useFormat } from '@/store/format';
import {ref,nextTick } from 'vue';
import TransformAudioCard from '@/components/TransformAudioCard.vue';
import { useSongList } from '@/store/musicList';
import { useRandomType } from '@/util/randomType';
const storeSongs=useSongList();

const activeName = ref('transform')
const store=useFormat();
const selectValue = ref('');

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref(null)

function handleClose(tag) {
  store.formatList.splice(store.formatList.indexOf(tag), 1);
  selectValue.value='';
}

function showInput(){
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}
function handleInputConfirm(){
  if (inputValue.value) {
    store.formatList.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
async function transformToFLAC(){
  const tempList=[];
  let len= storeSongs.notPlaySongs.length;
  let count=0;
  let loading = ElLoading.service({target: '.not-play-song-container', text:  `${count}/${len} 0%`});
  electron.onUpdateProgress((e,percent)=>{
    if(typeof percent === "number"&&parseInt(percent)>=99){
      count++;
    }
    loading.setText(`${count}/${len} ${percent.toFixed()}%`);
  })
  for (let i = 0; i < len; i++) {
      const item = storeSongs.notPlaySongs[i];
      const res=await electron.transformFormat(item.path,storeSongs.getName(item.path,'',true),'FLAC');
      if(!res)return;
      tempList.push({...res,path:res.newPath});
  }
  loading.setText(`等待添加到音乐列表……`);
  const pathList= tempList.map(item=>item.path);
  const res=await electron.getAudioInfo(pathList);
  storeSongs.addSongs(res);
  storeSongs.notPlaySongs.length=0;
  loading.close();
}
const transformDoc=[
  {
    label:'音乐文件播放格式',
    content:'有损压缩和无损压缩'
  },
  {
    label:'无损压缩',
    content:'WAV、APE、FLAC、WavPack、LPAC、WMALossless、AppleLossless、La、OptimFROG、Shorten等'
  },
  {
    label:'有损压缩',
    content:'mp3、OGG、AAC、m4a等等'
  },
  {
    label:'WAV',
    content:'Windows下录音时所用到的标准文件'
  },
  {
    label:'APE',
    content:'一种无损压缩音频技术，APE的文件大小大概为WAV的一半左右'
  },
  {
    label:'FLAC',
    content:'无损的，APE也是，本质就是WAV。就是编码不同。FLAC(Free Lossless Audio Codec)，是免费的并且支持大多数的操作系统，包括Windows、基于Unix内核而开发的系统，'
  },
  {
    label:'OGG',
    content:'(OGG Vobis)，类似于MP3，很出众的特点：支持多声道。'
  },
  {
    label:'AAC',
    content:'(高级音频编码技术 Advanced Audio Coding)可以在比MP3文件缩小30%的前提下提供更好的音质。'
  },
  {
    label:'MP3',
    content:'(MPEG Audio Layer3)就是一种音频压缩技术，能够在音质丢失很小的情况下把文件压缩到更小的程度，而且还可以较好的保持了原来的音质。MP3的特点：体积小，音质高。MP3音频可以按照不同的位速(比特率kbps)进行压缩，提供了在数据大小和声音质量之间进行权衡的一个范围，例如：低质的MP3有64kbps，好的也有320kbps'
  },
  {
    label:'转换建议',
    content:'实际上每次转换都是一个压缩的过程,会损坏原文件里的许多信息,使音质变差。换句话讲有损压缩就是丢掉一些东西，造成文件小了，储存、传输方便了，保证一定音质的情况下压缩。无损之间转换几乎无差，例如：本应用不能播放的APE、wam(无损)等无损格式转化完flac后几乎无差别。推荐是无损转有损，有损转有损情况很多。建议试试，再批量转换格式。例如：测试到MP3->AAC 音乐时长变长了，音质差了。'
  },
  {
    label:'压缩比比较',
    content:'(同一音源条件下) aac > ogg > mp3（wma） > ape > flac > wav'
  },
  {
    label:'音质比较',
    content:'(同一音源条件下) wav = flac = ape > aac > ogg > mp3 > wma'
  },
  {
    label:'输出的文件大小',
    content:' WAV文件所占容量=（采样频率×采样位数×声道）× 时间/8（1字节=8bit）',
  },
  {
    label:'一般输出文件的大小(大概)',
    content:'音频码率(比特率kbps) x 时长(持续时间 s) / 8  得到音频数据的总字节数'
  },
  
];
</script>
<template>
  <el-tabs stretch v-model="activeName" class="demo-tabs">
    <el-tab-pane label="音频转换" name="transform">
      <el-card >
        <template #header>
          <div class="card-header">
            <el-text size="large">请选择格式：</el-text>
            <el-select
            v-model="selectValue"
            clearable
            placeholder="选择格式"
            style="width: 240px"
            >
                <el-option
                v-for="item in store.formatList"
                :key="item"
                :label="item"
                :value="item"
                />
            </el-select>
          </div>
        </template>
        <div class="tag-container">
          <el-text size="large">自定义格式：</el-text>
          <el-tag v-for="tag in store.formatList" :key="tag" closable :type="useRandomType(Math.random())"
          @close="handleClose(tag)" >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + New Tag
          </el-button>
          
        </div>
      </el-card>
        <div class="row row-m">
          <TransformAudioCard :list="store.addedList" title="开始转换" :format="selectValue" :diffHandler="false" />
          <TransformAudioCard :list="store.doneList" title="添加到音乐列表" :format="selectValue" :diffHandler="true"/>
        </div>
    </el-tab-pane>
    <el-tab-pane label="不可播放的音频" name="notPlaySong">
      <div class="not-play-song-container">
        <el-collapse>
          <el-collapse-item title="不支持播放的音频APE、WMA" name="1">
            <p v-for="item in storeSongs.notPlaySongs">{{ storeSongs.getName(item.path,'',true) }}</p>
          </el-collapse-item>
        </el-collapse>
        <el-button :disabled="storeSongs.notPlaySongs.length===0?true:false" style="width: 100%;" type="success" plain @click="transformToFLAC">一键转换为FLAC {{ storeSongs.notPlaySongs.length }}</el-button>
      </div>
    </el-tab-pane>
    <el-tab-pane label="风格指南" name="guide">
        <el-descriptions title="音频转换器的工作原理：通过读取音频文件的元数据和采样信息，并在转换过程中重置它们，把一种格式的音频文件转换成另一种格式。" border
        :column="1" >
          <el-descriptions-item v-for="item in transformDoc" :label="item.label">{{item.content}}</el-descriptions-item>
        </el-descriptions>
    </el-tab-pane>
  </el-tabs>
</template>
<style scoped>
  .row{
    display: grid;
    grid-template-columns: repeat(2,48%);
    gap: 4%;
    width: 100%;
  }
  .tag-container{
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .el-card-container{
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }
  .row-m{
    margin-top: 2rem;
  }
  /* .color{
    position: relative;
    border: 1px solid #eee;
  }
  .color::after{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10%;
    height: 100%;
    background-color: burlywood;
    opacity: .1;
    z-index: 10;
  } */
</style>