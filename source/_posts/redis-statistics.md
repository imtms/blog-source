---
title: 写了个最简单的Redis访问统计和缓存命中统计
categories: By TMs
tags: [redis]
date: 2015-05-04 23:45:00
---

核心就这么一句。。。

    $redis->incr('stat');

模版functions里面加一个

    function statredis(){
    global $redis_host;
    global $redis_port;
    global $redis;
    try{
        $redis = new Credis_Client($redis_host . ':' . $redis_port);
        echo $redis->get('stat')." visits with ".$redis->get('hit')." hit & ".$redis->get('miss')." miss";
    }
    catch (Exception $e) {
        echo "no redis";
    }
    }

然后在footer里调用就好。效果见本页底部footer。

如果想做到每个页面单独统计。就在functions里写一个$redis->incr('stat:'.$md5($_SERVER['QUERY_STRING']));
