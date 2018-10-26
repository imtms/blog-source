---
title: 采用NodeMCU和GP2Y1010AU0F检测空气质量
date: 2016-10-21 15:50:41
categories: By TMs
tags: [nodemcu,hardware]
---
夏普GP2Y1010AU0F传感器用于检测空气中的灰尘浓度。可以检测非常细小的灰尘，例如香烟烟雾（粒径0.1~2um）。
该传感器中心有一个孔洞，可使空气自由穿过。内部有一个LED向孔洞进行照射。当空气中的灰尘穿过孔洞时，光线反射到接收端，通过放大电路将反射光强放大并转化为输出电压。通过测量输出电压并进行响应的换算，即可得知空气中灰尘的浓度。

GP2Y1010AU0F引脚连接

(1)V-LED + 150ohm电阻 + 220uF电容->VCC
(2)LED-GND->GND
(3)LED->D1(GPIO 5)
(4)S-GND->GND
(5)VO->A0
(6)VCC->VCC

其中需要加150ohm电阻和220uF电容，连接方式如下图中红框所示：

![connect](https://cdn.tms.qnxg.net/article/20181026/nodemcu/connect.png)

可以直接使用NodeMCU的adc即A0接口进行采样。先对GPIO 5拉低产生一个采样脉冲，读取A0的adc数据，即为输出电压。转换后可得粉尘浓度。代码如下

	pin1 = 1
	gpio.mode(pin1, gpio.OUTPUT) 
	tmr.alarm(1, 2000, 1, function()
	    gpio.write(pin1,gpio.LOW)
	    adcv = adc.read(0)
	    gpio.write(pin1,gpio.HIGH)
	    outv = adcv/ 1024 * 5
	    ugm3 = (outv - 0.9) / 5 * 1000
	    if (ugm3 >= 0 and ugm3 <= 35) then
		    aqiL = 0
		    aqiH = 50
		    bpL = 0
		    bpH = 35
    		aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 35 and ugm3 <= 75) then
		    aqiL = 50
		    aqiH = 100
		    bpL = 35
		    bpH = 75
    		aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 75 and ugm3 <= 115) then
		    aqiL = 100
		    aqiH = 150
		    bpL = 75
		    bpH = 115
		    aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 115 and ugm3 <= 150) then
		    aqiL = 150
		    aqiH = 200
		    bpL = 115
		    bpH = 150
		    aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 150 and ugm3 <= 250) then
		    aqiL = 200
		    aqiH = 300
		    bpL = 150
		    bpH = 250
		    aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 250 and ugm3 <= 350) then
		    aqiL = 300
		    aqiH = 400
		    bpL = 250
		    bpH = 350
		    aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
   		elseif (ugm3 > 350) then
		    aqiL = 400
		    aqiH = 500
		    bpL = 350
		    bpH = 500
		    aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL
    	else
    		aqi = 0
    	end
    	print(aqi)
	end)

其中adcv/ 1024 * 5和(outv - 0.9) / 5 * 1000为1024级采样精度转换为电压和相应电压下的粉尘浓度换算，具体可以查阅datasheet得到。如果换算后为负数，即可认为浓度太低检测不到。

下方的aqi换算公式为国家标准环境空气质量指数（AQI）技术规定（试行）( HJ 633—2012 2016-01-01实施)。

实际运行时发现数据不稳定，时有时无。查阅资料发现LED开启过程中有一个上升期。当LED开启持续0.28ms时，对输出电压进行采样最为准确。而NodeMCU的elua脚本并不支持微秒级别的延时。于是考虑其他方法。

查阅资料发现在不更换其他芯片单片机的情况下，ESP8266这块芯片可以采用Arduino的IDE进行C语言程序的编写。下一篇文章会具体写一下如何采用Arduino IDE环境对ESP8266进行编程。