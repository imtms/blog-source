title: 利用Redis作为前端静态缓存加速网站访问
categories: By TMs
tags: [redis,html,php,server]
date: 2014-11-10 02:27:00
---

本想做Mysql的缓存来加速读取，但是为了练手，先用Redis做HTML页面缓存好了。

先介绍一个Credis的PHP库，官方介绍为Credis_Client, a lightweight Redis PHP standalone client and phpredis wrapper。基本操作函数都有，用起来也是很顺手的，再介绍一个名为RedisDesktopManager的跨平台redis桌面管理软件，类似navicat吧。看redis的内容和修改也是挺好用的。说起redis，前几天装了redis来练手nosql，安装过程略简单，就不写文了。
用Redis作为页面缓存无非是把不太变化的PHP页面静态化然后写入redis，然后时常检测页面更新或者设置TTL来自动更新，也可以手动更新，比如这个首页就经常采用手动更新的方式。
主要用到的就是
`ob_start();`
`require 'index.php';`
`$html = ob_get_contents();`
`ob_end_clean();`
来把本来index.php的内容静态化写入redis，这里采用Hash的数据方式用`hSet(string $key, string $field, string $value)`函数来写入数据库，用域名做key，用网址做field参数，value就是页面内容的html代码。虽然是一种比较简单粗暴的办法，但也是极为好用的。

当页面被访问时首先会用`$redis->hexists(域名, 网址)`来判断Redis内是否存在页面缓存，如果存在则直接用`$redis->hget(域名, 网址);`来调用内容显示出来。

如果页面不存在会做一次是否需要把该页面缓存的判断，这里会把不需要缓存的页面，例如：搜索页，404页之类的来进行一次判断。
如果该页面是需要缓存的页面，则调用上面的函数进行缓存，然后用hSet写入redis，再用`$redis->expire(域名, 86400);`来控制整体的刷新时间。

同时为了可以手动清除缓存，这里我进行了一次`$_get['clean']`,如果该值为all，则将会执行`$redis->del(域名);`把整个hash数据清空，即清除整个网站的页面缓存，如果该值为page，则执行`$redis->hdel(域名,网址);`来清空本页面的缓存。

至此，利用Redis来缓存页面内容已经全部搞定了，测试结果显示缓存之前每个页面的执行时间是0.05403 seconds，缓存之后的页面执行时间（仅相当于一次redis读取）为0.00068 seconds，为原来的百分之一，可见效果还是很明显的。

注：以上采用域名和网址作为key和field要进行md5之类的hash转换。
