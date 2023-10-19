---
layout: post
title:  Axios delete传递数组问题
date:   2023-03-23 00:07:20 +0800
categories: 编程随笔
tags: 前端 axios
---
本文首次发布于博客园：[https://www.cnblogs.com/lxm-cnblog/p/17246117.html](https://www.cnblogs.com/lxm-cnblog/p/17246117.html)
现在转移到 github pages 上。

## Axios delete传递数组的注意点
后端接口如下:
```java
  @DeleteMapping("/deleteUser")
  public ResponseVO<Integer> deleteUser(@RequestParam(value = "userIdList", required = true) List<Integer> userIdList) 
```
在发送请求时如果向下面这样写会报400 bad request错误：
```
axios.delete(url, { params: {userIdList: userIdList} })
```
检查其请求的url，可以看到参数的格式有一定问题：
![](/post_assets/images/2023/03/23-axios-delete-params.png)
所以需要对其格式进行处理。
1. 可以引入`import qs from 'qs'`用`qs.stringfy`模块进行处理：
```js
const params = {
  params: {
    userIdList: userIdList
  },
  paramsSerializer: params => {
    return qs.stringify(params, { indices: false })
  }
}
axios.delete(url, params)
```
也可以直接拼接在url后：
```js
const url = '/users/user/deleteUser?' + qs.stringify({ userIdList: userIdList }, { indices: false })
axios.delete(url)
```
2. 也可以不使用qs，直接手动拼接参数:
```js
const url = '/users/user/deleteUser?' + userIdList.map(item => 'userIdList=' + item).join('&')
axios.delete(url)
```
或者:
```js
const params = new URLSearchParams()
userIdList.forEach(item => {
  params.append('userIdList', item)
})
axios.delete(url, { data: params })
```
