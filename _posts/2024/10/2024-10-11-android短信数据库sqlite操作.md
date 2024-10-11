---
layout: post
title: android短信数据库sqlite操作
date: 2024-10-11 14:00:00 +0800
categories: platforms
tags: android
---

# Android SQLite 直接操作脚本说明

## 1. LineageOS 更新数据库写入

用途：手动向 LineageOS 更新数据库插入 OTA 更新记录。

命令：
adb shell sqlite3 updates.db INSERT INTO updates ...

主要字段：

* status：更新状态
* path：更新包路径
* download_id：下载ID
* timestamp：时间戳
* type：更新类型（如 incremental / full）
* version：版本号
* size：文件大小

使用场景：

* 手动添加 OTA 更新
* 自动化更新脚本
* 调试系统更新

---

## 2. 短信数据库操作

数据库路径：
/data/user/0/com.android.providers.telephony/databases/mmssms.db

需要：

* root 权限
* adb shell

---

### 查询最近 10 条短信

SELECT _id, address, date, read, seen, body FROM sms ORDER BY date DESC LIMIT 10;

说明：

* address：手机号
* date：时间戳
* read：是否已读
* seen：是否已查看
* body：短信内容

---

### 查询未读短信数量

SELECT COUNT(1) FROM sms WHERE read=0 OR seen=0;

用途：

* 获取未读短信数
* 状态统计

---

### 标记所有短信为已读

UPDATE sms SET read=1, seen=1 WHERE read=0 OR seen=0;

用途：

* 清除未读短信标记
* 清理通知
* 自动化任务

---

注意事项：

* 需要 root 权限
* 直接修改数据库存在风险
* 建议先备份 mmssms.db


```
adb shell "sqlite3 /data/data/org.lineageos.updater/databases/updates.db \"INSERT INTO updates (status, path, download_id, timestamp, type, version, size)  VALUES ($status, '$zip_path_device', '$id', $timestamp, '$type', '$version', $size)\""

sqlite3 mmssms.db "SELECT _id, address, date, read, seen, body FROM sms ORDER BY date DESC LIMIT 10;"

sqlite3 /data/user/0/com.android.providers.telephony/databases/mmssms.db "SELECT _id, address, date, read, seen, body FROM sms ORDER BY date DESC LIMIT 10;"

sqlite3 /data/user/0/com.android.providers.telephony/databases/mmssms.db "SELECT COUNT(1) FROM sms WHERE read=0 OR seen=0;"

sqlite3 /data/user/0/com.android.providers.telephony/databases/mmssms.db "UPDATE sms SET read=1, seen=1 WHERE read=0 OR seen=0;"
```
