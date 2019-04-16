---
title: AWS的EC2的一个小坑
categories: By TMs
tags: [server]
date: 2016-03-05 18:09:00
---

AWS为了安全默认限制了root的登录，只允许使用ec2-user登录
去/etc/ssh/sshd_config里把PermitRootLogin改成了yes并且用sudo passwd设置了密码，/etc/init.d/sshd reload后，可是还是没法用root登录。
打开/root/.ssh/authorized_keys看了一下。。
里面居然有个echo Please login as the ec2-user user rather than root user;sleep 10;......
删掉后果然好了。

好吧。后来发现是Ubuntu系统都有这个问题。。。
