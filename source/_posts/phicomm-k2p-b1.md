title: K2P B1版本刷梅林固件
categories: By TMs
tags: [hardware]
date: 2017-11-03 15:22:00
---

# 前言

由于K2拿回家里用了，于是又撸了一台K2P放在办公室用，也是为了它的千兆有线网口，毕竟办公室是千兆网，通过K2P访问共享存储会方便快速很多。

早上下的单，第二天中午才到，一到手还是熟悉的开箱，长相颜值确实比K2高了很多，网上很多图片我也就不放了，银色版本，全身金属质感，炫酷。

# 简介

到手第一件事依旧是刷机，毕竟原生固件有众所周知的问题，但是一看我这版本是B1，哎毕竟非洲人。

K2P出了两个不同版本（或者严谨的说是三个，但是A2和A1只是在电容和屏蔽罩上有差别，CPU都是一样的，就不细分了），分别是A1和B1。其中A1采用的MTK MT7621A的处理器，而B1采用的是博通BCM47189，性能上面的差别网上众说纷纭，但是我试用下来反正千兆能跑满，也就不纠结那么多了。毕竟不花钱又能要求啥呢。

如果你是A1版本，那么恭喜你，网上有很多傻瓜方案都可以搞定，非常简单方便，大致流程无非是刷入Breed->刷入固件->开心使用吧。甚至Bootloader都有很多种，除了Breed还有其他可选。固件更是有非常多的选择，这里推荐荒野无灯的padavan，毕竟我K2也用的padavan还不错，当然如果喜欢LEDE之类的爱折腾的玩家也可以刷入LEDE等其他固件。

而我这B1版本就比较惨了（连官方都没出适配B1的固件），因为博通方案的缘故，Breed是没希望了，看了下至少还有一个梅林固件可用，并且CFE的一个小漏洞也让我们能开启telnet进行一些命令行操作，勉强够用了，期待以后有更多大神推出更多固件和BL。

# 刷机（仅限B1）

## 准备（开Telnet）

1. 首先要进入官方的CFE恢复界面，开启一下telnet功能来备份官方固件（毕竟万一梅林不好用或者哪天用到了官方固件）。方法还是老套路，长按reset开机，10s后可以用192.168.2.1进入CFE界面。（这里吐槽一下斐讯的路由器默认IP居然是192.168.2.X段的）

2. 去http://pan.baidu.com/s/1boIHBXH下载修改版的固件。

3. 在计算机上启动tftp服务器，将固件解压后放入tftp服务器根目录，然后在CFE网页输入
    
    http://192.168.2.1/do.htm?cmd=flash+-noheader+你电脑IP:固件名
    
固件名默认是k2p_bcm_v10d.bin+flash0.trx，而电脑IP我设置的192.168.2.2

4. 等个几分钟就刷好了。可以ping 192.168.2.1来看，刷的时候是不通的，刷完又通了。然后重启。

## 备份官方固件

1. telnet进去路由器

2. cat /dev/mtd0 /dev/mtd1 /dev/mtd3 /dev/mtd4 /dev/mtd5 /dev/mtd6 /dev/mtd7 > /tmp/all.bin 

3. mount --bind /tmp/all.bin /www/web-static/fonts/icofont.eot 

4. 去http://192.168.2.1/web-static/fonts/icofont.eot下载固件
下载后将icofont.eot改名为all.bin,并确认固件大小为16777216字节 

## 刷机

1. http://pan.baidu.com/s/1boIHBXH 下载固件
2. 同样在tftp服务器根目录下放上固件。使用
    http://192.168.2.1/do.htm?cmd=flash+-noheader+你电脑IP:固件名 刷入
（这里固件名是K2P_Merlin_V10d.trx+flash0.trx）
3. ping一下看刷完了用http://192.168.2.1/do.htm?cmd=nvram+erase清除下内存，然后重启。
4. 享受梅林固件

## 恢复MAC地址

因为梅林和官方的内存结构不一样，所以mac地址没了，需要手动设置一下。刷完以后在web的“系统管理”-“系统设置”页面打开telnet或ssh，telnet或ssh登录名和密码是你的web登录名及密码。

ssh上去使用 

    设置WAN口地址
    nvram set wan0_hwaddr=路由器MAC地址
    设置LAN口地址
    nvram set lan_hwaddr=路由器MAC地址 
    nvram set et0macaddr=路由器MAC地址 
    设置2.4G地址
    nvram set w1_hwaddr=路由器MAC地址
    nvram set wl0_hwaddr=路由器MAC地址
    nvram set 0:macaddr=路由器MAC地址
    设置5G地址
    nvram set wl1_hwaddr=路由器MAC地址+1
    nvram set sb/1/macaddr=路由器MAC地址+1
    保存上述设置
    nvram commit
    
即可

## 后记

刷完以后用了一段时间，表示一切正常，需要的功能（你懂得）都有，还可以开双WAN，千兆也可以跑满，不错的说。