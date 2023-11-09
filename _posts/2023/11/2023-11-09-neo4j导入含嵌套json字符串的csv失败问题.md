---
layout: post
title:  neo4j导入含嵌套json字符串的csv失败问题
date:   2023-11-09 11:00:00 +0800
categories: 编程随笔
tags: neo4j python
---

## 1. 问题描述
我在 neo4j 使用`LOAD CSV`导入数据时，报了下面的一个错:
```
At C:\Users\Administrator\Desktop\HonestCulture\neo4j-community-3.5.35\import\article_node.csv @ position 279 -  there's a field starting with a quote and whereas it ends that quote there seems to be characters in that field after that ending quote. That isn't supported. This is what I read: '{"note": "", "sentenseTranslation": "[{""原""[{\""原'
```
可以从官网上找到这个报错的原因 [https://neo4j.com/developer/kb/parsing-of-quotes-for-load-csv-and-or-import/](https://neo4j.com/developer/kb/parsing-of-quotes-for-load-csv-and-or-import/)，大概就是说 csv 文件中的字符串如果包含引号，需要用两个引号来转义。

csv 文件内容如下:
```csv
nodeId,title,annotation
1,标题1,"{""note"": """", ""sentenseTranslation"": [{\""原文"": \""测试数据\"", \""译文\"": \""测试数据\""}], ""knowledgePoint"": []}"
```
可以看到上面的`annotation`字段中包含了 json 字符串，而该 json 字符串中又因为嵌套了一个 json 字符串，内层 json 字符串中的引号被转义了两次，先转义成`\"`，再转义成`\"\"`，所以导致了这个问题。

## 2. 解决方案
该 csv 文件是通过 python 生成的，而在读取数据时，其中的 `sentenceTranslation` 字段使用了 `json.dumps` 方法，然后在生成 `annotation` 字段时，又再次使用了 `json.dumps` 方法，所以导致了这个问题。

解决方法有两个，最简单的方式就是内层的 json 字符串不要使用 `json.dumps` 方法，保留原始的字典格式，仅在最外层使用 `json.dumps` 方法即可。

```python
sentenceTranslation = [{"原文": "测试数据", "译文": "测试数据"}]
annotation = {
    "note": "",
    "sentenseTranslation": sentenceTranslation,
    "knowledgePoint": []
}
print(json.dumps(annotation))
```
此时得到的 csv 文件内容如下:
```csv
nodeId,title,annotation
1,标题1,"{""note"": """", ""sentenseTranslation"": [{""原文"": ""测试数据"", ""译文"": ""测试数据""}], ""knowledgePoint"": []}"
```

如果数据过于复杂，不便于对内层的 json 字符串进行处理，可以在两次转义之后处理一下转义字符。

```python
sentenceTranslation = json.dumps([{"原文": "测试数据", "译文": "测试数据"}], ensure_ascii=False)
annotation = json.dumps({
    "note": "",
    "sentenseTranslation": sentenceTranslation,
    "knowledgePoint": []
})
annotation = annotation.replace('\\"', '"')
print(annotation)
```
