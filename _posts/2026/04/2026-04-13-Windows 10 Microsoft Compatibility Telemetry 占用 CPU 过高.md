---
layout: post
title: Windows 10 Microsoft Compatibility Telemetry 占用 CPU 过高
date: 2026-04-13 19:30:00 +0800
categories: platforms
tags: windows
---

Windows 10 使用中，发现有时 Microsoft Compatibility Telemetry 进程占用 CPU 过高，直接占用高达 99%，导致机器卡顿。可以参考以下步骤来禁用 Microsoft Compatibility Telemetry：

https://www.cnblogs.com/ls1519/p/12867055.html#:~:text=Win10%E4%BD%BF%E7%94%A8%E4%B8%AD%EF%BC%8C%E5%8F%91%E7%8E%B0Microsoft%20Compatibility%20Telemetry%E8%BF%9B%E7%A8%8B%E5%8D%A0%E7%94%A8CPU%E8%BF%87%E9%AB%98%EF%BC%8C%E5%AF%BC%E8%87%B4%E6%9C%BA%E5%99%A8%E5%8D%A1%E9%A1%BF%E3%80%82%20*%20Microsoft%20Compatibility%20Telemetry%E6%98%AF%E5%BE%AE%E8%BD%AF%E4%B8%8B%E7%9A%84%E4%B8%80%E4%B8%AA%E7%9B%91%E6%B5%8B%E6%95%B0%E6%8D%AE%E6%94%B6%E9%9B%86%E6%9C%8D%E5%8A%A1%EF%BC%8C%E5%A6%82%E6%9E%9C%E5%8A%A0%E5%85%A5microsoft,Experience%EF%BC%9B%20*%203.%E5%9C%A8%E5%8F%B3%E4%BE%A7%E6%89%93%E5%BC%80%E7%9A%84%E7%AA%97%E5%8F%A3%E4%B8%AD%EF%BC%8C%E6%89%BE%E5%88%B0Microsoft%20Compatibility%20Appraiser%E8%AE%A1%E5%88%92%E4%BB%BB%E5%8A%A1%EF%BC%8C%E7%82%B9%E5%87%BB%E9%BC%A0%E6%A0%87%E5%8F%B3%E9%94%AE%2D%E9%80%89%E6%8B%A9%E2%80%9C%E7%A6%81%E7%94%A8%E2%80%9D%EF%BC%9B%20*%204.%E9%87%8D%E5%90%AF%E7%94%B5%E8%84%91%E5%8D%B3%E5%8F%AF%E3%80%82


右键 `此电脑` -> `管理` -> `系统工具` -> `任务计划程序库` -> `Microsoft` -> `Windows` -> `Application Experience`，找到 `Microsoft Compatibility Appraiser` 计划任务，右键选择“禁用”，重启电脑即可。
