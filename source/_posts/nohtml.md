---
title: 正则去除HTML
categories: By TMs
tags: [php,html]
date: 2014-08-22 00:23:00
---

        function noHTML($content)
        {
        $content = preg_replace("/<a[^>]*>/i",'', $content);
        $content = preg_replace("/<\/a>/i", '', $content);
        $content = preg_replace("/<div[^>]*>/i",'', $content);
        $content = preg_replace("/<\/div>/i",'', $content);
        $content = preg_replace("/<font[^>]*>/i",'', $content);
        $content = preg_replace("/<\/font>/i",'', $content);
        $content = preg_replace("/<p[^>]*>/i",'', $content);
        $content = preg_replace("/<\/p>/i",'', $content);
        $content = preg_replace("/<span[^>]*>/i",'', $content);
        $content = preg_replace("/<\/span>/i",'', $content);
        $content = preg_replace("/<\?xml[^>]*>/i",'', $content);
        $content = preg_replace("/<\/\?xml>/i",'', $content);
        $content = preg_replace("/<o:p[^>]*>/i",'', $content);
        $content = preg_replace("/<\/o:p>/i",'', $content);
        $content = preg_replace("/<u[^>]*>/i",'', $content);
        $content = preg_replace("/<\/u>/i",'', $content);
        $content = preg_replace("/<b[^>]*>/i",'', $content);
        $content = preg_replace("/<\/b>/i",'', $content);
        $content = preg_replace("/<meta[^>]*>/i",'', $content);
        $content = preg_replace("/<\/meta>/i",'', $content);
        $content = preg_replace("/<!--[^>]*-->/i",'', $content);//注释内容
        $content = preg_replace("/<p[^>]*-->/i",'', $content);//注释内容
        $content = preg_replace("/style=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/class=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/id=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/lang=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/width=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/height=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/border=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/face=.+?['|\"]/i",'',$content);//去除样式
        $content = preg_replace("/face=.+?['|\"]/",'',$content);
        $content = preg_replace("/face=.+?['|\"]/",'',$content);
        $content=str_replace( "&nbsp;","",$content);
        return $content;
        }
