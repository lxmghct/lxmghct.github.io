---
layout: post
title:  spring实现elasticsearch的search after
date:   2023-12-04 16:00:00 +0800
categories: 编程随笔 学习笔记
tags: elasticsearch
---

## 简单实现

```java
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Test {

    /**
     * search after分页检索
     *
     * @param client              client
     * @param searchSourceBuilder searchSourceBuilder
     * @param pageNum             页码
     * @param pageSize            每页大小
     */
    public static List<SearchHit> searchAfter(RestHighLevelClient client, SearchSourceBuilder searchSourceBuilder, int pageNum, int pageSize) {
        searchSourceBuilder.size(pageSize);
        searchSourceBuilder.trackTotalHits(false);
        SearchRequest searchRequest = new SearchRequest("book");
        searchRequest.source(searchSourceBuilder);
        SearchHit[] searchHits = null;
        // 跳过前面的数据
        int totalCountOfSkip = (pageNum - 1) * pageSize;
        // 根据内存和性能的需求调整batchSize, 最大不超过10000
        int batchSize = 10000;
        while (totalCountOfSkip > 0) {
            searchSourceBuilder.size(Math.min(totalCountOfSkip, batchSize));
            totalCountOfSkip -= batchSize;
            try {
                SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
                searchHits = searchResponse.getHits().getHits();
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
            if (searchHits.length == 0) {
                break;
            }
            SearchHit lastHit = searchHits[searchHits.length - 1];
            searchSourceBuilder.searchAfter(lastHit.getSortValues());
        }
        searchSourceBuilder.size(pageSize);
        try {
            SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
            searchHits = searchResponse.getHits().getHits();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return searchHits == null ? null : Arrays.asList(searchHits);
    }

}

```

## 在项目中的实际使用

我有一个需求是要查找某个 nested 字段的总匹配条目数，数据量较大会超过 10000 条，所以用 search after 来分页查询（这里用 scroll 可能更好一些）。数据的格式是这样的：

```json
{
  "text": [
    {
      "text": "测试文本",
      "keyword": ["test1", "test2"]
    },
    {
      "text": "测试文本2",
      "keyword": ["test3", "test4"]
    }
  ]
}
```
需要查找所有`text.text`包含搜索关键字的条数和`text.keyword`包含搜索关键字的条数，这里用到了 script 来分别统计，并使用 search after来统计总数。

这里还有另外两个小的需求： 
1. 由于数据中的中文有简体和繁体，所以需要同时匹配简体和繁体，这里用到了`com.github.houbb.opencc4j.util.ZhConverterUtil`来转换简体和繁体。
2. 允许使用空格、加号、减号来分隔关键字，来表示与或非的关系，需要对搜索关键字中的这几个符号的格式做检查，并动态拼接 painless script。

