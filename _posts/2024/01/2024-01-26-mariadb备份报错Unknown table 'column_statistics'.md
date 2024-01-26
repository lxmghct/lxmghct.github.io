---
layout: post
title:  mariadb备份报错Unknown table 'column_statistics'
date:   2024-01-26 22:30:00 +0800
categories: 编程随笔
tags: mariadb
---

参考[https://tecadmin.net/mysqldump-unknown-table-column_statistics-in-information_schema/](https://tecadmin.net/mysqldump-unknown-table-column_statistics-in-information_schema/)

在 mariadb 中使用mysqldump备份时报错：
```
mysqldump: Unknown table 'column_statistics' in information_schema
```

这是因为在 mariadb 10.2.2 版本中引入了`column_statistics`表，而`mysqldump`是 mysql 的备份工具，不支持 mariadb 的新特性，无法识别`column_statistics`表。

解决方式是在备份时添加`--column-statistics=0`参数：
```shell
mysqldump --column-statistics=0 --opt -u root -p database_name > backup.sql
```

在 spring 中进行自动备份时，为解决上述问题，如果只在特定版本的 mariadb 中出现问题，则根据需要手动添加`--column-statistics=0`参数；如果不确定 mariadb 版本，或者要兼容多个版本，则可以在备份前先检查 mariadb 版本，然后根据版本添加`--column-statistics=0`参数。

检查 mariadb 版本：
```java
@Select("select version()")
String getDatabaseVersion();
```
获取到的版本号格式为`10.6.11-MariaDB`。

自动备份代码：
```java

@Service
public class LogScheduledTask {

    @Autowired
    private LogService logService;

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username}")
    private String databaseUsername;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Scheduled(cron = "0 0 1 * * ?")
    public void backup() {
        String mariadbVersion = logService.getDatabaseVersion();
        String cmd1 = "cmd /c mysqldump ";
        String cmd2 = "cmd /c mysqldump --column-statistics=0 ";
        String backupPath = "backup/" + new SimpleDateFormat("yyyy-MM-dd").format(new Date()) + ".sql";
        String cmdParams = "--opt -u " + databaseUsername + " --password=" + databasePassword + " -h" + databaseHost + " test > " + backupPath;
        try {
            String cmd;
            if (compareVersion(mariadbVersion.split("-")[0], "10.2.2") >= 0) {
                cmd = cmd2 + cmdParams;
            } else {
                cmd = cmd1 + cmdParams;
            }
            Process process = Runtime.getRuntime().exec(cmd);
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                logService.saveLog("备份成功");
            } else {
                logService.saveLog("备份失败");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private int compareVersion(String version1, String version2) {
        if (version1 == null || version2 == null) {
            return 0;
        }
        String[] versionArray1 = version1.split("\\.");//注意此处为正则匹配，不能用"."；
        String[] versionArray2 = version2.split("\\.");
        int idx = 0;
        int minLength = Math.min(versionArray1.length, versionArray2.length);//取最小长度值
        int diff = 0;
        while (idx < minLength && (diff = Integer.parseInt(versionArray1[idx]) - Integer.parseInt(versionArray2[idx])) == 0) {
            ++idx;
        }
        //如果已经分出大小，则直接返回，如果未分出大小，则再比较位数，有子版本的为大；
        diff = (diff != 0) ? diff : versionArray1.length - versionArray2.length;
        return diff;
    }
}
