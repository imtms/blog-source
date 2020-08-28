---
title: 折腾NodeMCU
categories: By TMs
tags: [nodemcu,hardware]
date: 2016-10-21 14:46:59
---
从淘宝买回来一个CP2102+ESP8266的小模块准备刷NodeMCU固件玩下，却发现插上电脑以后没有任何反应，本来应该电脑提示发现新硬件，但是试了多次均没有。

装驱动，找文档，看了好久都没有类似这种现象的发生，找淘宝店家也不理我。只好自己折腾下。

![nodemcu](https://cdn.tms.qnxg.net/article/20181026/nodemcu/nodemcu.jpg)

经过测试发现，flash按钮和复位按钮是有效的，于是推测是USB转UART芯片CP2102坏掉了导致电脑不识别这块板。而ESP8266应该是完好的。

查了一下NodeMCU的资料发现这货其实已经把ESP8266的全部引脚都引出了。既然这样，为何不自己做外围下载电路和UART模块来救活这个ESP8266。

翻了一下抽屉，发现手头上只有一块古老的PL-2303。于是用他做了一个USB转UART的电路。对照这块板的pinmap把RX->TXD0和TX->RXD0，VCC->+5V和GND->GND分别接好。

![pinmap](https://cdn.tms.qnxg.net/article/20181026/nodemcu/nodemcupinmap.png)

连上电脑，发现了虚拟串口设备，装好PL2303的驱动，打开ESP8266Flasher，选择好编译好的NodeMCU固件点击刷入。按住板子上的flash后点按reset。电脑成功识别到了ESP8266。

经过十几分钟的等待，终于刷入成功。

迫不及待的打开ESPlorer，连接成功。果然是CP2102的锅。终于救活了这块ESP8266，接下来就可以好好折腾NodeMCU了。