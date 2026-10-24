import json
import logging
import re
from typing import List, Optional
from app.core.config import settings
from app.schemas.ai import ExtractedCardItem, CheckSentenceResponse

logger = logging.getLogger("lexora.ai")

# Fallback academic vocabulary knowledge base for offline/fallback parsing
FALLBACK_ACADEMIC_LEXICON = {
    "scrutinize": {
        "meaning_uz": "sinchiklab o'rganmoq, qattiq tekshiruvdan o'tkazmoq",
        "synonyms": "examine closely, audit, inspect",
        "example_en": "Regulatory authorities must scrutinize all financial disclosures."
    },
    "thrive": {
        "meaning_uz": "gullab-yashnamoq, ravnaq topmoq",
        "synonyms": "flourish, prosper, burgeon",
        "example_en": "Innovative startups thrive in supportive economic environments."
    },
    "foster": {
        "meaning_uz": "rivojlantirmoq, rag'batlantirmoq, parvarishlamoq",
        "synonyms": "cultivate, encourage, nurture",
        "example_en": "Collaborative seminars foster intellectual maturity among peers."
    },
    "ripple effect": {
        "meaning_uz": "zanjirsimon ta'sir, kaskadli oqibat",
        "synonyms": "domino effect, chain reaction",
        "example_en": "Economic downturns trigger an immediate ripple effect across households."
    },
    "window dressing": {
        "meaning_uz": "ko'zbo'yamachilik, faqat tashqi ko'rinishni yaxshilash",
        "synonyms": "superficial facade, pretense",
        "example_en": "Critics argued the policy change was mere window dressing."
    },
    "polarization": {
        "meaning_uz": "qutblashuv, qarama-qarshi tomonlarga bo'linish",
        "synonyms": "division, dichotomy, discord",
        "example_en": "Social media algorithms often exacerbate societal polarization."
    },
    "legitimacy": {
        "meaning_uz": "qonuniylik, jamoatchilik e'tirofi",
        "synonyms": "validity, authenticity, authority",
        "example_en": "Transparent institutions preserve public legitimacy."
    },
    "prosperity": {
        "meaning_uz": "farovonlik, to'kin-sochinlik",
        "synonyms": "affluence, economic well-being",
        "example_en": "Equitable growth is indispensable for durable prosperity."
    },
    "overreach": {
        "meaning_uz": "vakolatini suiiste'mol qilish, haddidan oshish",
        "synonyms": "encroachment, overstepping",
        "example_en": "The judiciary stepped in to curb executive overreach."
    },
    "altruism": {
        "meaning_uz": "xolis yaxshilik, fidoyilik, saxovat",
        "synonyms": "benevolence, selflessness",
        "example_en": "Genuine altruism inspires community solidarity."
    },
    "cohesion": {
        "meaning_uz": "jipslik, mustahkam birdamlik",
        "synonyms": "solidarity, unity",
        "example_en": "Cultural exchanges reinforce social cohesion."
    },
    "recruitment": {
        "meaning_uz": "xodimlarni jalb qilish, tanlov",
        "synonyms": "talent acquisition, hiring",
        "example_en": "Targeted recruitment campaigns attract skilled researchers."
    },
    "underserved": {
        "meaning_uz": "e'tibordan chetda qolgan, yetarli xizmat ko'rsatilmagan",
        "synonyms": "underprivileged, neglected",
        "example_en": "Mobile medical units deliver aid to underserved villages."
    },
    "fulfilling": {
        "meaning_uz": "qoniqish bag'ishlovchi, ma'noli",
        "synonyms": "rewarding, gratifying",
        "example_en": "Mentoring younger students is exceptionally fulfilling."
    },
    "inevitable": {
        "meaning_uz": "muqarrar, oldini olib bo'lmaydigan",
        "synonyms": "unavoidable, inescapable",
        "example_en": "Technological transformation is an inevitable reality."
    },
    "comprehensive": {
        "meaning_uz": "har tomonlama, keng qamrovli",
        "synonyms": "exhaustive, all-inclusive",
        "example_en": "The committee proposed a comprehensive reform package."
    },
    "predominant": {
        "meaning_uz": "ustun, asosiy o'rin tutuvchi",
        "synonyms": "dominant, primary, prevalent",
        "example_en": "Renewable energy will become the predominant source of power."
    },
    "exacerbate": {
        "meaning_uz": "yanada og'irlashtirmoq, keskinlashtirmoq",
        "synonyms": "aggravate, worsen, intensify",
        "example_en": "Water scarcity may exacerbate existing geopolitical frictions."
    },
    "ubiquitous": {
        "meaning_uz": "hamma joyda hoziru nozir, keng tarqalgan",
        "synonyms": "omnipresent, widespread",
        "example_en": "Smartphones have become ubiquitous across all demographics."
    },
    "mitigate": {
        "meaning_uz": "yumshatmoq, zararini kamaytirmoq",
        "synonyms": "alleviate, lessen, ease",
        "example_en": "Reforestation helps mitigate catastrophic flood hazards."
    }
}


