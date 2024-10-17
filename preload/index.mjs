import { ipcRenderer, contextBridge } from "electron";
// const { ipcRenderer, contextBridge } = require("electron");

async function addDirectory(path) {
    return await ipcRenderer.invoke('on-add-directory', path)
}

contextBridge.exposeInMainWorld('electron', {
    addDirectory,
    playSong: path => ipcRenderer.invoke('on-select-one-song', path),
    openDirectory: () => ipcRenderer.invoke('on-open-directory'),
    mainControlPlay: cb => ipcRenderer.on('on-main-control-play', cb),
    changeTrayIcon: bool => ipcRenderer.invoke('on-change-tray-icon', bool),
    openFilePlace: path => ipcRenderer.invoke('on-open-file-place', path),
    dragEnterSong: path => ipcRenderer.invoke('on-drag-enter-song', path),
    transformFormat: (path, name, format) => ipcRenderer.invoke('on-transform-format', path, name, format),
    onUpdateProgress: callback => ipcRenderer.on('on-update-progress', callback),
    deleteTransformDoneData: path => ipcRenderer.invoke('on-delet-done', path),
    openDirectoryFromTransform: async () => await ipcRenderer.invoke('on-transform-open-directory'),
    getAudioInfo: async pathList => await ipcRenderer.invoke('on-get-audio-infor', pathList),
    createWin: (arr, obj) => ipcRenderer.invoke('on-create-win', arr, obj),
    onMsg: callback => ipcRenderer.on('on-msg', callback),
    onSaveCurrentAudio: callback => ipcRenderer.on('on-sava-current-audio', callback),
    onVisualCloseInfo: callback => ipcRenderer.on('on-visual-close-info', callback),
    closeWin: () => ipcRenderer.invoke('on-close-win',),
    fullScreenWin: bool => ipcRenderer.invoke('on-fullScreen-win', bool),
    minimizableWin: bool => ipcRenderer.invoke('on-minimizable-win', bool),
    onSendPositionXY: callback => ipcRenderer.on('on-send-position-xy', callback),
    getPositionXY: (x, y) => ipcRenderer.invoke('on-get-position', x, y),
    onSwitchSong: callback => ipcRenderer.on('on-switch-song', callback),
    onSetWinSize: callback => ipcRenderer.on('on-set-win-size-wh', callback),
    onGetWinSize: (w, h) => ipcRenderer.invoke('on-get-win-size-wh', w, h),
    accurateGetAudioInfo: pathList => ipcRenderer.invoke('on-accurate-get-audio-info', pathList),
    onGetLrc: lrcPath => ipcRenderer.invoke('on-get-lrc-path', lrcPath),
    addAndSetLrc: () => ipcRenderer.invoke('on-add-Set-lrc'),
})
