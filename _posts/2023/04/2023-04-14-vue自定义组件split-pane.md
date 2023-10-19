---
layout: post
title:  vue自定义组件 split-pane
date:   2023-04-14 00:01:50 +0800
categories: 开发日志
tags: 前端 vue
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17317101.html](https://www.cnblogs.com/lxm-cnblog/p/17317101.html)
现在转移到 github pages 上。

github地址: [https://github.com/lxmghct/my-vue-components](https://github.com/lxmghct/my-vue-components)

## 组件介绍
* props:
    - splitCount: 分割数量, default: 2
    - direction: 分割方向, 'vertical' or 'horizontal', default: 'horizontal'
    - defaultRatio: 默认比例, 类型为数组, default: [1/spiltCount, 1/spiltCount, ...]
* slots:
    - <template slot="pane1">...</template>
    - <template slot="pane2">...</template>
    - ...
* events:
    - @resize: 拖动分割条时触发, 参数为分割线两侧的div
    - @resize-stop: 拖动分割条结束时触发
* methods:
    - changeItemSize(index, itemSize, dire='next') 改变第item个pane的大小, dire为next或prev, 表示修改当前pane时连带修改前一个pane还是后一个

## 效果展示
![](/post_assets/images/2023/04/14-vue-split-pane.gif)

## 设计思路
整个组件采用flex布局，通过设置整体的`flex-direction`控制分割方向，通过修改每个pane的`style.flex`控制每个pane的大小。
```html
<div class="split-main" ref="splitMain"
     :class="direction === 'vertical' ? 'split-vertical' : 'split-horizontal'">
  <template v-if="direction === 'vertical'">
    <div v-for="i in splitCount" :key="i" ref="splitItem"
         class="split-vertical-item">
      <div class="split-vertical-line" v-if="i < splitCount"
           @mousedown="_startDrag(i)"
           @touchstart="_startDrag(i)"></div>
      <div class="split-vertical-content">
        <slot :name="`pane${i}`"></slot>
      </div>
    </div>
  </template>
  <template v-else>
    <div v-for="i in splitCount" :key="i" ref="splitItem"
         class="split-horizontal-item">
      <div class="split-horizontal-line" v-if="i < splitCount"
           @mousedown="_startDrag(i)"
           @touchstart="_startDrag(i)"></div>
      <div class="split-horizontal-content">
        <slot :name="`pane${i}`"></slot>
      </div>
    </div>
  </template>
</div>
```
通过`v-for`循环生成分割数量的pane，每个pane中间插入分割线，分割线通过`@mousedown`和`@touchstart`事件绑定`_startDrag`方法，该方法用于监听鼠标或手指的移动事件，从而实现拖动分割线改变pane大小的功能。
```js
_startDrag (index) {
  this.dragIndex = index - 1
},
_onMouseMove (e) {
  if (this.dragIndex === -1) {
    return
  }
  let items = this.$refs.splitItem
  let item1 = items[this.dragIndex]
  let item2 = items[this.dragIndex + 1]
  let rect1 = item1.getBoundingClientRect()
  let rect2 = item2.getBoundingClientRect()
  let ratio1, ratio2
  let minLen = this.minLen
  if (this.direction === 'vertical') {
    let height = this.$refs.splitMain.clientHeight
    let tempY = e.clientY - rect1.top > minLen ? e.clientY : rect1.top + minLen
    tempY = rect2.bottom - tempY > minLen ? tempY : rect2.bottom - minLen
    ratio1 = (tempY - rect1.top) / height
    ratio2 = (rect2.bottom - tempY) / height
  } else {
    let width = this.$refs.splitMain.clientWidth
    let tempX = e.clientX - rect1.left > minLen ? e.clientX : rect1.left + minLen
    tempX = rect2.right - tempX > minLen ? tempX : rect2.right - minLen
    ratio1 = (tempX - rect1.left) / width
    ratio2 = (rect2.right - tempX) / width
  }
  item1.style.flex = ratio1
  item2.style.flex = ratio2
  e.preventDefault()
  this.$emit('resize', item1, item2)
},
_onMouseUp () {
  if (this.dragIndex === -1) {
    return
  }
  this.dragIndex = -1
  this.$emit('resize-stop')
}
```
完整代码在github上。[https://github.com/lxmghct/my-vue-components](https://github.com/lxmghct/my-vue-components)
