---
title: 给Pico-Pi-I.MX7D安装Debian系统
date: 2020-06-01 15:50:00
categories: By TMs
tags: [hardware]
---

手上有个闲置的PicoPI-I.MX7D，使用的是NXP的MCIMX7D7DVM10SC芯片，看了一下是ARM v7架构的，拥有512M内存和1G主频。虽然很鸡肋，但是好歹是个板子，不用又觉得浪费，于是想装一个Debian Linux上去跑跑小脚本用。

查阅了一圈资料发现，想用这货跑起debian需要自己编译内核外加使用u-boot来启动。
说干就干

###1. BootLoader的写入

安装一些交叉编译的依赖库和软件

ARM Cross Compiler: GCC

```
wget -c https://releases.linaro.org/components/toolchain/binaries/6.5-2018.12/arm-linux-gnueabihf/gcc-linaro-6.5.0-2018.12-x86_64_arm-linux-gnueabihf.tar.xz
tar xf gcc-linaro-6.5.0-2018.12-x86_64_arm-linux-gnueabihf.tar.xz
export CC=`pwd`/gcc-linaro-6.5.0-2018.12-x86_64_arm-linux-gnueabihf/bin/arm-linux-gnueabihf-
```
```
${CC}gcc --version
```

接下来编译U-boot

```
git clone -b v2019.07-rc4 https://github.com/u-boot/u-boot --depth=1
cd u-boot/
make ARCH=arm CROSS_COMPILE=${CC} distclean
make ARCH=arm CROSS_COMPILE=${CC} pico-pi-imx7d_defconfig
make ARCH=arm CROSS_COMPILE=${CC}
```

这样我们就拥有了一个适用于imx7d的U-boot。

想把BootLoader下载到板子上，需要用官方的 imx_usb_loader

连接板子的Console串口和type-c数据接口，从Github下载 imx_usb_loader。设置跳线到Download模式

```
git clone https://github.com/boundarydevices/imx_usb_loader
cd imx_usb_loader/
make
```
```
lsusb | grep Freescale
Bus 00x Device 00y: ID 15a2:0076 Freescale Semiconductor, Inc
```

使用imx_usb_loader加载SPL和uboot进系统

```
sudo ~/imx_usb_loader/imx_usb u-boot/SPL
sudo ~/imx_usb_loader/imx_usb u-boot/u-boot-dtb.img
```
这样系统就能从U-boot启动了。

```
Loading Environment from MMC... OK
In:    serial
Out:   serial
Err:   serial
Net:   FEC0
Hit any key to stop autoboot:  0
=>
```

在U-boot里设置一些参数以便启动dfu-agent

```
=> env default -f -a
=> saveenv

=> mmc partconf 0 0 7 0
=> dfu 0 mmc 0
```

这样就可以使用dfu-util写入u-boot到板子的eMMC存储了

```
sudo dfu-util -D u-boot/SPL -a spl
sudo dfu-util -R -D u-boot/u-boot-dtb.img -a u-boot
```
接下来就可以把板子从Download模式恢复为eMMC启动模式

重启以后板子会自动启动到U-boot，这时候在串口可以捕捉到u-boot，并且启用挂载外置存储模式，以便往eMMC里写入系统。

```
Loading Environment from MMC... OK
In:    serial
Out:   serial
Err:   serial
Net:   FEC0
Hit any key to stop autoboot:  0
=> ums 0 mmc 0
```
此时电脑上应该已经可以看到USB外接存储

```
lsusb | grep Netchip
Bus 00x Device 00y: ID 0525:a4a5 Netchip Technology, Inc. Pocketbook Pro 903
```

###2. 系统的内核编译和写入

#####Linux Kernel

```
git clone https://github.com/RobertCNelson/armv7-lpae-multiplatform
cd armv7-lpae-multiplatform/
./build_kernel.sh
```
这里要耗费大量时间来编译内核，以及缺少各种依赖库需要安装，大概三四个小时的时间。

####RootFS

首先选择系统，这里我选择的是Debian 10，当然也可以使用Ubuntu 20

Debian 10

