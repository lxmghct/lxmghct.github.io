---
layout: post
title: Python fails to output ANSI color codes for the terminal
date: 2026-04-13 14:30:00 +0800
categories: troubleshooting
tags: python
---

在 python 里使用 ANSI 转义序列来输出彩色文本时，可能会遇到在 Windows 终端上无效的问题。
参考：
https://stackoverflow.com/questions/40754673/python-fails-to-output-ansi-color-codes-for-the-terminal


可以使用以下代码来启用 Windows 终端对 ANSI 转义序列的支持：
```python
import os
import sys

if sys.platform == "win32":
    os.system('')
```
