---
layout: post
title: 原生html的table固定表头滚动
date: 2026-01-06 21:00:00 +0800
categories: learning-notes
tags: html
---

参考：[https://www.cnblogs.com/itjeff/p/16205938.html](https://www.cnblogs.com/itjeff/p/16205938.html)

```css
table tbody {
    display: block;
    height: 240px;
    overflow-y: scroll;
}

table thead,
tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
}
```
