---
layout: post
title: spring判断swagger model中的required字段
date: 2024-07-20 21:30:00 +0800
categories: 编程随笔
tags: spring swagger
---

swagger的`@ApiModelProperty`注解中有一个`required`字段，用来标识字段是否必填。在后端接口中，我们可能需要判断swagger model中的required字段是否为空。采用的方法是通过反射获取对象的所有字段，然后检查字段是否有`@ApiModelProperty`注解，如果有则判断`required`字段是否为`true`，如果为`true`则检查字段是否为空。

```java
    /**
     * 检查swagger的required字段
     * @param obj 对象
     * @return boolean
     */
    public static boolean checkRequiredFields(Object obj) {
        // 获取对象的所有字段
        Field[] fields = obj.getClass().getDeclaredFields();
        for (Field field : fields) {
            // 检查字段是否有@ApiModelProperty注解
            ApiModelProperty annotation = field.getAnnotation(ApiModelProperty.class);
            if (annotation != null && annotation.required()) {
                field.setAccessible(true);
                try {
                    // 检查字段是否为空
                    Object value = field.get(obj);
                    if (value == null) {
                        return false;
                    }
                } catch (IllegalAccessException e) {
                    e.printStackTrace();
                }
            }
        }
        return true;
    }
```
