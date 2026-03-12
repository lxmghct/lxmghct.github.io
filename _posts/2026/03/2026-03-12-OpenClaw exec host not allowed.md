---
layout: post
title: OpenClaw exec host not allowed
date: 2026-03-12 16:30:00 +0800
categories: troubleshooting
tags: openclaw ai
---

在使用 OpenClaw 时，遇到了以下错误：

```
exec host not allowed (requested sandbox; configure tools.exec.host=gateway to allow)
```

这个错误提示是说当前的 OpenClaw 配置不允许执行主机上的命令。要解决这个问题，需要在 OpenClaw 的配置文件中添加以下配置：

```
tools.exec.host=gateway
```

然后在 OpenClaw 中执行以下命令：

```
/exec host=gateway
```

