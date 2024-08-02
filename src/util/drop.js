import { ElMessage } from 'element-plus'
import { ref } from 'vue';
import { filterNotSongType } from '../../util/fiterSong';
import { filterImage } from './filterImage';
// const songTypeArray = ['AIFF', 'AIFF-C', 'AAC', 'APE', 'ASF', 'BWF', 'DSDIFF', 'DSF', 'FLAC', 'MP2', 'Matroska', 'MP3', 'MPC', 'MPEG 4', 'Ogg', 'Opus', 'Speex', 'Theora', 'Vorbis', 'WAV', 'WebM', 'WV', 'WMA', 'm4a', 'm4b'];
// function filterNotSongType(dirAndFileArray) {
//     return new Promise((resolve, reject) => {
//         let arr = dirAndFileArray.filter(item => songTypeArray.some(type => new RegExp('.' + type, 'gi').test(item)));
//         if (arr.length === 0) {
//             reject(`@此文件夹没有匹配音频文件或者应用有不支持音频。支持的文件列表有：${songTypeArray}`)
//         } else {
//             resolve(arr);
//         }
//     });
// }
let isBGActive = ref(false);
export function useDrop(store, str = 'audio') {
    const dropHandler = async e => {
        isBGActive.value = false;
        if (str === 'audio') {
            const edi = e.dataTransfer.items;
            if (!edi) return;
            let filePathList = [...edi].map(item => {
                if (item.getAsFile() !== null) {
                    return item.getAsFile().path
                } else {
                    return null;
                }
            });
            if (!filePathList) return;
            filePathList = await filterNotSongType(filePathList).catch(error => {
                ElMessage.error(String(error).split('@')[1])
            });
            if (!filePathList) return;
            const reslut = await electron.dragEnterSong(filePathList);
            store.addSongs(reslut);
        } else {
            let imgPathList = '';
            for (const f of e.dataTransfer.files) {
                imgPathList = f.path;
            }
            const res = await filterImage(imgPathList).catch(error => {
                ElMessage.error(String(error).split('@')[1])
            });
            if (res) {
                store.imagePath = res;
            }

        }
    }
    let ele = null;
    const dragenterHandler = (e) => {
        ele = e.target;
        isBGActive.value = true;
    }
    const dragleaveHandler = (e) => {
        if (ele !== e.target) return;
        isBGActive.value = false;
        ele = null;
    }
    return {
        dropHandler,
        dragenterHandler,
        dragleaveHandler,
        isBGActive
    }
}
