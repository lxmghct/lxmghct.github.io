---
layout: post
title: linux umount报错目标忙
date: 2024-07-30 14:00:00 +0800
categories: 编程随笔
tags: linux
---

我在Kylin10系统上挂载了一个目录，然后想要卸载这个目录，但是执行`umount`命令时报错：

```shell
umount: /mnt: 目标忙
```

这是因为有进程在使用这个目录，可以使用`fuser`命令查看：

```shell
fuser -mv /mnt
```

然后可以使用`kill`命令杀死这个进程：

```shell
kill -9 1234
```
