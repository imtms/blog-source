title: 两个Mysql Proxy项目---KingShard和Atlas
categories: By TMs
tags: [mysql]
date: 2015-08-17 10:42:00
---

# 1、kingshard
# 简介

kingshard是一个由Go开发高性能MySQL Proxy项目，kingshard在满足基本的读写分离的功能上，致力于简化MySQL分库分表操作；能够让DBA通过kingshard轻松平滑地实现MySQL数据库扩容。

## 主要功能：	

	1. 读写分离。
	2. 跨节点分表。
	3. 客户端IP访问控制。
	4. 平滑上线DB或下线DB，前端应用无感知。
	5. 支持多个slave，slave之间通过权值进行负载均衡。
	6. 支持强制读主库。
	7. 支持将sql发送到特定的node。
	8. 支持在单个node上执行事务，不支持跨多个node执行事务。
	
## 安装

    1. Install Go
    2. git clone https://github.com/flike/kingshard.git src/github.com/flike/kingshard
    3. cd src/github.com/flike/kingshard
    4. source ./dev.sh
    5. make
    6. set the config file (etc/multi.yaml)
    7. run kingshard (./bin/kingshard -config=etc/multi.yaml)



# 2、Atlas
# 简介

Atlas是由 Qihoo 360公司Web平台部基础架构团队开发维护的一个基于MySQL协议的数据中间层项目。它在MySQL官方推出的MySQL-Proxy 0.8.2版本的基础上，修改了大量bug，添加了很多功能特性。目前该项目在360公司内部得到了广泛应用，很多MySQL业务已经接入了Atlas平台，每天承载的读写请求数达几十亿条。同时，有超过50家公司在生产环境中部署了Atlas，超过800人已加入了我们的开发者交流群，并且这些数字还在不断增加。
    
主要功能：

1.读写分离

2.从库负载均衡

3.IP过滤

4.自动分表

5.DBA可平滑上下线DB

6.自动摘除宕机的DB

# Atlas相对于官方MySQL-Proxy的优势

1.将主流程中所有Lua代码用C重写，Lua仅用于管理接口

2.重写网络模型、线程模型

3.实现了真正意义上的连接池

4.优化了锁机制，性能提高数十倍

# Atlas详细说明

[1.Atlas的安装](http://github.com/Qihoo360/Atlas/wiki/Atlas的安装)

[2.Atlas的运行及常见问题](http://github.com/Qihoo360/Atlas/wiki/Atlas的运行及常见问题)

[3.Atlas的分表功能简介](http://github.com/Qihoo360/Atlas/wiki/Atlas的分表功能简介)

[4.Atlas部分配置参数及原理详解](http://github.com/Qihoo360/Atlas/wiki/Atlas部分配置参数及原理详解)

[5.Atlas的架构](https://github.com/Qihoo360/Atlas/wiki/Atlas的架构)

[6.Atlas的性能测试](https://github.com/Qihoo360/Atlas/wiki/Atlas的性能测试)

[7.Atlas功能特点FAQ](https://github.com/Qihoo360/Atlas/wiki/Atlas功能特点FAQ)

[8.Atlas Sharding](https://github.com/Qihoo360/Atlas/wiki/Atlas-Sharding)

# 名字来源

Atlas：希腊神话中双肩撑天的巨人，普罗米修斯的兄弟，最高大强壮的神之一，因反抗宙斯失败而被罚顶天。我们期望这个系统能够脚踏后端DB，为前端应用撑起一片天。

