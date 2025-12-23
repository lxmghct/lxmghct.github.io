---
layout: post
title: 安卓LinearLayout最后一个按钮宽度异常问题
date: 2025-12-23 16:00:00 +0800
categories: troubleshooting
tags: android
---

有如下安卓代码：
```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="8dp"
>
    <Button
        android:id="@+id/btnSaveOriginal"
        style="@style/ButtonStyle"
        android:text="@string/save_original"
    />
    <Button
        android:id="@+id/btnSaveModified"
        style="@style/ButtonStyle"
        android:text="@string/save_updated"
    />
    <Button
        android:id="@+id/btnImport"
        style="@style/ButtonStyle"
        android:text="@string/load_updated"
    />
    <Button
        android:id="@+id/btnClear"
        style="@style/ButtonStyle"
        android:text="@string/clear_updated"
    />
</LinearLayout>

<style name="ButtonStyle">
    <item name="android:layout_width">wrap_content</item>
    <item name="android:layout_height">wrap_content</item>
    <item name="android:backgroundTint">#265468</item>
    <item name="android:textColor">#FFFFFF</item>
    <item name="android:paddingHorizontal">12dp</item>
    <item name="android:paddingVertical">8dp</item>
    <item name="android:layout_marginHorizontal">5dp</item>
</style>
```

这里按钮的宽度非常奇怪，前两个按钮里面有5个字，宽度刚好盖过这些字没问题。但第三个按钮只有两个字，但宽度却远超过两个字的宽度，比前两个按钮宽度略微小一些。最后一个按钮则是因为宽度不够被挤扁了，宽度不足一个字的宽度，高度则是超过了前三个按钮。 

第三个按钮宽度比较宽是因为 Button 默认有最小宽度（minWidth），两个字不足以撑开内容宽度，于是被拉到最小宽度。

最后一个按钮则是因为几个按钮宽度总和超过了父布局的宽度，导致最后一个按钮被压缩到非常窄。

解决方法：
```xml
<Button
    android:layout_width="0dp"
    android:layout_weight="1"
    ... />
```
