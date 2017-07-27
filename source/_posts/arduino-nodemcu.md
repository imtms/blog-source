---
title: 采用Arduino IDE对ESP8266进行编程
date: 2016-10-21 16:11:55
categories: By TMs
tags: [nodemcu,hardware]
---
话说ESP8266真是个神奇的芯片，不仅可以使用NodeMCU和micropython等固件，还可以直接支持采用Arduino IDE环境进行编程和烧写。本身又有wifi和gpio，又便宜。简直是折腾神器。

采用Arduino编程的最大好处是，很多库可以直接引用。不用再写一些很底层的代码去驱动外设。这大大提高的开发效率，并且像上篇文章里写的，采用lua语言的NodeMCU还是有一些局限性的。比如不支持微秒级的延时。

要采用Arduino对ESP8266进行编程，首先要有一个1.6.4版本以上的Arduino IDE

其次在设置里需要把additional board manager URLs 设置为http://arduino.esp8266.com/stable/package_esp8266com_index.json

这样在工具里的开发板选择里就有了NodeMCU1.0选项。

下载完工具链就可以直接编写了。

下面是用Arduino写的gp2y1010au0f粉尘检测来测AQI的代码。测试通过

	/*
	   NodeMCU连接夏普GP2Y1010AU0F空气质量传感器检测PM2.5
	*/
	/* 定义引脚 */
	#define PIN_DATA_OUT A0 //连接空气质量传感器模拟量输出的IO口, NodeMCU只有A0可以作为ADC
	#define PIN_LED_VCC 5 //空气质量传感器中为内部Led供电的引脚
	/* 定义时间 */
	const int DELAY_BEFORE_SAMPLING = 280; //采样前等待时间
	const int DELAY_AFTER_SAMPLING = 40; //采样后等待时间
	const int DELAY_LED_OFF = 9680; //间隔时间
	/**
	   读取输出电压
	*/
	double getOutputV() {
	  digitalWrite(PIN_LED_VCC, LOW);
	  delayMicroseconds(DELAY_BEFORE_SAMPLING);
	  double analogOutput = analogRead(PIN_DATA_OUT);
	  delayMicroseconds(DELAY_AFTER_SAMPLING);
	  digitalWrite(PIN_LED_VCC, HIGH);
	  delayMicroseconds(DELAY_LED_OFF);
	  //Arduino模拟量读取值的范围为0~1023,以下换算为0~5v
	  double outputV = analogOutput / 1024 * 5;
	  return outputV;
	}
	/**
	   根据输出电压计算灰尘密度
	*/
	double getDustDensity(double outputV) {
	  //输出电压和灰尘密度换算公式: ug/m3 = (V - 0.9) / 5 * 1000
	  double ugm3 = (outputV - 0.9) / 5 * 1000;
	  //去除检测不到的范围
	  if (ugm3 < 0) {
	    ugm3 = 0;
	  }
	  return ugm3;
	}
	/**
	   根据灰尘密度计算AQI
	   环境空气质量指数（AQI）技术规定（试行）](http://kjs.mep.gov.cn/hjbhbz/bzwb/dqhjbh/jcgfffbz/201203/t20120302_224166.htm
	*/
	double getAQI(double ugm3) {
	  double aqiL = 0;
	  double aqiH = 0;
	  double bpL = 0;
	  double bpH = 0;
	  double aqi = 0;
	  //根据pm2.5和aqi对应关系分别计算aqi
	  if (ugm3 >= 0 && ugm3 <= 35) {
	    aqiL = 0;
	    aqiH = 50;
	    bpL = 0;
	    bpH = 35;
	  } else if (ugm3 > 35 && ugm3 <= 75) {
	    aqiL = 50;
	    aqiH = 100;
	    bpL = 35;
	    bpH = 75;
	  } else if (ugm3 > 75 && ugm3 <= 115) {
	    aqiL = 100;
	    aqiH = 150;
	    bpL = 75;
	    bpH = 115;
	  } else if (ugm3 > 115 && ugm3 <= 150) {
	    aqiL = 150;
	    aqiH = 200;
	    bpL = 115;
	    bpH = 150;
	  } else if (ugm3 > 150 && ugm3 <= 250) {
	    aqiL = 200;
	    aqiH = 300;
	    bpL = 150;
	    bpH = 250;
	  } else if (ugm3 > 250 && ugm3 <= 350) {
	    aqiL = 300;
	    aqiH = 400;
	    bpL = 250;
	    bpH = 350;
	  } else if (ugm3 > 350) {
	    aqiL = 400;
	    aqiH = 500;
	    bpL = 350;
	    bpH = 500;
	  }
	  //公式aqi = (aqiH - aqiL) / (bpH - bpL) * (desity - bpL) + aqiL;
	  aqi = (aqiH - aqiL) / (bpH - bpL) * (ugm3 - bpL) + aqiL;
	  return aqi;
	}
	/**
	   根据aqi获取级别描述
	*/
	String getGradeInfo(double aqi) {
	  String gradeInfo;
	  if (aqi >= 0 && aqi <= 50) {
	    gradeInfo = String("Perfect");
	  } else if (aqi > 50 && aqi <= 100) {
	    gradeInfo = String("Good");
	  } else if (aqi > 100 && aqi <= 150) {
	    gradeInfo = String("Mild polluted");
	  } else if (aqi > 150 && aqi <= 200) {
	    gradeInfo = String("Medium polluted");
	  } else if (aqi > 200 && aqi <= 300) {
	    gradeInfo = String("Heavily polluted");
	  } else if (aqi > 300 && aqi <= 500) {
	    gradeInfo = String("Severely polluted");
	  } else {
	    gradeInfo = String("Broken roof!!!");
	  }
	  return gradeInfo;
	}
	void setup() {
	  Serial.begin(115200);
	  pinMode(PIN_DATA_OUT, INPUT); //定义为输入(ADC读取模拟量)
	  pinMode(PIN_LED_VCC, OUTPUT); //定义为输出
	}
	void loop() {
	  double outputV = getOutputV(); //采样获取输出电压
	  double ugm3 = getDustDensity(outputV); //计算灰尘浓度
	  double aqi = getAQI(ugm3); //计算aqi
	  String gradeInfo = getGradeInfo(aqi); //计算级别
	  //打印到串口
	  Serial.println(String("outputV=") + outputV + "\tug/m3=" + ugm3 + "\tAQI=" + aqi + "\tgradeInfo=" + gradeInfo);
	  //间隔1秒执行下次检测
	  delay(1000);
	}