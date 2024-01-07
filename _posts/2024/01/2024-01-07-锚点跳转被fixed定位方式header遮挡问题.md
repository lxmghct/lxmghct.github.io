---
layout: post
title:  锚点跳转被fixed定位方式header遮挡问题.md
date:   2024-01-07 18:00:00 +0800
categories: 编程随笔
tags: html
---

当页面的 header 使用 fixed 定位时，锚点跳转会被 header 遮挡。解决方法是修改页面的 scroll-padding-top 属性值为 header 的高度。

```css
html {
  scroll-padding-top: 100px;
}
```
