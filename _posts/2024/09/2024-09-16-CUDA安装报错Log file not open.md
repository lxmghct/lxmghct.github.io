---
layout: post
title: CUDA安装报错Log file not open
date: 2024-09-16 16:00:00 +0800
categories: troubleshooting
tags: cuda
---

我在使用非root用户安装CUDA时，直接运行官方的安装脚本，报错：

```
Log file not open.
Segmentation fault (core dumped)    
```

原因是在当前机器上已经有人安装过CUDA，并且生成了`/tmp/cuda-installer.log`文件，但是这个文件的权限是安装它的那个用户，所以当前用户无法写入这个文件。如果有权限的话直接删除这个文件就可以解决问题。但是如果没有权限的话，就需要找到其他解决方法。

然后在这个网址看到了一种解决方法
[https://forums.developer.nvidia.com/t/cuda-toolkit-unpack-without-install/29615/3](https://forums.developer.nvidia.com/t/cuda-toolkit-unpack-without-install/29615/3)

里面说用下面这种方式来仅解压安装包：

```bash
./cuda_12.2.0_535.54.03_linux.run --tar mxvf
```

不过我试了一下照样报原来的错。最后没找到解决方法，所以直接联系了之前安装cuda的那个用户，让他把`/tmp/cuda-installer.log`文件删除了，然后再次运行安装脚本就成功了。
