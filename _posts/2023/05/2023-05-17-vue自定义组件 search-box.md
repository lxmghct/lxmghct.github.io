---
layout: post
title:  vue自定义组件 search-box
date:   2023-05-17 13:15:00 +0800
categories: 开发日志
tags: 前端 vue
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17408456.html](https://www.cnblogs.com/lxm-cnblog/p/17408456.html)
现在转移到 github pages 上。


github地址: [https://github.com/lxmghct/my-vue-components](https://github.com/lxmghct/my-vue-components)

## 组件介绍
* props:
    - value/v-model: 检索框的值, default: ''
    - boxStyle: 检索框的样式, default: 'position: fixed; top: 0px; right: 100px;'
    - highlightColor: 高亮颜色, default: 'rgb(246, 186, 130)'
    - currentColor: 当前高亮颜色, default: 'rgb(246, 137, 31)'
    - selectorList: 检索的选择器列表, default: []
    - iFrameId: 检索的iframe的id, default: null, 若需要搜索iframe标签中的内容, 则将该参数设为目标iframe的id
    - beforeJump: 跳转前的回调函数, default: () => {}
    - afterJump: 跳转后的回调函数, default: () => {}
    - (注: 上述两个回调函数参数为currentIndex, currentSelector, lastIndex, lastSelector)
* events:
    - @search: 检索时触发, 参数为input和total
    - @goto: 跳转时触发, 参数为index
    - @close: 关闭时触发
* methods:
    - clear() 清空检索框
    - search() 检索

## 效果展示
![](/post_assets/images/2023/05/17-vue-search-box.gif)

## 设计思路
完整代码见github: [https://github.com/lxmghct/my-vue-components](https://github.com/lxmghct/my-vue-components)
在其中的src/components/SearchBox下。
### 1. 界面
界面上比较简单, 输入框、当前/总数、上一个、下一个、关闭按钮。
```html
<div class="search-box" :style="boxStyle">
  <input
    v-model="input"
    placeholder="请输入检索内容"
    class="search-input"
    type="text"
    @input="search"
  >
  <!--当前/总数、上一个、下一个、关闭-->
  <span class="input-append">
    &nbsp;&nbsp;{{ current }}/{{ total }}&nbsp;&nbsp;
  </span>
  <span class="input-append" @click="searchPrevious">
    <div class="svg-container">
      <svg width="100px" height="100px">
        <path d="M 100 0 L 0 50 L 100 100" stroke="black" fill="transparent" stroke-linecap="round"/>
      </svg>
    </div>
  </span>
  <span class="input-append" @click="searchNext">
    <div class="svg-container">
      <svg width="100px" height="100px" transform="rotate(180)">
        <path d="M 100 0 L 0 50 L 100 100" stroke="black" fill="transparent" stroke-linecap="round"/>
      </svg>
    </div>
  </span>
  <span class="input-append" @click="searchClose">
    <div class="svg-container">
      <svg width="100%" height="100%">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" stroke-width="1" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="black" stroke-width="1" />
      </svg>
    </div>
  </span>
</div>
```

### 2. 检索与跳转
这部分是search-box的核心功能，一共有以下几个需要解决的问题:
1. 获取待搜索的容器
    - 为提高组件的通用性，可以通过传入选择器列表来获取容器，如`['.container', '#containerId']`，使用`document.querySelector()`获取容器。
2. 获取所有文本
    - 不能单独对某个dom节点获取文本, 因为某个待搜索词可能被分割在多个节点中, 例如`<span>hello</span><span>world</span>`，所以需要获取整个容器内的所有文本拼接起来, 然后再进行检索。
    - 使用`innetText`获取文本会受到样式影响, 具体见文章最后的其它问题。所以需要遍历所有节点将文本拼接起来。
    - 遍历文本节点时, 可以用`node.nodeType === Node.TEXT_NODE`判断是否为文本节点。
    ```js
    if (node.nodeType === Node.TEXT_NODE) { // text node
        callback(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) { // element node
        for (let i = 0; i < node.childNodes.length; i++) {
            traverseTextDom(node.childNodes[i], callback)
        }
    }
    ```
3. 检索结果的保存
    - 由于查找完之后需要实现跳转, 所以为方便处理, 将检索到的结果所在的dom节点保存起来, 以便后续跳转时使用。每个结果对应一个domList。
4. 高亮检索词
    - 使用span标签包裹检索词, 并设置样式, 实现高亮。
    - 为了避免检索词被html标签分割, 可以对检索词的每个字符都用span标签包裹, 例如检索词为`hello`，则可以将其替换为`<span>h</span><span>e</span><span>l</span><span>l</span><span>o</span>`。
    - 样式设置可以给span设置background-color, 为了方便修改并减小整体html长度, 可以改为给span设置class, 注意这种情况下在style标签设置的样式未必有效, 可以采用动态添加样式的方式。
    ```js
    function createCssStyle (css) {
        const style = myDocument.createElement('style')
        style.type = 'text/css'
        try {
            style.appendChild(myDocument.createTextNode(css))
        } catch (ex) {
            style.styleSheet.cssText = css
        }
        myDocument.getElementsByTagName('head')[0].appendChild(style)
    }
    ```
    - 将span标签插入到原先文本节点的位置, 若使用innerHtml直接进行替换, 处理起来略有些麻烦。可以考虑使用insertBefore和removeChild方法。
    ```js
    const tempNode = myDocument.createElement('span')
    tempNode.innerHTML = textHtml
    const children = tempNode.children
    if (children) {
      for (let i = 0; i < children.length; i++) {
        domList.push(children[i])
      }
    }
    // 将节点插入到parent的指定位置
    // insertBofore会将节点从原来的位置移除，导致引错误，所以不能用forEach
    while (tempNode.firstChild) {
      parent.insertBefore(tempNode.firstChild, textNode)
    }
    parent.removeChild(textNode)
    ```
5. 跳转
    由于结果对应的dom节点已保存，所以跳转起来比较容易。跳转时修改当前高亮的dom节点的类名, 然后将其滚动到可视区域。
    ```js
    setCurrent (index) {
        const lastSelector = this.searchResult[this.currentIndex] ? this.searchResult[this.currentIndex].selector : null
        const currentSelector = this.searchResult[index] ? this.searchResult[index].selector : null
        if (this.currentIndex >= 0 && this.currentIndex < this.searchResult.length) {
            this.searchResult[this.currentIndex].domList.forEach((dom) => {
                dom.classList.remove(this.currentClass)
            })
            this.searchResult[this.currentIndex].domList[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        this.currentIndex = index
        if (this.currentIndex >= 0 && this.currentIndex < this.searchResult.length) {
            this.searchResult[this.currentIndex].domList.forEach((dom) => {
                dom.classList.add(this.currentClass)
            })
        }
    }
    ```
6. 移除高亮效果
    - 由于高亮效果是通过给text节点添加span标签实现, 所以需要将span标签移除, 并替换为原先的文本节点。
    - 使用`insertBefore`和`removeChild`方法。
    - 替换完节点后需要调用`normalize()`方法, 将相邻的文本节点合并为一个文本节点。
    ```js
    function convertHighlightDomToTextNode (domList) {
        if (!domList || !domList.length) { return }
        domList.forEach(dom => {
            if (dom && dom.parentNode) {
                const parent = dom.parentNode
                const textNode = myDocument.createTextNode(dom.textContent)
                parent.insertBefore(textNode, dom)
                parent.removeChild(dom)
                parent.normalize() // 合并相邻的文本节点
            }
        })
    }
    ```

### 3. 添加对iframe的支持
有时候页面中可能会包含iframe标签, 如果需要检索iframe中的内容, 直接使用当前的document是无法获取到iframe中的内容的, 需要拿到iframe的document对象。
```js
const myIframe = document.getElementById(this.iframeId)
if (myIframe) {
  myDocument = myIframe.contentDocument || myIframe.contentWindow.document
} else {
  myDocument = document
}
if (myIframe && this.lastIframeSrc !== myIframesrc) {
  const css = `.${this.highlightClass} { background-color: ${this.highlightColor}; } .${this.currentClass} { background-color: ${this.currentColor}; }`
  createCssStyle(css)
  this.lastIframeSrc = myIframe.src
}
```
同一个iframe, 如果src发生变化, 则需要重新给其生成样式, 否则样式会失效。
## 其他问题
1. 使用svg画按钮图标时，双击svg按钮会自动触发全选
    - 解决方法: 在svg标签所在容器上添加`user-select: none;`样式
2. 使用`node.nodeType === Node.TEXT_NODE`判断文本节点时，会遇到一些空节点，导致检索错误
    - 解决方法: 在判断文本节点时，加上`node.textContent.trim() !== ''`的判断, 获取所有元素的文本时。
    - 后续修改: 可以不单独处理这些空的文本节点, 只要保证所有使用到获取文本的地方都统一使用或不使用`trim()`即可。尽量都不使用`trim()`, 如果随意使用`trim()`，可能会导致部分空白字符被误删。
