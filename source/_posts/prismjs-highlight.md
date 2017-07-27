title: 利用prism.js实现代码高亮
categories: By TMs
tags: [html]
date: 2015-08-14 15:56:00
---

发现一个小巧高效的代码高亮js，官网地址
http://prismjs.com/

> Prism is a lightweight, extensible syntax highlighter, built with
> modern web standards in mind. It’s a spin-off from Dabblet and is
> tested there daily by thousands.

    <link href="themes/prism.css" rel="stylesheet" />
    <script src="prism.js"></script>
定制后加载到主题。
因为本站采用了instantclick做pjax加速，需要在触发pjax的时候同时触发高亮渲染。去instantclick官网的doc里找到

> InstantClick fires four events to provide hooks into the lifecycle of
> the page:
> 
> change : The page is changed, also triggered on initial page load and
> if InstantClick is not supported. Replaces DOMContentLoaded.
> 
> Its callback can take an optional isInitialLoad argument, it’s a
> Boolean that will be true when it’s the initial page change or when
> InstantClick isn’t supported, and false when InstantClick changes the
> page.
> 
> fetch : A page starts preloading.
> 
> receive : A page has been preloaded. You can modify its content.
> 
> wait : The user has clicked on a link, but the page isn’t preloaded
> yet. Only triggers when the page isn’t displayed instantly.

这里采用on change触发InstantClick.on('change', yourCallback);代码如下

    InstantClick.on('change', function() {
        self.Prism.highlightAll(event);
    });
    InstantClick.init();

测试一下，一切正常。
