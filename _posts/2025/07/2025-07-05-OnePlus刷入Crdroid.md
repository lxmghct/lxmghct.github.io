---
layout: post
title: OnePlus Ace 3 Pro 刷入Crdroid系统
date: 2025-07-05 20:00:00 +0800
categories: platforms
tags: android
---

# 刷入 Crdroid 系统

截止到2025年7月，我找到的明确支持OnePlus Ace 3 Pro的第三方 Rom 只有 Crdroid 系统，[https://crdroid.net/downloads](https://crdroid.net/downloads)，所以我决定尝试刷入 Crdroid 系统。

按照官方教程，先给手机从 ColorOS 14 通过官方途径升级到 ColorOS 15，然后解锁 bootloader。然后照着教程刷入 Crdroid 系统。

# 刷入 Magisk
由于 Magisk Alpha 隐藏能力强于官方 Magisk，所以我选择了 Magisk Alpha 版本。[https://www.magiskmodule.com/download-magisk-alpha/](https://www.magiskmodule.com/download-magisk-alpha/)，目前下载到的版本是 28102。

安装好了之后刷入一些常用的模块：Shamiko、ZygiskNext、TrickyStore、TrickyAddonModule、PlayIntegrityFix。可能目前对于 Android 15 的支持还不够完善，所以这些隐藏途径还是会被某些应用比如 Native Detector 检测到。

# 刷入 LSPosed
直接在官网 [https://github.com/JingMatrix/LSPosed](https://github.com/JingMatrix/LSPosed) 的 Releases 页面下载最新版本的 APK 会直接导致在重启时 Zygisk 崩溃。最后在该仓库的 Actions 页面找到最新的 Core 版本，下载后安装即可。[Action 页面](https://github.com/JingMatrix/LSPosed/actions/workflows/core.yml?query=event%3Apush+branch%3Amaster)

