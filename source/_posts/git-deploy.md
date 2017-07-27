title: 利用git自动部署网站文件
categories: By TMs
tags: [git]
date: 2014-10-27 01:51:00
---

$ mkdir /work
$ mkdir /git && cd /git
$ git init --bare
Initialized empty Git repository in /git
$ cat > hooks/post-receive
#!/bin/bash
GIT_WORK_TREE=/work git checkout -f
$ chmod +x hooks/post-receive
