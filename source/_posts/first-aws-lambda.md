title: 年轻人的第一个AWS Lambda函数
categories: By TMs
tags: [server]
date: 2018-05-09 19:29:00
---

 - 前言

之前用Go写的VSCO接口失效了，下午又用Python重新写了一个。因为VSCO的锁区，导致在香港的服务器无法获取到需要的json，而美国服务器延迟又略大，又不想专门为这个API开一台服务器用，这时候突然想到了AWS的Lambda函数。

AWS Lambda介绍我就直接复制 https://aws.amazon.com/cn/documentation/lambda/ 了

> 使用 AWS Lambda，您无需预置或管理服务器即可运行代码。您只需为使用的计算时间付费，在代码未运行期间不产生任何费用。您可以为几乎任何类型的应用程序或后端服务运行代码，而无需任何管理。只需上传您的代码，Lambda会处理运行和扩展高可用性代码所需的一切工作。您可以将您的代码设置为自动从其他 AWS 服务触发，或者直接从任何 Web 或移动应用程序调用。

而从公网调用这个函数，又需要Amazon API Gateway https://aws.amazon.com/cn/documentation/apigateway/

> Amazon API Gateway 是一种完全托管型服务，使开发人员可以轻松发布、维护、监控和保护任何规模的 API。创建 API 以从后端服务（比如 Amazon Elastic Compute Cloud (Amazon EC2) 上运行的应用程序、AWS Lambda 上运行的代码或者任何 Web 应用程序）访问数据、业务逻辑或功能。可将 API Gateway 视为云中的一个背板，用于连接 AWS 服务和其他公有或私有网站。它可以提供一致的 RESTful 应用程序编程接口 (API)，让移动和 Web 应用程序可以访问 AWS 服务。

这样看下来，我把Lambda函数写好，使用API Gateway来控制访问，整体下来就是一个无服务器应用程序的demo了。

> API Gateway 与 AWS Lambda 共同构成 AWS 无服务器基础设施中面向应用程序的部分。对于调用公开 AWS 服务的应用程序，您可以使用 Lambda 与所需的服务交互，并通过 API Gateway 中的 API 方法来使用 Lambda 函数。AWS Lambda 在高可用性计算基础设施上运行代码。它会进行必要的计算资源执行和管理工作。为了支持无服务器应用程序，API Gateway 可以支持与 AWS Lambda 的简化代理集成和 HTTP 终端节点。

 - 实践

为了访问速度，这里我选择AWS的东京区域，首先创建一个Lambda函数，当前支持C#,Go,JAVA,Nodejs,Python几种语言的不同版本，足够日常使用了，这里我选择Python，并且把代码上传到AWS，注意配置好主函数（您函数中的 filename.handler-method 值。例如："main.handler" 将调用在 main.py 中定义的处理程序方法。）

左边添加一个触发器，这里采用API Gateway，配置好方法请求等参数，这里需要注意的是在API Gateway管理界面需要配置好各种请求和相应阶段以后可以进行测试，并且需要部署API，而部署完以后的API是有Stage的，URL里也需要注意有Stage，否则会报 `{"message":"Missing Authentication Token"} ` 错误。

绑定自定义域名aws-apne-gateway.tms.im，这里需要先在ACM（Amazon Certificate Manager）里导入或者生成域名证书。

这样就完成了一个Lambda函数的部署，整体操作下来还是很简单顺畅的。

 - 总结

一直想体验一下AWS的FaaS架构，今天也是借着这个小需求的机会体验了一把FaaS，感觉是开发者的福音，完全不需要考虑后端服务器的环境，部署等各种问题，只需要关注核心逻辑实现，把函数当成一个简单的黑盒实现即可。
缺点嘛也很明显，只适合不是那么复杂的可以拆分出来的函数逻辑的实现，和微服务架构有点像，如果业务逻辑很重并且非常缠绕，互相依赖太严重，无法通过拆分成小函数来执行的话可能就不太适合FaaS架构了。