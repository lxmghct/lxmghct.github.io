---
layout: post
title: spring gateway统一配置过滤器
date: 2024-04-21 23:30:00 +0800
categories: 开发日志
tags: spring
---

在使用spring gateway时，我想给每个转发的路由都添加几个过滤器，但是不想每个路由都添加一遍，所以想到了统一配置过滤器。

下面是application.yml配置文件的内容，由于在其他地方统一配置了过滤器，所以这里不需要再写filters字段。

```yml
spring:
  cloud:
    gateway:
      routes:
        - id: test
          uri: lb://test
          predicates:
              - Path=/api/test/**
        - id: user
          uri: lb://user
          predicates:
              - Path=/api/user/**
```


这里假定已经配置好了PreGatewayFilterFactory和PostGatewayFilterFactory两个过滤器：
```java
// filter/PreGatewayFilterFactory.java
public class PreGatewayFilterFactory extends AbstractGatewayFilterFactory<PreGatewayFilterFactory.Config> {
    // ...
}

// filter/PostGatewayFilterFactory.java
public class PostGatewayFilterFactory extends AbstractGatewayFilterFactory<PostGatewayFilterFactory.Config> {
    // ...
}
```


下面是统一配置过滤器的代码：
```java
// config/GatewayFilterConfig.java
import org.springframework.cloud.gateway.filter.FilterDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    private final RouteDefinitionLocator routeDefinitionLocator;

    public GatewayConfig(RouteDefinitionLocator routeDefinitionLocator) {
        this.routeDefinitionLocator = routeDefinitionLocator;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        // 获取所有在application.yml中配置的路由定义
        routeDefinitionLocator.getRouteDefinitions().subscribe(routeDefinition -> {
            // 为每个路由添加几个额外的过滤器
            routeDefinition.getFilters().add(new FilterDefinition("Pre"));
            routeDefinition.getFilters().add(new FilterDefinition("Post"));
            // 去掉路径中的前两个段
            routeDefinition.getFilters().add(new FilterDefinition("RewritePath=/(?<segment1>[^/]*)/(?<segment2>[^/]*)/(?<segment3>.*)$, /$\\{segment3}"));
        });
        return builder.routes().build();
    }
}
```

上述代码添加了Pre和Post两个过滤器，以及一个RewritePath过滤器，用来去掉路径中的前两个段。这样就可以在application.yml中配置路由，然后在GatewayConfig中统一添加过滤器。
