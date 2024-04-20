---
layout: post
title: gateway转发请求时security缓存问题
date: 2024-04-20 23:00:00 +0800
categories: 技术探索
tags: security
---

## 1. 问题描述
我在使用Spring Cloud Gateway转发请求时，发现请求到下游服务时，Security的上下文并没有更新，导致请求的用户信息不正确。

例如: 连续以未登录和登录的状态请求同一个接口，会导致登录时的接口依旧获取不到用户信息，获取到的是未登录时的信息

原因是第一次请求时，Security过滤器拦截了请求，但请求的上下文被缓存了，第二次请求时，Security过滤器不再拦截，通过过滤器后，直接从缓存中获取了未登录时的上下文

## 2. 解决方法
给请求的url添加一个随机参数，这样每次请求的url都不一样，就不会从缓存中获取上下文了。以下是一个Gateway的过滤器示例，给请求的url添加了一个随机id参数。

```java
package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.UUID;

@Component
public class PreGatewayFilterFactory extends AbstractGatewayFilterFactory<PreGatewayFilterFactory.Config> {

    public PreGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpRequest.Builder builder = request.mutate();

            // 添加随机id，否则传递到下游服务的Security后会被缓存，同一个请求反复发送会导致后续Servlet上下文被缓存不会更新
            String url = request.getURI().toString();
            builder.uri(URI.create(url + (url.contains("?") ? "&" : "?") +
                    "random-id=" + UUID.randomUUID().toString().substring(0, 8)));
            // 其他逻辑
            // ...
            return chain.filter(exchange.mutate().request(builder.build()).build());
        };
    }

}
```
