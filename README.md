# 🌌 LEXORA — AI-Powered IELTS & CEFR Vocabulary Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Ready-black?style=for-the-badge&logo=vercel" alt="Vercel Ready" />
</p>

---

## 📖 Loyiha Haqida (About The Project)

**Lexora** — O'zbekistonlik o'quvchi va abituriyentlar uchun maxsus ishlab chiqilgan, **sun'iy intellekt (Gemini AI)** hamda **interval takrorlash (Spaced Repetition System — Leitner Box 0–5)** tizimiga asoslangan ilg'or akademik lug'at platformasi.

Barcha frontend va backend API marshrutlari yagona **Next.js Fullstack (App Router)** arxitekturasida jamlangan bo'lib, **faqatgina Vercel'ning o'zida bir zumda (1-klikda)** deploy qilinishi uchun to'liq moslashtirilgan.

---

## 📂 Loyiha Strukturasi (Unified Architecture)

Loyihaning barcha qismlari bitta `src/` katalogida jamlangan:

```text
LEXORA/
├── prisma/
│   ├── schema.prisma      # Prisma sxemasi (User, Deck, Card, StudyProgress)
│   ├── seed.ts            # 102 ta Flagship so'zlarni bazaga kiritish skripti
│   └── seed_words.json    # 47 ta Core + 55 ta Academic C1-C2 so'zlar ma'lumotlar bazasi
├── public/                # Statik rasmlar va resurslar
├── src/
│   ├── app/
│   │   ├── api/           # Backend REST API Routes (Serverless)
│   │   │   ├── auth/      # Login, Register, Telegram, Me
│   │   │   ├── decks/     # To'plamlar ro'yxati va boshqaruvi
│   │   │   ├── progress/  # Spaced Repetition (Leitner 0-5) yangilanishi
│   │   │   ├── review/    # Bugungi takrorlash navbati va qiyin so'zlar
│   │   │   └── ai/        # Gemini AI (Matndan lug'at ajratish va gapni baholash)
│   │   ├── decks/         # To'plam sahifalari va /study interaktiv arenasi
│   │   ├── review/        # Takrorlash arenasi
│   │   ├── layout.tsx     # Asosiy sahifa skeleti
│   │   ├── page.tsx       # Boshqaruv paneli (Dashboard)
│   │   └── globals.css    # Tailwind CSS v4 Neo-brutalism dizayn tokenlari
│   ├── components/        # UI, Dashboard, Study va Auth interfeyslari
│   ├── context/           # AuthContext
│   └── lib/               # Prisma, Auth (Jose), SRS, SmartMatch, Speech API
├── package.json           # Yagona paketlar va skriptlar fayli
├── next.config.ts         # Next.js konfiguratsiyasi
├── vercel.json            # Vercel deployment sozlamalari
└── README.md
```

---

## 🚀 Vercel'ga Deploy Qilish (1-Klikda)

1. [vercel.com](https://vercel.com) ga kiring va GitHub akkauntingiz orqali kiring.
2. **"Add New..."** ➔ **"Project"** tugmasini bosing va **`geromari/LEXORA`** repozitoriyasini tanlang.
3. **Environment Variables:**
   * `DATABASE_URL`: Serverless PostgreSQL (masalan, bepul **Neon Postgres** yoki Vercel Storage) havolasi.
   * `JWT_SECRET`: Ixtiyoriy maxfiy kalit.
   * `GEMINI_API_KEY`: (Ixtiyoriy) Gemini AI kaliti (kiritilmasa avtomatik aqlli fallback ishlaydi).
   * `TELEGRAM_BOT_TOKEN`: (Ixtiyoriy) Telegram botingiz tokeni (masalan, `@BotFather` orqali olingan).
   * `TELEGRAM_BOT_USERNAME`: Telegram botingiz username'i (masalan: `lexora_uzbot`).
   * `NEXT_PUBLIC_APP_URL`: Deploy bo'lgan Vercel domenining havolasi (masalan: `https://lexora.vercel.app`).
4. **"Deploy"** tugmasini bosing! 
   * Vercel frontend va barcha backend API larni avtomatik tarzda bitta domenda deploy qiladi.

---

## 🤖 Telegram Botni Vercel'da Faollashtirish (Webhook)

Vercel — **Serverless** platforma bo'lib, unda doimiy ishlaydigan background jarayonlar (Long Polling) mavjud emas. Shuning uchun Telegram bot Vercel'da **Webhook** orqali ishlaydi:

1. **Vercel'da Environment Variables kiriting**:
   - `TELEGRAM_BOT_TOKEN`: Bot tokeningiz.
   - `TELEGRAM_BOT_USERNAME`: Masalan, `lexora_uzbot`.
   - `NEXT_PUBLIC_APP_URL`: Vercel domen manzilingiz (masalan: `https://sizning-domen.vercel.app`).
2. **Webhookni 1-klikda faollashtirish**:
   Deploy bo'lgandan so'ng, brauzeringizda quyidagi manzilni oching:
   ```text
   https://sizning-domen.vercel.app/api/telegram/setup
   ```
   Ushbu sahifa Telegram API'ga avtomatik ravishda Webhook manzilini bog'laydi va bot ma'lumotlarini qaytaradi.
3. **Botingizni tekshiring**:
   Telegram ilovasida botingizga kiring va `/start` tugmasini bosing:
   - 🎯 **Tezkor Quiz (5 ta so'z)** — Interaktiv test.
   - 🔍 **Aqlli Lug'at** — Istalgan inglizcha so'z yuborib ma'nosini ko'rish va 1 bosishda saqlash.
   - 👤 **Profil & Statistika** — SRS seriyangiz va o'rganilgan so'zlar.
   - 🔗 **Veb-saytga 1-klikda kirish** — Saytdagi "Telegram orqali kirish" tugmasi orqali parolsiz avtorizatsiya.

---

## ⚡ Lokal Muhitda Ishga Tushirish

```bash
# 1. Kutubxonalarni o'rnatish:
npm install

# 2. Bazani sinxronlash va 102 ta so'zni yuklash:
npm run db:push
npm run db:seed

# 3. Dasturni ishga tushirish:
npm run dev
```

Platforma `http://localhost:3000` manzilida ishga tushadi.

---

## 📄 Litsenziya

MIT License © 2026 Lexora Team.
