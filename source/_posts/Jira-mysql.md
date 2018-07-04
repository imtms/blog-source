title: 迁移Jira的数据库到Mysql
categories: By TMs
tags: [server]
date: 2018-07-04 12:15:20
---

# 前言

买了Jira Software Server自用也有一段时间了，之前安装的时候为了图省事，采用了内置的H2数据库，用了这么久，一直提醒我作为生产环境需要换成Mysql数据库，终于闲下来可以换一下。

# 开工

按照官方的步骤

1、首先备份数据。这个很简单，在后台就可以备份。

2、然后安装Mysql的JDBC驱动

    To copy the MySQL JDBC driver to your application server:

    Get the MySQL driver:
    If you are installing Jira, download the recommended MySQL driver JDBC Connector/J 5.1 from https://dev.mysql.com/downloads/connector/j/ 
    You can download either the .tar.gz or the .zip file by selecting the 'Platform Independent' option. Extract the jar for the driver (e.g. mysql-connector-java-5.x.x-bin.jar) from the archive.

    Restart Jira / Jira service.

这里遇到了一个问题，Mysql官方下载地址 https://dev.mysql.com/downloads/connector/j/ 进去以后下载到的是```Connector/J 8.0.11```，而这个版本是不能在JIRA使用的，会报错。
这里一定要点```Looking for previous GA versions```下载老版本，我用的是```5.1.46```终于可以正常使用。
安装完毕后重启JIRA

3、使用官方配置工具迁移

    Using the Jira configuration tool — Use this method, if you have an existing Jira instance. Your settings will be saved to the dbconfig.xml file in your Jira home directory.

这个工具默认是在```/opt/atlassian/jira/```里的，但是当我打开运行的时候产生了报错，说我JAVA版本不对，可是我明明JIRA都可以运行，怎么到了你这里连个工具都运行不了了呢。
查了一下资料原来是openJDK是不认的，必须是官方OracleJDK才行，因为这两个JDK的version输出不一样，要么改tools代码，要么换个JDK。我选择换JDK，毕竟OpenJDK后面还不知道有啥坑，还是用Oracle官方的吧。

使用工具一步步配置好数据库连接以后，启动Jira，遇到了无限500报错。看logs文件夹里的日志，应该是数据库连接成功，但是库名不对。检查了几遍明明是对的，看了一下连接，好像连的是一个不存在的名为PUBLIC的库。又用配置工具配置了几次，依旧不行。
查资料得知配置文件修改的是dbconfig.xml文件。这个文件在```/var/atlassian/application-data/jira```目录下。赶紧去看了一下。里面有一个莫名其妙的 ```<schema-name>PUBLIC</schema-name> ```字段，查遍了官方说明，都没看到有写这个字段。试着把这个字段改成正确的数据库名称，重启Jira，居然可以正常使用了。

4、然后就是进入初始化安装流程，这里选择导入已有数据，然后输入备份数据位置，等待即可。

# 总结

整个迁移过程说简单也简单，说坑也挺坑的，主要有这么几个点：

1、对Java的SDK对版本和类型（OpenJDK、OracleJDK）有奇怪要求。
2、对Mysql connector版本有奇怪要求，8不行5.1.46可以
3、官方配置工具配置完以后数据库居然不对，需要手动去配置文件里面修改。而这个dbconfig.xml配置文件又找了好久。
4、全都搞完以后日志里有一堆关于mysql连接不是ssl的Warning，害得我又去dbconfig.xml里把连接串url里加了个useSSL=false才正常。

终于可以正常用Jira Software了。这里强烈推荐一下这个管理工具，不管是做团队的项目管理，还是个人的事务管理，都肥肠好用哦。