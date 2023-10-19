---
layout: post
title:  Mariadb中同时使用with和insert values
date:   2023-04-08 02:30:00 +0800
categories: 编程随笔
tags: mariadb
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17297828.html](https://www.cnblogs.com/lxm-cnblog/p/17297828.html)
现在转移到 github pages 上。

不能将with放在insert之前，否则会报以下错误：
```
You have an error in your SQL syntax; check the manual that corresponds to your MariaDB server version for the right syntax to use near 'insert into table_name (id, name, ...) values ...' at line xxx
```
正确做法是将with放在values之前：
```sql
  insert into test (name, type)
  with temp as (select type from test1 where id = 1)
  values
     ('name1', (select type from temp)),
     ('name2', (select type from temp))
```