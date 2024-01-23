---
layout: post
title:  spring设置neo4j时间类型属性问题
date:   2024-01-23 22:00:00 +0800
categories: 编程随笔
tags: neo4j spring
---

在使用 spring-data-neo4j 时，如果要设置一个时间类型的属性，可以使用`java.util.Date`，不过有时候存储到 neo4j 后会自动变为时间戳，有时候可能并不想要这样的效果。

可以在需要存储的类中，使用`@com.fasterxml.jackson.annotation.JsonFormat`注解来指定时间的格式，如下：

```java
import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;

public class EntityNode {
    private Long nodeId;
    private String name;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "GMT+8")
    private Date createTime;
    // getter and setter
}
```
注意这里的`pattern`必须是 ISO 8601 格式，不能用一般的"yyyy-MM-dd HH:mm:ss"格式，否则会作为普通字符串存储，再次获取时就会报错：
```
org.apache.commons.beanutils.ConversionException: DateConverter does not support default String to 'Date' conversion.
```

对于某些并不在特定类中的时间属性，可以将时间转化为 ISO 8601 格式的字符串，然后存储到 neo4j 中，下面是我写的一个工具类：

```java

import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.converters.DateConverter;
import org.apache.commons.beanutils.converters.DateTimeConverter;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class TimeUtils {

    /**
     * 将时间转换为字符串
     * @param date 时间
     */
    public static String getTimeFormattedString(Date date) {
        // 保存到neo4j时，要减去8小时
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(Calendar.HOUR, -8);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        return sdf.format(calendar.getTime());
    }

    public static void initTimeFormat() {
        DateTimeConverter dtConverter = new DateConverter();
        dtConverter.setPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        ConvertUtils.register(dtConverter, Date.class);
    }

}

```

上述类需要在首次使用时调用`initTimeFormat`方法，可以把它放在程序入口处调用。然后就可以使用`getTimeFormattedString`方法来将时间转化为字符串，然后存储到 neo4j 中。
