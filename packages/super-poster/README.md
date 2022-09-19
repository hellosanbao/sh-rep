微信小程序海报帮助工具（原生、uniapp、taro）

## 安装

```bash
$ npm i @sh-rep/super-poster
```

## 起步

首先需要再 template 中新增一个 canvas 组件

```html
<canvas canvas-id="posterCanvas" id="posterCanvas" type="2d" />
```

绘制 canvas 海报

```js
import { getPoster } from "@sh-rep/super-poster";
let json = {
  width: 750, //画布宽度
  height: 1125, //画布高度
  displayWidth: 690, //展示宽度
  ratio: 1.5, // 画笔缩放比
  posterFileName: "poster1",
  doms: [
    {
      type: "text", //dom类型
      x: 0, //x坐标
      y: 56, //y坐标
      width: 750, //文本宽度
      value: "宇宙最强最强的小分队", //文本内容
      fontSize: 48, //字体大小
      color: "#212224", //文本颜色
      fontWeight: "bold", //字重
      lineNum: 1, //行数
      textAlign: "center", //左右对其方式
      borderColor: "#000", //文字描边颜色
      borderWidth: 0, //文字描边宽度
      rotate: 0, //旋转角度
      zIndex: 10,
    },
  ],
};
getPoster(json).then((res) => {
  console.log(res.img);
});
```

获取 renderdoms

```js
import { getPreview } from "super-poster";
let json = {
  width: 750, //画布宽度
  height: 1125, //画布高度
  displayWidth: 690, //展示宽度
  ratio: 1.5, // 画笔缩放比
  posterFileName: "poster1",
  doms: [
    {
      type: "text", //dom类型
      x: 0, //x坐标
      y: 56, //y坐标
      width: 750, //文本宽度
      value: "宇宙最强最强的小分队", //文本内容
      fontSize: 48, //字体大小
      color: "#212224", //文本颜色
      fontWeight: "bold", //字重
      lineNum: 1, //行数
      textAlign: "center", //左右对其方式
      borderColor: "#000", //文字描边颜色
      borderWidth: 0, //文字描边宽度
      rotate: 0, //旋转角度
      zIndex: 10,
    },
  ],
};
const domList = getPreview(json);
console.log(domList); //可遍历渲染domlist以dom方式展示海报
```

## 配置

### config

