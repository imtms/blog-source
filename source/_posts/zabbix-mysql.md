title: zabbix监控MYSQL主从复制
categories: By TMs
tags: [server,zabbix,mysql,linux]
date: 2015-03-09 16:52:00
---

保存这个脚本为sh文件
    #!/bin/bash
    /usr/local/mysql/bin/mysql -uzabbix -e 'show slave status\G' |grep -E "Slave_IO_Running|Slave_SQL_Running"|awk '{print $2}'|grep -c Yes
在zabbix_agentd.conf中下方加入以下一条语句：

    UserParameter=mysql.slavestatus,/etc/zabbix/mysqlms.sh
重启zabbix-agent，在Zabbix-Server所在服务器执行以下语句，测试是否成功：

    zabbix_get -s 192.168.1.106 -k  mysql.slavestatus
