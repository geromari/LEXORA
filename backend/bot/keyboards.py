from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
    WebAppInfo,
)


def is_valid_telegram_url(url: str) -> bool:
    """
    Checks whether a URL can be safely used in Telegram inline buttons.
    Telegram strictly rejects localhost, 127.0.0.1, or local IP addresses with 'Wrong HTTP URL'.
    """
    if not url:
        return False
    u = url.strip().lower()
    if "localhost" in u or "127.0.0.1" in u or "0.0.0.0" in u:
        return False
    return u.startswith("https://") or u.startswith("http://") or u.startswith("tg://")


def get_main_reply_keyboard(webapp_url: str = "") -> ReplyKeyboardMarkup:
    """
    Builds the persistent bottom reply keyboard mirroring modern Telegram bot UI standards.
    Features styled buttons (success / primary) with clean icon pairings:
    [ 🗓 Kunlik takrorlash ]  [ 👤 Profil ]
    [ 🎯 Tezkor Quiz (5 ta so'z) ]
    [ 📌 Qiyin so'zlarim ]    [ 🔔 Eslatmalar ]
    [ 💻 Lexora Web Platformasi ↗️ ]
    """
    web_button = (
        KeyboardButton(
            text="💻 Lexora Web Platformasi ↗️",
            web_app=WebAppInfo(url=webapp_url),
            style="primary",
        )
        if is_valid_telegram_url(webapp_url) and webapp_url.startswith("https://")
        else KeyboardButton(text="💻 Lexora Web Platformasi ↗️", style="primary")
    )
    keyboard = [
        [
            KeyboardButton(text="🗓 Kunlik takrorlash", style="success"),
            KeyboardButton(text="👤 Profil", style="success"),
        ],
        [
            KeyboardButton(text="🎯 Tezkor Quiz (5 ta so'z)", style="primary"),
        ],
        [
            KeyboardButton(text="📌 Qiyin so'zlarim"),
            KeyboardButton(text="🔔 Eslatmalar"),
        ],
        [
            web_button,
        ],
    ]
    return ReplyKeyboardMarkup(keyboard=keyboard, resize_keyboard=True)


