---
title: 部署SSl证书
categories: By TMs
tags: [ssl]
date: 2014-11-09 18:08:00
---

下午拿到了
AddTrustExternalCARoot.crt
COMODORSAAddTrustCA.crt
COMODORSADomainValidationSecureServerCA.crt
xtms_me.crt
四个证书文件，用cat命令或者文本编辑器把证书合成一个文件，命名xtms.crt，然后上传服务器。
刚开始想用http+https并存的方式，配置了80端口和443端口同时存在，然后443去反代80端口的内容，后来一想，干脆全部https算了，也显得有逼格一点，于是在nginx的配置里让80的请求全部301到https
<code>server
{
listen 443; #监听 SSL端口  
server_name xtms.me www.xtms.me;
index index.html index.htm index.php default.html default.htm default.php;
root  网站目录;
ssl on;
ssl_certificate 证书目录;
ssl_certificate_key key目录;
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_ciphers "ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES256-GCM-SHA384:AES128-GCM-SHA256:AES256-SHA256:AES128-SHA256:AES256-SHA:AES128-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4";
ssl_prefer_server_ciphers on;
#error_page   404   /404.html;
location / {
index index.html index.php;
if (-f $request_filename/index.html){
rewrite (.*) $1/index.html break;
}
if (-f $request_filename/index.php){
rewrite (.*) $1/index.php;
}
if (!-f $request_filename){
rewrite (.*) /index.php;
}
}
location ~ .php$ {
fastcgi_pass  unix:/tmp/php-cgi.sock;
fastcgi_index index.php;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
include fastcgi_params;
}
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
server{  
listen 80; 
server_name xtms.me www.xtms.me;  
if ($ssl_protocol = "") {
return 301 https://$server_name$request_uri;
}
}  
</code>
重启nginx生效
