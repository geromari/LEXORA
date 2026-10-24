# 🌌 LEXORA — AI-Powered IELTS & CEFR Vocabulary Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## 📖 Loyiha Haqida (About The Project)

**Lexora** — O'zbekistonlik o'quvchi va abituriyentlar uchun maxsus ishlab chiqilgan, **sun'iy intellekt (Google Gemini AI)** hamda **ilmiy asoslangan interval takrorlash (Spaced Repetition System — Leitner Box 0–5)** tizimiga asoslangan ilg'or akademik lug'at platformasi.

Platforma IELTS Reading & Writing imtihonlarida eng yuqori ball (Band 7.5–9.0) olish uchun zarur bo'lgan C1 va C2 darajadagi akademik leksikani eng tabiiy usullar bilan mustahkamlashga mo'ljallangan.

---

## ✨ Asosiy Imkoniyatlar (Core Features)

### 📚 1. 100+ Flagship Akademik So'zlar Bazasi
* **47 Core Academic Words:** IELTS matnlarida eng faol ishlatiladigan so'zlar (*ubiquitous, mitigate, bolster, perpetuate, obsolete, elucidate...*).
* **55 Core Words (C1–C2 Mastery):** Fan, jamiyat, siyosat va falsafa bo'yicha yuqori darajadagi akademik iboralar (*perennial dilemma, zero-sum game, the microscope and the manuscript, bankroll innovation, interdisciplinary...*).
* Har bir so'z aniq o'zbekcha kontekstual tarjima, sinonimlar va autentik IELTS namunaviy gaplari bilan to'liq ta'minlangan.

### 🧠 2. Ilmiy Interval Takrorlash (Spaced Repetition System — SRS)
* **0-quti:** Yangi yoki yaqinda adashilgan so'zlar (darhol takrorlash).
* **1-quti:** 24 soatdan so'ng.
* **2-quti:** 3 kundan so'ng.
* **3-quti:** 7 kundan so'ng.
* **4-quti:** 14 kundan so'ng.
* **5-quti:** 30 kundan so'ng (To'liq mustahkamlangan so'zlar).

### ⚡ 3. 4-in-1 Interaktiv Mashg'ulot Dvigateli (Study Engine)
* 🃏 **3D Glassmorphism Fleshkartalar:** 180° silliq 3D aylanish, kontekstual namunalar, qulay baholash tugmalari (*Qiyin, Yaxshi, Oson*).
* 🔘 **Variantli & Yozma Quiz:** MCQ yoki Yozma test, 50/50 aralash, `EN ➔ UZ` yoki `UZ ➔ EN` yo'nalishlarida.
* ✍️ **Smart Match Yozma Mashq (Typing Engine):** O'zbekcha tutuq belgilariga (`‘`, `’`, `'`, `` ` ``) chidamli intellektual tekshiruv, harfma-harf maslahat (+Hint) tizimi.
* 🤖 **AI Writing Assistant (Gemini AI):** Foydalanuvchi so'z ishtirokida gap tuzadi. Gemini AI esa uni 10 ballik CEFR mezonida tahlil qilib, grammatika va tabiiylik bo'yicha tuzatish beradi.

### 🔁 4. "Bugungi Takrorlash" Arenasi (`/review`)
* Bugun takrorlash muddati kelgan (`next_review_at <= hozir`) va qiyin so'zlarni bitta interaktiv shisha arenada jamlaydi.
* To'liq klaviatura boshqaruvi: `[Space]` — Aylantirish, `[1]` — Eslay olmadim, `[2]` — Esladim, `[A]` — Talaffuz.
* Kunlik seriya (Daily Streak 🔥) mexanikasi.

### ✨ 5. AI Smart Import (Matndan Lug'at Yaratish)
* Istalgan IELTS Reading matni yoki ilmiy maqolani nusxalab qo'ying.
* Sun'iy intellekt matndagi barcha B2/C1/C2 so'zlarni avtomatik ajratib oladi va tayyor lug'at to'plamiga aylantiradi.

