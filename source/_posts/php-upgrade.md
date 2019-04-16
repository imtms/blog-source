---
title: PHP升级
categories: By TMs
tags: [server,php]
date: 2015-02-28 23:24:00
---

刚刚把PHP升级到最新的5.6.6，本想升级到PHP7，但是由于没get到源码作罢。
升级完毕后部分文件显示access denied。
在stackoverflow上发现了几个解决方案，

> In your php-fpm www.conf set security.limit_extensions to .php or
> .php5 or whatever suits your environment. For some users, completely
> removing all values or setting it to FALSE was the only way to get it
> working.
> 
> In your nginx config file set fastcgi_pass to your socket address
> (e.g. unix:/var/run/php-fpm/php-fpm.sock;) instead of your server
> address and port.
> 
> Check your SCRIPT_FILENAME fastcgi param and set it according to the
> location of your files.
> 
> In your nginx config file include fastcgi_split_path_info
> ^(.+\.php)(/.+)$; in the location block where all the other fastcgi
> params are defined.


都无效，最后发现是php.ini里cgi.fix_pathinfo的值为0，造成pathinfo的部分文件没法用，修改为1重启php后解决问题。
