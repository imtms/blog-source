---
title: MYSQL事务隔离级别
categories: By TMs
date: 2016-12-05 16:59:08
tags: [mysql]
---
Mysql有四种事务隔离级别，分别是：
Read Uncommitted
Read Committed
Repeatable Read
Serializable

关于这四个隔离级别的介绍：

未提交读（READ UNCOMMITTED）。另一个事务修改了数据，但尚未提交，而本事务中的SELECT会读到这些未被提交的数据（脏读）。

提交读（READ COMMITTED）。本事务读取到的是最新的数据（其他事务提交后的）。问题是，在同一个事务里，前后两次相同的SELECT会读到不同的结果（不重复读）。

可重复读（REPEATABLE READ）。在同一个事务里，SELECT的结果是事务开始时时间点的状态，因此，同样的SELECT操作读到的结果会是一致的。但是，会有幻读现象（稍后解释）。

串行化（SERIALIZABLE）。读操作会隐式获取共享锁，可以保证不同事务间的互斥。

这四个级别逐渐增强，每个级别解决一个问题

脏读，最容易理解。另一个事务修改了数据，但尚未提交，而本事务中的SELECT会读到这些未被提交的数据。

不重复读。解决了脏读后，会遇到，同一个事务执行过程中，另外一个事务提交了新数据，因此本事务先后两次读到的数据结果会不一致。

幻读。解决了不重复读，保证了同一个事务里，查询的结果都是事务开始时的状态（一致性）。但是，如果另一个事务同时提交了新数据，本事务再更新时，就会“惊奇的”发现了这些新数据，貌似之前读到的数据是“鬼影”一样的幻觉。

可以通过select @@tx_isolation来查看当前隔离级别

通过set [ global | session ] transaction isolation level Read uncommitted | Read committed | Repeatable | Serializable来修改事务隔离级别

如果选择global，意思是此语句将应用于之后的所有session，而当前已经存在的session不受影响。

如果选择session，意思是此语句将应用于当前session内之后的所有事务。

如果什么都不写，意思是此语句将应用于当前session内的下一个还未开始的事务。