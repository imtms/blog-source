---
title: 使用NodeMCU和AM2302(DHT22)制作的在线温湿度监控系统
date: 2016-10-21 15:18:00
categories: By TMs
tags: [nodemcu,hardware]
---
NodeMCU可以用了，而手头上还有一块AM2302(DHT22)的温湿度测量模块。于是就想折腾一个可以实时监控温湿度并且上传到服务器，存到数据库供随时查看变化的温湿度监控系统。

首先查阅了NodeMCU的文档，初步确定了使用wifi模块连接wifi，http模块负责利用post上传数据，net模块来建立本地服务器供实时查看，tmr模块来做定时器定时获取数据，DHT模块来读取DHT22的数据，所以重新编译了内置了DHT Module的NodeMCU固件刷入。


首先在服务器上建立了一个数据库的两个数据表来存储相应数据，其中station表存储不同的NodeMCU模块的IP和上线时间，以供未来扩展多个监测点的时候使用，而data表存储具体的温度湿度和数据采集时间。

硬件连接首先是AM2302(DHT22)的VCC和GND分别接NodeMCU的3.3和GND输出。其次是DATA和NodeMCU的D5口相连，即可。

这里定义dhtpin=5

首先通过

	wifi.setmode(wifi.STATION)
	wifi.sta.config("wifi SSID","password")
	wifi.sta.connect()

连接wifi，不要忘记设定dns地址

	net.dns.setdnsserver("114.114.114.114", 0)

并且做了一个定时器，每隔一秒确认是否连接成功，连接成功以后会像服务器发起post请求把自己的IP和station ID汇报给服务器，代表监测站上线成功。其中监测站id即station变量我以地理位置+chipid来定义。

	tmr.alarm(2, 1000, 1, function()
    if wifi.sta.status()==5 then
    http.post('URL',
          'Content-Type: application/json\r\n',
          '{"station":"'..station..'","ip":"'..wifi.sta.getip()..'","pass":"password"}',
          function(code, data)
            if (code < 0) then
              print("HTTP request failed")
            else
                tmr.stop(2)
              print(code, data)
            end
          end)
     else
        print("connecting")
     end
	end)

json中的pass是为了服务器做简单的安全性校验用。
接下来是建立一个简单的服务器以供本地实时查询，代码如下

	srv = net.createServer(net.TCP)
	srv:listen(80, function(conn)
	    conn:on("receive", function(sck, payload)
	        gpio.write(led,gpio.LOW)
	        status, temp, humi, temp_dec, humi_dec = dht.read(dhtpin)
	        if status == dht.OK then
	            sck:send("HTTP/1.0 200 OK\r\nContent-Type: text/html\r\n\r\n<h1>DHT Temperature:"..temp..";".."Humidity:"..humi.."</h1>")
	            gpio.write(led,gpio.HIGH)
	        end
	        end)
	    conn:on("sent", function(sck) sck:close() end)
	end)

其中status, temp, humi, temp_dec, humi_dec = dht.read(dhtpin)为DHT模块读取语句

最后是建立另一个定时器，定时采集温湿度参数并且发送给服务器，代码为一分钟间隔采集。

	tmr.alarm(1, 60000, 1, function()
	    status, temp, humi, temp_dec, humi_dec = dht.read(dhtpin)
	    if status == dht.OK then
	           http.post('url',
	          'Content-Type: application/json\r\n',
	          '{"temp":"'..temp..'","humi":"'..humi..'","station":"'..station..'","pass":"tms"}',
	          function(code, data)
	            if (code < 0) then
	              print("HTTP request failed")
	            else
	              print(code, data)
	            end
	          end)
	    end
	end)

至此客户端的代码就算告一段落了。服务端代码无非是数据库插入，查询，echarts展示。

效果参见http://tms.im/Mo/tms.php

成品图
![TH](https://dn-tms.qbox.me/nodemcu/wenshidu.jpg)