---
layout: post
title: docker build failed to fetch anonymous token
date: 2025-12-17 14:00:00 +0800
categories: troubleshooting
tags: docker
---

运行 docker build 时报错：

```
[+] Building 19.0s (2/2) FINISHED                                                                  docker:desktop-linux
 => [internal] load build definition from Dockerfile                                                               0.1s
 => => transferring dockerfile: 4.09kB                                                                             0.0s
 => ERROR [internal] load metadata for docker.io/library/ubuntu:22.04                                             18.7s
------
 > [internal] load metadata for docker.io/library/ubuntu:22.04:
------
Dockerfile:1
--------------------
   1 | >>> FROM ubuntu:22.04
   2 |
   3 |     ENV DEBIAN_FRONTEND=noninteractive
--------------------
ERROR: failed to build: failed to solve: failed to fetch anonymous token: Get "https://auth.docker.io/token?scope=repository%3Alibrary%2Fubuntu%3Apull&service=registry.docker.io": net/http: TLS handshake timeout

View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/6ikq51gy10phjaauwjpt6dkjw
```

解决方法：
参考:  [https://www.cnblogs.com/xyz/p/18969515](https://www.cnblogs.com/xyz/p/18969515)

```bash
# linux
export DOCKER_BUILDKIT=0
export COMPOSE_DOCKER_CLI_BUILD=0

# windows
set DOCKER_BUILDKIT=0
set COMPOSE_DOCKER_CLI_BUILD=0
```


https://gist.github.com/minglewong/8375cc92e6821ac501c27f187511788b


docker system prune
docker image prune -f -a` : 删除所有不使用的镜像 · docker container prune -f : 删除所有停止的镜像
然后退出Docker Desktop并关停WSL2实例。

wsl --shutdown
最后打开 Windows 中提供的diskpart工具进行压缩

# 代码来自 https://github.com/microsoft/WSL/issues/4699#issuecomment-627133168

diskpart
# open window Diskpart
select vdisk file="C:\Users\lxm\AppData\Local\Docker\wsl\data\ext4.vhdx"
attach vdisk readonly
compact vdisk
detach vdisk
exit
select vdisk file="C:\Users\lxm\AppData\Local\Docker\wsl\disk\docker_data.vhdx"
select vdisk file="C:\Users\lxm\AppData\Local\Docker\wsl\main\ext4.vhdx"






root@3e23b9bbf132:/workspace/blueos-dev# repo init -u git@github.com:vivoblueos/manifests.git -b main -m manifest.xml
Downloading Repo source from https://gerrit.googlesource.com/git-repo
remote: Finding sources: 100% (47/47)
remote: Total 9544 (delta 5089), reused 9533 (delta 5089)
repo: Updating release signing keys to keyset ver 2.3

manifests:
kex_exchange_identification: Connection closed by remote host
Connection closed by 20.205.243.166 port 22
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
manifests: sleeping 4.0 seconds before retrying
fatal: cannot obtain manifest git@github.com:vivoblueos/manifests.git
================================================================================
Repo command failed: UpdateManifestError
        Unable to sync manifest manifest.xml