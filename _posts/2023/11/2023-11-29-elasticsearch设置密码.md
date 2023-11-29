---
layout: post
title:  elasticsearch设置密码
date:   2023-11-29 14:30:00 +0800
categories: 编程随笔
tags: elasticsearch
---

## 1. 设置密码
进入`elasticsearch`的安装目录，打开config目录下的`elasticsearch.yml`文件，添加如下配置：
```yaml
xpack.security.enabled: true
```

进入bin目录，启动`elasticsearch`:
```shell
./elasticsearch
```
设置密码：
```shell
./elasticsearch-setup-passwords interactive
```

## 2. 修改密码
修改密码：
```shell
curl -X POST -u elastic:old_password -H "Content-Type: application/json" http://localhost:9200/_security/user/elastic/_password -d "{\"password\":\"new_password\"}"
```
如果忘记密码，可以通过以下方式重置密码：
```shell
# 重置密码，系统会生成一个密码
./elasticsearch-reset-password -u elastic
# 交互式重置密码，自己输入新密码
./elasticsearch-reset-password -u elastic -i
```

## 3. 在spring boot中使用
在`application.yml`中添加任意配置：
```yaml
elasticsearch:
  host: localhost
  port: 9200
  username: elastic
  password: elastic-password
```
使用`CredentialsProvider`设置用户名和密码：
```java
package com.mb.retrieval.utils;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Component
public class EsClientUtils {

    @Value("${elasticsearch.host}")
    private String esHost;

    @Value("${elasticsearch.port}")
    private int esPort;

    @Value("${elasticsearch.username}")
    private String esUsername;

    @Value("${elasticsearch.password}")
    private String esPassword;

    private static EsClientUtils esClientUtils;

    @PostConstruct
    public void init() {
        esClientUtils = this;
    }

    public static RestHighLevelClient getEsClient() {
        RestHighLevelClient client = null;
        try {
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(esClientUtils.esUsername, esClientUtils.esPassword));
            client = new RestHighLevelClient(RestClient.builder(
                    new HttpHost(esClientUtils.esHost, esClientUtils.esPort, "http")
            ).setHttpClientConfigCallback(
                    httpClientBuilder -> httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider))
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
        return client;
    }

}

```
