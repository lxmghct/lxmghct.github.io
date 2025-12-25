---
layout: post
title: spring boot项目多配置文件无法启动问题
date: 2025-12-25 18:00:00 +0800
categories: troubleshooting
tags: java spring-boot
---

我在运行spring boot项目报了下面的错:

```
我在运行spring boot项目报了下面的错，该项目曾经是我开发的，不过我已经离开一年，现在回来运行不了了，架构几乎没有变化，数据库密码也是对的。请问可能是什么原因？

Error starting ApplicationContext. To display the conditions report re-run your application with 'debug' enabled.
2025-12-29 13:56:33.650 ERROR --- [ restartedMain] org.springframework.boot.SpringApplication : Application run failed
org.springframework.context.ApplicationContextException: Unable to start web server; nested exception is org.springframework.boot.web.server.WebServerException: Unable to start embedded Tomcat
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:156)
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:543)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:141)
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:743)
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:390)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:312)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1214)
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1203)
	at com.hc.display.DisplayApplication.main(DisplayApplication.java:21)
	at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
	at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
	at java.lang.reflect.Method.invoke(Method.java:498)
	at org.springframework.boot.devtools.restart.RestartLauncher.run(RestartLauncher.java:49)
Caused by: org.springframework.boot.web.server.WebServerException: Unable to start embedded Tomcat
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:124)
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.<init>(TomcatWebServer.java:86)
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getTomcatWebServer(TomcatServletWebServerFactory.java:416)
	at org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory.getWebServer(TomcatServletWebServerFactory.java:180)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.createWebServer(ServletWebServerApplicationContext.java:180)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.onRefresh(ServletWebServerApplicationContext.java:153)
	... 13 common frames omitted
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'servletEndpointRegistrar' defined in class path resource [org/springframework/boot/actuate/autoconfigure/endpoint/web/ServletEndpointManagementContextConfiguration$WebMvcServletEndpointManagementContextConfiguration.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.boot.actuate.endpoint.web.ServletEndpointRegistrar]: Factory method 'servletEndpointRegistrar' threw exception; nested exception is org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'healthEndpoint' defined in class path resource [org/springframework/boot/actuate/autoconfigure/health/HealthEndpointConfiguration.class]: Unsatisfied dependency expressed through method 'healthEndpoint' parameter 1; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'healthIndicatorRegistry' defined in class path resource [org/springframework/boot/actuate/autoconfigure/health/HealthIndicatorAutoConfiguration.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.boot.actuate.health.HealthIndicatorRegistry]: Factory method 'healthIndicatorRegistry' threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'dbHealthIndicator' defined in class path resource [org/springframework/boot/actuate/autoconfigure/jdbc/DataSourceHealthIndicatorAutoConfiguration.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [org.springframework.boot.actuate.health.HealthIndicator]: Factory method 'dbHealthIndicator' threw exception; nested exception is org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'scopedTarget.dataSource' defined in class path resource [org/springframework/boot/autoconfigure/jdbc/DataSourceConfiguration$Hikari.class]: Bean instantiation via factory method failed; nested exception is org.springframework.beans.BeanInstantiationException: Failed to instantiate [com.zaxxer.hikari.HikariDataSource]: Factory method 'dataSource' threw exception; nested exception is java.lang.IllegalStateException: Cannot load driver class: org.mariadb.jdbc.Driver
	at org.springframework.beans.factory.support.ConstructorResolver.instantiate(ConstructorResolver.java:627)
	at org.springframework.beans.factory.support.ConstructorResolver.instantiateUsingFactoryMethod(ConstructorResolver.java:607)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.instantiateUsingFactoryMethod(AbstractAutowireCapableBeanFactory.java:1321)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBeanInstance(AbstractAutowireCapableBeanFactory.java:1160)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:555)
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:515)
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:320)
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:222)
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:318)
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.getOrderedBeansOfType(ServletContextInitializerBeans.java:211)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.getOrderedBeansOfType(ServletContextInitializerBeans.java:202)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.addServletContextInitializerBeans(ServletContextInitializerBeans.java:96)
	at org.springframework.boot.web.servlet.ServletContextInitializerBeans.<init>(ServletContextInitializerBeans.java:85)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.getServletContextInitializerBeans(ServletWebServerApplicationContext.java:253)
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.selfInitialize(ServletWebServerApplicationContext.java:227)
	at org.springframework.boot.web.embedded.tomcat.TomcatStarter.onStartup(TomcatStarter.java:53)
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5132)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1384)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1374)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75)
	at java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:134)
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:909)
	at org.apache.catalina.core.StandardHost.startInternal(StandardHost.java:841)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1384)
	at org.apache.catalina.core.ContainerBase$StartChild.call(ContainerBase.java:1374)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at org.apache.tomcat.util.threads.InlineExecutorService.execute(InlineExecutorService.java:75)
	at java.util.concurrent.AbstractExecutorService.submit(AbstractExecutorService.java:134)
	at org.apache.catalina.core.ContainerBase.startInternal(ContainerBase.java:909)
	at org.apache.catalina.core.StandardEngine.startInternal(StandardEngine.java:262)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
	at org.apache.catalina.core.StandardService.startInternal(StandardService.java:421)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
	at org.apache.catalina.core.StandardServer.startInternal(StandardServer.java:932)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
	at org.apache.catalina.startup.Tomcat.start(Tomcat.java:456)
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.initialize(TomcatWebServer.java:105)
	... 18 common frames omitted
```

