---
title: Hadoop集群安装配置
date: 2017-03-03 22:40:44
categories: By TMs
tags: [hadoop]
---
最近需要做大数据的分析，研究了一下HADOOP，作为第一步，配置HADOOP集群是最基础的工作。这里简单记录一下流程。
### 一、配置每台机器的网络。包括修改hostname，hosts
### 二、配置每台机器之间的SSH免密码认证（注意.ssh文件夹和其内文件的权限）
### 三、配置防火墙
### 四、安装JAVA环境并配置环境变量
```
export JAVA_HOME=/usr/lib/jvm/java-1.7.0-openjdk
source ~/.bashrc 
```
### 五、安装HADOOP并配置环境变量
```
# Hadoop Environment Variables
export HADOOP_HOME=/usr/local/hadoop
export HADOOP_INSTALL=$HADOOP_HOME
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export PATH=$PATH:$HADOOP_HOME/sbin:$HADOOP_HOME/bin
```
```
source ~/.bashrc
```
### 六、配置PATH变量(hadoop/bin和hadoop/sbin)
### 七、配置文件slaves、core-site.xml、hdfs-site.xml、mapred-site.xml、yarn-site.xml
#### 1、slaves内为slaves机器名
#### 2、core-site.xml为
```
<configuration>
        <property>
                <name>fs.defaultFS</name>
                <value>hdfs://Master:9000</value>
        </property>
        <property>
                <name>hadoop.tmp.dir</name>
                <value>file:/usr/local/hadoop/tmp</value>
                <description>Abase for other temporary directories.</description>
        </property>
</configuration>
```
#### 3、hdfs-site.xml，dfs.replication 为datanode个数，一般设为 3
```
<configuration>
        <property>
                <name>dfs.namenode.secondary.http-address</name>
                <value>Master:50090</value>
        </property>
        <property>
                <name>dfs.replication</name>
                <value>3</value>
        </property>
        <property>
                <name>dfs.namenode.name.dir</name>
                <value>file:/usr/local/hadoop/tmp/dfs/name</value>
        </property>
        <property>
                <name>dfs.datanode.data.dir</name>
                <value>file:/usr/local/hadoop/tmp/dfs/data</value>
        </property>
</configuration>
```
#### 4、mapred-site.xml
```
<configuration>
        <property>
                <name>mapreduce.framework.name</name>
                <value>yarn</value>
        </property>
        <property>
                <name>mapreduce.jobhistory.address</name>
                <value>Master:10020</value>
        </property>
        <property>
                <name>mapreduce.jobhistory.webapp.address</name>
                <value>Master:19888</value>
        </property>
</configuration>
```
#### 5、yarn-site.xml
```
<configuration>
        <property>
                <name>yarn.resourcemanager.hostname</name>
                <value>Master</value>
        </property>
        <property>
                <name>yarn.nodemanager.aux-services</name>
                <value>mapreduce_shuffle</value>
        </property>
</configuration>
```
### 八、复制主节点hadoop及配置文件到所有节点
### 九、初始化namenode
```
hdfs namenode -format   
```
### 十、启动或关闭hadoop集群
```
start-dfs.sh
start-yarn.sh
mr-jobhistory-daemon.sh start historyserver
```
```
stop-yarn.sh
stop-dfs.sh
mr-jobhistory-daemon.sh stop historyserver
```

> JPS 查看进程
> hdfs dfsadmin -report 查看报告
