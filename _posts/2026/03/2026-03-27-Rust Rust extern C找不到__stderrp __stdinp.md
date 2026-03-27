---
layout: post
title: Rust extern "C"找不到__stderrp, __stdinp
date: 2026-03-27 15:30:00 +0800
categories: troubleshooting
tags: rust
---

在运行 Rust 程序时，遇到了以下错误：

```
extern "C"找不到__stderrp, __stdinp
```

这个错误提示是说 Rust 程序在链接时找不到 `__stderrp` 和 `__stdinp` 这两个符号。这通常是因为 Rust 程序在链接时没有正确链接到 C 标准库。而这些 `_stderrp` 和 `__stdinp` 是 Darwin 系统内部变量，在 Windows 或 Linux 上是不存在的。所以会出现这个错误。
