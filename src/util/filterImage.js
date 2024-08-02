import { imageList } from "./imageType";
export function filterImage(imgPath) {
    return new Promise((resolve, reject) => {
        let bool = imageList.some(type => new RegExp(type, 'gi').test(imgPath));
        if (!bool) {
            reject(`@此文件夹没有匹配图片文件或者应用有不支持图片。支持的文件列表有：${imageList}`)
        } else {
            resolve(imgPath);
        }
    });
}