### 🔊 6. Ovozli Talaffuz (Web Speech API)
* Har bir so'z va iborani 🇺🇸 Amerika (US) va 🇬🇧 Britaniya (UK) talaffuzida bir bosishda tinglash imkoniyati.

### 🤖 7. Telegram Bot & WebApp Integratsiyasi
* Shaxsiy Telegram bot orqali kunlik takrorlash eslatmalari, mini-quizlar va WebApp orqali platformaga bir zumda kirish.

---

## 🏗️ Texnologiyalar Steki (Tech Stack)

| Qatlam | Texnologiya | Tavsif |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** | React 19, TypeScript, Server & Client Components, Turbopack |
| **Styling** | **Tailwind CSS v4** | Neo-brutalism / Glassmorphism tokens, Micro-animations |
| **Animatsiyalar** | **Framer Motion + Lucide** | 3D Flip, silliq o'tishlar, SVG iconpack |
| **Backend** | **Python FastAPI** | Asinxron REST API, yuqori tezlik va barqarorlik |
| **Ma'lumotlar Bazasi** | **SQLAlchemy 2.0 (Async)** | SQLite (`lexora.db`) / PostgreSQL qo'llab-quvvatlaydi |
| **AI / LLM** | **Google Gemini API** | `google-genai` SDK + Offline evristik zaxira tizimi |
| **Telegram Bot** | **Aiogram 3.x** | Asinxron Telegram bot & APScheduler rejalashtiruvchisi |

---

## 📂 Loyiha Strukturasi (Project Structure)

```text
LEXORA/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI marshrutlari (decks, progress, ai, auth)
│   │   ├── core/            # Database, Security, Config, Seed ma'lumotlar
│   │   ├── models/          # SQLAlchemy ma'lumotlar modellari
│   │   ├── schemas/         # Pydantic V2 validatsiya sxemalari
│   │   └── services/        # SRS algoritmi va Gemini AI integratsiyasi
│   ├── bot/                 # Aiogram 3 Telegram bot
│   ├── tests/               # Pytest integratsiya testlari
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router sahifalari
│   │   ├── components/      # UI, Dashboard, Study va Auth komponentlari
│   │   ├── context/         # Auth va State kontekslari
│   │   └── lib/             # API mijoz, Speech API, SmartMatch yordamchilari
│   └── package.json
├── start.sh                 # Yagona buyruq bilan to'liq ishga tushirish skripti
└── README.md
```

---

## ⚡ Bir Qadamda Ishga Tushirish (Quick Start)

### 1. Repozitoriyni klonlash:
```bash
git clone https://github.com/USERNAME/LEXORA.git
cd LEXORA
```

### 2. Yagona skript orqali ishga tushirish:
```bash
chmod +x start.sh
./start.sh
```
*Yoki npm orqali:*
```bash
npm start
```

Ushbu skript avtomatik ravishda:
1. Python `.venv` va kerakli kutubxonalarni tekshiradi.
2. Frontend `node_modules` paketlarini sozlaydi.
3. Backendni `http://127.0.0.1:8000` manzilida ishga tushiradi.
4. Frontendni `http://localhost:3000` manzilida ochadi.

---

## 🛠️ Qo'lda Ishga Tushirish (Manual Setup)

### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Muhit o'zgaruvchilari nusxasi:
cp .env.example .env

# Serverni ishga tushirish:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **Swagger API Hujjatlari:** `http://127.0.0.1:8000/docs`
* **ReDoc:** `http://127.0.0.1:8000/redoc`

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
* **Web Ilova:** `http://localhost:3000`

---

## 🧪 Testlarni Ishga Tushirish

Backend integratsiya va SRS testlari:
```bash
cd backend
.venv/bin/pytest tests/ -v
```

Frontend production build tekshiruvi:
```bash
cd frontend
npm run build
```

---

## 📄 Litsenziya

Ushbu loyiha [MIT](LICENSE) litsenziyasi asosida taqdim etiladi. O'zbekiston yoshlarining ingliz tili salohiyatini yuksaltirish uchun ochiq ko'ngil bilan ishlab chiqilgan.
