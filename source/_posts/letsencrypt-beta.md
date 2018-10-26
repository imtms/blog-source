title: 换上了用Let's Encrypt Closed Beta自己签发的证书
categories: By TMs
tags: [server]
date: 2015-11-05 14:32:00
---

先上图。两个小时的成果。
![letsencrypt][1]

在10月31的时候就收到了letsencrypt发的 Let's Encrypt Closed Beta Invite‏ 说我的tms.im和www.tms.im已经加入内测白名单。可惜这封邮件被“智能”的丢进了垃圾邮件文件夹。导致我今天才看到。于是来折腾一下。

在开始之前先严重吐槽下，可能是由于内测或者该计划刚开始还不完善的原因。这个东西特别特别特别不亲民。我搞了两个多小时才签了一个证书出来。突然发现只签了tms.im没签www.tms.im。于是又用了40分钟的时间重新签了这两个。外加这货的有效期只有三个月，也就是说三个月以后我要重新签。在现在年付的付费证书已经这么便宜的情况下。到底letsencrypt有没有竞争力。

下面正文。

由于现在还是内测。官方在邮件里提供了一个内测用的API路径。

> To use Let's Encrypt's official client to obtain your real
> certificates, you will need to provide the production API URL on the
> command line:
> 
>   https://acme-v01.api.letsencrypt.org/directory

还提供了软件

> git clone https://github.com/letsencrypt/letsencrypt   cd letsencrypt 
> ./letsencrypt-auto --agree-dev-preview --server \
>       https://acme-v01.api.letsencrypt.org/directory auth

但是装好软件以后运行./letsencrypt-auto报错。

    Command "python setup.py egg_info" failed with error code 1 in /tmp/pip-build-Wa1Lwq/ConfigArgParse

去官方论坛https://community.letsencrypt.org/看了一下说只支持python2.7，不支持2.6。 好吧我centos6.7默认是2.6的python。也懒得搞成2.7了，于是另开了一台centos7的服务器来签发。

执行./letsencrypt-auto --agree-dev-preview --server https://acme-v01.api.letsencrypt.org/directory auth -d tms.im -d www.tms.im 

       报错The program nginx (process ID 7176) is already listening on TCP port 
        80. This will prevent us from binding to that port. Please stop the  
        nginx program temporarily and then try again.      

提醒我80端口被占用。验证个域名所有权还要关80端口额。还好只是个个人博客。如果我是生产用的域名和服务器怎么办。总不能停机去搞域名验证吧。

暂时停了80的nginx。终于进到了下一步。然后又开始报错

    Failed authorization procedure. tms.im (dvsni): unauthorized :: The client lacks sufficient authorization :: Correct zName not found for TLS SNI challenge

只好切换用手动模式：后面加一个
-a manual

手动模式告诉我需要自己开一个 SimpleHTTPServer 来搞验证，并且给了我一堆指令。我以为它会自动开呢。用netstat看了一下，果然没有自动开。好吧我只好手动调用python开一个SimpleHTTPServer 。然后按照每次验证它给的路径和文件名和文件内容创建对应的验证文件。

当我以为这样就可以通过验证的时候，letsencrypt告诉我还是tooyoung

    :: The client lacks sufficient authorization :: Invalid response from http://tms.im/.well-known/acme-challenge/g2eyBgAf3Z-NpzBAzTrvxopLxJ1PH1I8lt7sqiA01sQ [103.242.111.8]

什么。不是已经开好SimpleHTTPServer 了么。我的SimpleHTTPServer 里也有access log啊。我在浏览器打开也可以访问啊。再仔细一看IP是103.242.111.8。这，我不是改了DNS指向验证用的这台服务器了么，为什么非要去以前的服务器验证。

可能是远程API那边DNS更新比较慢吧。可是我用nslookup看了一下主要的几个DNS服务器都更新过了啊。鬼知道他们用的什么DNS，或者是就是有机制让你不能改IP验证？谁知道呢。只好在以前的服务器上也开了个SimpleHTTPServer，放入同样的验证文件。再进行验证。

这下终于生成成功了。最新的证书和私钥都在/etc/letsencrypt/live/$domain里面。内测阶段只能签三个月的证书。

/etc/letsencrypt/keys里面存的是所有的包括之前和最新的证书。

最好把整个/etc/letsencrypt目录都备份一下，里面是包括邮箱和token之类的东西。以后renew的时候用的。

折腾了两个多小时签发出第一张免费证书。letsencrypt还有很长的路要走啊。

  [1]: https://cdn.tms.qnxg.net/article/20181026/imgs/4.png
