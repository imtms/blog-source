title: 折腾Docker中
categories: By TMs
tags: [docker]
date: 2015-03-06 19:52:00
---

使用docker配置服务器中

常用指令有：
> 容器生命周期管理 — docker [run|start|stop|restart|kill|rm|pause|unpause]
> 容器操作运维 — docker [ps|inspect|top|attach|events|logs|wait|export|port]
> 容器rootfs命令 — docker [commit|cp|diff] 
> 镜像仓库 — docker [login|pull|push|search] 
> 本地镜像管理 — docker [images|rmi|tag|build|history|save|import] 
> 其他命令 — docker [info|version]


先docker pull centos:centos6拖了一个centos6回来，以此为基础
docker run -i -t --name tms centos:centos6 /bin/bash
开一个centos6的docker，在里面安装sshserver和mysql-server
安装完成后用
docker commit <containerid> tms/tms1
提交更改
用
-p port:port 来映射端口
docker rmi <image_id/image_name ...>删除docker，-f强制删除
