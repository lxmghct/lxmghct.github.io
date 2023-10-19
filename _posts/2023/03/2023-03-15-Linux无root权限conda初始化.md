---
layout: post
title:  Linux无root权限conda初始化
date:   2023-03-15 12:00:00 +0800
categories: 编程随笔
tags: linux conda
---

本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17218011.html](https://www.cnblogs.com/lxm-cnblog/p/17218011.html)
现在转移到 github pages 上。

## 1. 给anaconda文件写入权限
```
sudo chmod a+w .conda
```
如果没有权限则会在创建环境时报以下错误
```
NoWritableEnvsDirError: No writeable envs directories configured.
  - /home/ubuntu/.conda/envs
  - /usr/local/miniconda3
```

## 2. 创建环境
```
  conda create -n myenv
  # 若服务器已经预装了相关的环境（比如某些市场镜像已预装了tensorflow或PyTorch），则可以直接克隆环境
  conda create -n myenv --clone base
```

## 3. 激活环境
```
  conda activate myenv
```
如果出现以下报错:
```
CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.
To initialize your shell, run

    $ conda init <SHELL_NAME>

Currently supported shells are:
  - bash
  - fish
  - tcsh
  - xonsh
  - zsh
  - powershell

See 'conda init --help' for more information and options.

IMPORTANT: You may need to close and restart your shell after running 'conda init'.
```
则说明当前的shell没有配置使用conda activate，需要初始化
先获取当前shell类型
```
  echo $0
```
再初始化shell
```
  conda init <shell type>
```
然后重启shell之后再`conda activate`即可。