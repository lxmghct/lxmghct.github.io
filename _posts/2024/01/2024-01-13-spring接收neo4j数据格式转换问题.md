---
layout: post
title:  spring接收neo4j数据格式转换问题
date:   2024-01-13 18:30:00 +0800
categories: 编程随笔
tags: spring neo4j
---

我在使用 spring-data-neo4j 时，写了下面的查询语句：

```java
@Query("UNWIND {labelIdList} AS labelId\n" +
        "MATCH (n:BaseNode:Label {nodeId: labelId})-[:INCLUDE](a:Attribute)\n" +
        "WITH n.nodeId AS labelId, COLLECT(a) AtempAttributeList\n" +
        "UNWIND tempAttributeList AS attribute\n" +
        "MATCH (attribute)-[:INCLUDE]->(sub:Attribute)\n" +
        "WITH labelId, attribute, COLLECT(sub) AS subList\n" +
        "WITH labelId, COLLECT({root: attribute, children: subList} AS attributeList\n" +
        "RETURN labelId, attributeList")
List<Map<String, Object>> getLabelAttributeList(List<Long> labelIdList);
```

以该查询语句为例，spring 在接收 neo4j 返回的数据时，一般返回的数据格式有以下几个规律：

## 1. 节点类型
如果 neo4j 中某个类型的节点已经在 spring 中用`@org.neo4j.ogm.annotation.NodeEntity`标注了，那么 spring 会自动将 neo4j 返回的节点数据转换为 spring 中的节点对象。而没有用`@NodeEntity`标注的节点，spring 会将其转换为`org.neo4j.driver.internal.InternalNode`对象。<br>
如果要把没使用`@NodeEntity`注解的`InternalNode`转换为 spring 中的节点对象，有好几种方式，这里以`org.apache.commons.beanutils.BeanUtils`为例（注意不是`org.springframework.beans.BeanUtils`）：

```xml
<!-- 引入 commons-beanutils 依赖 -->
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.9.3</version>
</dependency>
```

```java
InternalNode internalNode = (InternalNode) yourObject;
Map<String, Object> nodeProperties = new HashMap<>(internalNode.asMap());
YourClass yourClassInstance = new YourClass();
BeanUtils.populate(yourClassInstance, nodeProperties);
yourClassInstance.setGraphId(internalNode.id());
```

## 2. Map 类型
2. 而对于其他的类型，比如上面的`RETURN labelId, attributeList`和`COLLECT({root: attribute, children: subList}`，返回的类型会被自动转化为`UnmodifiableMap`，所以可以用`Map<String, Object>`来接收。注意这里的`UnmodifiableMap`是`java.util.Collections$UnmodifiableMap`，它是一个私有类，所以不能直接使用。而idea 自动补全的`UnmodifiableMap`一般都是其他包下的类，不能用来接收 neo4j 返回的数据。

## 3. 列表类型
如果返回的数据是一个列表，如果是最终用`RETURN`得到的列表，那么用`java.util.List`来接收没有任何问题。但如果是用`COLLECT`得到的列表，那么再用`List`来接收就会报错:
```
"message": "[Ljava.util.Collections$UnmodifiableMap; cannot be cast to java.util.List"
```
这是因为`COLLECT`得到的列表是一个数组，所以要用`T[]`来接收比如`Object[]`。

所以上面代码中，如果想获取`attributeList`，用`List<Map<String, Object>>`来接收就会报上面第三点的错误。正确的做法是用`Map<String, Object>[]`或者`Object[]`来接收：
```java
List<Map<String, Object>> list = getLabelAttributeList(labelIdList);
for (Map<String, Object> map : list) {
    Map<String, Object>[] attributeList = (Map<String, Object>[]) map.get("attributeList");
}
```
