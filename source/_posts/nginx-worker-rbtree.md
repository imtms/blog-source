---
title: nginx模块开发遇到的一个坑
categories: By TMs
tags: [server]
date: 2017-12-1 18:11:00
---

先说总结：ngx_rbtree在不同worker进程相互独立。

然后是过程：

今天因为一个nginx模块开发的时候，不同fd进来使用ngx_find_value在红黑树ngx_rbtree里找不到上一个fd设置的值的情况，调试了一下午。

突然想起来nginx是多进程模式，有一个worker_processes参数。而模块又是worker进程分别调用，同样红黑树也是不同worker进程维护自己的红黑树。

怪不得接入不同worker的fd在红黑树中设置的值相互查不到。