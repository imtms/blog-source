title: 跨IDC数据备份
categories: By TMs
tags: [server]
date: 2015-08-22 00:24:00
---

为了数据安全性。除了做了主从和多机互备份以外，在异地容灾和数据备份方面也不容忽视。
这里是实现跨IDC数据备份的一种思路。分为文件备份和数据库备份两部分。文件备份可以保证用户上传的文件，图片和网站的代码不会丢失。而数据库备份则是数据保护的重中之重。
之所以采用跨IDC进行数据备份也是考虑到数据的安全性和同IDC的网络崩溃和主机崩溃的可能性。
## 文件备份
文件数量和大小决定了需要做到文件同步备份必须采用增量备份的方式。传统的方法是使用  inotify + rsync 来进行同步备份。
这里采用Sersync 来进行服务器间文件同步。
# 配置 Slave 上的 WWW 同步
Slave上安装rsync
然后配置文件写明，其中rsync.pass里面写入密码

    log file = /var/log/rsyncd.log 
    pidfile = /var/run/rsyncd.pid 
    lock file = /var/run/rsync.lock  
    secrets file = /etc/rsyncd/rsync.pass
    [tongbu]
    path = /home/wwwroot/
    comment = tongbu
    uid = root
    gid = root
    port=873
    use chroot = no
    read only = no
    list = no
    max connections = 200
    timeout = 600 
    auth users = tms
    hosts allow = 主机的IP

最后启动Rsync的 rsync –daemon
# 启动 Master 上的 Sersync 做数据同步
主机上配置sersync

     <sersync>
    	<localpath watch="/home/wwwroot">
    	    <remote ip="远程IP" name="tongbu"/>
    	</localpath>

其他配置略

    第一次启动加上 -r 参数做首次同步，之后就不要再加  -r 参数了
    ./sersync2 -n 2 -d -r -o confxml.xml

文件备份到此结束。

## 数据库备份

数据库备份这里采用主从的方式，而这里的slave纯粹做备份使用。无业务访问他。
前期准备工作步骤如下：
1、修改备份服务器上my.cnf中的server-id 

2、登录主服务器创建同步账号GRANT REPLICATION SLAVE ON *.* TO 'slave'@'Slave服务器IP' IDENTIFIED BY 'password';

备份主服务器步骤：
1、FLUSH TABLES WITH READ LOCK；

2、cp -ar /var/lib/mysql  /home/DATA/tmp

3、show master status;并且记录file和position

4、UNLOCK TABLES；

复制主服务器的/home/DATA/tmp到从服务器并且替换mysql的var目录

登录从服务器的mysql

    CHANGE MASTER TO
     
        ->     MASTER_HOST='master_host_name',
     
        ->     MASTER_USER='replication_user_name',
     
        ->     MASTER_PASSWORD='replication_password',
     
        ->     MASTER_LOG_FILE='前面让你记录下的 master 状态显示的 logfile 名字',
     
        ->     MASTER_LOG_POS=前面记录下的 postion;
    
    START SLAVE；
    
    show slave status \G

这样Master —> Slave 就运行起来了。数据库备份结束。

为了进一步的安全考虑，采用crontab每隔一天做一次全量备份，在备份服务器进行。脚本如下

    #!/bin/bash
    DBName=数据库名
    DBUser=备份用户
    DBPasswd=备份用户的密码
    BackupPath=/root/Dropbox/   #保存到同步目录
    
    LogFile=/root/db.log
    DBPath=/var/lib/mysql/ #备份的数据库目录
    BackupMethod=mysqldump
    #BackupMethod=mysqlhotcopy
    #BackupMethod=tar
    
    NewFile="$BackupPath"db$(date +%y%m%d).tgz
    DumpFile="$BackupPath"db$(date +%y%m%d)
    OldFile="$BackupPath"db$(date +%y%m%d --date='5 days ago').tgz  #自动删除5天前的备份
    echo "-------------------------------------------" >> $LogFile
    echo $(date +"%y-%m-%d %H:%M:%S") >> $LogFile
    echo "--------------------------" >> $LogFile
    #Delete Old File
    if [ -f $OldFile ]
    then
            rm -f $OldFile >> $LogFile 2>&1
            echo "[$OldFile]Delete Old File Success!" >> $LogFile
    else
            echo "[$OldFile]No Old Backup File!" >> $LogFile
    fi
    if [ -f $NewFile ]
    then
            echo "[$NewFile]The Backup File is exists,Can't Backup!" >> $LogFile
    else
            case $BackupMethod in
            mysqldump)
                    if [ -z $DBPasswd ]
                    then
                            mysqldump -u $DBUser --opt $DBName > $DumpFile
                    else
                            mysqldump -u $DBUser -p$DBPasswd --opt $DBName > $DumpFile
                    fi
                    tar czvf $NewFile $DumpFile >> $LogFile 2>&1
                    echo "[$NewFile]Backup Success!" >> $LogFile
                    rm -rf $DumpFile
                    ;;
            mysqlhotcopy)
                    rm -rf $DumpFile
                    mkdir $DumpFile
                    if [ -z $DBPasswd ]
                    then
                            mysqlhotcopy -u $DBUser $DBName $DumpFile >> $LogFile 2>&1
                    else
                            mysqlhotcopy -u $DBUser -p $DBPasswd $DBName $DumpFile >>$LogFile 2>&1
                    fi
                    tar czvf $NewFile $DumpFile >> $LogFile 2>&1
                    echo "[$NewFile]Backup Success!" >> $LogFile
                    rm -rf $DumpFile
                    ;;
            *)
                    service mysql stop >/dev/null 2>&1
                    tar czvf $NewFile $DBPath$DBName >> $LogFile 2>&1
                    service mysql start >/dev/null 2>&1
                    echo "[$NewFile]Backup Success!" >> $LogFile
                    ;;
            esac
    fi
    echo "-------------------------------------------" >> $LogFile

同时采用dropbox实时上传网盘。保证每日的数据库在云端存有一份备份。
