---
layout: post
title:  linux非root用户安装python3.8
date:   2023-09-17 17:40:00 +0800
categories: 开发日志
tags: python linux
---


## 1. 下载Python
```bash
wget https://www.python.org/ftp/python/3.8.10/Python-3.8.10.tgz
tar -zxvf Python-3.8.10.tgz
```
此时尝试编译安装，一般会缺少某些依赖编译失败。
```bash
./configure --prefix=$HOME/python3
make && make install
```
`make`步骤一般会报下面的错:
```
Failed to build these modules:
_hashlib              _ssl                                     

Could not build the ssl module!
Python requires an OpenSSL 1.0.2 or 1.1 compatible libssl with X509_VERIFY_PARAM_set1_host().
LibreSSL 2.6.4 and earlier do not provide the necessary APIs, https://github.com/libressl-portable/portable/issues/381
```
有时还会缺少`zlib`, `libffi`, `sqlite3`等。
```
Python build finished successfully!
The necessary bits to build these optional modules were not found:
_bz2                  _curses               _curses_panel      
_dbm                  _gdbm                 _lzma              
_sqlite3              _tkinter              _uuid              
readline              zlib   
```
缺少`libffi`导致`_ctypes`模块编译失败:
```
fatal error: ffi.h: No such file or directory
  107 | #include <ffi.h>
      |          ^~~~~~~
compilation terminated.

Failed to build these modules:
_ctypes 
```

## 2. 安装openssl, libffi, zlib, sqlite3等依赖库

### 2.1. 直接下载已经编译好的库
有root权限可以直接使用包管理器安装，如`yum`, `apt-get`, `brew`等。但是在没有root权限的情况下，可以自己编译安装。也可以下载已经编译好的库，然后指定路径。

```bash
apt-get download libbz2-dev lib-lzma-dev
dpkg -x libbz2-dev_1.0.8-4_amd64.deb $HOME/libs/libbz2
dpkg -x liblzma-dev_5.2.2-1.3_amd64.deb $HOME/libs/liblzma
```

### 2.2. 下载源码编译安装

这里以openssl, libffi, zlib, sqlite3为例。

openssl:

```bash
wget https://www.openssl.org/source/openssl-1.1.1d.tar.gz
tar -zxvf openssl-1.1.1d.tar.gz
cd openssl-1.1.1d
./config --prefix=$HOME/libs/openssl
make && make install
```

libffi和zlib也都类似的步骤。

libffi前往[https://github.com/libffi/libffi/releases](https://github.com/libffi/libffi/releases)下载

zlib前往[https://zlib.net/](https://zlib.net/)下载。或者其他站点下载:
```bash
wget https://nchc.dl.sourceforge.net/project/libpng/zlib/1.2.11/zlib-1.2.11.tar.gz
```

sqlite3: 参考[https://blog.csdn.net/qq_37144341/article/details/115214323](https://blog.csdn.net/qq_37144341/article/details/115214323)

```
wget https://www.sqlite.org/2017/sqlite-autoconf-3170000.tar.gz
tar -zxvf sqlite-autoconf-3170000.tar.gz
cd sqlite-autoconf-3170000
./configure --prefix=$HOME/libs/sqlite3 --disable-static --enable-fts5 --enable-json1 CFLAGS="-g -O2 -DSQLITE_ENABLE_FTS3=1 
```

### 2.3. 配置环境变量

写入环境变量, 打开`~/.bashrc`添加如下内容:

```bash
export LD_LIBRARY_PATH=$HOME/libs/libbz2/usr/lib/x86_64-linux-gnu:$HOME/libs/liblzma/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
```

其他依赖库类似。

这里需要写进`~/.bashrc`，如果仅仅只在当前shell生效，那么尽管python可以编译安装成功，并且可以正常执行。但是在下次重新进入系统或者打开新的shell时，就会在执行python代码时，比如`python xxx.py`时，会报错找不到依赖库，报错类似于:

```
ModuleNotFoundError: No module named '_lzma'
```

一开始我遇到时确实有点困惑，以为是有别人也在服务器上动过相关的环境。后面才意识到忘记把依赖库的路径写入环境变量。

## 3. 编译安装Python
先指定编译时的依赖库的路径，尽管上面配了`LD_LIBRARY_PATH`，但是编译时还是需要指定依赖库的头文件和库文件的路径。

```bash
export LDFLAGS="-L$HOME/libs/openssl/lib -L$HOME/libs/libffi/lib -L$HOME/libs/zlib/lib"
export CPPFLAGS="-I$HOME/libs/openssl/include -I$HOME/libs/libffi/include -I$HOME/libs/zlib/include"
```

然后重新编译安装Python:

```bash
# 可以输入./configure --help查看更多选项, 这里openssl可以用--with-openssl指定
./configure --prefix=$HOME/python3 --with-openssl=$HOME/libs/openssl

# 也可以直接把上一步LDFLAGS和CPPFLAGS的设置放到configure的前面
# LDFLAGS=... CPPFLAGS=... ./configure --prefix=$HOME/python3 --with-openssl=$HOME/libs/openssl

# 也可以用pkg-config来查找依赖库的路径
# export PKG_CONFIG_PATH=$HOME/libs/openssl/lib/pkgconfig:$HOME/libs/libffi/lib/pkgconfig:$HOME/libs/zlib/lib/pkgconfig
# LDFLAGS=$(pkg-config --libs-only-L openssl) ...其他部分同上
```

```bash
make
# 如果比较慢可以加上-j参数 make -j8
# 如果没有出现"Failed to build these modules: ..."之类的错误，就可以继续安装
make install
```

## 4. 配置环境变量
```bash
echo 'export PATH=$HOME/python3/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## 5. 测试
```bash
python3 --version
pip3 --version
```



