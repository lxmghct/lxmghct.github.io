---
layout: post
title: mvn package时报错：jar中没有主清单属性
date: 2024-04-19 11:00:00 +0800
categories: 编程随笔
tags: maven
---

解决方法：在 pom.xml 中添加 spring-boot-maven-plugin 插件。

```xml
<plugins>
    <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
    </plugin>
</plugins>
```
