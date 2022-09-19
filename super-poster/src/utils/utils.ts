// import { getFileSystemManager } from '@tarojs/taro';
const {getFileSystemManager} = wx
export function deepClone(target) {
    // 定义一个变量
    let result;
    // 如果当前需要深拷贝的是一个对象的话
    if (typeof target === 'object') {
        // 如果是一个数组的话
        if (Array.isArray(target)) {
            result = []; // 将result赋值为一个数组，并且执行遍历
            for (const i in target) {
                // 递归克隆数组中的每一项
                result.push(deepClone(target[i]));
            }
            // 判断如果当前的值是null的话；直接赋值为null
        } else if (target === null) {
            result = null;
            // 判断如果当前的值是一个RegExp对象的话，直接赋值
        } else if (target.constructor === RegExp) {
            result = target;
        } else {
            // 否则是普通对象，直接for in循环，递归赋值对象的所有值
            result = {};
            for (const i in target) {
                result[i] = deepClone(target[i]);
            }
        }
        // 如果不是对象的话，就是基本数据类型，那么直接赋值
    } else {
        result = target;
    }
    // 返回最终结果
    return result;
}

// 清空缓存中的图片
export const removeTempFile = (url) => {
    const manger = getFileSystemManager();
    if (url) {
        return manger.unlink({
            filePath: url,
        });
    }
    const res = manger.readdirSync(wx.env.USER_DATA_PATH);
    res.forEach((val) => {
        if (/\.(png|jpg|jpeg)$/g.test(val)) {
            manger.unlinkSync(`${wx.env.USER_DATA_PATH}/${val}`);
        }
    });
};

//获取字符长度
const getStrLen = (str) => {
    let len = 0;
    let i, c;
    for (i = 0; i < str.length; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += 2;
        }
    }
    return len;
};

//获取文本宽度
export const getTextWidth = (str, fontSize) => {
    const len = getStrLen(str);
    return (fontSize * len) / 2;
};

//获取json中的图片节点
export const getDepImgs=(json)=>{
    let doms = json.doms||[]
    return doms.reduce((total,curr)=>{
        if(curr.type=='block' && curr.doms && curr.doms.length>0){
            total = [...total,...getDepImgs(curr)]
        }else if(curr.type=== 'image'){
            total.push(curr.url)
        }
        return total
    },[])
}