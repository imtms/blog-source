---
title: CentOS 下用的是lnmp 的包配置Nginx 下的CI伪静态
categories: By TMs
tags: [server,nginx]
date: 2014-09-10 17:02:00
---

    server
            {
                    listen       80;
                    server_name cy.com;
                    index index.html index.htm index.php default.html default.htm default.php;
                    root  /home/wwwroot/cy;
    
                    location / {
                          if (-e $request_filename) {
                                    break;
                            }
    　　　　　　　　　　　　　if (-f $request_filename) {
    　　　　　　　　　　        expires max;
    　　　　　　　　　　        break;
        　　　　　　　　　　　}
                           if (!-e $request_filename) {
                                    rewrite ^/(.*)$ /index.php/$1 last;
                            }
                    }
    
            #       include ci.conf;
                    location ~ .*\.(php|php5)?$
                            {
                                    try_files $uri =404;
                                    fastcgi_pass  unix:/tmp/php-cgi.sock;
                                    fastcgi_index index.php;
                                    include fcgi.conf;
                            }
            location /index.php {
                fastcgi_pass  unix:/tmp/php-cgi.sock;
                fastcgi_param SCRIPT_FILENAME /home/wwwroot/cy/index.php;
                fastcgi_param PATH_INFO $fastcgi_path_info;
                fastcgi_split_path_info ^(.+\.php)(.*)$;
                fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
                include fcgi.conf;
            }
            #       location ~ /index.php/ {
            #               fastcgi_pass  unix:/tmp/php-cgi.sock;
            #               fastcgi_index   index.php;
            #               include fcgi.conf;
            #       }
                    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
                            {
                                    expires      30d;
                            }
    
                    location ~ .*\.(js|css)?$
                            {
                                    expires      12h;
                            }
    
                    access_log off;
            }

复制代码
在Nginx下通过ci框架开发项目时，发现ci框架在nginx下是不能运行的，在网络上搜索了相关资料后可通过修改相关配置实现nginx支持PHP的ci框架。

1、修改ci框架的配置文件 config/config.php
修改$config['uri_protocol']值
改为：

$config['uri_protocol'] = 'PATH_INFO';
2、修改nginx配置文件，在SERVER段中添加如下代码：

复制代码

    location /index.php{
        fastcgi_pass  unix:/tmp/php-cgi.sock;
        fastcgi_param SCRIPT_FILENAME /home/wwwroot/index.php;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_split_path_info ^(.+\.php)(.*)$;
        fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
        include fcgi.conf;
    }

复制代码
如果有多个应用，如：后台应用，可以多加一段以上代码，并修改相应入口文件：

复制代码

    location /admin.php{
        fastcgi_pass  unix:/tmp/php-cgi.sock;
        fastcgi_param SCRIPT_FILENAME /home/wwwroot/admin.php;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_split_path_info ^(.+\.php)(.*)$;
        fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
        include fcgi.conf;
    }

复制代码
第一次访问的时候，我是这么访问

http://cy.com/index.php/admin

我有一个admin 的目录

---------------------------------

如果出现了 Access Denied

----------------------------------------------

请检查

1、 php.ini（/etc/php5/cgi/php.ini）的配置中这两项
cgi.fix_pathinfo=1  （这个是自己添加的）
