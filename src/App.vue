<script setup>
import {
  Minus,
  Close,
  Refresh,
  Bottom
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import { RouterView } from 'vue-router';
import { useSongList } from '@/store/musicList';
import AudioControl from './components/AudioControl.vue';;
import { usePosition } from './store/position';
import { useTheme } from './store/theme';
const storePos = usePosition();
const store = useSongList();
const storeTheme = useTheme();
const resizeObserver = new ResizeObserver(entries => {
  const { clientHeight } = entries[0].target;
  storePos.clientHeight = clientHeight;
})
onBeforeMount(() => {
  let x = storePos.position[0];
  let y = storePos.position[1];
  electron.getPositionXY(x, y);
  let w = storePos.size[0];
  let h = storePos.size[1];
  electron.onGetWinSize(w, h);
})
onMounted(() => {
  electron.onSetWinSize((e, size) => {
    storePos.size = size;
  })
  electron.onSendPositionXY((e, position) => {
    storePos.position = position;
  });
  storeTheme.init();
  resizeObserver.observe(document.body);
  electron.onSaveCurrentAudio((e, bool) => {
    if (!bool) return;
    const {
      currentSong,
      duration,
      currentTime,
      c,
      d,
      path,
      pic,
      title,
      artist
    } = store.audioInfo;
    store.save = {
      currentSong,
      duration,
      currentTime,
      c,
      d,
      // progressPresent:store.audioInfo.progressPresent,
      // title:store.audioInfo.title,
      path,
      pic,
      title,
      artist
    }
  });

  store.audioInfo.pic = store.save.pic;
  store.audioInfo.title = store.save.title;
  store.audioInfo.artist = store.save.artist;

  if (store.songs.length !== 0) return;
  ElMessage({
    message: "点击右下角 '+' 按钮添加文件夹'",
    type: 'warning',
    plain: true,
    icon: Bottom
  });

});
onUnmounted(() => {
  resizeObserver.unobserve(document.body);
})

function clickHandler() {
  let arr = store.songs.map(item => item.path);
  if (!store.audioInfo.path) return;
  let audioCurrentObj = {
    progressPresent: store.audioInfo.progressPresent,
    path: store.audioInfo.path,
  }
  electron.createWin(arr, audioCurrentObj);
  store.audio.pause();
  electron.onVisualCloseInfo((e, currentSongInfo) => {
    store.playCurrentMusic(currentSongInfo.path);
    store.audio.addEventListener('durationchange', function durationchangeHandler(e) {
      e.target.currentTime = e.target.duration * currentSongInfo.progressPresent;
      this.addEventListener('canplay', function canplayHandler() {
        if (!currentSongInfo.isPlay) {
          store.pause();
        }
        this.removeEventListener('canplay', canplayHandler);
      })
      this.removeEventListener('durationchange', durationchangeHandler);
    })
  })
}
function closeApp() {
  electron.closeWin();
}
let isFullScreen = ref(false);
function fullScreen() {
  isFullScreen.value = !isFullScreen.value;
  isFullScreen.value ? electron.fullScreenWin(isFullScreen.value) : electron.fullScreenWin(isFullScreen.value);
}

function minimizableHandler() {
  electron.minimizableWin(true);
}
</script>
<template>
  <el-container>
    <el-header>
      <el-page-header class="header" title="PCA">
        <template #icon>
          <div class="img-container" @click="clickHandler">
            <img class="img" src="./assets/favicon-16x16.png" alt="">
          </div>
        </template>
        <template #content>
          <span class="text-mini"> {{ store.audioInfo.currentSong }} </span>
        </template>
        <template #extra>
          <div class="header-right">
            <el-button type="" text="" :icon="Minus" @click="minimizableHandler"></el-button>
            <el-button type="" text="" @click="fullScreen">
              <template #icon>
                <i class="fullScreen-not-full" v-show="!isFullScreen"></i>
                <i class="fullScreen-full" v-show="isFullScreen"></i>
              </template>
            </el-button>
            <el-button type="" text="" color="#F56C6C" :icon="Close" plain @click="closeApp"></el-button>
          </div>
        </template>
      </el-page-header>
    </el-header>
    <el-container>
      <el-aside>
        <el-menu :default-active="$route.path" router class="el-menu-vertical-demo" :collapse="true">
          <el-menu-item index="/musicList">
            <el-icon>
              <document />
            </el-icon>
            <template #title>音乐列表</template>
          </el-menu-item>
          <el-menu-item index="/transformAudio">
            <el-icon>
              <Refresh />
            </el-icon>
            <template #title>音频转换</template>
          </el-menu-item>
          <el-menu-item index="/playing">
            <el-icon>
              <Histogram />
            </el-icon>
            <template #title>正在播放</template>
          </el-menu-item>
          <el-menu-item index="/setting">
            <el-icon>
              <setting />
            </el-icon>
            <template #title>设置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main :style="{ height: (storePos.clientHeight - 160) + 'px' }">
        <RouterView v-slot="{ Component }">
          <KeepAlive include="MusicList">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
        <!-- <RouterView/> -->
      </el-main>
    </el-container>
  </el-container>
  <AudioControl />

</template>
<style>
.lrc{
  letter-spacing: .1rem;
}
.img-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.img-container::after {
  content: '';
  position: absolute;
  top: 3px;
  left: -1px;
  border: 1px solid var(--el-color-primary-light-6);
  width: 16px;
  height: 16px;
  z-index: 100;
  border-radius: 50%;
  transform-origin: center;
  animation: imgAnimation 2s infinite;
}

.img-container img {
  width: 100%;
  height: 100%;
}

.text-mini {
  font-size: var(--el-font-size-extra-small)
}

.fullScreen-not-full {
  background: url(./assets/border.png) center no-repeat;
  width: 100%;
  height: 100%;
}

.fullScreen-full {
  background: url(./assets/Batchfolding.png) center no-repeat;
  width: 100%;
  height: 100%;
}

.header-right {
  display: flex;
  flex-wrap: nowrap;
}

.el-aside {
  width: 64px;
}

.el-main {
  padding-top: 0;
  padding-bottom: 0;
}

.header {
  -webkit-app-region: drag;
}

.el-page-header__left,
.el-page-header__extra {
  -webkit-app-region: no-drag;
}
</style>