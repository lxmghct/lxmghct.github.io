---
layout: post
title:  v-if与v-show造成部分元素丢失的问题——v-if复用元素问题
date:   2023-04-13 03:50:00 +0800
categories: 技术探索
tags: 前端 vue
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17312047.html](https://www.cnblogs.com/lxm-cnblog/p/17312047.html)
现在转移到 github pages 上。

## 问题描述
在写tab切换时遇到了一个问题，以下为简化后的问题所在的代码：
```html
<img v-if="tabIndex === 2" id="t1">
<div v-if="tabIndex === 2" id="t2"></div>
<div v-if="tabIndex === 2" id="t3"></div>
<div v-show="tabIndex === 2" id="t4">
    <div id="content"></div>
</div>
```
当页面加载时，先向id为`content`的div中添加了一些元素：
```js
function addContent() {
    const newDiv = document.createElement('div');
    newDiv.innerHTML = '123456789';
    document.getElementById('content').appendChild(newDiv);
}
```
- 如果当`tabIndex`为2时执行`addContent()`，上述`123456789`能够正常显示；
- 但如果:
    - 在此时将`tabIndex`改为1，再将`tabIndex`改为2，
    - 或者在`tabIndex`不为2时执行`addContent()`，再将`tabIndex`改为2，
    这两种情况下，`123456789`都无法正常显示。

## 问题探索
首先尝试将目标元素输出到控制台。在切换`tabIndex`前，先获取原来的元素：
```js
var oldT4 = document.getElementById('t4');
var oldContent = document.getElementById('content');
```
此时输出显然能得到正确的结果。
然后在切换`tabIndex`后，再获取新的元素：
```js
var newT4 = document.getElementById('t4');
var newContent = document.getElementById('content');
console.log(oldT4, newT4);
console.log(oldContent, newContent);
```
此时会发现：  
- `oldContent`元素虽然能正常输出，但在页面上已经不存在了，此时`oldContent`仅仅是引用了一个不存在的元素；
- `newContent`元素就是当前页面上的`content`元素，但其中的内容已被清空。
- `newT4`元素就是当前页面上的`t4`元素。
- `oldT4`却离奇的变为了`t2`元素，`console.log(oldT4 === document.getElementById('t2'))`的结果为`true`。
![](/post_assets/images/2023/04/13-v-if-v-show.png)

## 问题原因
这是因为`t4`在`tabIndex`切换时，复用了被`v-if`隐藏的`t2`元素，复用时会重新渲染`t4`内的所有内容，这种情况下，动态添加到`content`元素中的内容就会被清空。
这里复用的顺序则是从第一个同样为div的被`v-if`隐藏的元素开始复用，即`t2`元素。类似的，如果此时进一步将`t2`元素的`v-if`修改成`v-show`，则`oldT4`就会去复用`t3`元素。

## 解决方案
要保留`content`元素中的内容，可以考虑：
1. 将`t2`、`t3`的`v-if`改成`v-show`。
2. 如果确实不方便修改`v-if`，则可以给`t2`、`t3`添加`key`属性，使其不会被复用。
