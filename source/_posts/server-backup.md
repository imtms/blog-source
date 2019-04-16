---
title: 服务器定时备份
categories: By TMs
tags: [server]
date: 2014-12-24 18:03:00
---

1.linux上安装dropbox

32位linux
# wget -O dropbox.tar.gz http://www.dropbox.com/download?plat=lnx.x86

64位linux
# wget -O dropbox.tar.gz http://www.dropbox.com/download?plat=lnx.x86_64

解压：
# tar xzvf dropbox.tar.gz

第一次运行生成host_id
# ~/.dropbox-dist/dropboxd &

生成id后，将host_id替换下面链接后面的字符在浏览器打开，输入你的帐号密码就绑定机器了．
https://www.dropbox.com/cli_link?host_id=XXXXXXXXXXXXXXXXXXX


2.建立连接备份网站
正式开始同步你的网站，通过ln软链接你所有要备份的目录，例如：
# cd ~/Dropbox

# ln -s /home/wwwroot/html

# ln -s /home/wwwroot/htdocs

开始运行同步
# ~/.dropbox-dist/dropboxd &

3.为了节省资源，可以不使用实时同步，只定时打开同步一天的文件再关掉以节省资源．
先关掉同步：
# killall dropbox

编写定时同步脚本：
# vi backup.sh

代码如下：
---------------------
#!/bin/sh
start() {
echo starting dropbox
/root/.dropbox-dist/dropboxd &
}

stop() {
echo stoping dropbox
pkill dropbox
}

case "$1" in
start)
start
;;
stop)
stop
;;
restart)
stop
start
;;

esac
-----------------------------

定时运行和关闭：
# chmod +x backup.sh

#crontab -e

每天4点开始同步，5点关闭同步．如果一般每天更新数据不多不用打开这么长时间，这个根据各人每天更新的数据量自己来设置．也可以一直开启同步。

# 0 4 * * * sh /root/backup.sh restart

# 0 5 * * * sh /root/backup.sh stop


4.备份数据库的脚本用
# vi bakmysql.sh

脚本如下：
--------------------------------
#!/bin/bash
DBName=修改为数据库名
DBUser=修改为数据库用户名
DBPasswd=修改为数据库密码
BackupPath=/root/Dropbox/   #保存到同步目录

LogFile=/root/db.log
DBPath=/usr/local/mysql/var/ #备份的数据库目录
#BackupMethod=mysqldump
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

---------------------------------------------------------------------------------
按上面的方法设置备份数据库的bakmysql.sh文件定时为3点备份，4点关闭执行。因为是在同步目录里，在打包之前，数据就开始上传了，而没打包的数据是不需要上传的，所以数据库备份不能一直开启同步。


5.删除卸载dropbox方法：
# killall dropbox

# rm -rf .dropbox .dropbox-dist Dropbox dropbox.tar.gz dbmakefakelib.py dbreadconfig.py
