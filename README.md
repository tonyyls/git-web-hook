# git-web-hook

基于 github/gitlab webhook 实现自动化部署工具。

# 背景

常用 gitbook 编写文档，每次文档内容有更新，流程是这样的：

1. 编写文档;
2. 在目录下执行`gitbook build`编译出静态资源(_book)；
3. 将静态资源拷贝到云服务器上;
4. 把原始文档再提交到 github/gitlab 上；
5. 完成文档更新；

整个过程较为繁琐，为了解决这个问题，借助于 `webhook` 来实现，理想流程如下: 

1. 编写文档;
2. 在目录下执行`gitbook build`编译出静态资源(_book)；
3. 把原始文档以及编译出当静态资源(_book)一并提交到仓库中(触发 Webhook Push Event)；
4. 完成文档更新；

抽象一下，这是一个自动化部署到过程，使用`DevOps`平台显得有点重，于是,基于`nodejs`写了个轻量级的 `git-web-hook` 来简化这个部署流程。


# 特性
* 支持 github & gitlab;
* 支持通过 url 自定义部署路径;
* 支持自定义资源拷贝路径；
* 支持拷贝完成后执行相关脚本；

# 使用



# 注册成系统服务

## windows service

## linux service






