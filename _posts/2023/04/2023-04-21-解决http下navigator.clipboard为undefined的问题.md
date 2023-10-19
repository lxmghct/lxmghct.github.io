---
layout: post
title:  解决http下navigator.clipboard为undefined的问题
date:   2023-04-21 19:56:00 +0800
categories: 编程随笔
tags: 前端
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17341614.html](https://www.cnblogs.com/lxm-cnblog/p/17341614.html)
现在转移到 github pages 上。


clipboard只有在安全域名下才可以访问(https、localhost), 而http域名下只能得到undefined。
例如现在想要实现点击"分享"按钮，将当前页面的url复制到剪贴板：
```js
  const clipboard = navigator.clipboard
  if (clipboard) {
    clipboard.writeText(window.location.href)
  }
```
在本地localhost测试是可以的，但是部署到服务器上后，由于部署的服务器使用的是http协议，所以clipboard为undefined。
解决方法：
可以考虑使用`document.execCommand('copy')`来实现复制到剪贴板的功能。
创建input写入待复制的文本，选定文本后执行`document.execCommand('copy')`进行复制：
```js
  const clipboard = navigator.clipboard || {
    writeText: (text) => {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  }
  if (clipboard) {
    clipboard.writeText(window.location.href)
  }
```
也可以使用`document.execCommand('copy')`触发复制事件后，再在复制事件中对剪贴板进行操作：
```js
export default {
  methods: {
    share() {
      this.isShare = true
      document.execCommand('copy')
      setTimeout(() => { this.isShare = false }, 100)
    }
  },
  created () {
    this.copyListener = (event) => {
      if (!this.isShare) { return }
      const clipboardData = event.clipboardData || window.clipboardData
      clipboardData.setData('text', window.location.href)
      event.preventDefault()
    }
    window.addEventListener('copy', this.copyListener)
  },
  beforeDestroy () {
    window.removeEventListener('copy', this.copyListener)
  }
}
```