| 参数名         | 类型   | 参数描述                  | 默认值     | 是否必传 |
| -------------- | ------ | ------------------------- | ---------- | -------- |
| width          | number | 画布宽度                  | -          | 是       |
| height         | number | 画布高度                  | -          | 是       |
| displayWidth   | number | dom 展示的宽度            | -          | 是       |
| ratio          | number | 画布缩放比                | 1          | 否       |
| posterFileName | string | 海报缓存的文件名          | Date.now() | 否       |
| doms           | Array  | 海报元素列表[Doms](#doms) | -          | 是       |

## doms

dom 一共有：text、texts、image、block 这几种类型

### text

文本

| 参数名      | 类型             | 参数描述        | 默认值       | 是否必传 |
| ----------- | ---------------- | --------------- | ------------ | -------- |
| type        | string           | dom 类型        | 固定值 text  | 是       |
| x           | number           | 起点位置 x 坐标 | 0            | 否       |
| y           | number           | 起点位置 y 坐标 | 0            | 否       |
| value       | string           | 文本内容        | -            | 是       |
| width       | number           | 文本区宽度      | config.width | 否       |
| fontSize    | number           | 文字大小        | -            | 是       |
| color       | string           | 文字颜色        | -            | 是       |
| fontWeight  | string ｜ number | 字重            | normal       | 否       |
| lineNum     | number           | 行数            | 1            | 否       |
| textAlign   | string           | 对齐方式        | left         | 否       |
| borderColor | string           | 字体边框颜色    | -            | 否       |
| borderWidth | number           | 字体边框宽度    | -            | 否       |
| rotate      | number           | 旋转角度        | 0            | 否       |
| zIndex      | number           | 元素层级        | 0            | 否       |

例：

```js
{
    type: 'text', //dom类型
    x: 0, //x坐标
    y: 56, //y坐标
    width: 750, //文本宽度
    value: '宇宙最强最强的小分队', //文本内容
    fontSize: 48, //字体大小
    color: '#212224', //文本颜色
    fontWeight: 'bold', //字重
    lineNum: 1, //行数
    textAlign: 'center', //左右对其方式
    borderColor: '#000', //文字描边颜色
    borderWidth: 0, //文字描边宽度
    rotate: 0, //旋转角度
    zIndex: 10,
}
```

### texts

多规格文本

| 参数名    | 类型     | 参数描述        | 默认值       | 是否必传 |
| --------- | -------- | --------------- | ------------ | -------- |
| type      | string   | dom 类型        | 固定值 texts | 是       |
| x         | number   | 起点位置 x 坐标 | 0            | 否       |
| y         | number   | 起点位置 y 坐标 | 0            | 否       |
| width     | number   | 文本区宽度      | config.width | 否       |
| textAlign | string   | 对齐方式        | left         | 否       |
| texts     | TextsDom | 文本列表        | -            | 是       |

### TextsDom

| 参数名     | 类型             | 参数描述 | 默认值 | 是否必传 |
| ---------- | ---------------- | -------- | ------ | -------- |
| value      | string           | 文本内容 | -      | 是       |
| fontSize   | number           | 字体大小 | -      | 是       |
| color      | string           | 颜色     | #000   | 否       |
| fontWeight | number ｜ string | 字重     | normal | 否       |

例：

```js
{
    type: 'texts',
    x: 352, //x坐标
    y: 1025, //y坐标
    width: 317,
    textAlign: 'center',
    texts: [
        {
            value: '-85.5', //文本内容
            fontSize: 48, //字体大小
            color: '#000', //文本颜色
            fontWeight: 'bold', //字重
        },
        {
            value: '斤', //文本内容
            fontSize: 36, //字体大小
            color: '#000', //文本颜色
            fontWeight: 'bold', //字重
        },
    ],
}
```

### image

图片

| 参数名       | 类型       | 参数描述                                                     | 默认值        | 是否必传 |
| ------------ | ---------- | ------------------------------------------------------------ | ------------- | -------- |
| type         | string     | dom 类型                                                     | 固定值 image  | 是       |
| url          | string     | 图片路径                                                     | -             | 是       |
| x            | number     | 起点位置 x 坐标                                              | 0             | 否       |
| y            | number     | 起点位置 y 坐标                                              | 0             | 否       |
| width        | number     | 图片宽度                                                     | config.width  | 是       |
| height       | number     | 图片高度                                                     | config.height | 是       |
| borderRadius | number     | 图片圆角半径                                                 | 0             | 否       |
| borderColor  | string     | 图片边框颜色                                                 | #000          | 否       |
| borderWidth  | number     | 图片边框宽度                                                 | 0             | 否       |
| rotate       | number     | 旋转角度                                                     | 0             | 否       |
| clip         | number[][] | 图片裁剪的顶点坐标集合 例如[[0,0],[0,100],[100,200],[200,0]] | -             | 否       |
| zIndex       | number     | 元素层级                                                     | 0             | 否       |

例：

```js
{
    type: 'image',
    url: 'https://hellosanbao-1257196807.cos.ap-chengdu.myqcloud.com/wangyiyun/WechatIMG12.jpeg',
    x: 0,
    y: 0,
    width: 750,
    height: 1125,
    borderWidth: 6,
    borderColor: '#000',
    clip: [[0,0],[0,100],[200,150],[200,0]],
    zIndex: 2,
},
```

### block

dom 集合块

| 参数名       | 类型        | 参数描述        | 默认值       | 是否必传 |
| ------------ | ----------- | --------------- | ------------ | -------- |
| type         | string      | dom 类型        | 固定值 block | 是       |
| x            | number      | 起点位置 x 坐标 | 0            | 否       |
| y            | number      | 起点位置 y 坐标 | 0            | 否       |
| width        | number      | 宽度            | -            | 否       |
| height       | number      | 高度            | -            | 否       |
| rotate       | number      | 旋转角度        | 0            | 否       |
| rotateOrigin | number[x,y] | 旋转中心店      | -            | 否       |
| translate    | number[x,y] | 偏移量          | -            | 否       |
| doms         | Doms        | dom 列表        | -            | 是       |

例：

```js
{
    type: 'block',
    x: 0,
    y: 0,
    width: 750,
    height: 1125,
    rotate:10,
    rotateOrigin: [0,0],
    translate: [0, 0],
    doms: [
       {
            type: 'image',
            url: 'https://hellosanbao-1257196807.cos.ap-chengdu.myqcloud.com/wangyiyun/WechatIMG12.jpeg',
            x: 0,
            y: 0,
            width: 750,
            height: 1125,
            borderWidth: 6,
            borderColor: '#000',
            clip: [[0,0],[0,100],[200,150],[200,0]],
            zIndex: 2,
        },
        {
            type: 'text', //dom类型
            x: 0, //x坐标
            y: 56, //y坐标
            width: 750, //文本宽度
            value: '宇宙最强最强的小分队', //文本内容
            fontSize: 48, //字体大小
            color: '#212224', //文本颜色
            fontWeight: 'bold', //字重
            lineNum: 1, //行数
            textAlign: 'center', //左右对其方式
            borderColor: '#000', //文字描边颜色
            borderWidth: 0, //文字描边宽度
            rotate: 0, //旋转角度
            zIndex: 10,
        }
    ],
}
```
