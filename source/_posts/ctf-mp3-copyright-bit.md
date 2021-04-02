---
title: MP3文件隐写之Copyright位
categories: By TMs
tags: [ctf]
date: 2021-03-30 18:43:00
---

最近在帮人做CTF的时候遇到一道有意思的题目，记录一下思维过程。

题目整个只有一个MP3文件的附件。[下载](http://cdn.tms.qnxg.net/article/20210402/2.zip)

## 0x01

首先观察16进制数据，没有发现异常，只有一个PNG图片作为封面图，提取PNG图片观察图片的16进制数据，也没有发现任何异常。

## 0x02

观察到Comment tag中有一个 163 key(Don't modify) 

经查询资料得知是网易云MP3里的元数据。AES-128-ECB加密，用密码 `#14ljk_!\]&0U<'(` 解码，得到一个Json字符串，观察并没有发现任何有用信息。

## 0x03

使用Audacity加载，观察波形图和频谱图，没有发现异常。

## 0x04

猜测使用`Mp3Stego`加密，但是没有密码，无法解密。使用`Mp3Stego`测试了几个常用密码以后放弃。

## 0x05

正在一筹莫展没有思路的时候，发现MP3格式的帧数据中，有一个`uint32 private_bit`，可以作为私有数据的标记位。帧头具体格式为：


typedef FrameHeader

{

unsigned int sync:11;                        //同步信息

unsigned int version:2;                      //版本

unsigned int layer: 2;                           //层

unsigned int error protection:1;           // CRC校验

unsigned int bitrate_index:4;              //位率

unsigned int sampling_frequency:2;         //采样频率

unsigned int padding:1;                    //帧长调节

unsigned int private:1;                       //保留字

unsigned int mode:2;                         //声道模式

unsigned int mode extension:2;        //扩充模式

unsigned int copyright:1;                           // 版权

unsigned int original:1;                      //原版标志

unsigned int emphasis:2;                  //强调模式

}

曾经也有题目是使用`private_bit`来隐藏Flag。但是翻看了几帧发现`private_bit`位都是0，似乎并没有存储数据。但是在翻看的时候发现，`uint32 copyright`这一位似乎内藏玄机，这一位在相邻几帧的数据有0有1，查询得知这是版权位，通常不会出现不同帧有0有1的情况。

于是决定将`copyright`位的数据提取出来看看。

## 0x06

在提取的过程中发现一个问题。该MP3文件每一帧的长度不固定，有的是414H，有的是415H，一开始完全没有找到规律。网上相关题目和private位隐写数据的示例，也都是固定帧长度的。只好另外想办法。

翻看资料得知帧长度的变化和padding填充位有关。

> 帧长度是压缩时每一帧的长度，包括帧头的4个字节。它将填充的空位也计算在内。Layer 1的一个空位长4字节，Layer 2和Layer 3的空位是1字节。当读取MPEG文件时必须计算该值以便找到相邻的帧。注意：因为有填充和比特率变换，帧长度可能变化

观察本文件得知如果padding位为1，帧长度就是415H，padding位为0，帧长度就是414H。

查询得知第一帧的起始位置为984484，又因为帧头为4个字符，padding_bit位于第三个字符的倒数第二位，而copyright位于第四个字符的倒数第四位。所以从984486开始查找，向后读取一个字节提取padding_bit，再向后读取一个字节提取copyright。

故写出一下python代码进行`copyright`位的提取。

    # coding:utf-8
    import re
    import binascii

    n = 984486  # 起始位置
    result = ''
    file = open('2.mp3', 'rb')
    # 提取
    while n < 12658083:  # 结束位置
        file.seek(n, 0)
        head = file.read(1)
        padding = '{:08b}'.format(ord(head))[-2]

        file.seek(n+1, 0)
        file_read_result = file.read(1)
        result += '{:08b}'.format(ord(file_read_result))[-4]

        n += 1045 if padding == "1" else 1044
    # 拼接
    flag = ''
    textArr = re.findall('.{'+str(8)+'}', result)
    for i in textArr:
        flag = flag + chr(int(i, 2)).strip('\n')
    print(flag)

执行代码得到 `flag{b3d7bed5-e8da-4d9c-848c-e5d332d63bcd}`

成功找到Flag，收工。