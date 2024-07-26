
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
    for (var row = 0; row < img.height; row++) {
        for (var col = 0; col < img.width; col++) {
            // console.log(data[((img.width * row) + col) * 4])
            if (row == 0) {
                r += data[((img.width * row) + col)];
                g += data[((img.width * row) + col) + 1];
                b += data[((img.width * row) + col) + 2];
            } else {
                r += data[((img.width * row) + col) * 4];
                g += data[((img.width * row) + col) * 4 + 1];
                b += data[((img.width * row) + col) * 4 + 2];
            }
        }
    }
    // 求取平均值
    r /= (img.width * img.height);
    g /= (img.width * img.height);
    b /= (img.width * img.height);

    // 将最终的值取整
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    // return "rgb(" + r + "," + g + "," + b + ")";
    return `${r},${g},${b}`;
}
export default getImageColor;
