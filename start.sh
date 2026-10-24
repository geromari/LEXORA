#!/usr/bin/env bash

# ==============================================================================
#  LEXORA — Unified Next.js Fullstack Platform
# ==============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[1;32m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
PURPLE="\033[1;35m"
RESET="\033[0m"

echo -e "${PURPLE}${BOLD}"
echo "=================================================================="
echo "          🌌 LEXORA FULLSTACK PLATFORM (VERCEL READY)             "
echo "=================================================================="
echo -e "${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Kutubxonalar o'rnatilmoqda (npm install)...${RESET}"
    npm install
fi

echo -e "${GREEN}✨ Lexora Next.js Fullstack ilovasi ishga tushirilmoqda...${RESET}"
echo -e "🌐 Web: ${CYAN}http://localhost:3000${RESET}\n"

exec npm run dev -- -p 3000
