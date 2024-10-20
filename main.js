import { BrowserWindow, app, protocol, ipcMain, dialog, Menu, Tray, shell } from 'electron'
// import bool from 'electron-squirrel-startup';
import path, { basename, join } from 'node:path';
import { createReadStream } from 'original-fs';
import { stat, readdir, unlink } from 'node:fs/promises';

import { fileURLToPath } from 'node:url'

import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';
import { parseFile } from 'music-metadata';
import { filterNotSongType } from './util/fiterSong.js';
import { getMusicInfo } from './util/getSongInfo.js';


// if (bool) app.quit();

// const { BrowserWindow, app, protocol, ipcMain, dialog, Menu, Tray, shell } = require('electron')
// const { basename, join } = require('node:path');
// const { createReadStream } = require('original-fs');
// const { stat, readdir, unlink } = require('node:fs/promises');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
// const ffmpeg = require('fluent-ffmpeg');
// const ffprobePath = require('@ffprobe-installer/ffprobe');
// const { filterNotSongType } = require('./util/fiterSong.js');
// const { getMusicInfo } = require('./util/getSongInfo.js');

// ffmpeg.setFfmpegPath(ffmpegPath.path);
// ffmpeg.setFfprobePath(ffprobePath.path);
// ffmpeg.setFfmpegPath(ffmpegPath.path.replace('app.asar', 'app.asar.unpacked'));
// ffmpeg.setFfprobePath(ffprobePath.path.replace('app.asar', 'app.asar.unpacked'));

const __filenameNew = fileURLToPath(import.meta.url);

const __dirnameNew = path.dirname(__filenameNew);
const iconsPath = {
    pause: join(__dirnameNew, './images/pause.png'),
    play: join(__dirnameNew, './images/play.png'),
    winIcon: join(__dirnameNew, './images/favicon-16x16.png'),
    relaunchIcon: join(__dirnameNew, './images/favicon.ico'),
};

ffmpeg.setFfmpegPath(ffmpegPath.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobePath.replace('app.asar', 'app.asar.unpacked'));
// const iconsPath = {
//     pause: join(__dirname, './images/pause.png'),
//     play: join(__dirname, './images/play.png'),
//     winIcon: join(__dirname, './images/favicon-16x16.png'),
//     relaunchIcon: join(__dirname, './images/favicon.ico'),
// };

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'local-audio',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            stream: true,
            bypassCSP: true,
        }
    },
    {
        scheme: 'local-img',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            stream: true,
            bypassCSP: true,
        }
    },
    {
        scheme: 'local-lrc',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            stream: true,
            bypassCSP: true,
        }
    }
])

Menu.setApplicationMenu(null);
let isVisual = false;
const preAndNext = {
    pre: '上一首',
    next: '下一首',
}
const menuList = [
    { id: '上一首', label: '上一首', type: 'normal', click: () => win.webContents.send('on-switch-song', 'pre'), enabled: !isVisual },
    { id: '下一首', label: '下一首', type: 'normal', click: () => win.webContents.send('on-switch-song', 'next'), enabled: !isVisual },
    { label: '退出', type: 'normal', click: () => app.quit() },
]
const contextMenu = Menu.buildFromTemplate(menuList);

function setMenuItemProp(contextMenu, MenuItem, props, bool) {
    const item = contextMenu.getMenuItemById(MenuItem)
    item[props] = bool;
}

let win;
function createWindow() {
    win = new BrowserWindow({
        frame: false,
        width: 1200,
        height: 750,
        show: false,
        icon: join(__dirnameNew, './images/chrome-256x256.ico'),
        webPreferences: {
            nodeIntegration: true,
            // preload: join(__dirnameNew, './preload/index.mjs'),
            preload: join(__dirnameNew, './preload/index.mjs'),
        },
    });
    // win.loadURL('http://localhost:5173/');
    win.loadFile(join(__dirnameNew, './dist/index.html'));

    ipcMain.handle('on-get-win-size-wh', (e, w, h) => {
        win.setSize(w, h)
    })
    ipcMain.handle('on-get-position', (e, x, y) => {
        win.setPosition(x, y)
    })
    win.on('ready-to-show', () => {
        win.setTitle('PCA');
        win.setIcon(iconsPath.relaunchIcon);
        // win.setAppDetails({ appIconPath: iconsPath.relaunchIcon });
        win.show();
    });
    win.on('close', e => {
        win.webContents.send('on-sava-current-audio', true)
    });
    win.on('resize', event => {
        //w 930 h 600
        let arr = win.getSize();
        if (arr[0] < 930 || arr[1] < 600) {
            win.setSize(930, 600)
            win.resizable = false;
        } else {
            win.resizable = true;
        }
    });
    win.on('resized', event => {
        let arr = win.getSize();
        win.resizable = true;
        win.webContents.send('on-set-win-size-wh', arr);
    });
    win.on('moved', () => {
        win.webContents.send('on-send-position-xy', win.getPosition());
    })
    // win.webContents.openDevTools();
}

