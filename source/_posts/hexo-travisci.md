title: 使用Travis CI自动发布Hexo的文章
categories: By TMs
tags: [git]
date: 2017-7-27 15:30:00
---

自从使用了Hexo静态博客以后是越来越懒了，连服务器环境都懒得配置了，索性直接发布在Github pages上面，后面又因为Github pages不支持https和cdn，外边又套了一层Netlify。最近又突然懒得连Hexo的环境也不想要了，甚至连服务器都不想用了。于是想想直接用github repo+Travis CI来帮我编译Hexo的静态博客。

初步的想法是把原始的post的md文件和theme放到一个repository里，然后写好.travis.yml，每次写文章后的push会触发Travis CI来进行构建，构建完毕后再把public文件夹push到Github pages的repository里，这个push会触发Netlify来拉取并完成发布。

首先需要在github的profile settings里生成一个Personal access tokens提供给Travis CI的编译后push使用。
把这个token配置到Travis CI的Environment Variables里即可。

接下来就是编写.travis.yml


	language: node_js
	node_js: stable
		 
	# S: Build Lifecycle
	install:
		  - npm install
		 
		script:
		  - hexo g
		 
		after_script:
		  - cd ./public
		  - git init
		  - git config user.name "TMs"
		  - git config user.email "tms@live.cn"
		  - git add .
		  - git commit -m "Update"
		  - git push --force --quiet "https://${TOKEN}@github.com/imtms/imtms.github.io.git" master:master
		# E: Build LifeCycle
		 
		branches:
		  only:
		    - blog-source

这里指定构建环境为nodejs，执行npm install来进行依赖安装，随后执行hexo g进行文章的编译，完成后进入到public文件夹并推送到Github pages的repository里。并且只针对blog-source分支进行编译。这里的TOKEN即为自动去环境变量里获取上面github settings里生成的TOKEN。

一切准备就绪，去Travis CI里打开针对blog-source的自动构建，进行一次push，观察结果。

顺便加上信仰徽章，可以随时观察构建状态：[![Build Status](https://Travis-CI.org/imtms/blog-source.svg?branch=blog-source)](https://Travis-CI.org/imtms/blog-source)

这下写博客连服务器和数据库都不需要了，运行hexo的nodejs环境也不需要了。而且可以随时在任何有git的电脑写。实在不行用github的在线编辑都能写。。。感谢Travis CI，感谢Github，感谢Netlify。
