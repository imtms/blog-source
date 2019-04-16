---
title: mysql主从配置
categories: By TMs
tags: [mysql]
date: 2015-01-06 11:37:00
---

在表结构和数据相同的情况下
配置主机server-id为1，从机为2
开启bin-log
主机执行
mysql>show master status;
   +------------------+----------+--------------+------------------+
   | File             | Position | Binlog_Do_DB | Binlog_Ignore_DB |
   +------------------+----------+--------------+------------------+
   | mysql-bin.000013 |      107 |              |                  |
   +------------------+----------+--------------+------------------+
   1 row in set (0.00 sec)
从机执行
change master to master_host='主机IP',master_user='用户',master_password='密码',master_log_file='mysql-bin.000013',master_log_pos=107;
然后start slave,最后show slave status;
