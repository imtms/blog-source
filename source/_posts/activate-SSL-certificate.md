title: 激活SSL证书
categories: By TMs
tags: [ssl]
date: 2014-10-28 19:58:00
---

今天才想起来之前送的一年的PositiveSSL证书。去激活了一下。
总体流程就是生成证书->签名->填写资料->通过
根据CSR Generation: Using OpenSSL (Apache w/mod_ssl, NGINX, OS X)的介绍
在linux下用openssl req -nodes -newkey rsa:2048 -keyout myserver.key -out server.csr
然后输入一堆资料 即可生成一个key文件和一个csr文件
保存好key，然后用文本编辑器打开csr复制即可。然后在相应网站填写资料。坐等通过。

