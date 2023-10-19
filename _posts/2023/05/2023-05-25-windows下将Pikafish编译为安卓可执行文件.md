---
layout: post
title:  windows下将Pikafish编译为安卓可执行文件
date:   2023-05-25 09:38:00 +0800
categories: 开发日志
tags: 交叉编译
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17430256.html](https://www.cnblogs.com/lxm-cnblog/p/17430256.html)
现在转移到 github pages 上。


## 1. 下载Android NDK

[https://developer.android.com/ndk/downloads?hl=zh-cn](https://developer.android.com/ndk/downloads?hl=zh-cn)

## 2. 下载Pikafish源码

[https://github.com/official-pikafish/Pikafish](https://github.com/official-pikafish/Pikafish)

## 3. 编译

在Pikafish的src目录下创建如下bat文件

```bash
set clang=D:\android-ndk-r25c\toolchains\llvm\prebuilt\windows-x86_64\bin\aarch64-linux-android31-clang++

%clang%  ^
    -static-libstdc++ ^
    -Wall ^
    -Wcast-qual ^
    -Wextra ^
    -Wshadow ^
    -std=c++17 ^
    -DNDEBUG -O3 ^
    -DUSE_NEON=8 ^
    -DIS_64BIT ^
    -DUSE_PTHREADS ^
    -DUSE_POPCNT ^
    -pedantic ^
    -fno-exceptions ^
    -flto=full ^
    -DANDROID_STL=c++_shared ^
    benchmark.cpp ^
    bitboard.cpp ^
    evaluate.cpp ^
    main.cpp ^
    misc.cpp ^
    movegen.cpp ^
    movepick.cpp ^
    position.cpp ^
    search.cpp ^
    thread.cpp ^
    timeman.cpp ^
    tt.cpp ^
    tune.cpp ^
    uci.cpp ^
    ucioption.cpp ^
    nnue\evaluate_nnue.cpp ^
    nnue\features\half_ka_v2_hm.cpp ^
    external\zip.cpp ^
    -o pikafish
```
具体的clang路径需要根据自己的ndk版本进行修改, `-static-libstdc++`不加也能编译成功，但在安卓上运行时会报找不到libc++_shared.so的错误，所以采用静态链接的方式。

## 4. 运行
将编译好的pikafish文件和pikafish.nnue文件放到同一个目录下，然后用adb运行即可。

