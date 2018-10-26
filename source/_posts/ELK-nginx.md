title: 采用ELK搭建nginx日志分析平台
categories: By TMs
tags: [server]
date: 2016-06-26 16:57:00
---

ELK=Elasticsearch(数据库)+Logstash(Log收集处理)+Kibana(展示平台)
对于这几个软件的特性和优势在这里就不再赘述了。可以参考各种资料和说明。
以前一直觉得ELK做日志收集分析有点太重量级，占用资源过大。最近对Elasticsearch进行了一些了解，感觉有很多优秀的特性值得采用。于是重新开始安装这套经典的重量级的开源日志收集分析平台。

对于ELK的安装在官网都有下载
这里只说几个要注意的地方
1、E和L需要JAVA环境，而且对版本号有依赖。
2、Elasticsearch不能以root权限运行。请自行建立非root账户
3、Kibana的rpm包安装完以后在/opt目录下。
4、Elasticsearch想创建pid文件运行（我用monit做监控用）请自行-f /tmp/es.pid
5、Logstash的配置文件需要自行建立 运行命令是 Logstash agent -f 配置文件路径

下面着重讲一下如何用Logstash对nginx的日志文件进行处理和入库Elasticsearch

首先在nginx的配置文件里对log-format进行配置
`log_format access '$http_host $server_addr $remote_addr [$time_local] "$request" '
                    '$request_body $status $body_bytes_sent "$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time';`
这里包含 访问域名、服务器IP、来源IP、时间（带时区）、请求动词、请求体、返回值、请求体字节数、来源referer、用户UA、请求时间、后端处理时间（PHP处理时间）

> tms.im 10.70.29.98 58.21.16.54 [26/Jun/2016:16:39:28 +0800] "GET /favicon.png HTTP/1.1" - 404 191 "http://tms.im/index.php" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" 0.000 -

以上是log示例，因为是静态文件 所以后端处理返回时间是0
新建一个logstash的配置文件nginx.conf 

    input {
       file {
         type => "nginx-access"
         path => "/data/wwwlogs/access_nginx.log"
       }
    }
    filter {
       grok {
            match => {
                "message"=>"%{IPORHOST:domain} %{IP:route_ip} %{IP:real_ip} \[%{HTTPDATE:timestamp}\] \"%    {WORD:http_verb} %{URIPATH:baseurl}(?:\?%{NOTSPACE:request}|) HTTP/%{NUMBER:http_version}\" (?:-|%    {NOTSPACE:request}) %{NUMBER:http_status_code} (?:%{NUMBER:bytes_read}|-) %{QS:referrer} %{QS:agent} %    {NUMBER:time_duration:float} (?:%{NUMBER:time_backend_response:float}|-)"
            }
        }
    }
    output {
     elasticsearch {
        hosts => "127.0.0.1"
      }
    }

其中需要注意的是grok的match段，网上查到的资料大都是直接输入grok表达式，而这种匹配已经被弃用，请使用如上的match段进行grok匹配。

这里grok匹配推荐一个网站可以在线进行grok表达式测试
[http://grokdebug.herokuapp.com/][1]
然后启动Logstash（之前已经启动了elasticsearch和kibana）

    /ELK/logstash/bin/logstash -f /ELK/logstash/nginx.conf

这样Logstash就配置完成了。进入kibana的管理界面。第一次进入需要进行mapping，点确定完成后即可看到数据。
![效果][2]
然后就可以建立Dashboard做各种统计分析了。
![效果][3]

  [1]: http://grokdebug.herokuapp.com/
  [2]: https://cdn.tms.qnxg.net/article/20181026/textimg/5.png
  [3]: https://cdn.tms.qnxg.net/article/20181026/textimg/6.png
