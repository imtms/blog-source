title: Windows下的Go编译
categories: By TMs
tags: [go,server]
date: 2014-11-20 22:12:00
---

继续折腾多用户SS
由于客户端需要在win下使用，于是要在win下编译go语言的local客户端
去golang.org下载了官方的安装包，安装完成后配置了系统变量
GOROOT为安装目录
PATH变量加入GOROOT\bin
GOPATH为某个编译安装目录
然后进入使用go version查看版本

确定没问题了使用go build
编译local.go文件为local.exe
中间遇到了很多依赖包的问题，一一下载他们放到相应的目录里。
终于编译成功
然后配合shadowsocks-QT5版本做后端使用，速度棒棒的。