ipcMain.handle('on-get-lrc-path', async (e, lrcPath) => {
    const res = await new Promise((resolve, reject) => {
        const rs = createReadStream(decodeURI(lrcPath), { encoding: 'utf-8' });
        rs.on('data', data => {
            resolve(data);
        });
        rs.on('error', error => {
            reject(error);
        })
    }).catch(e => {
        return [];
    })
    if (!res.length > 0) return res;
    // const str = res.replace(/\[[^]+\]\n/, '');
    // const str = '[00:00.00]' + res.split('[00:00.00]')[1];
    let strArr = res.split('\n') || [];
    let lrcArr = [];
    let lrcArr2 = [];
    strArr.forEach(str => {
        let time = 0;
        let time2 = 9;
        let text = '';
        let newStrArr = str.match(/\[\d{2}:\d{2}.\d{2}\]/g);
        if (newStrArr !== null && newStrArr.length > 1) {
            str.replace(/\[(\d{2}):(\d{2}).(\d{2})\]([^]+)/g, (str, $1, $2, $3, $4) => {
                time = newStrArr[0];
                time2 = newStrArr[1];
                text = $4;
            });
            lrcArr2.push({
                time: time2,
                text
            })
        } else {
            str.replace(/\[(\d{2}):(\d{2}).(\d{2})\]([^]+)/g, (str, $1, $2, $3, $4) => {
                time = parseInt($1, 10) * 60 + parseFloat(`${$2}.${$3}`);
                text = $4;
            });
        }
        lrcArr.push({
            time,
            text
        })
        lrcArr = [...lrcArr, ...lrcArr2];
    });
    lrcArr = lrcArr.filter(item => item.text !== '');
    return lrcArr;
})


async function getAudioFile(filePath) {
    const dirAndFileArray = await readdir(filePath);
    let getAudioFileArray = [];
    for (let j = 0; j < dirAndFileArray.length; j++) {
        const path = join(filePath, dirAndFileArray[j]);
        if (/System Volume Information/gi.test(path)) continue;
        const st = await stat(path);
        if (st.isDirectory()) {
            getAudioFileArray.push(...await getAudioFile(path))
        } else {
            getAudioFileArray.push(path)
        }
    }
    return getAudioFileArray;
}
async function getFiles() {
    win.focus();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: '选择文件夹',
        properties: ['openDirectory', 'multiSelections', 'showHiddenFiles']
    })
    if (canceled) return `取消添加`;
    // if (/[a-z]:\\$/i.test(filePaths[0])) return `不能查找根目录 ${filePaths[0]}`;
    if (/[a-z]:\\$/i.test(filePaths[0])) {
        // const res = await stat(filePaths[0]);
        const dirAndFileArray = await readdir(filePaths[0]);
        const res = [];
        for (let j = 0; j < dirAndFileArray.length; j++) {
            const path = join(filePaths[0], dirAndFileArray[j])
            if (/System Volume Information/gi.test(path)) continue;
            const st = await stat(path);
            if (!st.isDirectory()) {
                res.push(path);
            }
        }
        return res;
    } else {
        const getAudioFileArray = [];
        for (let index = 0; index < filePaths.length; index++) {
            const filePath = filePaths[index];
            let arr = await getAudioFile(filePath).catch(error => {
                return error;
            })
            if (Array.isArray(arr) && arr.length > 0) {
                getAudioFileArray.push(...arr);
            }
        }
        return getAudioFileArray
    }
}
ipcMain.handle('on-open-directory', async () => {
    const getAudioFileArray = await getFiles();
    if (!Array.isArray(getAudioFileArray)) return getAudioFileArray;
    let songPathAndLrcObj = await filterNotSongType(getAudioFileArray);
    return await getMusicInfo(songPathAndLrcObj)
})

