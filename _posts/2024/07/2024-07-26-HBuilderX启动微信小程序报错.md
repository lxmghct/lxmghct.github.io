---
layout: post
title: HBuilderX启动微信小程序报错：Cannot read property ‘forceUpdate‘ of undefined
date: 2024-07-26 19:30:00 +0800
categories: 编程随笔
tags: 微信小程序
---

## 报错1
```
[ app.json 文件内容错误] app.json: 未找到 ["sitemapLocation"] 对应的 sitemap.json 文件(env: Windows,mp,1.05.2203070; lib: 3.5.0)
```

解决方法：在微信开发者工具中重新编译小程序，如果还是报错就在啊HBuilderX中重新启动微信小程序。具体原因未知。

## 报错2
```
Cannot read property ‘forceUpdate‘ of undefined
```
参考: [https://blog.csdn.net/qq_40907752/article/details/107710357](https://blog.csdn.net/qq_40907752/article/details/107710357)

解决方法：如果微信开发者工具是游客模式，则使用自己的微信登录，并在manifest.json中把自己创建的小程序id填入。
