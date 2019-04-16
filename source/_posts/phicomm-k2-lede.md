---
title: 折腾斐讯K2刷LEDE
categories: By TMs
tags: [hardware]
date: 2017-02-22 16:45:21
---

昨天又看到有人上车，于是没有经受住诱惑，撸了一台蓝色的斐讯K2，不知道能不能安全下车。颜值嘛还可以。做功嘛略显粗糙。打开看了一下配置。MT7620，64M的RAM和8M的ROM。。。这也能标399的价格，也是呵呵了。
----------
首先刷一个优秀的Bootloader，这里我选择Breed，毕竟当年的U-Boot已经不行了。
这里有一个神奇的方法可以刷入Breed，不禁让我对作者的脑洞感到由衷的佩服。只有一句“这TM也行”可以表达我的内心想法了。

[http://www.right.com.cn/forum/thread-204435-1-1.html][1]

刷完Breed以后重启长按reset就可以进入刷机模式，就可以刷入系统固件了。
多年经验告诉我Openwrt是个好固件，然而去年openwrt内部出现了一些问题。导致有一部分核心人员独立出来成立了LEDE-Project。全称Linux Embedded Development Environment（名字起的好霸气啊），想想以前那么多的openwrt版本，那么混乱的Issue管理和补丁发布。这次还是试试LEDE吧。毕竟是新项目，又是openwrt的核心团队搞的，应该会不错的。

[LEDE官网在此][2]

在官网一搜，居然有K2的专门版本。这下好了，不用自己编译了。交叉编译搞死人。搜索PHICOMM K2 PSG1218就可以找到了。这里也贴一下[下载地址][3]。
刷完之后重启。看到一个丑丑的Luci界面。

配置好密码和网络等基本配置。还剩90%的剩余空间。爽啊。果断准备安装全套[不可描述]、[不可描述]和[不可描述]的软件。
安装过程中就不写了。水表已拆。说一句现在安装和编译东西比几年前我搞hg255d的时候简单方便多了。又不用考虑剩余内存。简直是一帆风顺啊。
嗯再放一个获取中国国内IP列表的脚本吧。

    wget -O- 'http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest' | awk -F\| '/CN\|ipv4/ { printf("%s/%d\n", $4, 32-log($5)/log(2)) }' > /etc/不可描述.txt

最后装一个luci-i18n汉化包和theme包美化一下。结束战斗。

测试一下2.4G+5G（虽然我只开了5G）信号都还是不错的。速度也还算稳定。[不可描述]的速度也能跑满带宽。十分满意。最后贴个界面图，这个	luci-theme-material还是挺好看的。
![图][4]


  [1]: http://www.right.com.cn/forum/thread-204435-1-1.html
  [2]: https://lede-project.org/
  [3]: https://downloads.lede-project.org/releases/17.01.0-rc2/targets/ramips/mt7620/lede-17.01.0-rc2-r3131-42f3c1f-ramips-mt7620-psg1218-squashfs-sysupgrade.bin
  [4]: https://cdn.tms.qnxg.net/article/20181026/textimg/lede.png