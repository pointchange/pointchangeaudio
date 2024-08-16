import { onMounted, onUnmounted } from "vue";
import { useEmpty } from "./empty";

export function useGlobalKeyup(store) {
    const {
        isEmpty
    } = useEmpty(store);
    function keyupHandler(e) {
        if (isEmpty.value) return;
        if (e.key.trim() === '') {
            if (store.isPlaying) {
                store.pause();
            } else {
                store.play();
            }
        }
        if (e.key === 'ArrowLeft' && e.altKey) {
            store.preSong(store.audioInfo.path);
        }
        if (e.key === 'ArrowRight' && e.altKey) {
            store.nextSong(store.audioInfo.path);
        }
    }
    onMounted(() => {
        window.addEventListener('keyup', keyupHandler);
    })
    onUnmounted(() => {
        window.removeEventListener('keyup', keyupHandler);
    })

}