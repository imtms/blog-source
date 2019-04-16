---
title: 修改了iptables规则
categories: By TMs
tags: [server]
date: 2014-12-10 16:44:00
---

虽然没出什么大问题，但是为了安全起见还是采用了更加严格的iptables规则。
#lo
-A INPUT -i lo -j ACCEPT
-A OUTPUT -o lo -j ACCEPT
#Established
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
-A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
#http/https
-A INPUT -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
-A OUTPUT -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
#ssh
-A INPUT -p tcp --dport [sshport] -m state --state NEW,ESTABLISHED -j ACCEPT
-A OUTPUT -p tcp --sport [sshport]  -m state --state ESTABLISHED -j ACCEPT
#dns
-A OUTPUT -p udp --dport 53 -j ACCEPT
#ss
-A INPUT -p tcp --dport [ssport] -j ACCEPT
#manage
-A INPUT -p tcp --dport [manageport] -j ACCEPT
-A OUTPUT -p tcp --dport [manageport] -j ACCEPT
#ping
-A OUTPUT -p icmp --icmp-type echo-request -j ACCEPT
-A INPUT -p icmp --icmp-type echo-request -j ACCEPT
-A INPUT -p icmp --icmp-type echo-reply -j ACCEPT
-A OUTPUT -p icmp --icmp-type echo-reply -j ACCEPT
#anti-ddos
-A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
#log
-A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7
-A OUTPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7
#default
-A INPUT -j DROP
-A OUTPUT -j DROP
-A FORWARD -j DROP
