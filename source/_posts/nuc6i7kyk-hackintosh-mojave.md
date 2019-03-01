---
title: 骷髅峡谷(nuc6i7kyk)安装黑苹果(macOS Mojave 10.14.3)
categories: By TMs
tags: [hardware]
date: 2019-3-1 16:06:59
---

### 一、前言

其实很久以前就给骷髅峡谷装过10.13版本的黑苹果+WIN10双系统，并且成功更新到Mojave。后来因为用的少又格式化掉了。去年用了一年的MacBook Pro以后，已经熟悉了苹果系统，并且基本工作都在macOS下完成了，遂又萌生了把骷髅峡谷装成苹果系统的想法。

黑苹果背后的基础知识我就不过多介绍了，可以在国内外各种论坛上了解，既然这次要搞，就要做到极致，目标是安装最新版的macOS系统，并且把能驱动的所有硬件都正常驱动起来，尽量完美使用骷髅峡谷的所有功能和最高效率。

### 二、准备

准备工作，需要的东西只是一个8G以上的U盘而已，USB3.0的为佳，因为速度会快很多。

安装黑苹果的步骤大同小异，因为这次是全盘格式化全新安装，所以我直接选择原版安装盘，使用原版安装包的磁盘管理来格式化全盘。

截止到写这篇文章为止，最新版的macOS是Mojave版本10.14.3 (18D109)，使用手头的MacBook Pro直接在应用商店搜索Mojave就可以下载安装包。

下载完成后，这里因为图省事，直接使用了UniBeast来制作安装盘。这是全球最大的黑苹果论坛tonymacx86上的人开发的一款快速制作安装盘的工具，其实原理大同小异，不管MBR还是GPT分区表，首先把U盘格式化为两个区，其中EFI分区可以用FAT32或者其他格式，然后把安装包放在另一个区，并且做好引导记录，把Clover安装到EFI分区里，并且放好最小依赖的一些kext和config，安装盘就制作好了。

### 三、设置

这里稍微说一下我的配置，骷髅峡谷CPU是i7 6770HQ，内存我装的16G单条，SSD是SanDisk的256G非NVME接口。外接一台苹果的Apple LED Cinema Display，通过DP接口连接。

通过各方面查资料，得知我的配置没有什么和macOS不兼容的，需要调节的只是骷髅峡谷本身的一些硬件的开关。遂安心。

接下来进行一些基本BIOS设置，来把不兼容的地方修改掉。

- Power->Secondary Power Settings, "Wake on LAN from S4/S5", 设置成 "Stay Off"
- Devices->Video, "IGD Minimum Memory" 设置为 64mb 
- Devices->Video, "IGD Aperture Size" 设置为 256mb 
- Boot->Secure Boot, "Secure Boot" 设置为 disabled
- Security->Security Features, "Execute Disable Bit" 设置为 enabled.
- Security->Security Features, "VT-d" 设置为 disabled 

这里说一下骷髅峡谷的无线网卡芯片是苹果系统不支持的，所以目前没有办法驱动，可以关掉。但是蓝牙是可用的。

### 四、安装

插入安装U盘，开机，按F12选择从U盘启动，选择安装macOS，进入安装界面。选择磁盘工具，把整个硬盘格式化为APFS格式（Mojave只支持装在APFS分区格式上），回去选择安装，一路下一步，安装完毕自动重启。

至此系统安装完毕。

这时候安装完的macOS只是在硬盘上，因为骷髅峡谷不是苹果电脑，没法直接启动苹果系统，所以需要第三方启动器来进行引导。这时候我们就要请出Clover，关于这个启动器的资料可以上网查找，反正很强就是了。

介于刚才我们的U盘安装盘上已经装了这玩意，所以还是可以通过插入U盘来选择U盘启动，这时候Clover里多了一些选择，其中有一个preboot还是啥的可以引导进入硬盘里的苹果系统。继续执行安装过程。包括选择时区，设置用户名密码之类的，直到正式安装完毕

### 五、启动

再次重启，从U盘启动。我们终于看到了Boot from macOS选项。标志着macOS已经安装完毕到硬盘了。但是这只是神坑的刚刚开始。

这时候选择Boot from macOS，基本是进不去的。通过-v来看输出的log，有各种问题，需要对症下药，这里给出一个基本完美的解决方案，大致不会出现什么问题。

把U盘插到另一个电脑上，挂载EFI分区，做一下修改。

- 把clover升级到 v4658版本以上，最好是用 https://github.com/RehabMan/Clover 这个大神的版本，里面自带了一些驱动。
- 安装IntelMausiEthernet.kext到clover的kext文件夹
- 使用 https://github.com/RehabMan/Intel-NUC-DSDT-Patch/raw/master/config_install_nuc6_sc.plist 这里的config.plist
- 如果你使用HDMI可能还需要按照文末的参考文献里的链接来设置一下fakeID
- 其他的kexts基本都可以先删掉，以防不兼容。

把调整完毕以后的clover启动盘插上，开机，U盘启动，选择Boot from macOS（最好还是-v看看log）。不出意外的话应该可以进入系统了。如果还是不行，需要看看-v输出的log，解决对应的error，有问题也可以和我交流。

最后需要把U盘里调好的可以启动macOS的Clover安装到硬盘的EFI分区，步骤和安装U盘Clover的差不多，如果你是UniBeast做的U盘，那你需要下载一个 https://github.com/RehabMan/Clover 的release并且安装。然后复制U盘Clover的相应文件到EFI分区即可了。

做完这步以后拔掉U盘重启，应该也可以使用硬盘的Clover引导进入macOS了。

### 六、调优

这时候应该可以正常启动进入macOS了，其实到这里，已经可以正常使用了。大部分硬件已经正常工作，可能性能不是最好或者部分硬件罢工罢了。如果不想折腾，或者只是体验，到这里就可以了。

如果要继续折腾可以继续看下去，但是调优这玩意是无止境的，每一个硬件都能折腾好几天，这里选择采用国外大神已经调节好的一些参数，加上部分需要自己调节的。

首先安装依赖，进入终端输入

    xcode-select --install
    
安装完毕以后开始clone大神的git并使用

    mkdir ~/Projects
    cd ~/Projects
    git clone https://github.com/RehabMan/Intel-NUC-DSDT-Patch nuc.git
    cd ~/Projects/nuc.git
    ./download.sh
    ./install_downloads.sh
    make
    make install_nuc6sc

这样会自动编译DSDT/SSDT并且复制到EFI分区。

针对nuc的电源管理，执行

    sudo pmset -a hibernatemode 0
    sudo rm /var/vm/sleepimage
    sudo mkdir /var/vm/sleepimage

最后使用文件夹里的config.plist

    cp config_nuc6_sc.plist /Volumes/EFI/EFI/Clover/config.plist

这样调优就基本完成了，后续我又碰到了声音方面的问题和USB3.0不识别和掉速的问题。需要自己通过maciASL和各种kext注入的方法来解决。比较麻烦，后续如果有时间再写。

### 七、参考

https://www.tonymacx86.com/threads/guide-intel-skylake-nuc6-and-skull-canyon-using-clover-uefi-nuc6i5syk-nuc6i7kyk-etc.261708/

https://www.tonymacx86.com/threads/guide-booting-the-os-x-installer-on-laptops-with-clover.148093/

https://www.tonymacx86.com/resources/categories/tonymacx86-downloads.3/