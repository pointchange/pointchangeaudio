import { stat } from 'node:fs/promises';
import { parseFile } from 'music-metadata';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import { createReadStream } from 'node:fs';

// const { stat } = require('node:fs/promises');
// const parseFile = require('music-metadata').default;
// import { parseFile } from 'music-metadata';

// const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
// const ffmpeg = require('fluent-ffmpeg');
// const ffprobePath = require('@ffprobe-installer/ffprobe');
// ffmpeg.setFfmpegPath(ffmpegPath.path);
// ffmpeg.setFfprobePath(ffprobePath.path);
// ffmpeg.setFfmpegPath(ffmpegPath.path.replace('app.asar', 'app.asar.unpacked'));
// ffmpeg.setFfprobePath(ffprobePath.path.replace('app.asar', 'app.asar.unpacked'));

ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobePath.replace('app.asar', 'app.asar.unpacked'));
//失败统一false
function hasOwnPropertyDouble(obj, property1, property2) {
    if (!obj.hasOwnProperty(property1)) return false;
    if (!property2) return obj[property1];
    if (!obj[property1].hasOwnProperty(property2)) return false;
    return obj[property1][property2];
}
function isNaNMetadata(value) {
    if (value === 'N/A') {
        return false
    } else {
        return value
    }
}
//audioPathArray 路径数组
async function getMusicInfo(songPathAndLrcObj, isAccurate = false) {
    let audioPathArray = songPathAndLrcObj.songPathArr || [];
    let lrcArray = songPathAndLrcObj.lrcArr || [];
    let songList = [];
    if (isAccurate) {
        for (let index = 0; index < audioPathArray.length; index++) {
            const path = audioPathArray[index];
            const metadata = await new Promise((resolve, reject) => {
                const rs = createReadStream(path);
                ffmpeg(rs).ffprobe(function (err, metadata) {
                    resolve(metadata)
                    rs.close();
                });
            });
            // console.log(metadata);
            songList.push({
                duration: isNaNMetadata(metadata.format.duration),
                container: isNaNMetadata(metadata.format.format_long_name),
                sampleRate: isNaNMetadata(metadata.streams[0].sample_rate),
                title: isNaNMetadata(metadata.format.title),
                artist: isNaNMetadata(metadata.format.artist),
                album: isNaNMetadata(metadata.format.album),
                bitrate: isNaNMetadata(metadata.format.bit_rate),

            });
        }
    } else {
        for (let index = 0; index < audioPathArray.length; index++) {
            const path = audioPathArray[index];
            const metadata = await parseFile(path);
            const info = await stat(path);
            songList.push({
                path,
                songSize: info.size,
                duration: hasOwnPropertyDouble(metadata, 'format', 'duration'),
                lossless: hasOwnPropertyDouble(metadata, 'format', 'lossless'),
                container: hasOwnPropertyDouble(metadata, 'format', 'container'),
                //number采样率，单位为每秒采样数（S/s）
                sampleRate: hasOwnPropertyDouble(metadata, 'format', 'sampleRate'),
                title: hasOwnPropertyDouble(metadata, 'common', 'title'),
                artist: hasOwnPropertyDouble(metadata, 'common', 'artist'),
                picture: hasOwnPropertyDouble(metadata, 'common', 'picture') ? true : false,
                album: hasOwnPropertyDouble(metadata, 'common', 'album'),
                //每秒编码音频文件的比特数
                bitrate: hasOwnPropertyDouble(metadata, 'format', 'bitrate'),
                lrc: false,

                // path,
                // songSize: info.size,
                // duration: metadata.format.duration,
                // lossless: metadata.format.lossless,
                // container: metadata.format.container,
                // //number采样率，单位为每秒采样数（S/s）
                // sampleRate: metadata.format.sampleRate,
                // title: metadata.common.title,
                // artist: metadata.common.artist,
                // picture: metadata.common.picture ? true : false,
                // album: metadata.common.album,
                // //每秒编码音频文件的比特数
                // bitrate: metadata.format.bitrate,
            })
        }
    }

    for (let index = 0; index < lrcArray.length; index++) {
        const lrc = lrcArray[index];
        for (let index = 0; index < songList.length; index++) {
            const songArr = (songList[index].path.replace(/[\s\S.]+\\/, '').replace(/\.\w+/g, '')).split('-');
            const lrcArr = (lrc.replace(/[\s\S.]+\\/, '').replace(/\.\w+/g, '')).split('-');
            if (songArr[0].trim() === lrcArr[0].trim() && songArr[1].trim() === lrcArr[1].trim()) {
                songList[index] = { ...songList[index], ...{ lrc } }
            }
        }
    }
    return songList;
}

export { getMusicInfo };
// module.exports = {
//     getMusicInfo
// }
