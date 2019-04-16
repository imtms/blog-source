---
title: PHP命令行消息处理程序
categories: By TMs
tags: [redis,php]
date: 2015-05-20 00:55:00
---

    <?php
    while (true) {
            $pid = pcntl_fork();
            if ($pid == -1) {
                echo date('Y-m-d H:i:s') . "fork失败！\n";
            } else if ($pid == 0) {
                $redis = new Redis();
                $redis->connect('127.0.0.1', 6379);
                //code here
                exit;
            } else {
                pcntl_wait($status);
            }
    }

pcntl_fork是PHP中的生成子进程，当调用该函数时，会返回一个进程pid，当pid为0时表明是在子进程中，所以把要执行的东西全放这里

