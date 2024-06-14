---
layout: post
title: neo4j报错Property values can only be of primitive types or arrays thereof
date: 2024-06-14 19:30:00 +0800
categories: 编程随笔
tags: neo4j
---

报错内容："Property values can only be of primitive types or arrays thereof"

报错代码如下：
```java
@Query("UNWIND {auditNodes} AS auditNode " +
        "MERGE (n:Audit:BaseNode {nodeId: auditNode.nodeId}) " +
        "ON CREATE SET n = auditNode " +
        "ON MATCH SET n += auditNode{.*, createTime: n.createTime, createBy: n.createBy, editors: n.editors} " +
        "WITH n " +
        "SET n.editors = CASE WHEN n.editors IS NULL THEN [{userId}] ELSE " +
        "CASE WHEN NOT {userId} IN n.editors THEN n.editors + {userId} ELSE n.editors END END")
void saveAuditNodes(List<AuditNode> auditNodes, Integer userId);
```

原因：neo4j 中不支持直接将含`NULL`的数组赋值给属性，上述代码中`userId`可能为`NULL`，所以会报错。

解决方案：在进入查询前先对`userId`进行判空处理，或者在查询语句中将`[{userId}]` 改为 `[] + {userId}`，这种情况下`userId`为`NULL`时，该赋值语句会被忽略。即使列表中有内容比如`[1,2,3] + NULL`，也会被忽略（该语句完全不执行，1,2,3也不会被添加到列表中）。
