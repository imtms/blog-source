---
title: docker中启用zabbix监控服务器集群
categories: By TMs
tags: [zabbix,docker]
date: 2015-03-09 16:57:00
---

    docker run -d \
               -p=10051:10051 \
               -p=10052:10052 \
               -p=80:80       \
               -p=2812:2812   \
               --name zabbix  \
               tmszabbix

