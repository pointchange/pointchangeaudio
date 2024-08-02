<script setup>
import { useTheme } from '@/store/theme';

    const store=useTheme();
    const props=defineProps(['option']);

    let fontList=[];
    switch (props.option) {
        case 'fontFamily':
            fontList=['Helvetica Neue','Helvetica','PingFang SC','Hiragino Sans GB','Microsoft YaHei'];
            break;
        case 'fontSize':
            fontList=['extra-small','small','base','medium','large','extra-large',];
            break;
        case 'fontWeight':
            fontList=[100,200,300,400,500,600,700,800,900];
            break;
        case 'letterSpacing':
            let initValue=-1;
            for (let i = 0; i < 16; i++) {
                if(initValue.toFixed(1)==0){
                    fontList.push('normal');
                }else{
                    fontList.push(initValue.toFixed(1));
                }
                initValue=initValue+0.2;
            }
            break;
        default:
            break;
    }
</script>
<template>
    <el-segmented  :size="option==='letterSpacing'?'small':'default'" v-model="store[option]" :options="fontList" @change="v=>store.changeFont(v,option)" />
</template>
<style scoped>
    
</style>