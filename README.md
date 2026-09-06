# blog-source

[blog.tms.im](https://blog.tms.im) 的 Hexo 源码，使用 Icarus 主题。

## 本地开发

需要 Node.js 20.19 或更高版本。

```bash
npm ci
npm run server
```

访问 `http://localhost:4000` 预览。创建文章后，在摘要结尾保留 `<!-- more -->`，文章正文标题从二级标题开始。

## 构建

```bash
npm run build
```

构建结果位于 `public/`。`blog-source` 分支的 Travis 构建成功后会将产物发布到 `imtms/imtms.github.io` 仓库。
