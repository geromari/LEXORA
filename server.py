#!/usr/bin/env python3
"""
Lexora Unified Fullstack Server Runner
======================================
Ushbu yagona fayl orqali backend (FastAPI) va frontend (Next.js) bitta jarayon sifatida
serverda yoki lokal muhitda qulay ishga tushiriladi va boshqariladi.

Foydalanish:
    python3 server.py           # Standart rejim
    python3 server.py --prod    # Production rejim (Next.js build & production server)
    python3 server.py --port 80 # Maxsus portlar bilan
"""

import argparse
import os
import signal
import subprocess
import sys
import threading
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Ranglar
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[1;32m"
CYAN = "\033[1;36m"
YELLOW = "\033[1;33m"
PURPLE = "\033[1;35m"
RED = "\033[1;31m"

processes = []
shutting_down = False


def log(prefix: str, message: str, color: str = CYAN):
    print(f"{color}[{prefix}]{RESET} {message}")


def stream_logs(pipe, prefix: str, color: str):
    try:
        for line in iter(pipe.readline, ""):
            if not line:
                break
            print(f"{color}[{prefix}]{RESET} {line.rstrip()}")
    except Exception:
        pass


def kill_all_processes():
    global shutting_down
    if shutting_down:
        return
    shutting_down = True
    log("LEXORA", "Barcha jarayonlar to'xtatilmoqda...", YELLOW)
    for p in processes:
        if p.poll() is None:
            try:
                p.terminate()
            except Exception:
                pass
    time.sleep(1)
    for p in processes:
        if p.poll() is None:
            try:
                p.kill()
            except Exception:
                pass
    log("LEXORA", "Tizim toza to'xtatildi.", GREEN)
    sys.exit(0)


def signal_handler(sig, frame):
    kill_all_processes()


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def check_and_setup_backend():
    venv_dir = os.path.join(BACKEND_DIR, ".venv")
    venv_python = os.path.join(venv_dir, "bin", "python3")
    venv_pip = os.path.join(venv_dir, "bin", "pip")

    if not os.path.exists(venv_python):
        log("BACKEND", "Virtual muhit (.venv) topilmadi. Yaratilmoqda...", YELLOW)
        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
        log("BACKEND", "Kutubxonalar o'rnatilmoqda...", YELLOW)
        subprocess.run([venv_pip, "install", "--upgrade", "pip"], check=True)
        subprocess.run([venv_pip, "install", "-r", os.path.join(BACKEND_DIR, "requirements.txt")], check=True)
    return venv_python


def check_and_setup_frontend(prod_mode: bool):
    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        log("FRONTEND", "node_modules topilmadi. O'rnatilmoqda (npm install)...", YELLOW)
        subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)

    if prod_mode:
        log("FRONTEND", "Production build tayyorlanmoqda (npm run build)...", CYAN)
        subprocess.run(["npm", "run", "build"], cwd=FRONTEND_DIR, check=True)


def main():
    parser = argparse.ArgumentParser(description="Lexora Unified Server Runner")
    parser.add_argument("--prod", action="store_true", help="Production rejimida ishga tushirish (npm run build & start)")
    parser.add_argument("--backend-port", type=int, default=8000, help="Backend porti (default: 8000)")
    parser.add_argument("--frontend-port", type=int, default=3000, help="Frontend porti (default: 3000)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Tinglash hosti (default: 0.0.0.0)")
    args = parser.parse_args()

    print(f"{PURPLE}{BOLD}")
    print("==================================================================")
    print("      🌌 LEXORA UNIFIED FULLSTACK SERVER RUNNER (V1.0)           ")
    print("==================================================================")
    print(f"{RESET}")

    # 1. Muhitni sozlash
    log("SERVER", "Muhit tekshirilmoqda...", CYAN)
    python_bin = check_and_setup_backend()
    check_and_setup_frontend(args.prod)

    # 2. Backendni ishga tushirish
    log("BACKEND", f"FastAPI ishga tushirilmoqda ({args.host}:{args.backend_port})...", GREEN)
    backend_cmd = [
        python_bin, "-m", "uvicorn", "app.main:app",
        "--host", args.host,
        "--port", str(args.backend_port),
    ]
    if not args.prod:
        backend_cmd.append("--reload")

    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    processes.append(backend_proc)
    threading.Thread(target=stream_logs, args=(backend_proc.stdout, "BACKEND", GREEN), daemon=True).start()

    # 3. Frontendni ishga tushirish
    frontend_cmd = ["npm", "run", "start" if args.prod else "dev", "--", "-p", str(args.frontend_port), "-H", args.host]
    log("FRONTEND", f"Next.js ishga tushirilmoqda ({args.host}:{args.frontend_port})...", CYAN)

    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    processes.append(frontend_proc)
    threading.Thread(target=stream_logs, args=(frontend_proc.stdout, "FRONTEND", CYAN), daemon=True).start()

    log("SERVER", f"✨ Barcha xizmatlar tayyor! Frontend: http://localhost:{args.frontend_port} | Backend: http://localhost:{args.backend_port}", PURPLE)
    log("SERVER", "To'xtatish uchun Ctrl+C tugmasini bosing.", YELLOW)

    while True:
        time.sleep(1)
        if backend_proc.poll() is not None:
            log("SERVER", "Backend kutilmaganda to'xtadi!", RED)
            kill_all_processes()
        if frontend_proc.poll() is not None:
            log("SERVER", "Frontend kutilmaganda to'xtadi!", RED)
            kill_all_processes()


if __name__ == "__main__":
    main()
