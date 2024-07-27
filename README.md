# PCA ( point change audio )

关闭数据连接，远离网络的嘈杂，感受生活带来的生机，带上一副耳机，倾听你我心声。PCA ( point change audio ) 本地音乐播放器。

## 下载

1. [阿里云盘](https://www.alipan.com/s/8EAChYJAx5C)

2. [夸克网盘](https://pan.quark.cn/s/c718018ca609)

## 项目介绍

PCA是基于 electron、vue3 的桌面应用 —— **本地音乐播放器**，无需联网，无网络请求。随着HTML5时代的发展，audio元素支持的音频类型越来越多，常见的 MP3、OGG、FLAC等类型的音频文件都能播放；但有些类型例如APE、WMA等音频文件经过测试不能播放，甚至识别不出文件类型。为了兼容不支持的音频类型，做了个**简易的音频转换器**，它集成在本地音乐播放器里，稍微等待几秒既能转换完成；同时拥有多个**主题**，多种色彩；心情不好，换个主题，换个心情，快来体验吧。

### 数据结构

```javascript
list:[
    {
        title: "test",
        artist: "t",
        album: "test group",
        container: "FLAC",
        path: "D: \\音乐\\xxx.flac",
        songSize: 46932581,
        duration: 372.2710204081633,
        bitrate: 1008375.2627008631,
        sampleRate: 44100,
        lossless: true,
        picture: false,
        isActive: true,
    }
]
```

| 属性 | 属性介绍 |
| :----: | :----: |
| title | 歌名 |
| artist | 歌手 |
| album | 专辑 |
| container | 音频编码格式 |
| path | 路径 |
| songSize | 文件大小（字节） |
| duration | 持续时间（秒） |
| bitrate | 每秒编码音频文件的比特数 |
| sampleRate | 采样率，单位为每秒采样数（S/s）|
| lossless | 是否无损 |
| picture | 是否有封面/插图 |
| isActive | 是否激活 |

## 项目依赖

| 依赖 | 依赖介绍 |
| :----: | :----: |
| [electron](https://www.electronjs.org/zh/) | 集成Chromium 和 Node.js桌面应用框架，就是把网页嵌套进桌面应用 |
| [vue3](https://cn.vuejs.org/) | 操纵数据，数据驱动视图 |
| [element plus](https://element-plus.org/zh-CN/) | 快速构建html |
| [pinia](https://pinia.vuejs.org/zh/) | 持久化数据和状态管理 |
| [ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) | 处理和操纵音频 |
| [music-metadata](https://github.com/Borewit/music-metadata) | 读取音频元信息 |
| [animate.css](https://animate.style/) | 控制动画 |

## 版本0.0.5

1. 修复音频封面规则匹配，列表标签错乱规则。

2. 增添 "正在播放" 页面切换动画。

## 版本0.0.4

1. 新增 "正在播放" 页面。

## 版本0.0.3

1. 修复播放顺序持续保存

2. 优化事件造成的内存开销，" 一键重置 "更彻底。

3. 新增调整窗口大小的功能，实现响应式界面

## 版本0.0.2

1. 重要修复音频封面，让其正常显示。

2. 版本0.0.0和版本0.0.1禁止使用，会卡顿。

## 版本0.0.1

1. 修改部分bug，增添可视化音频入口动画

## 版本0.0.0

1. 实现音频播放，音频转换，主题切换 3 个主要功能。

## 应用操作

1. 列表为空，点击右下角 "+" 按钮添加文件夹；双击列表项播放音频，右键移除列表项；单击 ">" 打开列表项详情。

2. 音频转换，选择需要转换的音频格式，点击 绿色 "+" 按钮添加文件夹， 勾选需转换音频，开始转换，转换完一般在需转换音频的文件夹下创建新音频文件，后缀大写以便区分。小白可以参考 "格式风格指南"

3. 设置：一键初始化本应用、主题切换、一键初始化主题。

4. 点击左上角 图标 logo 启动音频可视化。

## 项目启动

1. pointchangeaudio目录下```npm start```

## 项目经验

### electron 在安装的时候屡次报错

1. 下载缓慢或者进度不动：```npm edit ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"``` 官网里也有[介绍](https://www.electronjs.org/zh/docs/latest/tutorial/installation#%E8%87%AA%E5%AE%9A%E4%B9%89)

2. 本项目是先装好vue3，其次在安装electron。由于electron 大部分使用 CommonJS规范，可vue3是ES Modules规范，二者有些冲突。最好解决方案删除package.json文件里的type: module,单纯使用CommonJS。

### electron 项目启动

1. 本项目几乎是ES Modules规范，但例如：node:path 使用ES Modules引入，```ReferenceError: __dirname is not defined```，不支持__dirname。解决 3 种方案：

    - 删除文件 package.json 中的配置项："type": "module"

    ``` js
    import { fileURLToPath } from 'url'
    import { dirname } from 'path'
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    ```

    - 使用CommonJS导入。

2. preload.js 文件里使用ES Modules规范引入electron 文件无法挂载到window全局对象上，很迷。具体报错信息：```Uncaught ReferenceError: electron is not defined```，后来发现改后缀mjs+webPreferences的```nodeIntegration: true```，问题解决。

### electron 项目打包

1. Electron Forge 一体化打包，省事；但本项目音频转换依赖ffmpeg，打包后屡次报错，path正确，但就是报错，一般ffmpeg 等.exe文件打包在app.asar.unpack中才合适。

    ```js
      "config": {
        "forge": {
          "packagerConfig": {
            "asar": true,//electron 内置压缩
            "name": "pointchangeaudio",// 应用程序的名称
            "executableName": "pointchangeaudio(PCA)",//执行文件的名称
            "icon": "./images/chrome-256x256"//应用程序的图标路径 (无需后缀)
          },
          "makers": [
            {
              "name": "@electron-forge/maker-zip",//压缩包 
              "platforms": [
                "win32"//window平台
              ]
            },
            {
              "name": "@electron-forge/maker-squirrel",//Windows的.exe安装包
              "config": {
                "setupIcon": "./images/chrome-256x256.ico"
              }
            }
          ],
          //插件
          "plugins": [
            {
              //自动解包本机模块插件
              //此插件会自动将node_modules文件夹中的所有本机Node模块添加到asar.unpack文件夹中的packagerConfig配置选项中
              "name": "@electron-forge/plugin-auto-unpack-natives",
              "config": {}
            }
          ]
        }
      }
    ```

2. electron-builder 很成熟的打包工具，无论用 cmd 还是 esM 都支持。在 package.json 配置好build

```json
"build": {
    //应用id 唯一id
    "appId": "com.pointchange.audio",
    //安装完之后的名称
    "productName": "point change audio",
    //版权 
    "copyright": "pointchange©20240719",
    "directories": {
        //输出文件夹
      "output": "release"
    },
    //需要打包的文件 ：例如本项目，
    //本项目vue3+electron， vue3单独放一个文件夹好点，打包后依赖的node_modules会小很多。
    //electron-builder自动打包node_modules，
    //一些二进制文件 .exe 会在打包后app.asar.unpacked文件夹下
    "files": [
      "dist",
      "vue_child/dist",
      "preload",
      "main.js",
      "util",
      "images"
    ],
    //electron 内置加密
    "asar": true,
    //win配置
    "win": {
      "icon": "images/chrome-256x256.ico",
      "target": [
        {
            //打包成一个独立的 exe 安装程序
          "target": "nsis",
           "arch": [
            // 打出来32 位 + 64 位的包，就是window作兼容
            "ia32"
          ]
        }
      ]
    },
    //安装程序相关的配置
    "nsis": {
      "oneClick": false,
      //语言 2052是中文
      "language": "2052",
      //是否开启安装时权限限制
      "perMachine": true,
    //允许修改安装目录
      "allowToChangeInstallationDirectory": true,
      //卸载时删除用户数据
      "deleteAppDataOnUninstall": true,
      // 安装图标
      "installerIcon": "images/chrome-256x256.ico",
      //卸载图标
      "uninstallerIcon": "images/chrome-256x256.ico",
      //安装时头部图标
      "installerHeaderIcon": "images/chrome-256x256.ico",
    //   创建桌面图标
      "createDesktopShortcut": true,
      //开始菜单图标
      "createStartMenuShortcut": true
    }
  }
```

### javascript使用方面

1. 由于electron大量使用promise代理，对promise、async、 await有了深刻理解，尤其在错误管理方面，那一步出错几乎能准确定位并给用户提示

2. 在创建audio对象时，总结出有 **3** 种方法：

   - audio标签：最好的方式，但考虑到各个页面可能用到或着控制audio事件，所以单页面使用方便，多页面或多个组件使用起来就麻烦。

   - new audio 不创建audio标签，但使用几乎与audio标签相同的功能。

   - new AudioContext() 几乎兼容上面两种方案。有一种情况： AudioContext.createBufferSource()作为音频源，要想调节播放进度条，AudioContext继承的currentTime是只读属性，无法更改。

3. 调节播放进度条卡住或者卡住后重新播放的 bug： 通过网络请求，自定义协议拦截，从node读取出来的流(stream)文件，把流响应给页面时，响应头作相应配置。感谢这位[老哥的文章](https://blog.csdn.net/fly_leopard/article/details/113701939)。

4. map 数组里每项为 引用类型 会改变原数组。

5. 有的时候以为 forEach 这么简单函数应该像for循环一样使用，只是for的函数版；其实forEach和promise、async、await结合就发现不是预期的结果。不报错，无提示，就是结果不对。```forEach() 期望的是一个同步函数，它不会等待 Promise 兑现。``` 解决方法 promise.all() 或者 简简单单用 for 代替就完事了。

6. **音频可视化**，一个非常消耗内存资源的功能。虽然好看好完，但必须对canvas熟悉，canvas可以说是另一个特殊的css，了解完canvas基本功能就够呛的了。在某个配合完美的图形上，要是积分学得好，就容易实现。

音频格式转换

1. 本质上只是音频数据格式转换，一般是从无损转换有损。音频元数据转换过程中只是删除某些数据，压缩到文件小了。元数据记载信息一般是不变。所以前端只是把数据的路径传给后端，后端执行转换操作。后端转换完后，有**两**种响应操作：
    - 只响应音频流，前端把转换前的音频文件信息复制下来，等待后端响应流数据后，直接音频文件信息与流数据一一匹配，特点：**快速，高效**。

    - 响应音频流和再次对转换后音频流解析的音频文件信息，后端都处理完，前端只是展示到页面。
  
    >前者适合元数据不变的情况下，后者更适合元数据发生意外的各种情况。

2. ffprobe读取音频元数据很慢，但几乎能读取比较多可用的数据。music-metadata几乎是一瞬间读取，很快但读取数据会出现意外情况。将二者结合会更适合应对大多数意外情况。

### 设计思路上的问题

1. 前端与后端交互，electron给出了很多种形式。总结目前知道的只有两种；**主进程与渲染进程通信和自定义协议通信**（拦截网络请求）：

    - 起初设计上只知道用主进程与渲染进程通信，但在调整播放进度条功能下，这重通信就显得有点麻烦，况且前端定位在进度条某个位置，还得传送位置给主进程。要是一开始传整个文件给前端倒是不麻烦，但万一音频文件一百多m，那就又有问题；后端得分块读取慢慢传。处理过程繁琐。

    - 了解自定义协议( 感谢这位[老哥](https://www.bilibili.com/video/BV1ur421h7Js/?spm_id_from=333.337.search-card.all.click) )， 解决响应问题后，就可以像网络请求一样处理。

    - 二者结合其实更好，但也可以类似单纯使用网络请求。但是使用自定义协议后，从代码写法上，protocol 不能在任何除```app.whenReady().then()```函数里面，造成现在 main.js 文件十分糟糕与尴尬得局面

2. 可视化页面是另一个新的 BrowserWindow 的窗口。其中数据传输和又一次类似事件显得代码臃肿。

3. 本项目没有使用 TS 语法，考虑到electron 会出现更多的问题，所以在第一个electron 应用上暂时不用。不用带来的坏处十分多。例如：主进程与渲染进程通信，更直白的可以这么理解：

    ```mermaid
    graph LR
    A{main.js} -->|send|B{preload.js}
        B -->|callback| C{页面}
        C -->|fn| B
        B -->|callback| A
        F[主进程与渲染进程通信]
    ```

   - 在经过一层传输数据后，往往要返回传送的对象查看类型。更加增加查看操作。

4. 在选取本地存储持久化数据方式有 **3** 种：
    - 保存在数据库中，但要增加对数据库的操作

    - 保存在类似 .txt 文件，就是 node 日常对文件增删改查
  
    - 保存在 localStorage 中，可每个域只能有 5MB 大小。

    > 本项目选取localStorage，主要是用于测试。目前 localStorage 不能存储buffer 数据，否则会造成页面卡顿。

5. element plus 对于vue支持，节省不少代码，简洁而优雅。但在主题颜色选择中有 **el-color-picker** 颜色选择器带来新的问题：```Added non-passive event listener to a scroll-blocking 'touchstart' event. Consider marking event handler as 'passive' to make the page more responsive.```就是滚动性能提升的建议。
   - 要么事件+```passive: true```

   - 要么是用插件```default-passive-events```，但随之而来，调节音频的Slider进度条报错：```Unable to preventDefault inside passive event listener invocation```需要```passive: false```，这就本末倒置了。
    >还得是原生 input type="color" 可以轻松解决问题。

## 项目总结

本次项目作为简易本地播放器，初次体验 electron 知道了还可以以嵌套网页的形式作为桌面端应用，考虑到 main.js 的书写糟糕、可视化音频的臃肿、选取通信方式和存储格式的犹豫，可能后期维护与优化本项目造成一定的难度。
