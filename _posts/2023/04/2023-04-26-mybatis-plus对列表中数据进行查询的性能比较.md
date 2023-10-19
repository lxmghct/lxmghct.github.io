---
layout: post
title:  mybatis-plus对列表中数据进行查询的性能比较
date:   2023-04-21 19:56:00 +0800
categories: 技术探索
tags: mybatis
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17354547.html](https://www.cnblogs.com/lxm-cnblog/p/17354547.html)
现在转移到 github pages 上。

使用循环的方式对列表中的数据进行数据库查询肯定要比一次性查询要慢。为了验证一下，所以测试一下二者的性能。

## 测试代码
共准备了以下几个测试代码：
1. 空白对照
```java
public List<User> test0() {
    return new ArrayList<>();
}
```
2. for循环遍历
```java
public List<User> test1(@RequestBody List<Integer> ids) {
    List<User> list = new ArrayList<>();
    for (Integer id : ids) {
        list.add(userService.getById(id));
    }
    return list;
}
```
3. listByIds
```java
public List<User> test2(@RequestBody List<Integer> ids) {
    return userService.listByIds(ids);
}
```
4. mapper中的foreach
```java
// controller
public List<User> test3(@RequestBody List<Integer> ids) {
    return userService.selectByIds(ids);
}
// mapper
@Select("<script>" +
            "select * from user where id in " +
                "<foreach collection='list' item='item' open='(' separator=',' close=')'>" +
                    "#{item}" +
                "</foreach>" +
        "</script>")
List<User> selectByIds(@Param("list") List<Integer> ids);
```

## 测试结果
n为ids的长度，使用postman发送请求，各接口响应时间如下：

| n | test0 | test1 | test2 | test3 |
| --- | :-: | :-: | :-: | :-: |
| 1 | 214ms | 260ms | 260ms | 260ms |
| 2 | 214ms | 302ms | 260ms | 260ms |
| 10 | 214ms | 655ms | 260ms | 260ms |
| 40 | 214ms | 2.08s | 260ms | 260ms |
| 240 | 214ms | 10.71s | 261ms | 261ms |
| 1000 | 214ms | - | 267ms | 267ms |

## 测试结论
空白对照基本可以看做除去数据库查询以外的其他时间，减去这段时间后，可以看出本次实验环境下一次数据库查询的时间大概为40ms左右。使用mybatis的listByIds和foreach的时间基本相同，因为无论n为多少，都只会执行一次数据库查询。而使用for循环反复创建数据库连接的开销太大。
