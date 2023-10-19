---
layout: post
title:  vue自定义组件 ip-input
date:   2023-04-14 02:50:00 +0800
categories: 开发日志
tags: 前端 vue
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17317111.html](https://www.cnblogs.com/lxm-cnblog/p/17317111.html)
现在转移到 github pages 上。

github地址: [https://github.com/lxmghct/my-vue-components](https://github.com/lxmghct/my-vue-components)

## 组件介绍
* props:
    - value: 输入的ip地址, 类型为字符串, 格式为xx.xx.xx.xx, default: ''
    - disabled: 是否禁用, 类型为布尔值, default: false
* events:
    - @input: 输入时触发, 参数为输入的ip地址
    - @change: ip地址改变时触发, 参数1为newIp, 参数2为oldIp

## 效果展示
![](/post_assets/images/2023/04/14-vue-ip-input.gif)

## 设计思路
组件设计上比较简单，四个输入框，每个输入框只能输入0-255的数字，输入满3位后自动跳转到下一个输入框，退格`Backspace`则可以删除内容并跳转到上一个输入框，左右方向键也可以进行切换输入框，这些都只需调用目标输入框的`focus()`方法即可。
```html
<div class="ip-input">
  <!-- 每一段一个输入框 -->
  <div v-for="(item, index) in ipArr" :key="index" class="ip-input__item-wrap">
    <input
      ref="ipInput"
      v-model="ipArr[index]"
      type="text"
      class="ip-input__item"
      :class="{
        'ip-input__item--active': index === activeIndex,
      }"
      :disabled="disabled"
      @input="handleInput(index)"
      @focus="handleFocus(index)"
      @blur="handleBlur(index)"
      @keydown.left.exact="handleFocus(index - 1)"
      @keydown.right.exact="handleFocus(index + 1)"
      @keydown.backspace.exact="handleBackspace(index)"
    >
    <span v-if="index !== ipArr.length - 1" class="ip-input__dot">.</span>
  </div>
</div>
```
```js
handleInput(index) {
  const newValue = this.ipArr[index]
  // 如果输入的是非数字，或者输入不在0-255之间，则阻止输入
  if (!this.isNumberValid(newValue)) {
    this.ipArr[index] = this.oldIpInput[index]
    return false
  }
  this.$emit('input', this.ipArr.join('.'))
  this.oldIpInput[index] = newValue
  if (newValue.length === 3 || (newValue.length === 2 && newValue > 25)) {
    if (index === this.ipArr.length - 1) { return true }
    // 将焦点移动到下一个输入框
    this.handleFocus(index + 1)
  }
  return true
},
handleFocus(index) {
  if (index < 0 || index > this.ipArr.length - 1) { return }
  if (this.activeIndex !== index) {
    this.$refs.ipInput[index].focus()
  }
  this.activeIndex = index
}
```
此外，还加入了复制和粘贴ip的功能，粘贴时会自动将ip地址分割并填入到对应的输入框中，复制时会将完整的ip地址复制到剪贴板中。这可以通过监听`copy`和`paste`事件来实现，通过`event.clipboardData`来获取剪贴板中的数据。
```js
this.pasteListener = (event)=> {
  if (this.activeIndex === -1) { return }
  const clipboardData = event.clipboardData || window.clipboardData
  this.clipboardText = clipboardData.getData('text')
  this.handlePaste(this.activeIndex)
}
this.copyListener = (event) =>{
  if (this.activeIndex === -1) { return }
  const clipboardData = event.clipboardData || window.clipboardData
  clipboardData.setData('text', this.ipArr.join('.'))
  event.preventDefault()
}
window.addEventListene('paste', this.pasteListener)
window.addEventListene('copy', this.copyListener)
```
完整代码可以前往文章开头的github地址查看。