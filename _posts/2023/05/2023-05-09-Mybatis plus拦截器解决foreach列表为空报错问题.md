---
layout: post
title:  Mybatis plus拦截器解决 foreach 列表为空报错问题
date:   2023-05-09 16:45:00 +0800
categories: 技术探索
tags: mybatis
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17385580.html](https://www.cnblogs.com/lxm-cnblog/p/17385580.html)
现在转移到 github pages 上。


在mybatis中使用`<foreach>`标签时, 如果传入的列表为空, 则解析为sql语句时`<foreach>`标签所在位置会被解析为空, 最终的sql呈现为`in ()`或者`in`后面的内容为空, 从而导致sql语法错误。
网上找了很多种方法，如果foreach用的地方比较少，在执行sql之前判空即可。如果用到foreach的地方比较多，用拦截器来处理可能会更好。

参考: [https://blog.csdn.net/qq_26222859/article/details/55101903](https://blog.csdn.net/qq_26222859/article/details/55101903)
部分代码做了一些修改。

拦截器：
```java
import org.apache.ibatis.cache.CacheKey;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;

import java.util.*;

@Intercepts({
        @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
        @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class, CacheKey.class, BoundSql.class}),
        @Signature(type = Executor.class, method = "update", args = {MappedStatement.class,Object.class})
})
public class EmptyCollectionInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object[] args = invocation.getArgs();
        MappedStatement mappedStatement = (MappedStatement) args[0];
        Object parameter = args[1];
        if (parameter == null) {
            Class<?> parameterType = mappedStatement.getParameterMap().getType();
            // 实际执行时的参数值为空，但mapper语句上存在输入参数的异常状况，返回默认值
            if (parameterType != null) {
                return getDefaultReturnValue(invocation);
            }
            return invocation.proceed();
        }
        BoundSql boundSql = mappedStatement.getBoundSql(parameter);
        if (hasEmptyList(boundSql.getSql())) {
            return getDefaultReturnValue(invocation);
        }
        return invocation.proceed();
    }

    @Override
    public Object plugin(Object target) {
        //只拦截Executor对象，减少目标被代理的次数
        if (target instanceof Executor) {
            return Plugin.wrap(target, this);
        } else {
            return target;
        }
    }

    @Override
    public void setProperties(Properties properties) {
    }

    /**
     * 返回默认的值，list类型的返回空list,数值类型的返回0
     *
     * @param invocation Invocation
     * @return Object
     */
    private Object getDefaultReturnValue(Invocation invocation) {
        Class<?> returnType = invocation.getMethod().getReturnType();
        if (returnType.equals(List.class)) {
            return new ArrayList<>();
        } else if (returnType.equals(Integer.class) || returnType.equals(int.class)
                || returnType.equals(Long.class) || returnType.equals(long.class)
                || returnType.equals(Short.class) || returnType.equals(short.class)
                || returnType.equals(Byte.class) || returnType.equals(byte.class)) {
            return 0;
        }
        return null;
    }

    /**
     * 判断是否存在空list
     *
     * @param sql sql
     * @return boolean
     */
    private static boolean hasEmptyList(String sql) {
        char quote = '\0';
        int index = 0;
        int len = sql.length();
        boolean hasBackSlash = false;
        // 找到不在引号内的in关键字
        while (index < len) {
            char c = sql.charAt(index++);
            if (hasBackSlash) { // 忽略转义字符
                hasBackSlash = false;
                continue;
            }
            switch (c) {
                case '\\':
                    hasBackSlash = true;
                    break;
                case '\'':
                case '"':
                case '`':
                    if (quote == c) {
                        quote = '\0';
                    } else if (quote == '\0') {
                        quote = c;
                    }
                    break;
                case 'i':
                case 'I':
                    if (quote == '\0' && index + 1 < len && (sql.charAt(index) == 'n' || sql.charAt(index) == 'N') && index > 1) {
                        // in前必须是空白字符或三种引号或右括号，in后必须是空白字符或左括号
                        if (sql.substring(index - 2, index + 2).matches("(?i)([\\s)\"'`]in[\\s(])")) {
                            int leftQuoteIndex = sql.indexOf('(', index + 1);
                            int rightQuoteIndex = sql.indexOf(')', index + 1);
                            if (leftQuoteIndex == -1 || rightQuoteIndex == -1 || leftQuoteIndex > rightQuoteIndex ||
                                    !sql.substring(index + 1, leftQuoteIndex).trim().isEmpty() ||
                                    sql.substring(leftQuoteIndex + 1, rightQuoteIndex).trim().isEmpty()) {
                                return true;
                            } else {
                                index = rightQuoteIndex + 1;
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return false;
    }
}
```

配置类：
```java
import org.apache.ibatis.session.SqlSessionFactory;
import com.mb.process.interceptor.EmptyCollectionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.List;

@Configuration
public class MybatisConfig {

    @Autowired
    private List<SqlSessionFactory> sqlSessionFactoryList;

    @PostConstruct
    public void addMySqlInterceptor() {
        EmptyCollectionInterceptor interceptor = new EmptyCollectionInterceptor();
        for (SqlSessionFactory sqlSessionFactory : sqlSessionFactoryList) {
            sqlSessionFactory.getConfiguration().addInterceptor(interceptor);
        }
    }

}
```
