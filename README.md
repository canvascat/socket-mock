# socket-mock

一个基于 Electron + React + Vite 的本地 Socket/WebSocket Mock 工具，支持服务端与客户端的可视化管理、调试和消息交互。

## 主要功能

- 支持创建、启动、关闭、删除 Socket/WebSocket 服务端和客户端
- 支持端口/管道占用校验，防止冲突
- 支持服务/客户端的类型、标识筛选与搜索
- 支持客户端详情页，实时查看日志、发送文本/JSON 消息
- 所有操作均为可视化，无需命令行

## 技术栈

- Electron（桌面端）
- React 19 + Vite（前端）
- Zustand（状态管理）
- shadcn/ui + Radix UI（UI 组件）
- Tailwind CSS（样式）
- TypeScript

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 启动开发环境

```bash
pnpm dev
```

3. 打包构建

```bash
pnpm build
```

## 目录结构简述

- `src/pages/socket-server/` 服务端管理页面
- `src/pages/socket-client/` 客户端管理与详情页面
- `electron/` 主进程与 socket mock 实现

## 交流与反馈

如有建议或问题，欢迎 issue 反馈。

