---
layout: post
title: 使用RestTemplate转发请求
date: 2024-03-15 21:00:00 +0800
categories: 编程随笔
tags: spring
---

我想自己实现一个简单的网关，用于转发请求。由于在项目中已经使用了`spring-boot-start-web`，此时如果再加入`spring-cloud-gateway`，会导致很多问题，所以我打算自己写一个简单的网关用于转发请求。

```java
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.net.URI;
import java.util.*;

@RestController
@ApiIgnore
public class RouterController {

    @RequestMapping(value = "/test/**")
    public void forwardNeo4jRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String forwardUrl = "http://localhost:8088/" + request.getRequestURI().substring(7);
        forwardRequest(forwardUrl, request, response);
    }

    private void forwardRequest(String forwardUrl, HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 获取请求方法
        HttpMethod httpMethod = HttpMethod.resolve(request.getMethod());
        if (httpMethod == null) {
            throw new IllegalArgumentException("Invalid HTTP method: " + request.getMethod());
        }
        // 获取header
        Enumeration<String> headerNames = request.getHeaderNames();
        HttpHeaders headers = new HttpHeaders();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            headers.add(headerName, headerValue);
        }
        // 获取请求体
        BufferedReader reader = request.getReader();
        StringBuilder requestBody = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            requestBody.append(line);
        }
        // 获取请求参数
        Map<String, String[]> parameterMap = request.getParameterMap();
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            String[] list = entry.getValue();
            for (String s : list) {
                params.add(entry.getKey(), s);
            }
        }
        // 构建uri
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(forwardUrl);
        if (params.size() > 0) {
            builder.queryParams(params);
        }
        URI uri = builder.build().encode().toUri();
        // 构建请求实体
        RequestEntity<?> requestEntity;
        requestEntity = new RequestEntity<>(requestBody.toString(), headers, httpMethod, uri);
        // 发送请求
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> responseEntity = restTemplate.exchange(requestEntity, String.class);
        // 设置响应
        response.setCharacterEncoding("UTF-8");
        response.setStatus(responseEntity.getStatusCodeValue());
        response.setContentType(Objects.requireNonNull(responseEntity.getHeaders().getContentType()).toString());
        response.getWriter().write(Objects.requireNonNull(responseEntity.getBody()));
    }
}
```

使用`/test/**`来匹配 test 开头的请求，然后将请求转发到`http://localhost:8088/`。转发的过程中，需要将请求方法、请求头、请求体、请求参数都转发过去。
