---
layout: post
title:  jekyll添加beaudar评论系统
date:   2023-10-15 09:10:00 +0800
categories: 开发日志
tags: jekyll
---
beaudar是一个基于github issue的评论系统，所有评论都保存在某个仓库的issue评论中，是utterances的中文版本。官网为[https://beaudar.lipk.org/](https://beaudar.lipk.org/)，其中有详细的使用说明。

先建一个公开的仓库用于保存评论，然后去[https://github.com/apps/beaudar](https://github.com/apps/beaudar)给仓库安装beaudar应用。

按照官网的说明，一步一步设置，最后官网会给出对应的代码，然后将代码添加到页面中即可。

beaudar会根据页面的url或者title等信息自动创建issue，也可以使用自定义的issue-term来指定issue的标题。如果只使用文章的标题有可能会出现重复的问题，使用url又显得太长格式上不美观，所以我使用了日期加标题的方式来作为issue的标题。

```html
<script src="https://beaudar.lipk.org/client.js"
  repo="{{ site.beaudar.repo }}"
  branch="{{ site.beaudar.branch }}"
  issue-term="【{{ page.date | date:"%Y-%m-%d" }}】 {{ page.title | truncate: 100, "" }}"
  theme="github-light"
  loading="false"
  crossorigin="anonymous" async>
</script>
```