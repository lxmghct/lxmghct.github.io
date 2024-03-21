---
layout: post
title: spring禁用security
date: 2024-03-21 19:00:00 +0800
categories: 编程随笔
tags: spring security
---

在spring boot项目中，如果引入了`spring-boot-starter-security`依赖，会默认启用security。有时候调试的时候不想启用security，可以在启动类上加上`@SpringBootApplication(exclude = {SecurityAutoConfiguration.class, ManagementWebSecurityAutoConfiguration.class})`注解禁用security。
