const typeList = [
    'primary',
    'success',
    'info',
    'warning',
    'danger',
];
export function useRandomType(rand) {
    return typeList[parseInt(rand * typeList.length)];
}