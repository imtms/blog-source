title: 赞一下Vultr的客服
categories: By TMs
tags: [linux,server]
date: 2015-05-06 02:38:00
---

今晚遇到的奇葩事情也是多。刚才在Vultr的两台VPS之间正通过private network传输数据呢
突然后悬挂(大雾)就断了，然后就再也ping不通对方了。
ifup，ifconfig eth1  up都试了也没有用。就差报警了。
这时机智的我去Support发了一个ticket。
没想到不到两分钟客服就回了

> Hello,
> 
> This is a known issue. We have implemented updates to our network
> infrastructure and would like to refresh your existing instance(s) to
> resolve the underlying issue. This will require us to restart your
> instance so just let us know when we can do this for you.
> 
> PLEASE NOTE: You may not perform this restart yourself; we must
> perform this for you and the restart window should be less than five
> minutes in length for any given instance.
> 
> Jeff Benfer Systems Administrator

卧槽，基础设施历史遗留问题，要重启。还不能自己来。这么坑。
好吧看来只能重启了。进服务器收拾收拾东西，发了个

> Ok,you can restart it now,I've stopped the important services.

又是不到两分钟，服务器重启好了0.0 卧槽速度好快。完全没有感觉，检查了一下确实是重启了。
这时发现，private network还是不能用啊，ifconfig了一下。没有eth1。 ifup eth1 报错

> Device eth1 does not seem to be present, delaying initialization.

哎哟卧槽看这情况是给我换了个虚拟网卡啊。
赶紧cat /etc/udev/rules.d/70-persistent-net.rules一发压压惊

    # PCI device 0x1af4:0x1000 (virtio-pci)
    SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="不给看", ATTR{type}=="1", KERNEL=="eth*", NAME="eth1"
    
    # PCI device 0x1af4:0x1000 (virtio-pci)
    SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="不给看", ATTR{type}=="1", KERNEL=="eth*", NAME="eth0"
    
    # PCI device 0x1af4:0x1000 (virtio-pci)
    SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="不给看", ATTR{type}=="1", KERNEL=="eth*", NAME="eth2"

eth1和2都有是什么鬼，又发ticket问一下小哥，三分钟后小哥回复了

> Hello,
> 
> eth2 should work for you. Please let us know if it does not.
> 
> Jeff Benfer Systems Administrator

那就把eth1的配置转移到eth2上试试吧。ifup eth2.顺利完成，互相ping了一下对面，终于通了。泪流满面

赶紧把必要的服务开启了一下，docker该开的也都开好了，MYSQL的主从同步检查了一下，还是连不上master啊

然而突然想到iptables的配置里写的3306端口只开放给eth1。赶紧去改了又show slave status\G一下。终于OK了。

然而说了这么多，除了分享网络配置和这RP不好遇到的奇葩问题以外，严重赞一下Vultr的ticket客服，凌晨两三点能在两分钟左右就回复我的ticket简直是业界良心，还能迅速解答我的问题。相比之下Digitalocean的10-20分钟略慢。国内的服务商就更不用说了。动辄一两天慢得要死不说，搞来搞去完全不专业。

最后的最后，放一下Vultr和Do的带Aff链接，虽然没人会用

[Vultr][1]  
[Digitalocean][2]


  [1]: http://www.vultr.com/?ref=6820398
  [2]: https://www.digitalocean.com/?refcode=a1727a4f2885
