---
title: Zabbix 监控windows 网卡流量（2008 64bit）
categories: By TMs
tags: [zabbix,server]
date: 2014-10-01 19:22:00
---

在windows客户端获取网卡参数列表:

typeperf -qx | find "Network Interface" | find "Bytes" 
\Network Interface(Intel[R] 82574L Gigabit Network Connection)\Bytes Total/sec

\Network Interface(Intel[R] 82574L Gigabit Network Connection _2)\Bytes Total/sec

\Network Interface(Intel[R] 82574L Gigabit Network Connection)\Bytes Received/sec

\Network Interface(Intel[R] 82574L Gigabit Network Connection _2)\Bytes Received/sec

\Network Interface(Intel[R] 82574L Gigabit Network Connection)\Bytes Sent/sec

\Network Interface(Intel[R] 82574L Gigabit Network Connection _2)\Bytes Sent/sec 

 

可直接保存为文件方便查看（typeperf -qx | find "Network Interface" | find "Bytes"  > herb.txt ）

由此看出 此台windows服务器有两块网卡在启用状态分别是

Network Interface(Intel[R] 82574L Gigabit Network Connection

Network Interface(Intel[R] 82574L Gigabit Network Connection _2

其实 这里也可以从如下图中看出 与那块网卡对应



在zabbix_agentd.conf添加

PerfCounter=Net_Incoming,"\Network Interface(Intel[R] 82574L Gigabit Network Connection)\Bytes Sent/sec",5

PerfCounter=Net_Outgoing,"\Network Interface(Intel[R] 82574L Gigabit Network Connection)\Bytes Received/sec",5
![请输入图片描述][1]
 
![请输入图片描述][2]
 

修改配置后重新启动zabbix_agentd.exe后通过

zabbix_get.exe -s 127.0.0.1 -k Net_Incoming

zabbix 添加监控项


  [1]: http://img1.ph.126.net/093vlrn26SceiR813D8p6w==/4914553093468279888.jpg
  [2]: http://adf
