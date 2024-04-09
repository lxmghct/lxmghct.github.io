---
layout: post
title: spring boot使用feign请求在接收返回的数据时报错问题
date: 2024-04-09 16:30:00 +0800
categories: 编程随笔
tags: spring
---

我在 spring boot 项目中使用 feign 请求在另一个系统中创建用户时，用户成功创建，并且在 return 语句前都没有问题，但是在接收返回的数据时报错了。错误信息如下：

```
feign.RetryableException: Incomplete output stream executing POST http://localhost:8094/user/batchCreateUser
	at feign.FeignException.errorExecuting(FeignException.java:213)
	at feign.SynchronousMethodHandler.executeAndDecode(SynchronousMethodHandler.java:115)
	at feign.SynchronousMethodHandler.invoke(SynchronousMethodHandler.java:80)
	at feign.ReflectiveFeign$FeignInvocationHandler.invoke(ReflectiveFeign.java:103)
	at com.sun.proxy.$Proxy157.batchCreateUser(Unknown Source)
	at com.hc.display.controller.UserManageController.createAnnotationUser(UserManageController.java:226)
	at com.hc.display.controller.UserManageController.addOneUser(UserManageController.java:53)
	at com.hc.display.controller.UserManageController$$FastClassBySpringCGLIB$$43114b6c.invoke(<generated>)
	at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:218)
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:749)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:163)
	at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:295)
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:98)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:186)
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:688)
	at com.hc.display.controller.UserManageController$$EnhancerBySpringCGLIB$$a254db94.addOneUser(<generated>)
```

其中批量创建用户的代码如下：

```java
/**
 * 批量创建用户
 *
 * @param users 用户信息列表
 */
@PostMapping("/batchCreateUser")
public ResponseVO<String> batchCreateUser(@RequestBody List<UserCreateDTO> users) {
    List<UserNode> userNodes = new ArrayList<>();
    for (UserCreateDTO user : users) {
        userNodes.add(new UserNode(user.getUserId(), user.getUserName()));
    }
    userNodeService.batchCreateUser(userNodes);
    return ResponseVO.success();
}
```

其中的 UserCreateDTO 定义如下：
```java
@ApiModel("UserCreateDTO")
public class UserCreateDTO {
    @ApiParam(value = "用户userId(用户在MySQL中的id)", required = true)
    private Integer userId;
    @ApiParam(value = "用户名", required = true)
    private String userName;
    public Integer getUserId() {
        return userId;
    }
    public String getUserName() {
        return userName;
    }
}
```

feign 的配置类如下：

```java
@Component
@FeignClient(name = "annotation", url = "http://localhost:8094")
public interface AnnotationInterfaces {

    @PostMapping(value = "/user/batchCreateUser", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseVO<String> batchCreateUser(@RequestBody List<?> users);
}
```
返回值类型的 ResponseVO 在两个系统中都是相同的。而且其他的 feign 接口也是用了 ResponseVO 作为返回值类型，也没有问题。经过多次尝试发现，只有当传递的参数使用了`@RequestBody`注解时，才会出现这个问题。而且在另一个系统中，用户已经创建成功了，只是返回值的问题。见[https://github.com/spring-cloud/spring-cloud-openfeign/issues/228](https://github.com/spring-cloud/spring-cloud-openfeign/issues/228)

找到了一篇类似的文章：[https://blog.csdn.net/Thinkingcao/article/details/109161139](https://blog.csdn.net/Thinkingcao/article/details/109161139)，提到使用Apache HttpClient替换Feign原生httpclient，但是没有成功。

最后这个问题的原因也没有找到，而我采取的方式是忽略这个错误，因为用户已经创建成功了，只是返回值的问题。如果有人知道这个问题的原因，欢迎留言告诉我。

```java
try {
    annotationInterfaces.batchCreateUser(annoUserList);
} catch (RetryableException e) {
    if (!e.getMessage().startsWith("Incomplete output stream executing POST")) {
        e.printStackTrace();
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
        return ResponseVO.error("无法连接标注系统后台，无法在标注系统中创建用户");
    }
}
```
把这个错误单独处理，不影响用户的使用。