ipcMain.handle('on-open-file-place', async (e, path) => {
    shell.showItemInFolder(path);
});
ipcMain.handle('on-drag-enter-song', async (e, pathObj) => {
    let songList = await getMusicInfo({ songPathArr: pathObj.songPathArr })
    return songList;
})
ipcMain.handle('on-transform-format', async (e, path, name, format) => {
    const postfix = name.split('.')[1];
    const pathNoPostfix = path.replace(postfix, '');
    const newPath = pathNoPostfix + format;
    await new Promise((resolve, reject) => {
        ffmpeg(path).on('end', function () {
            resolve()
        }).on('progress', async function (progress) {
            win.webContents.send('on-update-progress', progress.percent);
        }).on('error', e => {
            reject(e);
        }).save(newPath);
    });
    return { newPath, name: basename(newPath) };
})
ipcMain.handle('on-delet-done', async (e, path) => {
    return await unlink(path);
});
ipcMain.handle('on-transform-open-directory', async (e) => {
    const getAudioFileArray = await getFiles();
    const resultObj = await filterNotSongType(getAudioFileArray);
    let res = [];
    resultObj.songPathArr.forEach(item => {
        res.push({
            name: item.replace(/[\s\S.]+\\/, ''),
            path: item,
            isSelect: true,
            progress: 0,
        })
    });
    return res;
});
ipcMain.handle('on-get-audio-infor', async (e, pathList) => {
    return await getMusicInfo({ songPathArr: pathList })
});

let winChild;
ipcMain.handle('on-create-win', (e, arr, obj) => {
    win.hide();
    isVisual = true;
    Object.keys(preAndNext).forEach(item => {
        setMenuItemProp(contextMenu, preAndNext[item], 'visible', !isVisual)
    })
    winChild = new BrowserWindow({
        width: 350,
        height: 250,
        show: false,
        transparent: true,
        resizable: false,
        frame: false,
        webPreferences: {
            devTools: false,
            nodeIntegration: true,
            // preload: join(__dirnameNew, './preload/vue_child.mjs'),
            preload: join(__dirnameNew, './preload/vue_child.mjs'),
        }
    });
    // winChild.loadURL('http://localhost:5174/');
    winChild.loadFile(join(__dirnameNew, './vue_child/dist/index.html'));
    winChild.on('ready-to-show', () => {
        winChild.show();
        winChild.setAlwaysOnTop(true);
        winChild.webContents.send('on-msg', arr, obj);
        winChild.setSkipTaskbar(true);
    })
    // process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    // winChild.webContents.openDevTools();

    winChild.on('moved', () => {
        winChild.webContents.send('on-send-position', winChild.getPosition());
    })
});
ipcMain.handle('on-init-open', (e, position) => {
    winChild.setPosition(position[0], position[1]);
})

ipcMain.handle('on-visual-close', (e, currentSongInfo) => {
    isVisual = false;
    Object.keys(preAndNext).forEach(item => {
        setMenuItemProp(contextMenu, preAndNext[item], 'visible', !isVisual)
    })
    win.show();
    winChild.close();
    win.webContents.send('on-visual-close-info', currentSongInfo);
});

ipcMain.handle('on-accurate-get-audio-info', async (e, pathList) => {
    return await getMusicInfo({ songPathArr: pathList }, true)
});

ipcMain.handle('on-add-Set-lrc', async () => {
    win.focus();
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: '选择文件',
        properties: ['openFile', 'showHiddenFiles'],
        buttonLabel: '确认'
    })
    if (canceled) return `取消添加`;
    return filePaths[0];
});


