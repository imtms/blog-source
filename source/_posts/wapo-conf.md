title: windows下APACHE+PHP连接ORACLE的配置
categories: By TMs
tags: [oracle,php,server]
date: 2014-10-28 08:14:00
---

现有一台windows 2008的服务器跑有apache+php+mysql的服务，最近有连接oracle数据库的需求，虽然走了很多弯路，但终于自己配置好了，现在把过程写出来分享一下
----------
由于服务器原来跑的是apache2.2+php5.3，一开始的想法是在不改变服务器软件的情况下增加oracle支持，phpinfo中看到当前使用的php.ini位置，去掉extension=php_oci8.dll前的注释。由于服务器没有跑oracle，所以需要几个关键的dll文件，要去oracle官网下载安装Oracle Instant Client。下载后，将其解压到C:\instantclient_11_2 （非固定位置），并将该路径加入到系统PATH环境变量的最前面。

这里要注意，php5.3里，用于连接oracle的oci8.dll只能支持Oracle Instant Client 11.2以下的版本，一开始安装12怎么都没法用提示无法加载静态库，还有要注意32位和64位选要和php对应，否则会提示xxx不是有效的win32程序。


到这里应该可以使用phpinfo看到OCI8模块出现。
