---
layout: post
title:  python写入neo4j时间格式问题
date:   2023-11-24 16:00:00 +0800
categories: 编程随笔
tags: python neo4j
---

在使用`py2neo`写入`neo4j`时，如果属性值是时间类型，需要将时间转换为ISO-8601格式，否则会报错。

```python
import datetime

# 转化为ISO-8601格式
current_time = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M:%S.%fZ')

# 将%f只保留3位小数
current_time = current_time[:-4] + current_time[-1]
```
