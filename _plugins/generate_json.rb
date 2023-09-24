require 'json'
require 'cgi'  # 用于处理 HTML 实体的转义和恢复

Jekyll::Hooks.register :site, :post_write do |site|

  # 去除文章的 HTML 标签，可以压缩 JSON 文件的大小
  def strip_html(content)
      content.gsub(/<\/?[^>]*>/, "")
  end

  # 恢复原文本中的 HTML 实体，比如如果文章的文本中包含 &lt; 或 &gt; 这样的字符
  def restore_html_entities(content)
    CGI.unescapeHTML(content)
  end

  # 正在生成用于搜索的 JSON 文件
  puts "[Search Plugin] Generating search data for posts into _site/assets/posts.json...\n"
  start_time = Time.now

  # 准备存储所有文章数据的数组，并按日期从新到旧排序
  # all_posts = site.posts.docs.map do |post|
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

  puts "[Search Plugin] done in #{Time.now - start_time} seconds. Total posts: #{all_posts.size}"

end
