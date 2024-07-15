---
layout: post
title: nginx配置proxy_pass时出现no live upstreams while connecting to upstream
date: 2024-07-15 14:00:00 +0800
categories: 编程随笔
tags: nginx
---

## 1. 问题描述
在 nginx 配置文件中有如下配置项:
```conf
    location /api {
        proxy_pass    http://localhost:8090;
    }
```
前端访问 `/api` 时，有时候能正常访问，但有时候会出现 `502 Bad Gateway` 错误，查看 nginx 日志发现如下错误:
```
no live upstreams while connecting to upstream
```

已确认过8090端口的服务是正常的，但是 nginx 有时候会出现这个错误。

## 2. 解决方法
参考[https://stackoverflow.com/questions/49767001/how-to-solve-nginx-no-live-upstreams-while-connecting-to-upstream-client](https://stackoverflow.com/questions/49767001/how-to-solve-nginx-no-live-upstreams-while-connecting-to-upstream-client)

将 `proxy_pass` 中的`localhost`改为`127.0.0.1`即可解决问题。原因暂未深入研究。

根据 stackoverflow 上的回答来看，当在proxy_pass中使用localhost时，Nginx会依赖操作系统的DNS解析机制来解析这个主机名。localhost在不同的环境下可能解析为IPv4地址（127.0.0.1）或者IPv6地址（::1）。这取决于系统的DNS配置和优先级设置。当localhost解析为::1（IPv6地址）时，如果Nginx配置或后端服务没有正确处理IPv6请求或者绑定到IPv6端口，可能会导致连接失败。所以改成`127.0.0.1`可以让Nginx总是使用IPv4地址。
