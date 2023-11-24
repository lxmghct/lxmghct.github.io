---
layout: post
title:  el-select绑定value-key问题
date:   2023-11-24 15:00:00 +0800
categories: 编程随笔
tags: vue element-ui
---

参考[https://blog.csdn.net/Jie_Li_Wen/article/details/122881529](https://blog.csdn.net/Jie_Li_Wen/article/details/122881529)

在使用`el-select`组件时，如果绑定的值是对象，需要使用`value-key`属性来指定对象的某个属性作为`v-model`的值。

```html
<template>
  <div>
    <el-select class="my-select" v-model="currentMapData" value-key="dynasty" placeholder="请选择朝代" @change="handleDynastyChange">
      <el-option
        v-for="item in mapData"
        :key="item.dynasty"
        :label="item.dynasty"
        :value="item">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  data () {
    return {
      mapData: [
        { dynasty: '唐朝', name: '唐朝' },
        { dynasty: '宋朝', name: '宋朝' },
        { dynasty: '元朝', name: '元朝' },
        { dynasty: '明朝', name: '明朝' }
      ],
      currentMapData: null
    }
  },
  methods: {
    handleDynastyChange () {
      console.log(this.currentMapData)
    }
  }
}
```

如果不指定`value-key`属性，`el-select`显示就会出现问题，无论选择哪个选项，都会显示最后一个选项的值。

