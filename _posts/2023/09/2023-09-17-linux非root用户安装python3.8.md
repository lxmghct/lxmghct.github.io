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

## 2. 安装openssl, libffi, zlib
openssl:

```bash
wget https://www.openssl.org/source/openssl-1.1.1d.tar.gz
tar -zxvf openssl-1.1.1d.tar.gz
cd openssl-1.1.1d
./config --prefix=$HOME/openssl
make && make install
```

libffi和zlib也都类似的步骤。

libffi前往[https://github.com/libffi/libffi/releases](https://github.com/libffi/libffi/releases)下载

zlib前往[https://zlib.net/](https://zlib.net/)下载。或者其他站点下载:
```bash
wget https://nchc.dl.sourceforge.net/project/libpng/zlib/1.2.11/zlib-1.2.11.tar.gz
```

## 3. 编译安装Python
先指定编译时的依赖库的路径:
```bash
export LDFLAGS="-L$HOME/openssl/lib -L$HOME/libffi/lib -L$HOME/zlib/lib"
export CPPFLAGS="-I$HOME/openssl/include -I$HOME/libffi/include -I$HOME/zlib/include"
```

然后重新编译安装Python:

```bash
# 可以输入./configure --help查看更多选项, 这里openssl可以用--with-openssl指定
./configure --prefix=$HOME/python3 --with-openssl=$HOME/openssl

# 也可以直接把上一步LDFLAGS和CPPFLAGS的设置放到configure的前面
# LDFLAGS=... CPPFLAGS=... ./configure --prefix=$HOME/python3 --with-openssl=$HOME/openssl

# 也可以用pkg-config来查找依赖库的路径
# export PKG_CONFIG_PATH=$HOME/openssl/lib/pkgconfig:$HOME/libffi/lib/pkgconfig:$HOME/zlib/lib/pkgconfig
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



