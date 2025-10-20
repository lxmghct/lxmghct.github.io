---
layout: post
title: moviepy与pillow版本冲突问题
date: 2025-10-20 15:00:00 +0800
categories: troubleshooting
tags: python
---

我想使用 python 将单一图片转化为一个视频文件，使用 moviepy 库来实现。代码如下：

```python
def image_to_video(image_path, audio_path, output_path="output.mp4", volume=1.0):
    """
    生成视频：单张图片 + 背景音乐
    :param image_path: 图片路径 (jpg/png/jpeg)
    :param audio_path: 音频路径 (mp3)
    :param output_path: 输出视频路径 (默认 output.mp4)
    :param volume: 音量大小 (1.0为原音量，0.5为一半音量)
    """
    # 加载音频
    audio = AudioFileClip(audio_path).volumex(volume)
    duration = audio.duration  # 音频持续时间
    print(duration)

    # 创建图片视频片段（持续时间与音频相同）
    clip = ImageClip(image_path).resize(height=480, width=720).set_duration(duration)

    # 设置视频的音频
    video = clip.set_audio(audio)

    # 导出视频
    video.write_videofile(
        output_path,
        fps=24,
    )

    print(f"✅ 视频已生成: {output_path}")
```

不过遇到了两个问题，都是由于 moviepy 与 pillow 版本冲突问题，造成以下两种情况：

1. ImageClip无法resize，报错如下：

```
clip = ImageClip(image_path).resize(height=480, width=720)

Traceback (most recent call last):
  File "create_video.py", line 47, in <module>
    image_to_video(args.image, args.audio, args.output, args.volume)
  File "create_video.py", line 19, in image_to_video
    clip = ImageClip(image_path).resize(height=480, width=720).set_duration(10)
  File "D:\dev\python\venvs\audio-test\lib\site-packages\moviepy\video\fx\resize.py", line 152, in resize   
    newclip = clip.fl_image(fl)
  File "<decorator-gen-72>", line 2, in fl_image
  File "D:\dev\python\venvs\audio-test\lib\site-packages\moviepy\decorators.py", line 14, in outplace       
    f(newclip, *a, **k)
  File "D:\dev\python\venvs\audio-test\lib\site-packages\moviepy\video\VideoClip.py", line 936, in fl_image 
    arr = image_func(self.get_frame(0))
  File "D:\dev\python\venvs\audio-test\lib\site-packages\moviepy\video\fx\resize.py", line 150, in <lambda> 
    fl = lambda pic: resizer(pic.astype('uint8'), newsize)
  File "D:\dev\python\venvs\audio-test\lib\site-packages\moviepy\video\fx\resize.py", line 37, in resizer   
    resized_pil = pilim.resize(newsize[::-1], Image.ANTIALIAS)
AttributeError: module 'PIL.Image' has no attribute 'ANTIALIAS'
```

参考:
https://stackoverflow.com/questions/76616042/attributeerror-module-pil-image-has-no-attribute-antialias

原因：
Pillow 10.0.0版本移除了ANTIALIAS属性。

2. 生成的视频无法播放，windows media player 报错：服务器启动失败。不过vscode可以播放。



解决方法：
```
pip install Pillow==9.5.0
pip install moviepy==1.0.3
```
