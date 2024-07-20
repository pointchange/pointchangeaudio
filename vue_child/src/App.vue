<script setup>
  import { computed, onBeforeMount, onMounted, ref } from 'vue';
  const canvasRef=ref(null);
  let songs=ref([]);
  let audioInfo=ref({});
  let src=computed(()=>audioInfo.value.hasOwnProperty('path')?'local-audio://'+audioInfo.value.path:'');
  const audioRef=ref(null);
  const currentTime=ref('');
  let currentSongInfo=ref({});
  function play(){
    audioRef.value.play();
    electron.changeTrayIcon(true);
  }
  function pause(){
    audioRef.value.pause();
    electron.changeTrayIcon(false);
  }
  onBeforeMount(()=>{
    electron.initOpen(JSON.parse(window.localStorage.getItem('position')));
  })
  onMounted(()=>{
    electron.onMsg((e,arr,obj)=>{
      songs.value=arr;
      audioInfo.value=obj;
    });

    electron.onIsPlay((e,bool)=>{
      if (bool) {
        play()
      } else {
        pause()
      }
    });
    
    const audioCtx=new AudioContext();
    const track=audioCtx.createMediaElementSource(audioRef.value);
    const analyser=audioCtx.createAnalyser();
    track.connect(analyser);
    track.connect(audioCtx.destination);
    analyser.fftSize=512;
    let dataArray= new Uint8Array(analyser.frequencyBinCount);
    const canvasCtx=canvasRef.value.getContext("2d");
    const WIDTH = canvasRef.value.width;
    const HEIGHT =canvasRef.value.height;
    const moveX = 150;
    const moveY = 75;
  
    function draw(){
      requestAnimationFrame(draw); 
      analyser.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      let barWidth = Math.round((WIDTH / dataArray.length) * 3);
      let barHeight;
      let x = 0;

      function circleAnimation({
        shadowX,
        shadowColor,
        strokeStyle,
        r1,
        lineToX,
        r2,
      },isTransparent=false){
        canvasCtx.save();
        canvasCtx.shadowColor = shadowColor;
        canvasCtx.shadowOffsetX = shadowX;
        if(!isTransparent){
          canvasCtx.strokeStyle=strokeStyle
        }
        canvasCtx.translate(moveX, moveY);
        canvasCtx.rotate(r1);
        for (let i = 0; i < dataArray.length; i++){
          if(isTransparent){
            canvasCtx.strokeStyle='transparent';
          }
          canvasCtx.lineWidth =1;
          barHeight = dataArray[i]/20;
          if(dataArray[i]/2>HEIGHT/2){
            if(isTransparent){
              canvasCtx.strokeStyle='rgba(255,255,255,.1)';
            }
            canvasCtx.lineWidth = barHeight;
          }
          canvasCtx.beginPath();
          canvasCtx.lineTo(lineToX, 0);
          canvasCtx.stroke();
          canvasCtx.rotate(r2/ dataArray.length);
        }
        canvasCtx.restore();
      }

      canvasCtx.lineCap = "round";

      canvasCtx.shadowOffsetX = 4;
      canvasCtx.shadowOffsetY = 0;
      canvasCtx.shadowBlur = 12;
      canvasCtx.shadowColor = "#fff";
      
      canvasCtx.strokeStyle='#fefefe';
      canvasCtx.lineWidth=2;
      canvasCtx.beginPath();
      canvasCtx.arc(moveX+4, 75, 40,Math.PI*(3/2+1/12), Math.PI*(1/2-1/12), false);
      canvasCtx.stroke();

      circleAnimation({
        shadowX:4,
        shadowColor:"rgba(249,232,51,.5)",
        strokeStyle:"rgba(255,255,255,.1)",
        r1:Math.PI*(1/2+1/12),
        lineToX:40+2,
        r2:Math.PI*(1/2+4/12),
      })

      canvasCtx.shadowOffsetX = -4;
      canvasCtx.beginPath();
      canvasCtx.arc(moveX-4, 75, 40, Math.PI*(1/2+1/12), Math.PI*(3/2-1/12), false);
      canvasCtx.stroke();
      circleAnimation({
        shadowX:-4,
        shadowColor:"rgba(249,232,51,.5)",
        strokeStyle:"rgba(255,255,255,.1)",
        r1:Math.PI*(3/2+1/12),
        lineToX:40+2,
        r2:Math.PI*(1/2+4/12)
      })

      canvasCtx.shadowOffsetX = 10;
      canvasCtx.lineWidth=10;
      canvasCtx.strokeStyle='rgba(255,255,255,.1)'
      canvasCtx.beginPath();
      canvasCtx.arc(moveX+4, 75, 60,Math.PI*(3/2+1/12), Math.PI*(1/2-1/12), false);
      canvasCtx.stroke();

      circleAnimation({
        shadowX:10,
        shadowColor:"rgba(249,232,51,.5)",
        strokeStyle:"rgba(255,255,255,.1)",
        r1:Math.PI*(3/2+1/12),
        lineToX:60+10/2,
        r2:Math.PI*(1/2+4/12),
      },true)

      canvasCtx.shadowOffsetX = -10;
      canvasCtx.beginPath();
      canvasCtx.arc(moveX-4, 75, 60, Math.PI*(1/2+1/12), Math.PI*(3/2-1/12), false);
      canvasCtx.stroke();

      circleAnimation({
        shadowX:-10,
        shadowColor:"rgba(249,232,51,.5)",
        strokeStyle:"rgba(255,255,255,.1)",
        r1:-Math.PI*(3/2-1/12),
        lineToX:60+10/2,
        r2:Math.PI*(1/2+4/12),
      },true)

      canvasCtx.shadowOffsetX = 0;
      canvasCtx.shadowOffsetY = 0;
      canvasCtx.shadowBlur = 0;
      canvasCtx.shadowColor = "transparent";
      function rectAnimation(fillStyle,isM=false){
        x=0;
        canvasCtx.save();
        if(isM){
          canvasCtx.translate(0, moveY*2);
          canvasCtx.scale(1,-1)
        }
        for (let i = 0; i < dataArray.length; i++) {
          canvasCtx.fillStyle =fillStyle;
          barHeight = dataArray[i]/10;
          canvasCtx.fillRect(x, (HEIGHT - barHeight)/2-barHeight/2, barWidth, barHeight);
          x += barWidth + 1;
        }
        canvasCtx.restore();
      }
      rectAnimation('rgba(255,255,255,.1)',true);
      rectAnimation('rgba(255,255,255,.6)');

      canvasCtx.lineWidth=1;
      canvasCtx.strokeStyle='rgba(255,255,255,.8)'
      canvasCtx.strokeText(currentTime.value,moveX-10, moveY+26);
    }
    draw();

    electron.sendPosition((e,position)=>{
      window.localStorage.setItem('position',JSON.stringify(position))
    });

  });

  let isRemoveDurationchange=ref(true);
  function getName(path){
    return path.replace(/[\s\S.]+\\/, '').replace(/\.\w+/, '');
  }
  let index=ref(-1);
  function loadeddataHandler(e){
    isRemoveDurationchange.value=false;
    durationchangeHandler=null;
    if(index.value===-1){
      index.value= songs.value.findIndex(item=>item===audioInfo.value.path);
    }
    currentSongInfo.value.title=getName(songs.value[index.value]);

    e.target.volume = 0;
    let i = 0;
    play();
    let id = setInterval(() => {
      if (i === 100) {
        clearInterval(id);
        id = null;
        return;
      }
      i++;
        e.target.volume =i/100;
    }, 20);


  }
  function durationchangeHandler(e){
    e.target.currentTime= e.target.duration* audioInfo.value.progressPresent/100;
  }
  function endedHandler(e){
    index.value++;
    if(index.value>=songs.value.length-1){
      index.value=0;
      e.target.src='local-audio://'+songs.value[index.value];
    }else{
      e.target.src='local-audio://'+songs.value[index.value];
    }
  }
  function countTime(time) {
      let min = parseInt(time / 60);
      if (min < 10) {
          min = '0' + min;
      }
      let second = Math.round(time % 60);
      if (second < 10) {
          second = '0' + second;
      }
      return `${min}:${second}`;
  }
  function timeupdateHandler(e){
    currentTime.value=countTime(e.target.currentTime);
  }
  const isPlay=ref(true);
  function playAndPause(){
    isPlay.value=!isPlay.value;
    if(isPlay.value){
      play();
    }else{
      pause();
    }
  }
  function close(){
    electron.visualClose({
      path:songs.value[index.value],
      progressPresent:audioRef.value.currentTime/audioRef.value.duration,
      isPlay:isPlay.value
    });
  }
</script>

<template>
  <div class="canvas-container" @dblclick="playAndPause">
    <canvas ref="canvasRef"></canvas>
    <div>{{ currentSongInfo.title }}</div>
    <span @click="close">X</span>
  </div>
  <audio ref="audioRef" :src="src" 
  @loadeddata="loadeddataHandler"
  @timeupdate="timeupdateHandler"
  @durationchange="e=>isRemoveDurationchange&&durationchangeHandler(e)"
  @ended="endedHandler"></audio>
</template>

<style scoped> 
  .canvas-container{
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center; 
    user-select: none;
  }
  canvas{
    -webkit-app-region: no-drag;
  }

  .canvas-container:hover span{
    display:flex;
  }
  .canvas-container div{
    display: inline-flex;
    justify-content: center;
    color: rgba(255, 255, 255, .8);
    cursor: move;
    user-select: none;
  }
  .canvas-container span{
    position: absolute;
    display: none;
    right: 6%;
    padding: 4px 8px;
    border-radius: 4px;
    color:#fff;
    cursor: default;
  }
  .canvas-container span:hover{
    background-color: red;
    cursor: default;
  }
</style>