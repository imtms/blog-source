title: 折腾了一天服务器
categories: By TMs
tags: [server]
date: 2015-03-01 19:36:00
---

前几天因为要用到namespace等特性，把PHP升级了一下，今天索性把Nginx，PHP和MYSQL都升级到最新。
期间遇到了各种奇怪的问题包括mysql编译时候gcc版本太低，编译最新版gcc时又遇到了服务器swap不足等各种问题。
然后就是无尽的编译过程，3个小时过去了。
终于都搞定了
听说PHP5.5以后有集成Zend Opcache，在编译的时候就开启了--enable-opcache，
完成安装以后在php.ini中加入了

    [opcache]
    zend_extension="/usr/local/php/lib/php/extensions/no-debug-non-zts-20131226/opcache.so"
    opcache.enable=1
    opcache.enable_cli=1
    opcache.memory_consumption=64
    opcache.interned_strings_buffer=4
    opcache.max_accelerated_files=4000
    opcache.max_wasted_percentage=5
    opcache.revalidate_freq=60
    opcache.fast_shutdown=1
然后重启phpfpm。在phpinfo中就可以看到Zend Opcache了。
从https://gist.github.com/ck-on/4959032这里get了一个脚本可以查看命中率。看起来还不错