async def extract_vocabulary_from_text(
    text: str,
    level: str = "C1",
    count: int = 15
) -> List[ExtractedCardItem]:
    """
    Extracts 10-20 advanced words/idioms from English text with Uzbek translations.
    Uses Google Gemini API if configured, otherwise falls back to academic lexicon parser.
    """
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            system_instruction = (
                f"You are an expert IELTS Cambridge examiner and Uzbek lexicographer. "
                f"Extract exactly {count} advanced {level}-level vocabulary words, phrasal verbs, "
                f"or academic collocations from the provided English passage. "
                f"For each term, provide: "
                f"1. 'term_en': the exact word or collocation, "
                f"2. 'meaning_uz': a natural, accurate Uzbek translation and explanation, "
                f"3. 'synonyms': 2-3 English synonyms, "
                f"4. 'example_en': a high-level academic example sentence showcasing its natural usage, "
                f"5. 'level': CEFR level (e.g. '{level}'). "
                f"Return ONLY valid JSON array of objects without markdown fences."
            )

            prompt = f"English Passage:\n\n{text[:15000]}\n\nOutput JSON Array:"
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_instruction}\n\n{prompt}",
            )

            if response and response.text:
                clean_text = response.text.strip()
                # Remove markdown fences if present
                clean_text = re.sub(r"^```json\s*", "", clean_text)
                clean_text = re.sub(r"^```\s*", "", clean_text)
                clean_text = re.sub(r"\s*```$", "", clean_text)

                parsed_json = json.loads(clean_text)
                results: List[ExtractedCardItem] = []
                for item in parsed_json:
                    results.append(
                        ExtractedCardItem(
                            term_en=item.get("term_en", "").strip(),
                            meaning_uz=item.get("meaning_uz", "").strip(),
                            synonyms=item.get("synonyms", ""),
                            example_en=item.get("example_en", ""),
                            level=item.get("level", level),
                        )
                    )
                if len(results) >= 5:
                    return results[:count]
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to heuristic parser: {e}")

    # Fallback heuristic extractor: Match against our academic lexicon or extract key phrases
    logger.info("Executing academic fallback vocabulary extractor...")
    lower_text = text.lower()
    matched_items: List[ExtractedCardItem] = []

    # 1. Match against known academic lexicon
    for term, data in FALLBACK_ACADEMIC_LEXICON.items():
        if re.search(rf"\b{re.escape(term)}\b", lower_text):
            # Extract actual context sentence from text if possible
            sentence_match = re.search(rf"([^.!?]*\b{re.escape(term)}\b[^.!?]*[.!?])", text, re.IGNORECASE)
            example = sentence_match.group(1).strip() if sentence_match else data["example_en"]

            matched_items.append(
                ExtractedCardItem(
                    term_en=term,
                    meaning_uz=data["meaning_uz"],
                    synonyms=data["synonyms"],
                    example_en=example,
                    level=level,
                )
            )

    # 2. If fewer than 10 matched, extract complex words (length >= 8) and generate definitions
    if len(matched_items) < count:
        words = re.findall(r"\b[a-zA-Z]{8,}\b", text)
        existing_terms = {m.term_en.lower() for m in matched_items}
        for w in words:
            w_lower = w.lower()
            if w_lower not in existing_terms and w_lower not in ["something", "everything", "therefore", "different", "important"]:
                existing_terms.add(w_lower)
                sentence_match = re.search(rf"([^.!?]*\b{re.escape(w)}\b[^.!?]*[.!?])", text, re.IGNORECASE)
                example = sentence_match.group(1).strip() if sentence_match else f"The concept of {w_lower} is critical in academic discourse."

                matched_items.append(
                    ExtractedCardItem(
                        term_en=w_lower,
                        meaning_uz=f"{w_lower} (kontekstual akademik atama)",
                        synonyms="academic term, key concept",
                        example_en=example,
                        level=level,
                    )
                )
                if len(matched_items) >= count:
                    break

    return matched_items[:count]


