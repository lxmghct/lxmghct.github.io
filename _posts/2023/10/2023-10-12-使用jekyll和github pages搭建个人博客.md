---
layout: post
title:  "使用jekyll和github pages搭建个人博客"
date:   2023-10-12 14:00:00 +0800
categories: 技术
tags: jekyll
---
**Jekyll** 是一个静态网站生成器，它可以将文本文档（如 Markdown 或 Textile）和 HTML 文件通过一些处理生成一个有机整体的 HTML 语言的网站。Jekyll 的核心是一个文本转换引擎，它支持多种文本标记语言，例如 Markdown 和 HTML，并通过 Liquid 渲染器转化成一个完整的可发布的静态网站。

**GitHub Pages** 是一个由 GitHub 提供的静态网站托管服务，它允许用户在 GitHub 上托管自己的静态网站，并提供了一些域名配置和自定义选项。用户可以通过 GitHub Pages 托管个人博客、项目文档等静态网站内容。

下面我将介绍一下自己搭建博客的过程。

## 1. 创建GitHub Pages仓库
首先，在GitHub上创建一个仓库，用于存放博客内容。在仓库名为`username.github.io`，其中`username`是GitHub用户名。比如我的是`lxmghct.github.io`。注意仓库的访问权限要设置为`Public`。在该仓库的settings中，可以修改github pages的一些配置，如主题、分支、域名等。

![github-page-setting](/post_assets/images/2023/10/12-github-page-setting.png)

## 2. 安装环境
本地搭建Jekyll环境，可以在本地预览博客效果，也可以在本地编辑博客内容。
### 2.1 安装Ruby
Ruby官网下载地址：[https://rubyinstaller.org/downloads/](https://rubyinstaller.org/downloads/)

<img src="/post_assets/images/2023/10/12-ruby-install.png" alt="Ruby Install" style="zoom: 75%;" />

安装完成后，可以在命令行中输入`ruby -v`查看版本。

### 2.2 安装rubygems
RubyGems 是 Ruby 的一个包管理器，它提供了一个标准的格式来打包 Ruby 程序和库，还提供了一个管理这些包的工具。RubyGems 是一个用于分发 Ruby 程序和库的标准格式，它可以自动下载、安装、管理 Ruby 程序和库。
RubyGems 官网下载地址：[https://rubygems.org/pages/download](https://rubygems.org/pages/download)

下载后解压后，进入解压目录，执行命令：
```shell
cd D:\rubygems-3.4.19\
ruby setup.rb
gem -v # 查看版本
```

### 2.3 安装Jekyll
```shell
gem install jekyll
jekyll -v # 查看版本
```

## 3. 创建并运行博客

### 3.1 创建博客
可以使用Jekyll提供的命令创建博客：
```shell
jekyll new myblog
```

也可以fork一个现成的博客模板，然后clone到本地。

jekyll的目录结构如下：
{% raw %}
```yaml
_config.yml: 存储配置数据，例如网站主题，名称，介绍，域名，Github用户名等。
_drafts: 存放未发布的文章，这些文件的格式中都没有日期，例如 title.MARKUP。
_includes: 可以加载这些包含部分到你的布局或者文章中以方便重用。例如，可以用这个标签 {% include file.ext %} 来把文件 _includes/file.ext 包含进来。
_layouts: 这是包裹在文章外部的模板。布局可以在 YAML 头信息中根据不同文章进行选择。例如，标签 {{ content }} 可以将 content 插入页面中。
_posts: 这里放的就是你的文章了。文件格式很重要，必须要符合: YEAR-MONTH-DAY-title.MARKUP。
_site: 一旦 Jekyll 完成转换，就会将生成的页面放在这里（默认）。
```
{% endraw %}

### 3.2 运行博客
```shell
cd myblog
jekyll server
```
然后在浏览器中输入`http://localhost:4000`，就可以看到博客的效果了。如果需要修改端口可以在`_config.yml`中修改`port`字段。
{% assign openTag = '{%' %}
1. 每次修改代码后，无需重启服务，刷新浏览器即可看到效果。如果修改了`_config.yml`文件，需要重启服务。
2. 如果在博客代码块中出现liquid语法，可以在前后加上`{{ openTag }} raw %}`和`{{ openTag }} endraw %}`，使其不被解析。如果想要显示`{{ openTag }} raw %}`，可以使用如下代码:
{% raw %}
```html
{% assign openTag = '{%' %}
{{ openTag }} raw %}
...
{{ openTag }} endraw %}
```
{% endraw %}

## 4. 发布博客
将博客内容提交到GitHub仓库中，每次提交代码都会触发GitHub Pages的构建，大约1-2分钟后，就可以在`https://username.github.io`上看到博客的效果了。

## 5. 其他说明
1. Github Pages 并不是无限存储和无限流量的静态站点服务，一些限制如下：
- 仓库大小限制为1GB
- 每月流量限制为100GB
- 每小时构建限制为10次
<br>更多信息可以参考github官网说明[usage-limits](https://link.zhihu.com/?target=https%3A//help.github.com/articles/what-is-github-pages/%23usage-limits)。
2. 如果需要使用自定义域名，可以在仓库的settings中进行配置。或者在根目录下创建一个名为`CNAME`的文件，文件内容为自定义域名。
