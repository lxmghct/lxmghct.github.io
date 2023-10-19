---
layout: post
title:  unity将安卓streamingAssetsPath文件复制到persistentDataPath
date:   2023-06-18 13:40:00 +0800
categories: 编程随笔
tags: unity
---

本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17489056.html](https://www.cnblogs.com/lxm-cnblog/p/17489056.html)
现在转移到 github pages 上。

```csharp
private void TestCopy()
{
  string from = Application.streamingAssetsPath + "/Test/test.txt";
  string to = Application.persistentDataPath + "/Test/";
  CopyFile(from, to);
}

public static void CopyFile(string sourcePath, string destinationPath)
{
    byte[] fileData = null;
    // 从 StreamingAssets 文件夹读取文件数据
    if (Application.platform == RuntimePlatform.Android)
    {
        using (UnityWebRequest www = UnityWebRequest.Get(sourcePath))
        {
            www.SendWebRequest();
            while (!www.isDone) { }
            fileData = www.downloadHandler.data;
        }
    }
    else
    {
        fileData = File.ReadAllBytes(sourcePath);
    }
    // 创建目标文件夹（如果不存在）
    string destinationFolder = Path.GetDirectoryName(destinationPath);
    if (!Directory.Exists(destinationFolder))
    {
        Directory.CreateDirectory(destinationFolder);
    }
    // 将文件数据写入目标文件
    File.WriteAllBytes(destinationPath, fileData);
}

```