async def evaluate_sentence_usage(
    target_term: str,
    sentence: str,
    deck_title: Optional[str] = None
) -> CheckSentenceResponse:
    """
    Evaluates learner's written sentence with a target phrase.
    Returns score out of 10, Uzbek feedback, and improved C1-level version.
    """
    clean_sentence = sentence.strip()

    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            system_instruction = (
                "You are an expert Cambridge IELTS Writing examiner (Band 9) and bilingual English-Uzbek instructor. "
                "The student was instructed to write an academic sentence incorporating the target term: "
                f"'{target_term}'. "
                "Analyze the student's sentence for: "
                "1. Correct grammatical structure, "
                "2. Natural lexical collocation and tone, "
                "3. Accurate use of the target term. "
                "Return a JSON object with: "
                "'score': integer between 1 and 10, "
                "'grammar_correct': boolean, "
                "'natural_usage': boolean, "
                "'feedback_uz': clear, constructive feedback in natural Uzbek explaining strengths, mistakes, or suggestions, "
                "'improved_sentence': an elevated Band 8.5/C1 revision of their sentence demonstrating sophisticated vocabulary. "
                "Return ONLY valid JSON without markdown fences."
            )

            prompt = f"Target term: '{target_term}'\nStudent sentence: \"{clean_sentence}\"\nOutput JSON:"

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_instruction}\n\n{prompt}",
            )

            if response and response.text:
                clean_res = response.text.strip()
                clean_res = re.sub(r"^```json\s*", "", clean_res)
                clean_res = re.sub(r"^```\s*", "", clean_res)
                clean_res = re.sub(r"\s*```$", "", clean_res)

                data = json.loads(clean_res)
                return CheckSentenceResponse(
                    success=True,
                    score=int(data.get("score", 7)),
                    grammar_correct=bool(data.get("grammar_correct", True)),
                    natural_usage=bool(data.get("natural_usage", True)),
                    feedback_uz=str(data.get("feedback_uz", "Jumlada so'z o'rinli qo'llangan.")),
                    improved_sentence=str(data.get("improved_sentence", clean_sentence)),
                    original_sentence=clean_sentence,
                    target_term=target_term,
                )
        except Exception as e:
            logger.warning(f"Gemini API call failed for sentence checker, falling back to heuristic: {e}")

    # Fallback evaluator
    logger.info("Executing heuristic sentence evaluation...")
    lower_sentence = clean_sentence.lower()
    lower_term = target_term.lower()

    # Check term presence
    has_term = lower_term in lower_sentence
    word_count = len(clean_sentence.split())

    score = 8
    feedback_points: List[str] = []

    if not has_term:
        score -= 4
        feedback_points.append(f"Berilgan '{target_term}' so'zi yoki iborasi jumlada aniqlanmadi.")
    else:
        feedback_points.append(f"'{target_term}' iborasini jumlada to'g'ri qo'llay oldingiz.")

    if word_count < 6:
        score -= 2
        feedback_points.append("Jumla ancha qisqa. IELTS Writing uchun murakkabroq sintaksis va qo'shma gaplardan foydalanish tavsiya etiladi.")
    elif word_count >= 12:
        score = min(10, score + 1)
        feedback_points.append("Jumlada akademik bog'lovchilar va kengaytirilgan sintaksis muvaffaqiyatli aks etgan.")

    if not clean_sentence[0].isupper():
        score = max(1, score - 1)
        feedback_points.append("Jumla bosh harf bilan boshlanishi kerak.")

    if not clean_sentence.endswith((".", "!", "?")):
        score = max(1, score - 1)
        feedback_points.append("Jumla oxiriga tinish belgisi (nuqta) qo'yishni unutmang.")

    score = max(1, min(10, score))
    grammar_correct = score >= 7
    natural_usage = has_term and word_count >= 8

    # Generate an improved sentence
    improved = f"In contemporary academic discussions, the capacity to {lower_term} invariably plays a decisive role in achieving sustainable outcomes."

    feedback_uz = " ".join(feedback_points)

    return CheckSentenceResponse(
        success=True,
        score=score,
        grammar_correct=grammar_correct,
        natural_usage=natural_usage,
        feedback_uz=feedback_uz,
        improved_sentence=improved,
        original_sentence=clean_sentence,
        target_term=target_term,
    )
