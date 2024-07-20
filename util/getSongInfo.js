// import { stat } from 'node:fs/promises';
// import { parseFile } from 'music-metadata';
// import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
// import ffmpeg from 'fluent-ffmpeg';
// import { path as ffprobePath } from '@ffprobe-installer/ffprobe';

const { stat } = require('node:fs/promises');
// const parseFile = require('music-metadata').default;
// import { parseFile } from 'music-metadata';

const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('@ffprobe-installer/ffprobe');
// ffmpeg.setFfmpegPath(ffmpegPath.path);
// ffmpeg.setFfprobePath(ffprobePath.path);
ffmpeg.setFfmpegPath(ffmpegPath.path.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobePath.path.replace('app.asar', 'app.asar.unpacked'));
//失败统一false
function hasOwnPropertyDouble(obj, property1, property2) {
    if (!obj.hasOwnProperty(property1)) return false;
    if (!property2) return obj[property1];
    if (!obj[property1].hasOwnProperty(property2)) return false;
    return obj[property1][property2];
}
//audioArray 可用的数据数组
//filePath: 文件夹绝对路径
async function getMusicInfo(audioArray) {
    let songList = [];
    for (let index = 0; index < audioArray.length; index++) {
        const path = audioArray[index];
        // console.log(filePath, song);
        // const metadata = await new Promise((resolve, reject) => {
        //     const rs = createReadStream(path);
        //     ffmpeg(rs).ffprobe(function (err, metadata) {
        //         resolve(metadata)
        //         rs.close();
        //     });
        // });
        // let title = ''
        // let artist = ''
        // let album = ''
        // if (metadata.format.hasOwnProperty('tags')) {
        //     title = metadata.format.tags.title;
        //     artist = metadata.format.tags.artist;
        //     album = metadata.format.tags.album;

        // } else if (metadata.streams[0].hasOwnProperty('tags')) {
        //     title = metadata.streams[0].tags.title;
        //     artist = metadata.streams[0].tags.artist;
        //     album = metadata.streams[0].tags.album;
        // }
        // songList.push({
        //     song,
        //     songSize: metadata.format.size,
        //     duration: metadata.format.duration,
        //     container: metadata.format.format_name,
        //     sampleRate: metadata.streams[0].sample_rate,
        //     bitrate: metadata.format.bitrate,
        //     title,
        //     artist,
        //     album,
        // })
        const { parseFile } = await import('music-metadata');
        const metadata = await parseFile(path);
        const info = await stat(path);

        let duration = '';
        if (/.aac/i.test(path)) {
            const res = await new Promise((resolve, reject) => {
                ffmpeg(path).ffprobe(function (err, metadata) {
                    resolve(metadata)
                });
            });
            duration = res.format.duration
        } else {
            duration = hasOwnPropertyDouble(metadata, 'format', 'duration')
        }

        songList.push({
            path,
            songSize: info.size,
            duration,
            lossless: hasOwnPropertyDouble(metadata, 'format', 'lossless'),
            container: hasOwnPropertyDouble(metadata, 'format', 'container'),
            //number采样率，单位为每秒采样数（S/s）
            sampleRate: hasOwnPropertyDouble(metadata, 'format', 'sampleRate'),
            title: hasOwnPropertyDouble(metadata, 'common', 'title'),
            artist: hasOwnPropertyDouble(metadata, 'common', 'artist'),
            picture: hasOwnPropertyDouble(metadata, 'common', 'picture'),
            album: hasOwnPropertyDouble(metadata, 'common', 'album'),
            //每秒编码音频文件的比特数
            bitrate: hasOwnPropertyDouble(metadata, 'format', 'bitrate'),
        })
    }
    //文件路径 文件名
    return songList;
}
// export { getMusicInfo };
module.exports = {
    getMusicInfo
}

// export async function getAudioInfo(path){
//     const metadata = await parseFile(path);
//     const info = await stat(path);
//     return {
//         song:,
//             songSize: info.size,
//             duration: hasOwnPropertyDouble(metadata, 'format', 'duration'),
//             lossless: hasOwnPropertyDouble(metadata, 'format', 'lossless'),
//             container: hasOwnPropertyDouble(metadata, 'format', 'container'),
//             //number采样率，单位为每秒采样数（S/s）
//             sampleRate: hasOwnPropertyDouble(metadata, 'format', 'sampleRate'),
//             title: hasOwnPropertyDouble(metadata, 'common', 'title'),
//             artist: hasOwnPropertyDouble(metadata, 'common', 'artist'),
//             picture: hasOwnPropertyDouble(metadata, 'common', 'picture'),
//             album: hasOwnPropertyDouble(metadata, 'common', 'album'),
//             //每秒编码音频文件的比特数
//             bitrate: hasOwnPropertyDouble(metadata, 'format', 'bitrate'),
//     }
// }