---
layout: post
title: UE5创建项目时报错No available Windows SDKs found
date: 2024-07-17 15:00:00 +0800
categories: 编程随笔
tags: UE5
---

## 问题描述
我在使用UE5.3创建一个空白的游戏项目时，报了下面的错：

```
Running D:/IDE/Epic Games/UE_5.3/Engine/Build/BatchFiles/Build.bat  -projectfiles -project="D:/projects/Unreal Projects/tank/tank.uproject" -game -rocket -progress
Using bundled DotNet SDK version: 6.0.302
Running UnrealBuildTool: dotnet "..\..\Engine\Binaries\DotNET\UnrealBuildTool\UnrealBuildTool.dll" -projectfiles -project="D:/projects/Unreal Projects/tank/tank.uproject" -game -rocket -progress
Log file: C:\Users\lxm\AppData\Local\UnrealBuildTool\Log_GPF.txt

Some Platforms were skipped due to invalid SDK setup: Win64.
See the log file for detailed information


Generating VisualStudio project files:
Discovering modules, targets and source code for project...
No available Windows SDKs found
Windows SDK must be installed in order to build this target.
```

## 解决方法
打开Microsoft Visual Studio Installer，修改安装，找到单个组件中的`Windows 10 SDK`，安装即可。
![image](/post_assets/images/2024/07/17-vs-intaller-win10-sdk.png)