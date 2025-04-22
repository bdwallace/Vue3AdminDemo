### Node版本要求：`v20.10.0` 及以上版本

1. 全局安装

```bash
npm install -g @pureadmin/cli
npm install -g pnpm
```


### 安装依赖

```bash
cd vue-pure-admin

pnpm install
```

### 启动平台

```bash
pnpm dev
```

### 项目打包

```bash
pnpm build
```

## Docker 支持

1. 自定义镜像名为 `vue-pure-admin` 的镜像（请注意下面命令末尾有一个点 `.` 表示使用当前路径下的 `Dockerfile` 文件，可根据实际情况指定路径）

```bash
docker build -t vue-pure-admin .
```

2. 端口映射并启动 `docker` 容器（`8080:80`：表示在容器中使用 `80` 端口，并将该端口转发到主机的 `8080` 端口；`pure-admin`：表示自定义容器名；`vue-pure-admin`：表示自定义镜像名）

```bash
docker run -dp 8080:80  --name pure-admin vue-pure-admin
```
