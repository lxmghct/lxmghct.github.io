---
layout: post
title: 小米11青春版刷入lineageos系统并获取root权限
date: 2024-09-13 20:00:00 +0800
categories: platforms
tags: lineageos
---

# 1. 刷入 LineageOS 系统

我想给小米11青春版刷入lineageos系统，虽然过程比较复杂，但官方有详细的刷机教程，可以参考[https://wiki.lineageos.org/devices/renoir/install/](https://wiki.lineageos.org/devices/renoir/install/)。小米账号绑定设备7天后，使用官方工具解锁bootloader，然后按照教程刷入lineageos系统。


lineageos官网支持的设备列表如这个网址所示：[https://wiki.lineageos.org/devices/](https://wiki.lineageos.org/devices/)

其中并没有小米11青春版，然后我根据一些版本比较接近的设备进行对比，最后在这个网站上找到的一些手机的详细对比：[https://www.phone888.cn/compare/phones/xiaomi-mi-11-lite-5g-128gb6gb-vs-xiaomi-mi-11-youth-256gb/17665525](https://www.phone888.cn/compare/phones/xiaomi-mi-11-lite-5g-128gb6gb-vs-xiaomi-mi-11-youth-256gb/17665525)
我这里给的网址是小米11青春版和Mi 11 Lite 5G的详细对比，经过对比发现，二者除了运行内存和存储容量不同外，其他硬件配置基本一致，所以我决定尝试刷入Mi 11 Lite 5G的lineageos系统。


# 2. Root 权限

然后我希望能够获取root权限，实际上lineageos是自带root权限的，只需要在设置->关于本机->Build 号连续点击几次就可以打开开发者选项，然后在开发者选项中打开root权限即可。不过这种方式会让应用能够识别到手机已经获取了root权限，某些应用比如银行软件会因为这个原因无法使用，所以我还是决定刷入Magisk，这样可以隐藏root权限。

按照Magisk官网的教程即可，其中一开始用到的boot.img可以不用自己提取，在上面安装lineageos的过程中用到了lineageos官网提供的boot.img，直接用这个boot.img给Magisk即可。某些版本的Magisk我试下来稍微有点问题，在我尝试的几个版本里，最后我选择了27.005版本。

# 3. 隐藏 root 环境

https://www.magiskmodule.com/download-magisk-alpha/


参考酷安"苏疫杆菌"的帖子 "一键隐藏250420使用教程"
https://wwpf.lanzoum.com/b00hqc30wh
password: hide

其中包含：

1. Shamiko v1.2.1
https://github.com/LSPosed/LSPosed.github.io/releases

2. ZygiskNext v1.2.8
https://github.com/Dr-TSNG/ZygiskNext

3. TrickyStore v1.2.1
https://github.com/5ec1cff/TrickyStore

4. TrickyAddonModule v3.8.1
https://github.com/KOWX712/Tricky-Addon-Update-Target-List

5. PlayIntegrityFix v19.0
https://github.com/chiteroman/PlayIntegrityFix

如果 PlayIntegrityFix 19.0 没有效果，参考[https://www.reddit.com/r/Magisk/comments/197yo2b/help_play_integrity_fix_isnt_working/?rdt=589130](https://www.reddit.com/r/Magisk/comments/197yo2b/help_play_integrity_fix_isnt_working/?rdt=58913)，再安装一个[https://github.com/daboynb/PlayIntegrityNEXT](https://github.com/daboynb/PlayIntegrityNEXT)

PlayIntegrityFix 按照酷安教程点击操作会导致无法下载，即使开了代理。这种情况可以先将 PlayIntegrityFix 文件里的 actions.sh 中的 download 方法里修改 curl 语句，加上代理参数
```bash
curl -x http://127.0.0.1:7890
```
重新刷入 PlayIntegrityFix 模块，安装完成后重启。然后在 clash 里监听 7890 端口，然后使用 adb -d root 或者手机安装 termux 进入 `/data/adb/modules/playintegrityfix` 目录，执行 `sh action.sh`，就可以了。


对于 Momo 检测出的 "设备正在运行非原厂系统" 的问题，也是参考上面的帖子，以及[这里](https://alist.mochen.one/%E9%82%A3%E9%B2%81%E5%A4%9A/share/Android/%E6%90%9E%E6%9C%BA/root/%E6%A8%A1%E5%9D%97%E5%8F%8A%E6%96%87%E4%BB%B6/root%E7%8E%AF%E5%A2%83%E6%A3%80%E6%B5%8B/%E8%A7%A3%E5%86%B3%E8%AE%BE%E5%A4%87%E6%AD%A3%E5%9C%A8%E8%BF%90%E8%A1%8C%E9%9D%9E%E5%8E%9F%E5%8E%82%E7%B3%BB%E7%BB%9F)
解决方法是删除或者重命名 /system 目录下的 addon.d 目录，这是LineageOS 的升级脚本，需要的时候再恢复。


