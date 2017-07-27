title: MYSQL主从复制大深坑
categories: By TMs
tags: [mysql]
date: 2015-08-17 12:19:00
---

今天在配置proxy需要一主多从，配置主库的时候使用了binlog_ignore_db和binlog_do_db参数，结果发现主库的所有的update操作都不写binlog了。导致从库根本不改变。做很多操作可是show master status;里的position一直没有变过。所以从库也不会跟上操作。查阅好多资料无果。突然看到replicate-ignore-db和replicate-do-db这两个参数在从库上使用。于是试了一下。果然是因为主库的binlog_ignore_db和binlog_do_db参数的原因。虽然不知道是为什么。不过这个坑还真是爬了一上午。以后忽略复制在slave上使用replicate-ignore-db和replicate-do-db不要在主库用binlog参数了。