尝试了下面方案：

1. 检查依赖，发现 `C:\Users\用户名\.m2\repository\` 中是存在 `mariadb`这个依赖的。
2. 移除 `.idea` 目录，重新加载项目，问题依旧。
3. idea清除缓存，问题依旧。


**最终解决方案**：

由于我在项目的`pom.xml`中存在配置文件切换操作。

根目录的`pom.xml`中有如下配置：
```xml

    <profiles>

        <profile>
            <id>prod-mariadb</id>
            <properties>
                <profileActive>prod-mariadb</profileActive>
                <projectEnv>prod</projectEnv>
                <spring.datasource.driver-class-name>org.mariadb.jdbc.Driver</spring.datasource.driver-class-name>
                <spring.datasource.url>jdbc:mariadb://localhost:3306/honest_culture?useUnicode=true&amp;characterEncoding=utf-8</spring.datasource.url>
                <spring.datasource.username>root</spring.datasource.username>
                <spring.datasource.password>root-password</spring.datasource.password>
            </properties>
        </profile>

        <profile>
            <id>prod-dm</id>
            <properties>
                <profileActive>prod-dm</profileActive>
                <projectEnv>prod</projectEnv>
                <spring.datasource.driver-class-name>dm.jdbc.driver.DmDriver</spring.datasource.driver-class-name>
                <spring.datasource.url>jdbc:dm://localhost:5236?schema=""honest_culture""&amp;clobAsString=1</spring.datasource.url>
                <spring.datasource.username>SYSDBA</spring.datasource.username>
                <spring.datasource.password>SYSDBA</spring.datasource.password>
            </properties>
        </profile>
    </profiles>
```

子目录的`pom.xml`：
```xml
    <profiles>
        <profile>
            <id>prod-mariadb</id>
            <dependencies>
                <dependency>
                    <groupId>org.mariadb.jdbc</groupId>
                    <artifactId>mariadb-java-client</artifactId>
                </dependency>
            </dependencies>
        </profile>

        <profile>
            <id>prod-dm</id>
            <dependencies>
                <dependency>
                    <groupId>com.dameng</groupId>
                    <artifactId>DmJdbcDriver18</artifactId>
                </dependency>
            </dependencies>
        </profile>
    </profiles>
```

最终通过两次切换maven配置文件并重新加载项目，问题解决。
