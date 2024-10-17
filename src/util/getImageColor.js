const canvas = document.createElement('canvas');
const context = canvas.getContext("2d", { willReadFrequently: true });
function getImageColor(img) {
    canvas.width = img.width;
    canvas.height = img.height;

    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 获取像素数据
    const data = context.getImageData(0, 0, img.width, img.height).data;
    let r = 1, g = 1, b = 1;
    // 取所有像素的平均值
    for (let row = 0; row < img.height; row++) {
        for (let col = 0; col < img.width; col++) {
            // console.log(data[((img.width * row) + col) * 4])

            let i = img.width * row + col;

            if (row == 0) {
                i = col;
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            } else {
                r += data[i * 4];
                g += data[i * 4 + 1];
                b += data[i * 4 + 2];
            }
        }
    }

    // 求取平均值
    const wh = img.width * img.height;
    r /= wh;
    g /= wh;
    b /= wh;

    // 将最终的值取整
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    // return "rgb(" + r + "," + g + "," + b + ")";
    return `${r},${g},${b}`;
}
export default getImageColor;
