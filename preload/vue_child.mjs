// const { ipcRenderer, contextBridge } = require("electron");
import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld('electron', {
    onMsg: callback => ipcRenderer.on('on-msg', callback),
    onIsPlay: callback => ipcRenderer.on('on-child-control-play', callback),
    visualClose: currentSongInfo => ipcRenderer.invoke('on-visual-close', currentSongInfo),
    changeTrayIcon: bool => ipcRenderer.invoke('on-child-change-tray-icon', bool),
    sendPosition: callback => ipcRenderer.on('on-send-position', callback),
    initOpen: position => ipcRenderer.invoke('on-init-open', position),
})