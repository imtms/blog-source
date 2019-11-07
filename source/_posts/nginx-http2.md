---
title: 本站启用nginx的HTTP/2新特性
categories: By TMs
tags: [server]
date: 2015-10-14 01:11:00
---

今天新配服务器，到nginx官网下载源码，瞬间看到

> 2015-09-22	 nginx-1.9.5 mainline version has been released, featuring experimental HTTP/2 module.

Nginx终于原生支持HTTP/2了。早就听闻HTTP/2的一大堆优秀的新特性。马上开启尝尝鲜。

根据官网的说明，在编译的时候configure时加入--with-http_v2_module即可编译带ngx_http_v2_module的nginx
> The ngx_http_v2_module module (1.9.5) provides support for HTTP/2 and
> supersedes the ngx_http_spdy_module module.
> 
> This module is not built by default, it should be enabled with the
> --with-http_v2_module configuration parameter.

编译成功后在conf文件里把listen 443 ssl改为 listen 443 ssl http2即可开启http2支持

    server {
        listen 443 ssl http2;
    }

开启完毕，马上验证一下

## 开启前：
![开启前][1]

## 开启后
![开启后][2]

## 速度提升将近一倍，头部压缩、压缩HTTP头等特性表现的很明显，初始化连接和ssl的损耗都已经降到最低。看来HTTP/2的优化还是很给力的，期待更多的网站支持HTTP/2

参考阅读：
[Module ngx_http_v2_module][3]
[View the HTTP/SPDY/HTTP2 Protocol in Google Chrome][4]


  [1]: https://cdn.tms.im/article/20181026/imgs/1.png
  [2]: https://cdn.tms.im/article/20181026/imgs/2.png
  [3]: http://nginx.org/en/docs/http/ngx_http_v2_module.html
  [4]: https://ma.ttias.be/view-http-spdy-http2-protocol-google-chrome/