app.whenReady().then(() => {
    createWindow();

    protocol.handle('local-audio', async (request) => {
        let rightPath = request.url.replace(/local-audio:\/\/(\w)/, '$1' + ':');
        let path = decodeURI(rightPath);
        const info = await stat(path).catch(e => {
            dialog.showErrorBox('播放出错', `应用找不到 ${path} 文件`)
        })
        if (!info) return;
        let start = Number(request.headers.get('range').split('=')[1].split('-')[0]);
        let end = info.size - 1;
        const rs = createReadStream(path, { start, end });

        const response = new Response(rs, {
            headers: {
                "Connection": 'keep-alive',
                //audio/mpeg 不完善写法
                "Content-Type": 'audio/mpeg',
                "Access-Control-Allow-Credentials": "true",
                "Accept-Ranges": "bytes"
            }
        });

        // response.headers.set("Accept-Ranges", "bytes");
        if (start == 0) {
            response.headers.set("Content-Length", `${info.size}`);
        } else {
            response.headers.set("Content-Length", `${end - start + 1}`);
        }
        response.headers.set("Content-Range", `${start}-${end}/${info.size}`);
        // response.headers.set('Connection', 'keep-alive')
        // response.headers.set("Content-Type", "audio/mpeg");
        // response.headers.set("Access-Control-Allow-Credentials", "true")
        return response;
    })
    protocol.handle('local-img', async (request) => {
        // let rightPath = request.url.replace(/local-img:\/\/(\w)/, '$1' + ':');
        if (request.url.includes('background')) {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
                title: '选择图片',
                properties: ['openFile', 'showHiddenFiles']
            });
            if (canceled) return new Response();;
            const rs = createReadStream(filePaths[0])
            const response = new Response(rs);
            return response;
        }
        if (request.url.includes('picture')) {
            // request.url.replace(/picture\/\/(\w)/, '$1' + ':');
            let str = request.url.split('picture')[1];
            let arr = str.split('/');
            // let str2 = arr.join(':/');
            arr[0] = arr[0] + ':';
            let str2 = arr.join('/');
            // console.log(arr, str2)
            // return;
            // let path = request.url.split('picture')[1];
            const metadata = await parseFile(decodeURI(str2));
            const { picture } = metadata.common;
            // console.log(picture);
            // return;
            /*
            [
                {
                    format: 'image/jpeg',
                    type: 'Media (e.g. label side of CD)',
                    description: '',
                    data: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff db 00 43 00 02 01 01 01 01 01 02 01 01 01 02 02 02 02 02 04 03 02 02 02 02 05 04 04 03 ... 221375 more bytes>
                }
            ]
            */

            // let img = `data:${picture[0].format};base64,${picture[0].data.toString('base64')}`;

            return new Response(picture[0].data);
        }
        if (request.url.includes('cover')) {
            let str = request.url.split('cover')[1];
            let arr = str.split('/');
            arr[0] = arr[0] + ':';
            let str2 = arr.join('/');
            const rs = createReadStream(str2)
            const response = new Response(rs);
            return response;
        }
    })
    protocol.handle('local-lrc', async (request) => {
        let rightPath = request.url.replace(/local-lrc:\/\/(\w)/, '$1' + ':');
        const res = await new Promise((resolve, reject) => {
            const rs = createReadStream(decodeURI(rightPath), { encoding: 'utf-8' });
            rs.on('data', data => {
                resolve(data);
            });
            rs.on('error', error => {
                reject(error);
            })
        })
        // const str = res.replace(/\[[^]+\]\n/, '');
        // const str = '[00:00.00]' + res.split('[00:00.00]')[1];
        let strArr = res.split('\n') || [];
        let lrcArr = [];
        strArr.forEach(str => {
            let time = 0;
            let text = '';
            str.replace(/\[(\d{2}):(\d{2}).(\d{2})\]([^]+)/g, (str, $1, $2, $3, $4) => {
                time = parseInt($1, 10) * 60 + parseFloat(`${$2}.${$3}`);
                text = $4;
            });
            lrcArr.push({
                time,
                text
            })
        });
        lrcArr = lrcArr.filter(item => item.text !== '');
        return new Response(JSON.stringify(lrcArr));
    })

    let timeId = null
    let isPlay = false;
    let tray = null;

    tray = new Tray(iconsPath.pause);
    ipcMain.handle('on-change-tray-icon', (e, bool) => {
        isPlay = bool;
        isPlay ? tray.setImage(iconsPath.play) : tray.setImage(iconsPath.pause);
    });
    ipcMain.handle('on-child-change-tray-icon', (e, bool) => {
        isPlay = bool;
        isPlay ? tray.setImage(iconsPath.play) : tray.setImage(iconsPath.pause);
    });

    tray.on('click', () => {
        if (isVisual) {
            isPlay = !isPlay;
            if (isPlay) {
                winChild.webContents.send('on-child-control-play', true)
                tray.setImage(iconsPath.play);
            } else {
                winChild.webContents.send('on-child-control-play', false)
                tray.setImage(iconsPath.pause)
            }
        } else {
            timeId = setTimeout(() => {
                isPlay = !isPlay;
                if (isPlay) {
                    win.webContents.send('on-main-control-play', true)
                    tray.setImage(iconsPath.play);
                } else {
                    win.webContents.send('on-main-control-play', false)
                    tray.setImage(iconsPath.pause)
                }
            }, 500)
        }
    });
    tray.on('double-click', () => {
        if (isVisual) return;
        clearTimeout(timeId);
        win.show();
    });
    tray.setToolTip('PCA');

    tray.setContextMenu(contextMenu);

});

ipcMain.handle('on-close-win', (e) => {
    win.close();
})
ipcMain.handle('on-fullScreen-win', (e, bool) => {
    win.fullScreen = bool;
})
ipcMain.handle('on-minimizable-win', (e, bool) => {
    win.minimize();
})

app.on('window-all-closed', () => {
    app.quit();
})