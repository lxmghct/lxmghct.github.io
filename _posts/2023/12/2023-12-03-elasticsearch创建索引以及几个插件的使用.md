---
layout: post
title:  elasticsearch创建索引以及几个插件的使用
date:   2023-12-03 09:30:00 +0800
categories: 编程随笔
tags: elasticsearch
---
记录一下在使用elasticsearch时创建索引的配置，以及几个插件的使用。

## 1. 简繁体转换插件
用于简体和繁体之间的转换  
[https://github.com/medcl/elasticsearch-analysis-stconvert/releases](https://github.com/medcl/elasticsearch-analysis-stconvert/releases)

## 2. 拼音分词插件
用于使用拼音进行搜索  
[https://github.com/infinilabs/analysis-pinyin/releases](https://github.com/infinilabs/analysis-pinyin/releases)

## 3. ik分词插件
用于中文分词  
[https://github.com/infinilabs/analysis-ik/releases](https://github.com/infinilabs/analysis-ik/releases)

## 4. analysis-hao分词插件
用于中文分词  
[https://github.com/tenlee2012/elasticsearch-analysis-hao](https://github.com/tenlee2012/elasticsearch-analysis-hao)

## 5. icu_collation_keyword
用于中文排序  
[https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html](https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-icu.html)

## 6. 创建索引

```json
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "search_analyzer": {
            "filter": ["lowercase"],
            "char_filter": ["tsconvert"],
            "type": "custom",
            "tokenizer": "my_search_token"
          },
          "index_analyzer": {
            "filter": ["lowercase"],
            "char_filter": ["tsconvert"],
            "type": "custom",
            "tokenizer": "my_index_token"
          },
          "ik_analyzer": {
            "char_filter": ["tsconvert"],
            "type": "custom",
            "tokenizer": "ik_max_word"
          }
        },
        "char_filter": {
          "tsconvert": {
            "type": "stconvert",
            "convert_type": "t2s",
            "keep_both": true
          }
        },
        "tokenizer": {
          "my_index_token": {
            "enableFailDingMsg": "true",
            "type": "hao_index_mode",
            "enableSingleWord": "true",
            "enableFallBack": "true",
            "autoWordLength": 3
          },
          "my_search_token": {
            "enableFailDingMsg": "true",
            "type": "hao_search_mode",
            "enableSingleWord": "true",
            "enableFallBack": "true",
            "autoWordLength": 3
          }
        }
      },
      "number_of_replicas": "0"
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": {
        "type": "keyword"
      },
      "bookName": {
        "type": "text",
        "analyzer": "index_analyzer",
        "search_analyzer": "search_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "sort": {
            "type": "icu_collation_keyword",
            "index": false,
            "language": "zh",
            "country": "CN"
          }
        }
      },
      "isFree": {
        "type": "long"
      },
      "createTime": {
        "type": "keyword"
      },
      "subLibraryId": {
        "type": "long"
      },
      "classification": {
        "type": "text",
        "analyzer": "ik_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "sort": {
            "type": "icu_collation_keyword",
            "index": false,
            "language": "zh",
            "country": "CN"
          }
        }
      },
      "author": {
        "type": "text",
        "analyzer": "ik_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          },
          "sort": {
            "type": "icu_collation_keyword",
            "index": false,
            "language": "zh",
            "country": "CN"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "ik_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "completionTime": {
        "type": "integer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "subLibrary": {
        "type": "text",
        "analyzer": "ik_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "directory": {
        "type": "nested",
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "text",
            "analyzer": "ik_analyzer"
          },
          "parentId": {
            "type": "integer"
          },
          "pageId": {
            "type": "integer"
          }
        }
      },
      "text": {
        "type": "nested",
        "properties": {
          "page": {
            "type": "integer"
          },
          "keyword": {
            "type": "text",
            "analyzer": "ik_analyzer",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "text": {
            "analyzer": "ik_analyzer",
            "type": "text",
            "fields": {
              "keyword": {
                "type": "keyword",
                "ignore_above": 256
              }
            }
          },
          "directoryId": {
            "type": "integer"
          },
          "originPath": {
            "type": "keyword"
          },
          "pdfPath": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

```
