---
layout: post
title: flask-socketio与threading模块冲突问题
date: 2026-01-06 19:00:00 +0800
categories: troubleshooting
tags: python
---

`flask-socketio`与`threading`模块冲突问题

如果直接在`threading`模块中使用`emit`等功能，会导致无法获取当前的`SocketIO`上下文，从而无法正确发送消息。

为了解决这个问题，可以使用`SocketIO`提供的`start_background_task`方法来创建后台任务。而`time.sleep`等阻塞操作也应避免使用，可以使用`SocketIO`的`sleep`方法来替代。
