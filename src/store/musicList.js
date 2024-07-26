import { defineStore } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus'
export const useSongList = defineStore('song-list', {
    state: () => ({
        songs: [
            //{}
        ],
        audio: new Audio(),
        audioInfo: {
            currentSong: '',
            duration: '0:00',
            currentTime: '0:00',
            progressPresent: 0,
            title: '',
            path: '',
        },
        playOrder: 0,
        notPlaySongs: [],
        save: {},
        visualClose: {},
        isPlay: false,
        isPlaying: false,
    }),
    getters: {
        isEmpty: state => state.songs.length,
        //all song
        songLists: state => {
            return state.songs.reduce((pre, cur) => [...pre, ...(cur.songLists || [])], [])
        },
        filePaths: state => {
            return state.songs.reduce((pre, cur) => [...pre, ...(cur.filePaths || '')], [])
        },
        find: state => {
            return inputValue => {
                if (inputValue === '') {
                    return state.songs;
                } else {
                    return state.songs.filter(item => new RegExp(inputValue.trim(), 'ig').test(item.path));
                }
            }
        },
        getName: state => {
            return (path, title, isDeleteForm = false) => {
                if (title) {
                    return title;
                } else if (!title && !isDeleteForm) {
                    return path.replace(/[\s\S.]+\\/, '').replace(/\.\w+/, '')
                } else {
                    return path.replace(/[\s\S.]+\\/, '')
                }
            };
        }
    },
    actions: {
        availebleSongs(songs) {
            const uniqueNotPlaySongs = songs.filter(item => !this.notPlaySongs.some(v => v.path === item.path));
            return uniqueNotPlaySongs.filter(item => {
                if (/.(ape|wma)/ig.test(item.path)) {
                    this.notPlaySongs.push(item)
                } else {
                    return item;
                }
            })
        },
        addSongs(newList) {
            if (this.songs.length !== 0) {
                let uniqueArr = newList.filter(item => !this.songs.some(v => v.path === item.path));
                uniqueArr = this.availebleSongs(uniqueArr);
                if (uniqueArr.length === 0) {
                    ElMessage({
                        message: '并没有找到新歌曲，或许列表里有。',
                        type: 'warning',
                    })
                } else {
                    this.songs = [...uniqueArr, ...this.songs];
                }
            } else {
                this.songs = this.availebleSongs(newList)
            }
        },
        async addDirectory() {
            const result = await electron.openDirectory().catch(error => {
                ElMessage.error(String(error).split('@')[1])
            });
            if (!result) return;
            this.addSongs(result);
        },
        countTime(time) {
            let min = parseInt(time / 60);
            if (min < 10) {
                min = '0' + min;
            }
            let second = Math.round(time % 60);
            if (second < 10) {
                second = '0' + second;
            }
            return `${min}:${second}`;
        },
        async playCurrentMusic(path) {
            this.audioInfo.path = path;
            this.audioInfo.currentSong = this.getName(path, '', true);
            const filterCurrentSongObj = this.songs.filter(item => item.path === path)[0];
            this.audioInfo.pic = filterCurrentSongObj.picture;
            //匹配歌曲名字
            this.audioInfo.title = this.getName(path, filterCurrentSongObj.title);
            //找路径
            this.audioInfo.artist = filterCurrentSongObj.artist ? filterCurrentSongObj.artist : this.getName(path, '', true).split('-')[0];
            this.audio.src = 'local-audio://' + path;
            //播放错误处理
            let that = this;
            this.audio.addEventListener('error', function audioError(e) {
                ElMessageBox.confirm(`可能是有不支持的音频文件，也可能是音频文件不存在。是否要移除当前 ${path}的文件`, '播放失败',
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'warning',
                    })
                    .then(() => {
                        that.deleteSongListItem(path);
                        ElMessage({
                            type: 'success',
                            message: '删除成功',
                        })
                    })
                    .catch(() => {
                        ElMessage({
                            type: 'info',
                            message: '删除 取消',
                        })
                    });
                e.target.removeEventListener('error', audioError);
            })


            const loadeddataHandler = () => {
                // if ('onerror' in this.audio) {
                //     this.audio.removeEventListener('error', errorDailog);
                // }
                if ('ondurationchange' in this.audio) {
                    this.audio.removeEventListener('durationchange', this.initDuration);
                }
                this.play();
                this.audioInfo.duration = this.countTime(this.audio.duration);
                this.audioInfo.currentTime = this.countTime(this.audio.currentTime);
                if (JSON.stringify(this.save) === '{}') {
                    this.save = {
                        c: this.audio.currentTime,
                        d: this.audio.duration,
                        path,
                        currentSong: this.audioInfo.currentSong,
                        duration: this.audioInfo.duration,
                        currentTime: this.audioInfo.currentTime,
                    }
                }
            }

            this.audio.addEventListener("loadeddata", () => {
                loadeddataHandler();
                this.audio.removeEventListener('loadeddata', loadeddataHandler);
            });
            this.audio.addEventListener('timeupdate', this.timeupdateHandler);
            this.audio.addEventListener('ended', () => {
                this.nextSong(path);
            });
            //active song
            this.songs.forEach(v => {
                if (v.path === path) {
                    v.isActive = true;
                } else {
                    v.isActive = false;
                }
            });
        },
        timeupdateHandler() {
            this.audioInfo.c = this.audio.currentTime;
            this.audioInfo.d = this.audio.duration;
            this.audioInfo.currentTime = this.countTime(this.audio.currentTime);
            if (isNaN(this.audio.currentTime / this.audio.duration)) return;
            this.audioInfo.progressPresent = (this.audio.currentTime / this.audio.duration).toFixed(2) * 100;
        },
        pause() {
            // let index = 100;
            // let id = setInterval(() => {
            //     if (index === 0) {
            //         electron.changeTrayIcon(false);
            //         this.audio.pause();
            //         clearInterval(id);
            //         id = null;
            //         return;
            //     }
            //     index--;
            //     this.changeVolume(index);
            // }, 10);
            this.isPlaying = false;
            electron.changeTrayIcon(false);
            this.audio.pause();
        },
        initDuration() {
            this.changeProgress(this.save.c);
        },
        play() {
            this.isPlaying = true;
            this.isPlay = true;
            this.audio.volume = 0;
            let index = 0;
            if (!this.audio.src) {
                this.playCurrentMusic(this.save.path);
                this.audio.addEventListener('durationchange', this.initDuration)
            }
            electron.changeTrayIcon(true);
            this.audio.play();
            let id = setInterval(() => {
                if (index === 100) {
                    clearInterval(id);
                    id = null;
                    return;
                }
                index++;
                this.changeVolume(index);
            }, 20);
        },
        changeProgress(v) {
            this.audio.currentTime = v;
        },
        switchSong(path, num) {
            const len = this.find('').length - 1;
            if (len === -1) return;
            const index = this.find('').findIndex(item => item.path === path);
            if (index === (num !== 0 ? len : 0)) {
                this.playCurrentMusic(this.find('')[num !== 0 ? 0 : len].path);
            } else {
                switch (this.playOrder) {
                    case 0:
                        this.playCurrentMusic(this.find('')[num !== 0 ? index + 1 : index - 1].path);
                        break;
                    case 1:
                        this.playCurrentMusic(this.find('')[parseInt(Math.random() * len)].path);
                        break;
                    case 2:
                        this.playCurrentMusic(this.find('')[index].path);
                        break;
                }0
            }
        },
        nextSong(path) {
            this.switchSong(path);
        },
        preSong(path) {
            this.switchSong(path, 0);
        },
        changeVolume(v) {
            this.audio.volume = v / 100
        },
        deleteSongListItem(path) {
            this.songs = this.songs.filter(v => v.path !== path)
        },
    },
    persist: {
        paths: ['songs', 'orderNameList', 'notPlaySongs', 'save', 'playOrder']
    }
})