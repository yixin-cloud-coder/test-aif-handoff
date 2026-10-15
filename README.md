# test-aif-handoff

用于测试 [AIF Handoff](https://github.com/lee-to/aif-handoff) 开发框架的仓库。

AIF Handoff 是一个自主看板：在看板上建任务，AI 代理会自动完成 **规划 → 实现 → 审查**，任务依次经过
`Backlog → Planning → Plan Ready → Implementing → Review → Done`。本仓库就是交给它去开发的目标项目。

---

## 目录结构

```
02项目/
├── aif-handoff/          # AIF Handoff 工具本身（看板 + API + Agent），已克隆
└── test-aif-handoff/     # 本仓库：由 AIF Handoff 管理和开发的目标项目
    ├── README.md
    └── setup-aif-handoff.sh   # 一键安装脚本
```

> AIF Handoff 和本仓库是**并列**的两个目录，不要把工具装进本仓库里。

---

## 一、环境要求

| 依赖 | 版本 | 检查命令 |
|---|---|---|
| Node.js | 20.19+ 或 22.12+（推荐用 nvm，项目自带 `.nvmrc` = 22.22.2） | `node -v` |
| npm | 10+ | `npm -v` |
| Git | 任意 | `git --version` |
| Xcode 命令行工具 | 编译 `better-sqlite3` 需要 | `xcode-select -p`，没有就 `xcode-select --install` |
| Claude 账号 | Claude Pro/Max 订阅，或 `ANTHROPIC_API_KEY` | — |
| Claude Code CLI（可选） | ≥ 2.1.191，只有使用 **CLI 传输**时才需要 | `claude --version` |

安装 nvm 和 Node（如尚未安装）：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# 重开终端后
nvm install 22
```

---

## 二、安装（方式 A：一键脚本，推荐）

```bash
cd "/Users/lizhipeng/Documents/00华尚融通/02项目/test-aif-handoff"
bash setup-aif-handoff.sh
```

脚本会：切换到正确的 Node 版本 → 复制 `.env` → `npm install` → `npm run init`（初始化 SQLite 数据库）。

## 二、安装（方式 B：手动）

```bash
cd "/Users/lizhipeng/Documents/00华尚融通/02项目/aif-handoff"
nvm use                 # 使用 .nvmrc 中的版本
cp -n .env.example .env # 已存在则跳过
npm install
npm run init
```

> ⚠️ 如果之后切换过 Node 版本，需要执行 `npm rebuild better-sqlite3`，否则 API 会崩溃，界面显示 **502 Bad Gateway**。

---

## 三、配置 Claude 认证

二选一：

- **使用订阅（默认）**：本机已登录过 Claude Code（`~/.claude/` 有凭证）即可，无需额外配置。
  没登录过的话：`npm i -g @anthropic-ai/claude-code && claude`，按提示登录。
- **使用 API Key**：编辑 `aif-handoff/.env`，加入
  ```dotenv
  ANTHROPIC_API_KEY=sk-ant-xxxxx
  ```

> ⚠️ Anthropic 不允许在官方 Claude Code CLI 之外使用 Pro/Max 订阅。若用订阅，建议在运行时配置（Settings → Runtime profile）里把 Claude 的传输方式设为 **CLI**；若用 SDK 传输，请改用 API Key。

如需用 Codex：`npm i -g @openai/codex && codex login`，然后在 Runtime profile 中选择 Codex（transport 选 `cli` 或 `app-server`）。

---

## 四、启动

```bash
cd "/Users/lizhipeng/Documents/00华尚融通/02项目/aif-handoff"
npm run dev
```

| 服务 | 地址 |
|---|---|
| Web 看板 | http://localhost:5180 |
| API | http://localhost:3009 |
| MCP（可选，需在 `.env` 设置 `MCP_PORT=3100`） | http://localhost:3100/mcp |

---

## 五、把本仓库接入看板

1. 打开 http://localhost:5180 ，点击新建 **Project**。
2. **Root Path** 填：
   ```
   /Users/lizhipeng/Documents/00华尚融通/02项目/test-aif-handoff
   ```
   AIF Handoff 会在本仓库里生成 `.ai-factory/` 目录（AI Factory 的规范和技能配置）。
3. 新建一个任务，例如「初始化一个 Node.js + Express 的 Hello World 服务」，放进 Backlog。
4. 观察它自动经过 Planning → Implementing → Review → Done。
   - 关闭 auto mode：计划生成后会停在 **Plan Ready** 等你批准。
   - 打开 auto mode：全程无人值守；审查不通过会自动返工，无法收敛时会标记为「需要人工审查」。

---

## 六、团队使用：两种模式怎么选

先想清楚一件事：**AIF Handoff 的看板、数据库和 AI 代理是跑在"一台机器"上的。** 所以团队用法只有两种：

| | 模式 A：每人本地一套 | 模式 B：一台共享服务器（Docker） |
|---|---|---|
| 成员要装吗 | 每人都按第一～五节装一份 | **成员什么都不用装**，浏览器打开网址即可 |
| 看板 | 各看各的，互相看不到 | 全队同一块看板，实时同步 |
| 代码在哪 | 各自电脑上，靠 Git 推拉协作 | 服务器上，代理推分支 / 开 PR 到 GitHub |
| AI 认证 | 每人用**自己的** Claude 订阅（CLI 传输） | 必须用 **API Key**（一个订阅给全队用违反条款） |
| 费用 | 每人订阅费 | API 按量计费 |
| 适合 | 试用、2～3 人小团队 | 正式团队协作 |

### 模式 A：每人本地一套

每位成员：

1. 克隆本仓库到自己电脑：`git clone https://github.com/yixin-cloud-coder/test-aif-handoff.git`
2. 在本仓库**旁边**执行 `bash test-aif-handoff/setup-aif-handoff.sh`（脚本会把 aif-handoff 克隆到同级目录并安装）
3. 用**自己的** Claude 账号登录：`npm i -g @anthropic-ai/claude-code@latest && claude`
4. `npm run dev` 启动，在看板里按第五节新建 Project，Root Path 指向自己电脑上的 test-aif-handoff
5. 把 Claude 运行配置切到 **CLI 传输**（见第三节）

协作约定（避免互相覆盖）：

- 每人在自己的分支上让 AI 干活，完成后提 PR 合并到 `main`，开工前先 `git pull`
- 任务分工在外部约定（群里、Issue），因为各人看板不互通
- 不需要开 Participants Mode（只有自己用）

### 模式 B：一台共享服务器（推荐给正式团队）

**只有管理员装一次**，成员只用浏览器。步骤见第七节，其中团队相关配置是：

```dotenv
# aif-handoff/.env（服务器上）
ANTHROPIC_API_KEY=sk-ant-xxxxx                      # 团队共用必须用 API Key
PARTICIPANTS_MODE_ENABLED=true                      # 开启账号体系
PARTICIPANT_ALLOWED_ORIGINS=https://aif.your-company.com   # 成员访问的地址，必须完全一致
PARTICIPANT_SESSION_COOKIE_SECURE=true              # 走 HTTPS 时打开

# 可选：从 GitHub 仓库创建项目、Issue 自动转任务、自动开 PR
AIF_GITHUB_PROJECT_CLONE_ENABLED=true
AIF_GITHUB_ISSUE_PR_ENABLED=true
GITHUB_TOKEN=github_pat_xxxxx   # fine-grained token，只授权本仓库
```

`GITHUB_TOKEN` 需要的权限：Metadata 读；Issues、Pull requests、Contents 读写；Commit statuses、Checks 读。

创建第一个管理员（Docker 下）：

```bash
echo '至少12位的密码' > /secure/admin-pw && chmod 600 /secure/admin-pw
docker compose exec -T api npm run participants:bootstrap -- \
  --username admin --display-name "管理员" --password-stdin < /secure/admin-pw
```

之后管理员登录看板，在**参与者菜单**里给每位成员建账号（可设临时密码，成员登录后自己改）。

角色说明：

- **admin**：管理成员、分配任务、改配置
- **member**：评论任何任务；可以领取"人工任务"并处理，也可以交回给 AI；**不能操作 AI 正在执行的任务**

任务分两类负责人：**AI**（代理自动执行）和 **Human**（成员手动处理，代理不会碰）。

---

## 七、Docker 部署是什么

**Docker 就是把 AIF Handoff 连同它需要的 Node、Claude CLI、Codex 等全部打包成"容器"，服务器上只要装了 Docker，一条命令就能跑起来**，不用手动配 Node 版本、编译 better-sqlite3。它会启动 4 个容器：

| 容器 | 作用 |
|---|---|
| `web` | 看板网页 |
| `api` | 后端接口 + WebSocket 实时推送 |
| `agent` | AI 代理调度器（真正写代码的地方） |
| `mcp` | 可选，给其他 AI 工具对接用 |

数据库和登录凭证存在 Docker 卷里，重启不丢；项目代码放在宿主机目录里。

### 在服务器上部署（模式 B）

前提：一台 Linux 服务器（2 核 4G 起步），已装 Docker 和 Docker Compose，有域名更好。

```bash
git clone https://github.com/lee-to/aif-handoff.git
cd aif-handoff
cp .env.example .env
# 按第六节模式 B 编辑 .env，另外加上：
#   DOMAIN=aif.your-company.com      （生产模式自动申请 HTTPS 证书）
#   PROJECTS_DIR=/srv/aif-projects
mkdir -p /srv/aif-projects            # 必须先建，否则容器没有写权限

# 正式环境（只开放 80/443，带 HTTPS、健康检查、资源限制）：
docker compose -f docker-compose.production.yml up -d --build

# 或者内网试用（开放 5180 端口，不配 HTTPS）：
# docker compose up -d --build
```

然后创建管理员（见上一节），成员访问 `https://aif.your-company.com` 登录即可。

> 生产模式下项目文件放在 Docker 命名卷里（不是宿主机目录）。推荐开启 `AIF_GITHUB_PROJECT_CLONE_ENABLED`，在看板里直接用 GitHub 仓库地址创建项目。
> 代理 push 代码需要服务器上有可用的 Git 凭证（HTTPS 凭证助手或 SSH key）。

常用运维命令：

```bash
docker compose logs -f agent     # 看代理日志
docker compose restart           # 重启
docker compose down              # 停止（数据保留）
git pull && docker compose up -d --build   # 升级
```

### 在自己电脑上用 Docker（可选）

如果不想在 Mac 上装 Node，也可以本地用 Docker 跑：

```bash
cd "/Users/lizhipeng/Documents/00华尚融通/02项目/aif-handoff"
cp -n .env.example .env
echo 'PROJECTS_DIR=/Users/lizhipeng/Documents/00华尚融通/02项目' >> .env
docker compose up --build
docker compose exec agent claude login   # 或在 .env 设 ANTHROPIC_API_KEY
docker compose restart agent
```

新建 Project 时 Root Path 填本机路径，会自动映射为容器内的 `/home/www/test-aif-handoff`。

---

## 常见问题

| 现象 | 处理 |
|---|---|
| 界面 502 Bad Gateway | `npm rebuild better-sqlite3`（Node 版本变过） |
| `npm install` 编译失败 | `xcode-select --install` 后重试 |
| 任务跑太久 / 频繁超时 | `.env` 中保持 `AGENT_USE_SUBAGENTS=false`（默认） |
| 代理报权限不足 | `.env` 中设 `AGENT_BYPASS_PERMISSIONS=true`，或在 `.claude/settings.local.json` 中授权 |
| 端口被占用 | `.env` 中修改 `PORT` / `WEB_PORT` |

## 参考

- AIF Handoff：https://github.com/lee-to/aif-handoff
- 官方文档：https://github.com/lee-to/aif-handoff/tree/main/docs
- AI Factory：https://github.com/lee-to/ai-factory