```java
package com.mb.retrieval.utils;

import com.github.houbb.opencc4j.util.ZhConverterUtil;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.script.Script;
import org.elasticsearch.script.ScriptType;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortOrder;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class Test {

    /**
     * 获取匹配条数总数
     * @param directorySearchContent 目录标引搜索内容
     * @param textSearchContent 全文文本搜索内容
     * @param boolQueryBuilder boolQueryBuilder
     * @param client client
     */
    public static int getTotalCountOfMatchRecords(String directorySearchContent, String textSearchContent, BoolQueryBuilder boolQueryBuilder, RestHighLevelClient client) {
        String directoryPainlessScript = getPainlessScriptOfMatchCountSearch(directorySearchContent);
        String textPainlessScript = getPainlessScriptOfMatchCountSearch(textSearchContent);
        if (directoryPainlessScript == null && textPainlessScript == null) {
            return 0;
        }
        SearchRequest searchRequest = new SearchRequest("book");
        SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
        searchSourceBuilder.query(boolQueryBuilder).fetchSource(false).sort("id", SortOrder.ASC);
        if (textPainlessScript != null) {
            Script script1 = new Script(ScriptType.INLINE, "painless",
                    "params['_source']['text'].stream().filter(t -> {String w = t.get(\"text\");return " + textPainlessScript + ";}).count()",
                    new HashMap<>());
            searchSourceBuilder.scriptField("text_text", script1);
        }
        if (directoryPainlessScript != null) {
            Script script2 = new Script(ScriptType.INLINE, "painless",
                    "params['_source']['text'].stream().filter(t -> t.get(\"keyword\").stream().anyMatch(w -> " + directoryPainlessScript + ")).count()",
                    new HashMap<>());
            searchSourceBuilder.scriptField("text_keyword", script2);
        }
        int batchSize = 10000;
        searchSourceBuilder.size(batchSize);
        searchRequest.source(searchSourceBuilder);
        try {
            int total = 0;
            while (true) {
                SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);
                SearchHit[] searchHits = searchResponse.getHits().getHits();
                for (SearchHit hit : searchHits) {
                    total += textPainlessScript != null ? (int) hit.getFields().get("text_text").getValue() : 0;
                    total += directoryPainlessScript != null ? (int) hit.getFields().get("text_keyword").getValue() : 0;
                }
                if (searchHits.length < batchSize) {
                    break;
                }
                searchRequest.source().searchAfter(searchHits[searchHits.length - 1].getSortValues());
            }
            return total;
        } catch (IOException e) {
            e.printStackTrace();
            return 0;
        }
    }


    private static String getPainlessScriptOfMatchCountSearch(String searchContent) {
        searchContent = removeEmptyChar(searchContent);
        if (searchContent.length() == 0) { return null; }
        StringBuilder painlessScript = new StringBuilder();
        StringBuilder word = new StringBuilder();
        Map<Character, String> delimiterMap = new HashMap<Character, String>() {{
            put(' ', "||"); put('+', "&&"); put('-', "&& !");
        }};
        for (char c : searchContent.toCharArray()) {
            if (delimiterMap.containsKey(c)) {
                if (word.length() > 0) {
                    painlessScript.append(getSimpleAndTraditionalPainlessScriptOfWord(word.toString()));
                }
                painlessScript.append(delimiterMap.get(c));
                word = new StringBuilder();
            } else {
                word.append(c);
            }
        }
        if (word.length() > 0) {
            painlessScript.append(getSimpleAndTraditionalPainlessScriptOfWord(word.toString()));
        }
        if (painlessScript.toString().startsWith("&& ")) {
            painlessScript.delete(0, 3);
        }
        return painlessScript.toString();
    }

    private static String getSimpleAndTraditionalPainlessScriptOfWord(String word) {
        if (word == null || word.length() == 0) {
            return "";
        }
        String simplifiedWord = ZhConverterUtil.convertToSimple(word);
        String traditionalWord = ZhConverterUtil.convertToTraditional(word);
        if (simplifiedWord.equals(traditionalWord)) {
            return "w.contains(\"" + simplifiedWord + "\")";
        } else {
            return "(w.contains(\"" + simplifiedWord + "\") || w.contains(\"" + traditionalWord + "\"))";
        }
    }

    private static String removeEmptyChar(String str) {
        if (str == null) {
            return "";
        }
        // 多个空格、加号、减号只保留一个
        str = str.trim().replaceAll("\\s+", " ")
                .replaceAll("\\++", "+").replaceAll("-+", "-")
                // 去除加号和减号前后的空格
                .replaceAll("\\s*\\+\\s*", "+").replaceAll("\\s*-\\s*", "-")
                // 加号和减号相邻时，如果末尾是减号则只保留一个减号，否则只保留一个加号
                .replaceAll("([+-])+-", "-").replaceAll("([+-])+", "+")
                // 去除开头的加号和空格，去除结尾的加号和减号和空格
                .replaceAll("^\\s*\\+\\s*", "").replaceAll("\\s*[+-]*\\s*$", "");
        return str;
    }

}
```