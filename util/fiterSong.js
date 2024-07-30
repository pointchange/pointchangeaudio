import { songTypeArray } from "./songType.js";
const LRC = 'lrc';
function filterNotSongType(dirAndFileArray) {
    return new Promise((resolve, reject) => {
        let songPathArr = dirAndFileArray.filter(item => songTypeArray.some(type => new RegExp(`.${type}$`, 'gi').test(item)));
        let lrcArr = dirAndFileArray.filter(item => new RegExp(`.${LRC}$`, 'gi').test(item));
        if (songPathArr.length === 0) {
            reject(`@此文件夹没有匹配音频文件或者应用有不支持音频。支持的文件列表有：${songTypeArray}`)
        } else {
            resolve({ songPathArr, lrcArr });
        }
    });
}
// module.exports = { filterNotSongType };
export { filterNotSongType }