---
layout: post
title: Crdroid安装microG
date: 2025-09-18 10:00:00 +0800
categories: platforms
tags: android
---

# 问题描述
我尝试在自己的 Crdroid 11.7 系统上安装 microG，设备是 OnePlus Ave 3 Pro。不过无论使用正常 apk 安装，还是使用 Magisk 模块安装，还是刷入到`/system/priv-app/GmsCore/`下，microG 都无法正常工作，Google Play 服务无法启动，都是可以安装但点击后直接闪退。

官方教程：
[https://github.com/microg/GmsCore/wiki/Installation](https://github.com/microg/GmsCore/wiki/Installation)

# 解决方法
我在 github 上提问：
[https://github.com/microg/GmsCore/issues/3049](https://github.com/microg/GmsCore/issues/3049)

得到了开发者的回复：
```
The latest microG Installer Revived support microG v0.3.4, it is possible that it won't work correctly with the new version of microG.

You may get better results with my installer: https://github.com/micro5k/microg-unofficial-installer

The nightly build include the latest microG.
See instructions here: https://github.com/micro5k/microg-unofficial-installer/blob/main/docs/INSTRUCTIONS.rst

NOTE: My installer install in the real system partition (without Magisk) so it need free space in that partition.
```

将手机进入 Recovery 模式后，使用 adb sideload 安装了这个非官方的安装包，microG 成功安装并可以正常使用。
