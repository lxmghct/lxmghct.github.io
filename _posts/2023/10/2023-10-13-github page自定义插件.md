---
layout: post
title:  github page自定义插件
date:   2023-10-13 09:30:00 +0800
categories: 技术探索
tags: github
---

## 1. 问题描述
在github pages中，我们可以通过`_plugins`目录下的插件来实现一些自定义功能。比如下面实现了一个生成所有文章json的插件。
```ruby
require 'json'
require 'cgi'
Jekyll::Hooks.register :site, :post_write do |site|

  def strip_html(content)
      content.gsub(/<\/?[^>]*>/, "")
  end

  def restore_html_entities(content)
    CGI.unescapeHTML(content)
  end

  all_posts = site.posts.docs.sort_by { |post| -post.date.to_i }.map do |post|
    {
      title: post.data['title'],
      url: post.url,
      date: post.date,
      content: restore_html_entities(strip_html(post.content))
    }
  end
  
  File.open('_site/assets/posts.json', 'w') do |file|
    file.write(JSON.pretty_generate(all_posts))
  end

end
```
这个插件会在每次生成网站时，将所有文章的标题、url、日期和内容生成到`_site/assets/posts.json`文件中。在本地执行`jekyll server`后，该文件会被生成到`_site/assets/posts.json`中。后面可以通过ajax请求这个json文件来获取所有文章的信息。


但是当部署到github pages时，由于github pages默认的部署行为只支持官方插件，所以我们需要通过其他方式来实现这个功能。

## 2. 解决方案
我们可以通过`github actions`来实现这个功能。具体步骤如下：

### 2.1 创建github actions
在项目根目录下创建`.github/workflows`目录，并在该目录下创建`deploy.yml`文件，内容如下：
```yaml
name: Build and Deploy Jekyll Site

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2.2'

      - name: Install dependencies
        run: |
          gem install bundler
          bundle install

      - name: Build site with Jekyll
        run: bundle exec jekyll build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./_site
```
这个`deploy.yml`文件定义了一个`build`任务，当`master`分支有代码提交时，会执行该任务。该任务会先安装`ruby`和`bundler`，然后安装依赖，接着执行`jekyll build`命令生成网站，最后通过`peaceiris/actions-gh-pages`插件将生成的网站发布到`gh-pages`分支。该方法可以执行`_plugins`目录下的插件。

上述方法如果直接执行，在未设置`GITHUB_TOKEN`的情况下会报错，具体可以去网上查找解决方案（我目前没遇到这个问题，所以也不清楚具体解决方法）。

### 2.2 配置ACTION权限
上述方法如果在未配置ACTION权限的情况下，也会报错：
```
Push the commit or tag
  /usr/bin/git push origin gh-pages
  remote: Permission to xxx/xxx.github.io.git denied to github-actions[bot].
  fatal: unable to access 'https://github.com/xxx/xxx.github.io.git/': The requested URL returned error: 403
  Error: Action failed with "The process '/usr/bin/git' failed with exit code 128"
```
这是因为`github-actions`没有权限推送代码到`gh-pages`分支。解决方法是在项目的`Settings`->`Actions`->`General`中，找到`Workflow permissions`，勾选`Read and write permissions`和`Allow GitHub Actions to create and approve pull requests`。

### 2.3 配置分支
在项目的`Settings`->`Pages`中，将`Source`设置为`gh-pages`分支，`root`设置为`/`。


