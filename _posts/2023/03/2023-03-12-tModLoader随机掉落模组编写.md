---
layout: post
title:  tModLoader随机掉落模组编写
date:   2023-03-12 10:00:00 +0800
categories: 开发日志
tags: C# 游戏 terraria
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17207420.html](https://www.cnblogs.com/lxm-cnblog/p/17207420.html)
现在转移到 github pages 上。

## 1. 整体思路
目标是实现击杀低敌怪后有概率掉落任意物品，包括其他模组中的内容，数量取决于该物品的最大堆叠数，同时保留原本可能的掉落物。<br>
随机掉落的思路比较简单，重写GlobalNPC中的死亡或者掉落方法即可。在1.4以前的tModLoader可以重写`NPCLoot`方法，换成一个随机物品即可。1.4之后看了下源码，GLobalNPC下没有NPCLoot方法了，有可能其他的方法可以重写比如`ModifyNPCLoot`(看着比较像，但没试过)。我这边采用的是重写`PreKill(NPC)`方法。<br>
获取最大堆叠数则是要获取id对应的Item，这里有个坑，我一开始用的是`ItemLoader.GetItem().Item.maxStack`，没注意到`ItemLoader.GetItem()`这个方法获取的是非原版的物品，然后一直返回null，运行之后的报错又恰好行号跟我代码对不上，然后折腾了好久才发现。最后用的是`item.SetDefaults(itemId)`来获取Item。

## 2. 核心代码
```csharp
using Terraria;
using Terraria.ID;
using Terraria.ModLoader;
using System;

namespace RandomDropMod
{
    public class RandomDropModNPC : GlobalNPC
    {
        private static Random random = new Random();
        public override bool PreKill(NPC npc)
        {
            if (random.Next(100) > ModContent.GetInstance<RandomDropModConfig>().DropProbability)
            {
                return base.PreKill(npc);
            }
            // 随机生成物品
            int itemId = random.Next(ItemLoader.ItemCount);
            Item item = new Item();
            item.SetDefaults(itemId);
            // 随机生成物品的数量
            int maxStack = item.maxStack;
            /*
                最大堆叠, 生成数量
                1, 1
                2~10, 1~(maxStack-1)
                11~30, 5~(maxStack-5)
                31~100, 15~(maxStack-15)
                >100, 30~60
            */
            int count = 1;
            if (maxStack > 1)
            {
                if (maxStack < 10)
                {
                    count = random.Next(maxStack - 1) + 1;
                }
                else if (maxStack < 30)
                {
                    count = random.Next(maxStack - 5) + 5;
                }
                else if (maxStack < 100)
                {
                    count = random.Next(maxStack - 15) + 15;
                }
                else
                {
                    count = random.Next(30) + 30;
                }
            }
            // 生成物品
            Item.NewItem(null, npc.position, itemId, count);
            return base.PreKill(npc);
        }
    }
}
```

## 3. 设置用户可调整掉落概率
参考官方提供的ExampleMod，添加一个Config即可。
```csharp
using System.ComponentModel;
using Terraria.ModLoader.Config;

namespace RandomDropMod
{
    public class RandomDropModConfig : ModConfig
    {
        public override ConfigScope Mode => ConfigScope.ServerSide;
        
        [Label("Chance to drop item")]
        [Slider]
        [SliderColor(255, 255, 50)]
        [Range(0, 100)]
        [Increment(1)]
        [DefaultValue(20)]
        public int DropProbability { get; set; }
    }
}
```
