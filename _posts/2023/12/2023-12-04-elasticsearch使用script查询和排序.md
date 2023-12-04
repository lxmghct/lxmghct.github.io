---
layout: post
title:  elasticsearch使用script查询和排序
date:   2023-12-04 12:00:00 +0800
categories: 编程随笔 学习笔记
tags: elasticsearch
---

## 使用script作为排序条件

比如某个用户查询书籍，然后想把这个用户购买的书籍排在前面，那么就没法直接对某个字段进行排序。我想到的方案是先查询出用户购买的所有书籍id，然后使用脚本排序，把用户购买的书籍id放在前面。


`GET /book/_search`
```json
{
  "track_total_hits": true,
  "query": {
    "match": {
      "bookName": "本草"
    }
  },

  "sort": {
    "_script": {
      "type": "number",
      "script": {
        "lang": "painless",
        // "source": "if (params['id_set'].contains(params['_source']['id'])) { return 0 } else { return 1 }",
        // "source": "if (['12345'].contains(doc['id'].value)) { return 0 } else { return 1 }",
        "source": "if (doc['id'].size() > 0 && params.id_set.contains(doc['id'].value)) return 0; else return 1;",
        "params": {
          "id_set": ["12345", "12346"]
        }
      },
      "order": "asc"
    }
  },
  "size": 100
}

```

springboot中的代码如下：
```java
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.script.ScriptType;
import java.util.*;

SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

String scriptContent = "if (doc['id'].size() > 0 && params.bookIdList.contains(doc['id'].value)) return 0; else return 1;";

Script script = new Script(ScriptType.INLINE, "painless", scriptContent, Collections.singletonMap("bookIdList", bookIdList));

searchSourceBuilder.sort(SortBuilders.scriptSort(script, ScriptSortBuilder.ScriptSortType.NUMBER).order(SortOrder.ASC));
```

## 使用script作为查询条件

如果要用 script 来作为查询条件，可以按照上面类似的方法，只是把 script 放在 query 下面。

`GET /book/_search`
```json
{
  "track_total_hits": true,
  "query": {
    "script": {
      "script": {
        "lang": "painless",
        "source": "params['id_set'].contains(doc['id'].value)",
        "params": {
          "id_set": ["12345", "12346"]
        }
      }
    }
  },
  "size": 100
}
```

对应的springboot代码如下：
```java
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.script.ScriptType;
import java.util.*;

SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

String scriptContent = "params['id_set'].contains(doc['id'].value)";

Script script = new Script(ScriptType.INLINE, "painless", scriptContent, Collections.singletonMap("id_set", bookIdList));

searchSourceBuilder.query(QueryBuilders.scriptQuery(script));
```

## 使用script作为查询返回的字段

有时候需要返回的字段并不是索引中的字段，而是根据索引中的字段计算出来的，这时候可以使用 script_fields 来实现。

`GET /book/_search`
```json
{
  "track_total_hits": true,
  "query": {
    "bool": {
      "must": [
        {
          "nested": {
            "path": "text",
            "query": {
              "match": {
                "text.text": "测试"
              }
            }
          }
        }
      ]
    }
  },
  "_source": false,
  "script_fields": {
    "text_text": {
      "script": {
        "lang": "painless",
        "source": "params['_source']['text'].stream().filter(t -> t.get(\"text\").contains(params.searchContent)).map(t->t.get(\"text\")).collect(Collectors.toList())",
        "params": {
          "searchContent": "测试"
        }
      }
    },
    "text_keyword": {
      "script": {
        "lang": "painless",
        "source": "params['_source']['text'].stream().filter(t -> t.get(\"keyword\").contains(params.searchContent)).map(t->t.get(\"keyword\")).collect(Collectors.toList())",
        "params": {
          "searchContent": "测试"
        }
      }
    },
    "directory": {
      "script": {
        "lang": "painless",
        "source": "params['_source']['directory'].stream().filter(t -> t.get(\"name\").contains(params.searchContent)).map(t->t.get(\"name\")).collect(Collectors.toList())",
        "params": {
          "searchContent": ""
        }
      }
    }
  }
}
```

springboot代码如下：
```java
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.script.ScriptType;
import java.util.*;

SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
Script script1 = new Script(ScriptType.INLINE, "painless",
                   "params['_source']['text'].stream().filter(t -> {String w = t.get(\"text\");return w != null && w.contains(params.searchContent);}).map(t->t.get(\"text\")).collect(Collectors.toList())",
                    Collections.singletonMap("searchContent", "测试"));
searchSourceBuilder.scriptField("text_text", script1);
```
