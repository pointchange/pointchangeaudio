import { defineStore } from "pinia";


export const useFormat = defineStore('format', {
    state: () => ({
        formatList: [
            'AAC',
            'APE',
            'FLAC',
            'OGG',
            'WAV',
            'WMA',
            'MP3',
            'M4A',
        ],
        addedList: [
            // {
            //     path: 'D:\\猪猪侠.mp3',
            //     name: '猪猪侠.mp3',
            //     isSelect: false,
            //     progress: 0,
            // },
            // {
            //     path: 'D:\\work\\vsCodeFiles\\electron\\video_vue3_electron\\1.mp3',
            //     name: '1.mp3',
            //     isSelect: true,
            //     progress: 0,

            // },
            // {
            //     path: 'D:\\work\\vsCodeFiles\\electron\\video_vue3_electron\\2.mp3',
            //     name: '2.mp3',
            //     isSelect: true,
            //     progress: 0,

            // }

        ],
        doneList: [
            // {
            //     path: 'D:\\猪猪侠.mp3',
            //     name: '猪猪侠.mp3',
            //     isSelect: false,
            //     progress: 0,
            // },
            // {
            //     path: 'D:\\work\\vsCodeFiles\\electron\\video_vue3_electron\\1.mp3',
            //     name: '1.mp3',
            //     isSelect: true,
            //     progress: 0,

            // },
            // {
            //     path: 'D:\\work\\vsCodeFiles\\electron\\video_vue3_electron\\3.flac',
            //     name: '3.flac',
            //     isSelect: true
            // },
            // {
            //     path: 'D:\\work\\vsCodeFiles\\electron\\video_vue3_electron\\3.aac',
            //     name: '3.aac',
            //     isSelect: true
            // }
        ],
    }),
})