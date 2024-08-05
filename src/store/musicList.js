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
        currentSongLrc: [],
        currentTimeLrc: '',
        isShowLrc: false,
        savePlayedSongs: [],
        savePlayedSongsIndex: 0,
        pre: false,
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
                    return path.replace(/[\s\S.]+\\/, '').replace(/\.\w+/g, '')
                } else {
                    return path.replace(/[\s\S.]+\\/, '')
                }
            };
        }
    },
    actions: {
        init() {
            this.audio.addEventListener('error', () => {
                ElMessageBox.confirm(`可能是有不支持的音频文件，也可能是音频文件不存在。是否要移除当前 ${this.audioInfo.path}的文件`, '播放失败',
                    {
                        confirmButtonText: '确认',
                        cancelButtonText: '取消',
                        type: 'warning',
                    })
                    .then(() => {
                        that.deleteSongListItem(this.audioInfo.path);
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
                // e.target.removeEventListener('error', audioError);
            })
            // this.audio.addEventListener('durationchange',()=>{

            // })
            this.audio.addEventListener("loadeddata", () => {
                // if ('onerror' in this.audio) {
                //     this.audio.removeEventListener('error', errorDailog);
                // }
                // if ('ondurationchange' in this.audio) {
                //     this.audio.removeEventListener('durationchange', that.initDuration);
                // }
                this.play();
                this.audioInfo.duration = this.countTime(this.audio.duration);
                this.audioInfo.currentTime = this.countTime(this.audio.currentTime);
                if (JSON.stringify(this.save) === '{}') {
                    this.save = {
                        c: this.audio.currentTime,
                        d: this.audio.duration,
                        path: this.audioInfo.path,
                        currentSong: this.audioInfo.currentSong,
                        duration: this.audioInfo.duration,
                        currentTime: this.audioInfo.currentTime,
                    }
                }
            });
            this.audio.addEventListener('timeupdate', this.timeupdateHandler);
            this.audio.addEventListener('ended', () => {
                this.nextSong(this.audioInfo.path);
            });
        },
        availebleSongs(songs) {
            const uniqueNotPlaySongs = songs.filter(item => !this.notPlaySongs.some(v => v.path === item.path));
            // return songs;
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
                if (String(error).includes('@')) {
                    ElMessage.error(String(error).split('@')[1])
                } else {
                    ElMessage.error(error)
                }
            });
            if (Array.isArray(result)) {
                this.addSongs(result);
            } else {
                ElMessage.error(result)
            }
        },
        countTime(time) {
            function isUnitsDigit(n) {
                if (n < 10) {
                    n = '0' + n;
                }
                return n;
            }

            let hour = isUnitsDigit(Math.floor(time / 3600));
            let min = isUnitsDigit(Math.floor(time / 60) % 60);
            let second = isUnitsDigit(Math.floor(time % 60));

            return (hour > 0 ? `${hour}:` : '') + `${min}:${second}`;
        },

        async playCurrentMusic(path) {
            if (!this.pre) {
                this.savePlayedSongs.push(path);
                this.savePlayedSongsIndex++;
                this.pre = false;
            }
            this.currentSongLrc = [];
            this.audioInfo.path = path;
            this.audioInfo.currentSong = this.getName(path, '', true);
            const filterCurrentSongObj = this.songs.filter(item => item.path === path)[0];
            this.audioInfo.pic = filterCurrentSongObj.picture;
            //匹配歌曲名字
            this.audioInfo.title = this.getName(path, filterCurrentSongObj.title);
            //找路径
            this.audioInfo.artist = filterCurrentSongObj.artist ? filterCurrentSongObj.artist : this.getName(path, '', true).split('-')[0];
            if (filterCurrentSongObj.lrc) {
                // fetch("local-lrc://" + filterCurrentSongObj.lrc)
                //     .then(res => res.json())
                //     .then(data => this.currentSongLrc = data);
                // const currentSongLrc = await new Promise((resolve, reject) => {
                //     fetch("local-lrc://" + filterCurrentSongObj.lrc).then(res => resolve(res.json())).catch(error => reject(error));
                // })
                // this.currentSongLrc = currentSongLrc
                // console.log(this.currentSongLrc);

                this.currentSongLrc = await electron.onGetLrc(filterCurrentSongObj.lrc);
            }
            this.audio.src = 'local-audio://' + path;
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
            if (this.currentSongLrc.length === 0) return;
            for (let index = 0; index < this.currentSongLrc.length; index++) {
                if (this.audio.currentTime + 1 >= this.currentSongLrc[index].time && ((!this.currentSongLrc[index + 1]) || this.audio.currentTime < this.currentSongLrc[index + 1].time)) {
                    this.currentTimeLrc = this.currentSongLrc[index].text;
                }
            }
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
                let that = this;
                this.audio.addEventListener('durationchange', function durationchangeHandler() {
                    that.changeProgress(that.save.c)
                    this.removeEventListener('durationchange', durationchangeHandler)
                })
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
                }
            }
        },
        nextSong(path) {
            this.switchSong(path);
        },
        preSong(path) {
            if (this.playOrder === 1 && this.savePlayedSongsIndex > 0) {
                this.pre = true;
                this.playCurrentMusic(this.savePlayedSongs[this.savePlayedSongsIndex - 1]);
                this.savePlayedSongsIndex--;
            } else {
                this.savePlayedSongsIndex = this.savePlayedSongs.length;
                this.switchSong(path, 0);
            }
        },
        changeVolume(v) {
            this.audio.volume = v / 100
        },
        deleteSongListItem(path) {
            this.songs = this.songs.filter(v => v.path !== path)
        },
    },
    persist: {
        paths: ['songs', 'orderNameList', 'notPlaySongs', 'save', 'playOrder', 'isShowLrc']
    }
})