<script setup>
import {
    Plus
} from '@element-plus/icons-vue';
import { ElMessage, ElLoading,ElMessageBox} from 'element-plus'
// import {} from "element-plus";
import { onMounted, ref, shallowRef,onUnmounted } from 'vue';
import { useFormat } from '@/store/format';
import { useSongList } from '@/store/musicList';
import { usePosition } from '@/store/position';
    const storePos=usePosition();
    const storeSong=useSongList();
    const store=useFormat();
    const props=defineProps(['list','title','format','diffHandler']);
    function handleDelete(row){
        store.addedList=store.addedList.filter(item=>item.name!==row.name);
        if(!props.diffHandler)return;
        ElMessageBox.confirm(
            `是否要删除本地文件：${row.path}`,
            '删除本地文件',
            {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            electron.deleteTransformDoneData(row.path);
            store.doneList=store.doneList.filter(item=>item.name!==row.name);
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
        }).catch(() => {
            ElMessage({
                type: 'info',
                message: '取消删除',
            })
        })
    }
    const selectTotal=shallowRef(0);
    const selectedList=ref([]);
    const selectedDoneTotal=shallowRef(0);
    const selectedDoneList=ref([]);
    function handleSelectionChange(row,index){
        selectTotal.value=row.length;
        selectedList.value=row;
        if(!props.diffHandler)return;
        selectedDoneTotal.value=row.length;
        selectedDoneList.value=row;
    }
    async function addDirectory(){
        const res=await electron.openDirectoryFromTransform().catch(error=>{
            ElMessage.error(String(error).split('@')[1])
        });
        if(!res)return;
        store.addedList.unshift(...res);
    }
    async function startTransform(){
        if(!props.format){
            ElMessage({
                message: '请选择格式',
                type: 'warning',
            })
            return;
        }
        let len=selectedList.value.length;
        let progressValue=0;
        let count=1;
        let loading = ElLoading.service({target: '.card-container', text:  `${count}/${len} ${progressValue}%`});
        electron.onUpdateProgress((e,percent)=>{
            if(percent>99){
                count += 1;
            }
            loading.setText(`${count}/${len} ${percent.toFixed()}%`);
        })
        for (let i = 0; i < len; i++) {
            const item = selectedList.value[i];
            const res=await electron.transformFormat(item.path,item.name,props.format).catch(error=>{
                ElMessage({
                    message: `格式错误：${String(error)}`,
                    type: 'warning',
                })
                loading.close();
                return;
            });
            if(!res)return;
            store.doneList.push({...res,path:res.newPath});
        }
        loading.close()
    }
    async function addToAudioList(){
        const pathList= store.doneList.map(item=>item.path);
        const res=await electron.getAudioInfo(pathList);
        storeSong.addSongs(res);
        store.doneList.length=0;
    }
    const resizeObserver = new ResizeObserver(entries => {
        const {offsetTop}=entries[0].target;
        storePos.offsetTop=offsetTop+40+15;
    })
    let element=null;
    onMounted(()=>{
        element=document.querySelectorAll('.transform-el-table')[0];
        resizeObserver.observe(element);
    });
    onUnmounted(()=>{
        resizeObserver.unobserve(element);
    })

</script>
<template>
    <el-card class="card-container">
        <template #header>
            <div class="card-header">
                <el-button :disabled="selectedList.length?false:true" type="success" plain @click="startTransform" v-if="title==='开始转换'">{{title}} {{selectTotal}}</el-button>
                <el-button type="success" plain @click="addToAudioList" v-else>{{title}} {{selectedDoneTotal}}</el-button>
            </div>
        </template>
        <el-table
            class="transform-el-table"
            :data="list"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            :max-height="storePos.clientHeight-storePos.offsetTop-160-20"
        >
            <el-table-column type="selection"/>
            <el-table-column label="全选" property="name"/>
            <el-table-column align="right">
                <template #header>
                    <!-- <el-statistic title="" :value="562">
                        <template #prefix>
                        <el-icon style="vertical-align: -0.125em">
                            <PieChart />
                        </el-icon>
                        </template>
                    </el-statistic> -->
                    <el-space spacer="|">
                        <el-tag size="small">已选：{{ diffHandler?selectedDoneTotal:selectTotal}}</el-tag>
                        <el-tag size="small">共：{{list.length}}</el-tag>
                    </el-space>
                    
                </template>
                <template #default="scope">
                    <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(scope.row)"
                    >
                    Delete
                    </el-button>
                </template>
            </el-table-column>
            <template #empty v-if="title==='开始转换'">
                <el-tooltip
                effect="dark"
                content="添加文件夹"
                >
                    <el-button type="success" plain :icon="Plus" @click="addDirectory"></el-button>
                </el-tooltip>
            </template>
        </el-table>
    </el-card>
</template>
<style >
    .small{
        margin-top: .2rem;
        font-size: var(--el-font-size-extra-small)
    }
    .card-header{
        display: flex;
        justify-content: center;
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
    } 
</style>