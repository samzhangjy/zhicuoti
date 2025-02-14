# 智错题

![cover](./docs/cover.png)

智错题是一个基于 FastAPI 和 Next.js 的在线智能错题分析系统。

技术报告：[基于深度学习的智能错题分析和管理系统的研究](./docs/paper.pdf) 。


## 开发环境

本项目所有测试和开发工作都将在 Python 3.10.12 、Node.js v20.15.1 下进行。

操作系统平台为 Windows Subsystem for Linux 下的 Ubuntu 22.04.4 LTS 。

无法保证在其他环境下的运行情况。


## 安装

下载本 repo 至本地后，在项目根目录执行下列指令来安装依赖。

### 后端

```bash
pip install -r requirements.txt
```

### 前端

```bash
cd frontend && pnpm i
```

## 服务器启动

智错题暂无部署指令，只能在本地运行。

### 后端

```bash
python -m backend.main
```

### 前端

```bash
pnpm dev
```

或者在生产环境下运行：

```bash
pnpm build
pnpm start
```
