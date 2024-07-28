import { songTypeArray } from "./songType.js";
function filterNotSongType(dirAndFileArray) {
    return new Promise((resolve, reject) => {
        let arr = dirAndFileArray.filter(item => songTypeArray.some(type => new RegExp(`.${type}$`, 'gi').test(item)));
        if (arr.length === 0) {
            reject(`@此文件夹没有匹配音频文件或者应用有不支持音频。支持的文件列表有：${songTypeArray}`)
        } else {
            resolve(arr);
        }
    });
}
// module.exports = { filterNotSongType };
export { filterNotSongType }