---
layout: post
title: Valheim游戏取消攻击后摇的AutoHotkey脚本
date: 2025-09-29 20:00:00 +0800
categories: games
tags: autohotkey
---
用于 Vaiheim 游戏中剑类武器使用表情取消攻击后摇并打出三连重击的 AutoHotkey 脚本。

先在游戏内绑定一个表情动作到 Q 键：
```
bind q nonono
```
2025.09战斗号角之前的版本可绑定 point 表情，更新后只能绑定 nonono 表情。

然后使用以下 AutoHotkey v2 脚本，便可实现按下 Alt+Q 键时，自动执行三连击并取消后摇的效果：
```
#Requires AutoHotkey v2.0

Alt & q:: {
    Send("q")
	Sleep 15
	Click "Down Left"
	Sleep 100
    Send("q")
	Sleep 100
    Send("q")
	Sleep 150
    Send("q")
	Sleep 150
	Click "Down Middle"
	Sleep 50
    Send("q")
	Sleep 800
	Click "Up Middle"
	Sleep 100
	Click "Up Left"
}
```
