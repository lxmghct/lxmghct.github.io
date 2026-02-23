---
layout: post
title: vscode ssh权限混乱问题.
date: 2026-02-23 16:00:00 +0800
categories: troubleshooting
tags: vscode ssh
---

使用vscode ssh连接服务器时，如果同时以多个用户连接了同一个服务器，有时会出现权限混乱的问题。比如先以user1连接服务器，再打开一个新窗口以root连接服务器，可以发现root这个窗口任何操作都没有权限，也就是似乎以user1的权限去打开了root的目录。

这个原因是因为在vscode ssh的配置文件里使用了相同的 Host，导致vscode ssh无法区分不同用户的连接，从而出现权限混乱的问题。
```
Host 123.123.xxx.xxx
  HostName 123.123.xxx.xxx
  User devuser

Host 123.123.xxx.xxx
  HostName 123.123.xxx.xxx
  User root
```

解决这个问题的方法是给每个用户的连接配置不同的 Host，比如：

```
Host devuser_123.123.xxx.xxx
  HostName 123.123.xxx.xxx
  User devuser
Host root_123.123.xxx.xxx
  HostName 123.123.xxx.xxx
  User root
```
