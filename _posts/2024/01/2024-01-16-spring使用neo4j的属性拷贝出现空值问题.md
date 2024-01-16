---
layout: post
title:  spring使用neo4j的属性拷贝出现空值问题
date:   2024-01-16 20:00:00 +0800
categories: 编程随笔
tags: neo4j spring
---

我有一个需求是把某个 map 类型的所有 key-value 都赋值给某一个节点，但是要忽略 map 中的某几个字段。neo4j 官方文档有对 map 类型的数据相关操作进行说明：

[https://neo4j.com/docs/cypher-manual/current/values-and-types/maps/](https://neo4j.com/docs/cypher-manual/current/values-and-types/maps/)

参考上面的文档，我打算使用`map{.*, key1: null, key2: null}`的方式来实现，具体的 cypher 语句如下：

```cypher
MERGE (n:Attribute {nodeId: $attr.nodeId})
ON CREATE SET n += $attr{.*, children: null}
```

一般情况这种方法可以实现。但在使用时发现该节点的其他字段也被设置为了 null，因为该 map 的某些字段确实是 null。这样就会导致 neo4j 返回的节点对象中，该节点的其他字段也被设置为了 null。

一个解决方法是定义一个类来存储 map 中的字段，然后使用`com.fasterxml.jackson.annotation.JsonInclude`注解来忽略 null 值。

```java
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Attribute {
    private Long nodeId;
    private String name;
    private String value;
    private String children;
    // getter and setter
}
```
