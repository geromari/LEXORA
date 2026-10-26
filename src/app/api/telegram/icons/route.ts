import { NextRequest, NextResponse } from "next/server";
import { getAppUrl, callTelegramApi } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packName = searchParams.get("pack");
    const appUrl = getAppUrl();

    // 1. If pack name is provided, fetch document IDs directly from Telegram API!
    let packInfo: any = null;
    if (packName) {
      const stickerSet = await callTelegramApi("getStickerSet", { name: packName });
      if (stickerSet.ok && stickerSet.result) {
        packInfo = {
          name: stickerSet.result.name,
          title: stickerSet.result.title,
          is_custom_emoji: stickerSet.result.sticker_type === "custom_emoji",
          stickers: stickerSet.result.stickers.map((s: any) => ({
            emoji: s.emoji,
            custom_emoji_id: s.custom_emoji_id,
            file_id: s.file_id,
          })),
        };
      }
    }

    const availableIcons = [
      { name: "user", label: "Profil (User)", emoji: "👤", file100: `${appUrl}/telegram-icons/user-100.png` },
      { name: "calendar", label: "Kunlik takrorlash (Calendar)", emoji: "🗓", file100: `${appUrl}/telegram-icons/calendar-100.png` },
      { name: "barchart", label: "Statistika (BarChart)", emoji: "📊", file100: `${appUrl}/telegram-icons/barchart-100.png` },
      { name: "zap", label: "Tezkor Quiz (Zap)", emoji: "⚡️", file100: `${appUrl}/telegram-icons/zap-100.png` },
      { name: "bookmark", label: "Qiyin so'zlar (Bookmark)", emoji: "📑", file100: `${appUrl}/telegram-icons/bookmark-100.png` },
      { name: "bell", label: "Eslatmalar (Bell)", emoji: "🔔", file100: `${appUrl}/telegram-icons/bell-100.png` },
      { name: "globe", label: "Web Platforma (Globe)", emoji: "🌐", file100: `${appUrl}/telegram-icons/globe-100.png` },
      { name: "check", label: "To'g'ri (Check)", emoji: "✅", file100: `${appUrl}/telegram-icons/check-100.png` },
      { name: "x", label: "Noto'g'ri (X)", emoji: "❌", file100: `${appUrl}/telegram-icons/x-100.png` },
      { name: "flame", label: "Streak (Flame)", emoji: "🔥", file100: `${appUrl}/telegram-icons/flame-100.png` },
      { name: "sparkles", label: "AI (Sparkles)", emoji: "✨", file100: `${appUrl}/telegram-icons/sparkles-100.png` },
      { name: "book-open", label: "Lug'at (BookOpen)", emoji: "📖", file100: `${appUrl}/telegram-icons/book-open-100.png` },
    ];

    return NextResponse.json({
      ok: true,
      message: "Lucide Icons (https://lucide.dev/icons/) for Telegram Bot",
      download_all_zip: `${appUrl}/telegram-icons/lexora-lucide-icons.zip`,
      visual_preview_url: `${appUrl}/telegram-icons/preview.html`,
      note_on_visibility: "Ikonkalar shaffof fonda bo'lgani uchun, oq ikonkalarni ko'rishda fonni qora yoki rangli qilib oching. Standart oq fonda ko'rish uchun 1_dark_icons papkasidagi qora ikonkalardan foydalaning.",
      icons: availableIcons,
      pack_query_result: packInfo,
      instructions: [
        "1. Brauzerda jonli ko'rish uchun: 'visual_preview_url' havolasini oching.",
        "2. To'plamni 'download_all_zip' havolasi orqali yuklab oling. Arxiv ichida 3 ta papka mavjud: 1_dark_icons (qora), 2_white_icons (oq) va 3_colored_icons (rangli).",
        "3. Telegramda @Stickers botiga kiring va /newemojis buyrug'ini bering.",
        "4. Har bir ikonkani yuklab, tegishli emojini belgilang (masalan user-100.png -> 👤, calendar-100.png -> 🗓).",
        "5. Emoji pack yaratilgach, uning nomini ushbu URL ga ?pack=PACK_NAME qilib yuborsangiz, barcha 'custom_emoji_id' larni avtomatik chiqarib beradi.",
        "6. Olingan ID larni Vercel Environment Variables ga (TELEGRAM_EMOJI_USER, TELEGRAM_EMOJI_CALENDAR va h.k.) kiriting.",
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
