---
layout: post
title:  swagger2的apimodel错乱问题
date:   2024-01-14 17:00:00 +0800
categories: 编程随笔
tags: swagger
---

我在使用 swagger2 时，遇到了一个问题：A 类中有一个内部类 B，C 类中有一个内部类 D，而 B 和 D 的类名是相同的，两个内部类都使用了`@io.swagger.annotations.ApiModel`注解，但是在 swagger-ui 中，B 或 D 其中一个类会被显示为另一个类的属性，即使修改了`ApiModel`的`value`和`description`属性也无效。

目前除了避免类名重复，暂时没有找到其他解决方式。
