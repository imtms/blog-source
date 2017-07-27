title: PHP安装redis扩展模块
categories: By TMs
tags: [redis,php]
date: 2015-05-15 00:39:00
---

每次要用redis都要引入外部库，突然想到为什么不能用php扩展模块的方式来调用redis，毕竟PHP的extension是很强大的。
于是找了一下还真有。
说一下安装过程
https://github.com/phpredis/phpredis
在这里获取phpredis的最新安装包
然后unzip或者tar解压。
先使用phpize得到configure文件，然后执行./configure --with-php-config=/usr/local/php/bin/php-config
然后make && make install
这样就在extension目录里产生了一个redis.so文件
我们要在php.ini里面载入它
在php.ini中加入

    [redis]
    extension=redis.so

重启一下php-fpm。然后进phpinfo()看一下。有redis就成功了。调用方法稍后再写。