```
wget -c https://rcn-ee.com/rootfs/eewiki/minfs/debian-10.4-minimal-armhf-2020-05-10.tar.xz
sha256sum debian-10.4-minimal-armhf-2020-05-10.tar.xz
cd598e42850cbef87602bf15ee343abfbf0d8c6ba81028c741672b5f24263534  debian-10.4-minimal-armhf-2020-05-10.tar.xz
tar xf debian-10.4-minimal-armhf-2020-05-10.tar.xz
```
Ubuntu 20.04 LTS

```
wget -c https://rcn-ee.com/rootfs/eewiki/minfs/ubuntu-20.04-minimal-armhf-2020-05-10.tar.xz
sha256sum ubuntu-20.04-minimal-armhf-2020-05-10.tar.xz
de0177ac9259fdbcc626ee239f4258b64070c0921dbc38c45fab6925a5becaa1  ubuntu-20.04-minimal-armhf-2020-05-10.tar.xz
tar xf ubuntu-20.04-minimal-armhf-2020-05-10.tar.xz
```

使用lsblk找到外置存储，我的是/dev/sdb1，并且进行清零

```
export DISK=/dev/sdb
sudo dd if=/dev/zero of=${DISK} bs=1M count=10
```

再次安装BootLoader

```
sudo dd if=./u-boot/SPL of=${DISK} seek=1 bs=1k
sudo dd if=./u-boot/u-boot-dtb.img of=${DISK} seek=69 bs=1k
```

创建分区

```
sudo sfdisk ${DISK} <<-__EOF__
1M,,L,*
__EOF__
```

格式化并挂载分区

```
sudo mkfs.ext4 -L rootfs ${DISK}1
sudo mkdir -p /media/rootfs/
sudo mount ${DISK}1 /media/rootfs/
```

首先写入rootfs
```
sudo tar xfvp ./*-*-*-armhf-*/armhf-rootfs-*.tar -C /media/rootfs/
sync
sudo chown root:root /media/rootfs/
sudo chmod 755 /media/rootfs/
```

然后找到编译完成的内核版本，如kernel_version=5.X.Y-Z

```
export kernel_version=5.X.Y-Z

sudo mkdir -p /media/rootfs/boot/extlinux/
sudo sh -c "echo 'label Linux ${kernel_version}' > /media/rootfs/boot/extlinux/extlinux.conf"
sudo sh -c "echo '    kernel /boot/vmlinuz-${kernel_version}' >> /media/rootfs/boot/extlinux/extlinux.conf"
sudo sh -c "echo '    append root=/dev/mmcblk2p1 ro rootfstype=ext4 rootwait quiet' >> /media/rootfs/boot/extlinux/extlinux.conf"
sudo sh -c "echo '    fdtdir /boot/dtbs/${kernel_version}/' >> /media/rootfs/boot/extlinux/extlinux.conf"

sudo cp -v ./armv7-lpae-multiplatform/deploy/${kernel_version}.zImage /media/rootfs/boot/vmlinuz-${kernel_version}

sudo mkdir -p /media/rootfs/boot/dtbs/${kernel_version}/
sudo tar xfv ./armv7-lpae-multiplatform/deploy/${kernel_version}-dtbs.tar.gz -C /media/rootfs/boot/dtbs/${kernel_version}/

sudo tar xfv ./armv7-lpae-multiplatform/deploy/${kernel_version}-modules.tar.gz -C /media/rootfs/

sudo sh -c "echo '/dev/mmcblk2p1  /  auto  errors=remount-ro  0  1' >> /media/rootfs/etc/fstab"
```
最后写入完成重启即可。

```
sync
sudo umount /media/rootfs
```
串口Console端

```
Loading Environment from MMC... OK
In:    serial
Out:   serial
Err:   serial
Net:   FEC0
Hit any key to stop autoboot:  0
=> ums 0 mmc 0
UMS: LUN 0, dev0, hwpart 0, section 0x0, count 0x720000
Ctrl+C to exit ...
=> reset
```
重启后就会自动进入Debian了

参考资料：

https://developer.android.com/things/hardware/imx7d

https://www.nxp.com/part/MCIMX7D7DVM10SC#/

https://www.digikey.com/eewiki/display/linuxonarm/PICO-PI-IMX7
