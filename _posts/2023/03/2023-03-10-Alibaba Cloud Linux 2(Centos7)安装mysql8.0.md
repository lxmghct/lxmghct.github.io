---
layout: post
title:  Alibaba Cloud Linux 2(Centos7)安装mysql8.0.md
date:   2023-03-10 02:30:00 +0800
categories: 编程随笔
tags: mysql linux
---

本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/articles/17202074.html](https://www.cnblogs.com/lxm-cnblog/articles/17202074.html)
现在转移到 github pages 上。

## 1. 检查是否安装历史版本，如果有则删除相关文件
- 查找并删除历史版本mysql
```
  rpm -qa|grep mysql
  # 如果存在则删除
  rpm -ev [组件名称]
  # 查找残留文件
  find / -name mysql
```
- 删除配置以及数据
```
  # 删除配置
  rm -rf /etc/my.cnf
  # 删除数据目录
  cd /var/lib/mysql
  rm -rf *
```
- 查找并删除已有mysql依赖
 ```
  # 查找依赖
  rpm -qa | grep mysql
  # 如果有则删除
  rpm -e [mysql_libs]
  # 若删除失败则强力删除
  rpm -e --nodeps [mysql_libs]
```
- 查看并删除mariadb
```
  rpm -qa | grep mariadb
  rpm -e --nodeps [mariadb]
```

## 2. 下载mysql8.0
```
  wget http://mirrors.tuna.tsinghua.edu.cn/mysql/yum/mysql80-community-el7/mysql80-community-release-el7-1.noarch.rpm
```
- 如果以下出现404错误
```
  failure: repodata/repomd.xml from xxx: [Errno 256] No more mirrors to try.
    https://download.xxx.com/linux/centos/2.1903/x86_64/stable/repodata/repomd.xml: [Errno 14] HTTPS Error 404 - Not Found
```
- 这有可能是Alibaba Cloud Linux 2 的Centos版本的问题，可以有以下两种解决方法:
1. 下载Centos7 yum源
```
  wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
  yum clean all 
  yum list 
  yum makecache
```
2. 找到/etc/yum.repos.d下的repo文件, 将其中的所有$releasever替换成7

## 3. 安装mysql
```
  # 安装mysql依赖包
  yum install -y libaio
  # 安装mysql
  rpm -ivh mysql80-community-release-el7-1.noarch.rpm
  yum install mysql-server
```
- 若出现Public key for mysql-community-server-5.7.37-1.el7.x86_64.rpm is not installed则需要更新mysql的GPA
```
  rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
  # 然后再安装
  yum install mysql-server
```

## 4. 配置并启动mysql
1. 设为开机启动
```
  # 检查是否开机启动
  systemctl list-unit-files|grep mysqld
  # 若没有则设为开机启动
  systemctl enable mysqld.service
```
2. 初始化mysql
```
  mysqld --initialize
  # 查看初始化密码
  grep 'temporary password' /var/log/mysqld.log
  # 登录mysql
  mysql -uroot -p
```
  - 可能会出现的报错:  
    1. 如果出现`Can't connect to local MySQL server through socket '/var/lib   /mysql/mysql.sock' (111)`
    ```
        # 进入报错路径并删除mysql.sock，再重启服务
        cd /var/lib/mysql/ 
        rm -rf mysql.sock 
        systemctl stop mysqld 
        systemctl start mysqld 
        // 然后登入mysql查看是否正常 
        mysql -u root -p 
    ```
    2. 如果启动报错
    ```
        service mysqld start
        Redirecting to /bin/systemctl start mysqld.service
        Job for mysqld.service failed because the control process exited with error code. See "systemctl status mysqld.service" and "journalctl -xe" for details.
    ```
      - 执行以下指令
    ```
      chown mysql:mysql -R /var/lib/mysql
    ```
    3. 如果出现`Failed to start mysqld.service: Unit not found`
    ```
      yum -y install mariadb  mariadb-devel  mariadb-server
    ```
3. 修改密码
```sql
  alter user 'root'@'localhost' identified by '12345678';
```
- 如果提示`ERROR 1819 (HY000): Your password does not satisfy the current policy requirements`
```sql
  set global validate_password.policy=0;
```

4. 远程授权
```sql
  grant all privileges on *.* to 'root'@'%' identified by '12345678' with grant option;
```
- 如果出现`check the manual that corresponds to your MySQL server version for the right syntax to`
- 原因是我采用的mysql版本是8.0.13，给新用户授权时有所变化
```sql
    -- 创建账户
    create user 'root'@'xxx.xxx.xxx.xxx' identified by 'password'
    -- 授权，with grant option指该用户可以将自己拥有的权限授权给别人
    grant all privileges on *.* to 'root'@'xxx.xxx.xxx.xxx' with grant option
```
- 刷新权限
```sql
  flush privileges;
```

