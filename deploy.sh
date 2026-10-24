#!/usr/bin/env bash

# ==============================================================================
#  LEXORA — 1-Click Server Deployment Script (Ubuntu / Debian / Linux)
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
echo "          🌌 LEXORA 1-CLICK PRODUCTION SERVER DEPLOY              "
echo "=================================================================="
echo -e "${RESET}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# 1. Tizim paketlarini tekshirish
echo -e "${CYAN}1. Python va Node.js tekshirilmoqda...${RESET}"
if ! command -v python3 &>/dev/null; then
    echo -e "${YELLOW}Python3 o'rnatilmoqda...${RESET}"
    sudo apt update && sudo apt install -y python3 python3-venv python3-pip
fi

if ! command -v node &>/dev/null; then
    echo -e "${YELLOW}Node.js 20 o'rnatilmoqda...${RESET}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 2. Backend virtual muhit
echo -e "${CYAN}2. Backend virtual muhiti sozlanmoqda...${RESET}"
if [ ! -d "backend/.venv" ]; then
    python3 -m venv backend/.venv
fi
backend/.venv/bin/pip install --upgrade pip
backend/.venv/bin/pip install -r backend/requirements.txt

# 3. Frontend paketlari va Production Build
echo -e "${CYAN}3. Frontend kutubxonalari o'rnatilib, build olinmoqda...${RESET}"
cd frontend
npm install
npm run build
cd "${SCRIPT_DIR}"

# 4. Yagona serverni ishga tushirish
echo -e "\n${GREEN}${BOLD}==================================================================${RESET}"
echo -e "${GREEN}${BOLD}  ✨ LEXORA SERVERGA DEPLOY QILISHGA TO'LIQ TAYYOR!${RESET}"
echo -e "${GREEN}${BOLD}==================================================================${RESET}"
echo -e "  🌐 ${BOLD}Lokal ishga tushirish (dev):${RESET}        ${CYAN}python3 server.py${RESET}"
echo -e "  🚀 ${BOLD}Production rejimida ishga tushirish:${RESET} ${CYAN}python3 server.py --prod${RESET}"
echo -e "  🐳 ${BOLD}Docker orqali 1-buyruqda:${RESET}            ${CYAN}docker compose up -d${RESET}"
echo -e "${GREEN}${BOLD}==================================================================${RESET}\n"

# Agar serverda fonda doimiy ishlashi kerak bo'lsa:
if [ "$1" == "--run" ]; then
    exec python3 server.py --prod
fi
