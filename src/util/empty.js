import { computed } from "vue";

export function useEmpty(store) {
    const isEmpty = computed(() => store.songs.length === 0 ? true : false);
    const isSaveEmpty = computed(() => JSON.stringify(store.save) === '{}');
    const isDisabled = computed(() => isEmpty.value || isSaveEmpty.value);
    return {
        isEmpty,
        isSaveEmpty,
        isDisabled
    }
}