def get_welcome_keyboard(webapp_url: str = "") -> InlineKeyboardMarkup:
    """
    Builds the main interactive in-message menu with styled buttons:
    - [ 🎯 Tezkor Quiz (5 ta so'z) ] (primary blue)
    - [ 🗓 Kunlik takrorlash ] (success green) | [ 👤 Profil ] (success green)
    - [ 📌 Qiyin so'zlarim ] | [ 🔔 Eslatmalar ]
    - [ 📖 Bot qo'llanmasi ]
    - [ 💻 Lexora Web Platformasi ↗️ ] (primary blue, if public URL)
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text="🎯 Tezkor Quiz (5 ta so'z)",
                callback_data="start_quiz",
                style="primary",
            )
        ],
        [
            InlineKeyboardButton(
                text="🗓 Kunlik takrorlash",
                callback_data="quiz:start",
                style="success",
            ),
            InlineKeyboardButton(
                text="👤 Profil",
                callback_data="my_stats",
                style="success",
            ),
        ],
        [
            InlineKeyboardButton(
                text="📌 Qiyin so'zlarim",
                callback_data="hard_words",
            ),
            InlineKeyboardButton(
                text="🔔 Eslatmalar",
                callback_data="reminder:toggle",
            ),
        ],
        [
            InlineKeyboardButton(
                text="📖 Bot qo'llanmasi",
                callback_data="help",
            )
        ],
    ]

    # Attach WebApp or direct web button if it is a valid public domain
    if is_valid_telegram_url(webapp_url):
        if webapp_url.startswith("https://"):
            web_button = InlineKeyboardButton(
                text="💻 Lexora Web Platformasi ↗️",
                web_app=WebAppInfo(url=webapp_url),
                style="primary",
            )
        else:
            web_button = InlineKeyboardButton(
                text="💻 Lexora Web Platformasi ↗️",
                url=webapp_url,
                style="primary",
            )
        keyboard.append([web_button])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_lookup_keyboard(term: str, webapp_url: str = "") -> InlineKeyboardMarkup:
    """Inline keyboard for word search result."""
    keyboard = [
        [
            InlineKeyboardButton(
                text="💾 Lug'atimga saqlash",
                callback_data=f"save:{term[:32]}",
                style="success",
            )
        ]
    ]
    if is_valid_telegram_url(webapp_url):
        keyboard.append([
            InlineKeyboardButton(
                text="💻 Webda mashq qilish ↗️",
                url=webapp_url,
                style="primary",
            )
        ])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_stats_keyboard(webapp_url: str = "") -> InlineKeyboardMarkup:
    """Inline keyboard for user statistics view."""
    bottom_row = []
    if is_valid_telegram_url(webapp_url):
        bottom_row.append(
            InlineKeyboardButton(
                text="💻 Webda to'liq tahlil ↗️",
                url=webapp_url,
                style="primary",
            )
        )
    bottom_row.append(
        InlineKeyboardButton(
            text="🔙 Asosiy menyu",
            callback_data="main_menu",
        )
    )
    keyboard = [
        [
            InlineKeyboardButton(
                text="🎯 Hozir Quiz boshlash",
                callback_data="quiz:start",
                style="success",
            )
        ],
        bottom_row,
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_quiz_finished_keyboard(webapp_url: str = "") -> InlineKeyboardMarkup:
    """Inline keyboard after finishing a 5-word quiz."""
    bottom_row = []
    if is_valid_telegram_url(webapp_url):
        bottom_row.append(
            InlineKeyboardButton(
                text="💻 Web Platformaga o'tish ↗️",
                url=webapp_url,
                style="primary",
            )
        )
    bottom_row.append(
        InlineKeyboardButton(
            text="🔙 Asosiy menyu",
            callback_data="main_menu",
        )
    )
    keyboard = [
        [
            InlineKeyboardButton(
                text="🔁 Yana 5 ta so'z",
                callback_data="quiz:start",
                style="primary",
            ),
            InlineKeyboardButton(
                text="👤 Profil & Statistika",
                callback_data="stats",
                style="success",
            ),
        ],
        bottom_row,
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_reminder_keyboard(is_enabled: bool = True) -> InlineKeyboardMarkup:
    """Inline keyboard for daily reminder settings."""
    btn_text = "🔕 Eslatmani o'chirish" if is_enabled else "🔔 Eslatmani yoqish"
    btn_style = "danger" if is_enabled else "success"
    keyboard = [
        [
            InlineKeyboardButton(
                text=btn_text,
                callback_data="reminder:toggle_action",
                style=btn_style,
            )
        ],
        [
            InlineKeyboardButton(
                text="🔙 Asosiy menyu",
                callback_data="main_menu",
            )
        ],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_quiz_inline_keyboard(question_id: int, options: list[str]) -> InlineKeyboardMarkup:
    """Renders 4 inline options for interactive in-chat quiz."""
    prefixes = ["A", "B", "C", "D"]
    keyboard = []
    for idx, opt in enumerate(options[:4]):
        prefix = prefixes[idx] if idx < len(prefixes) else str(idx + 1)
        keyboard.append([
            InlineKeyboardButton(
                text=f"{prefix}) {opt}",
                callback_data=f"qopt:{question_id}:{idx}",
            )
        ])
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_quiz_feedback_keyboard(is_last: bool, webapp_url: str = "") -> InlineKeyboardMarkup:
    """Inline keyboard shown after answering a quiz question."""
    if is_last:
        return get_quiz_finished_keyboard(webapp_url)
    keyboard = [
        [
            InlineKeyboardButton(
                text="Keyingi savol ➡️",
                callback_data="quiz:next",
                style="primary",
            )
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)


def get_hard_words_keyboard(webapp_url: str = "") -> InlineKeyboardMarkup:
    """Inline keyboard for hard words list view."""
    bottom_row = []
    if is_valid_telegram_url(webapp_url):
        bottom_row.append(
            InlineKeyboardButton(
                text="💻 Webda to'liq mashq qilish ↗️",
                url=webapp_url,
                style="primary",
            )
        )
    bottom_row.append(
        InlineKeyboardButton(
            text="🔙 Asosiy menyu",
            callback_data="main_menu",
        )
    )
    keyboard = [
        [
            InlineKeyboardButton(
                text="🎯 Tezkor Quiz (5 ta so'z)",
                callback_data="start_quiz",
                style="primary",
            )
        ],
        bottom_row,
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

