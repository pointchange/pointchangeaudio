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
    }
])
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

Menu.setApplicationMenu(null);
let tray = null;


app.whenReady().then(() => {
    createWindow();

    protocol.handle('local-audio', async (request) => {
        let rightPath = request.url.replace(/local-audio:\/\/(\w)/, '$1' + ':');
        const info = await stat(decodeURI(rightPath)).catch(e => {
            dialog.showErrorBox('播放出错', `应用找不到 ${decodeURI(rightPath)} 文件`)
        })
        if (!info) return;
        let start = Number(request.headers.get('range').split('=')[1].split('-')[0]);
        let end = info.size - 1;
        const rs = createReadStream(decodeURI(rightPath), { start, end });

        const response = new Response(rs);

        response.headers.set("Accept-Ranges", "bytes");
        if (start == 0) {
            response.headers.set("Content-Length", `${info.size}`);
        } else {
            response.headers.set("Content-Length", `${end - start + 1}`);
        }
        response.headers.set("Content-Range", `${start}-${end}/${info.size - 1}`);
        response.headers.set('Connection', 'keep-alive')
        response.headers.set("Content-Type", "audio/mpeg;charset=UTF-8");
        response.headers.set("Access-Control-Allow-Credentials", "true")
        response.headers.set("Keep-Alive", "timeout=5")
        response.headers.set("Cache-Control", "public, max-age=0")
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
    })
    ipcMain.handle('on-open-directory', async (e) => {
        win.focus();
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: '选择文件夹',
            properties: ['openDirectory', 'multiSelections', 'showHiddenFiles']
        })
        if (canceled) return;
        const dirAndFileArray = await readdir(filePaths[0]);
        let audioArray = await filterNotSongType(dirAndFileArray);
        audioArray = audioArray.map(item => join(filePaths[0], item));
        return await getMusicInfo(audioArray)
    })
    let isVisual = false;

    ipcMain.handle('on-open-file-place', async (e, path) => {
        shell.showItemInFolder(path);
    });
    ipcMain.handle('on-drag-enter-song', async (e, filePathList) => {
        let songList = await getMusicInfo(filePathList)
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
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            title: '选择文件夹',
            properties: ['openDirectory', 'multiSelections', 'showHiddenFiles']
        })
        if (canceled) return;
        const fileList = await readdir(filePaths[0]);
        const availableSongTypeList = await filterNotSongType(fileList);
        let res = [];
        availableSongTypeList.forEach(item => {
            res.push({
                name: item,
                path: join(filePaths[0], item),
                isSelect: true,
                progress: 0,
            })
        });
        return res;
    });
    ipcMain.handle('on-get-audio-infor', async (e, pathList) => {
        return await getMusicInfo(pathList)
    });

    let winChild;
    ipcMain.handle('on-create-win', (e, arr, obj) => {
        win.hide();
        isVisual = true;
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
        win.show();
        winChild.close();
        win.webContents.send('on-visual-close-info', currentSongInfo);
    });

    let timeId = null
    let isPlay = false;

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
    const menuList = [
        { label: '上一首', type: 'normal', click: () => win.webContents.send('on-switch-song', 'pre') },
        { label: '下一首', type: 'normal', click: () => win.webContents.send('on-switch-song', 'next') },
        { label: '退出', type: 'normal', click: () => app.quit() },
    ]
    const contextMenu = Menu.buildFromTemplate(menuList)

    tray.setContextMenu(contextMenu)

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