#!/usr/bin/env bash
# AIF Handoff 一键安装脚本（macOS，非 Docker 方式）
# 用法：在本仓库目录下执行  bash setup-aif-handoff.sh
set -euo pipefail

PROJECTS_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AIF_DIR="$PROJECTS_ROOT/aif-handoff"
echo "==> 工作目录: $PROJECTS_ROOT"

# 1. 获取 AIF Handoff 源码
if [ ! -d "$AIF_DIR/.git" ]; then
  git clone https://github.com/lee-to/aif-handoff.git "$AIF_DIR"
else
  echo "==> aif-handoff 已存在，跳过克隆（更新可执行: cd \"$AIF_DIR\" && git pull）"
fi
cd "$AIF_DIR"

# 2. 切换到项目要求的 Node 版本（.nvmrc，需 20.19+ 或 22.12+）
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  set +u; . "$HOME/.nvm/nvm.sh"; nvm install; nvm use; set -u
fi
command -v node >/dev/null 2>&1 || { echo "未找到 Node.js，请先安装 nvm 再执行: nvm install 22"; exit 1; }
echo "==> Node 版本: $(node -v)"

# 3. 环境变量
[ -f .env ] || cp .env.example .env

# 4. 安装依赖（better-sqlite3 在本机编译，需要 Xcode 命令行工具）
xcode-select -p >/dev/null 2>&1 || echo "提示：如编译失败，请先执行 xcode-select --install"
npm install

# 5. 初始化数据库
npm run init

cat <<MSG

==> 安装完成！
启动:     cd "$AIF_DIR" && npm run dev
打开:     http://localhost:5180
新建项目时 Root Path 填: $PROJECTS_ROOT/test-aif-handoff
MSG
