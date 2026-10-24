#!/usr/bin/env bash

# ==============================================================================
#  LEXORA — AI IELTS & CEFR Vocabulary Platform Single Startup Script
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# Colors for terminal output
BOLD="\033[1m"
CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
PURPLE="\033[1;35m"
RED="\033[1;31m"
RESET="\033[0m"

echo -e "${PURPLE}"
cat << "EOF"
  _      ______  _____   ____  _____            
 | |    |  ____|/ ____| / __ \|  __ \     /\    
 | |    | |__  | |  __ | |  | | |__) |   /  \   
 | |    |  __| | | |_ || |  | |  _  /   / /\ \  
 | |____| |____| |__| || |__| | | \ \  / ____ \ 
 |______|______|\_____| \____/|_|  \_\/_/    \_\
EOF
echo -e "${RESET}"
echo -e "${CYAN}${BOLD}O'zbek o'quvchilari uchun AI IELTS/CEFR Lug'at Platformasi${RESET}"
echo -e "${YELLOW}Monorepo ishga tushirilmoqda...${RESET}\n"

# 1. Check Python Virtual Environment for Backend
echo -e "${BOLD}1. Backend tayyorgarligi tekshirilmoqda...${RESET}"
if [ ! -d "${BACKEND_DIR}/.venv" ]; then
  echo -e "${YELLOW}Backend virtual muhiti (.venv) topilmadi. Yaratilmoqda...${RESET}"
  python3 -m venv "${BACKEND_DIR}/.venv"
  "${BACKEND_DIR}/.venv/bin/pip" install --upgrade pip
  "${BACKEND_DIR}/.venv/bin/pip" install -r "${BACKEND_DIR}/requirements.txt"
fi

# 2. Check Node Modules for Frontend
echo -e "${BOLD}2. Frontend tayyorgarligi tekshirilmoqda...${RESET}"
if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
  echo -e "${YELLOW}Frontend kutubxonalari (node_modules) topilmadi. O'rnatilmoqda...${RESET}"
  (cd "${FRONTEND_DIR}" && npm install)
fi

# Cleanup on exit (Ctrl+C / SIGINT / SIGTERM)
cleanup() {
  echo -e "\n${YELLOW}To'xtatish buyrug'i qabul qilindi. Barcha jarayonlar yopilmoqda...${RESET}"
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  # Kill any stray child processes in the current process group
  kill -- -$$ 2>/dev/null || true
  echo -e "${GREEN}Lexora muvaffaqiyatli to'xtatildi.${RESET}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 3. Start FastAPI Backend
echo -e "${BOLD}3. FastAPI Backend ishga tushirilmoqda (Port 8000)...${RESET}"
if lsof -ti:8000 >/dev/null 2>&1; then
  echo -e "${YELLOW}Port 8000 band. Eski jarayon to'xtatilmoqda...${RESET}"
  kill -9 $(lsof -ti:8000) 2>/dev/null || true
  sleep 1
fi
cd "${BACKEND_DIR}"
"${BACKEND_DIR}/.venv/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd "${SCRIPT_DIR}"

# 4. Wait briefly for backend to warm up
sleep 2

# 5. Start Next.js Frontend
echo -e "${BOLD}4. Next.js Frontend ishga tushirilmoqda (Port 3000)...${RESET}"
if lsof -ti:3000 >/dev/null 2>&1; then
  echo -e "${YELLOW}Port 3000 band. Eski jarayon to'xtatilmoqda...${RESET}"
  kill -9 $(lsof -ti:3000) 2>/dev/null || true
  sleep 1
fi
cd "${FRONTEND_DIR}"
npm run dev -- -p 3000 &
FRONTEND_PID=$!
cd "${SCRIPT_DIR}"

echo -e "\n${GREEN}${BOLD}==============================================================================${RESET}"
echo -e "${GREEN}${BOLD}  ✨ LEXORA TIZIMI MUVAFFAQIYATLI ISHGA TUSHIRILDI!${RESET}"
echo -e "${GREEN}${BOLD}==============================================================================${RESET}"
echo -e "  🌐 ${BOLD}Frontend Web Ilova:${RESET}     ${CYAN}http://localhost:3000${RESET}"
echo -e "  ⚡ ${BOLD}FastAPI Backend:${RESET}        ${CYAN}http://127.0.0.1:8000${RESET}"
echo -e "  📚 ${BOLD}Interaktiv Swagger Docs:${RESET} ${CYAN}http://127.0.0.1:8000/docs${RESET}"
echo -e "  🔁 ${BOLD}Takrorlash Arenasi:${RESET}      ${CYAN}http://localhost:3000/review${RESET}"
echo -e "  🤖 ${BOLD}Telegram Bot:${RESET}           ${CYAN}cd backend && python run_bot.py${RESET} (yoki .env da TELEGRAM_BOT_TOKEN)"
echo -e "${GREEN}${BOLD}==============================================================================${RESET}"
echo -e "${YELLOW}Serverlarni to'xtatish uchun [Ctrl+C] tugmasini bosing.${RESET}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
