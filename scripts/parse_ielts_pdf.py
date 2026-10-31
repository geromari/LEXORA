#!/usr/bin/env python3
"""
Robust parser for IELTS_10-14_Top_2000_Vocabulary_ALL.pdf
Extracts all 2000 vocabulary words and writes to prisma/seed_words.json
"""
import sys
import os
import re
import json

def parse_pdf(pdf_path):
    import pypdf

    reader = pypdf.PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"Total pages in PDF: {total_pages}")

    words = []
    current_word = None
    state = "IDLE"

    for page_num in range(2, total_pages):
        text = reader.pages[page_num].extract_text()
        lines = [l.strip() for l in text.split('\n')]

        filtered_lines = []
        for l in lines:
            if not l:
                continue
            if 'TOP 2000' in l and 'AKADEMIK' in l:
                continue
            if 'Instagram @otabek_xalimov9.0' in l:
                continue
            filtered_lines.append(l)

        i = 0
        while i < len(filtered_lines):
            line = filtered_lines[i]

            if re.match(r'^\d{1,4}$', line):
                # Verify this is a word number header
                if (i + 2 < len(filtered_lines) and 'Chastota:' in filtered_lines[i+2]) or \
                   (i + 3 < len(filtered_lines) and 'Chastota:' in filtered_lines[i+3]):
                    if current_word:
                        words.append(current_word)
                    num = int(line)
                    term = filtered_lines[i+1]
                    i += 2
                    pos = ''
                    if 'Chastota:' not in filtered_lines[i]:
                        pos = filtered_lines[i]
                        i += 1
                    freq = 0
                    if i < len(filtered_lines) and 'Chastota:' in filtered_lines[i]:
                        m = re.search(r'\d+', filtered_lines[i])
                        if m:
                            freq = int(m.group())
                        i += 1
                    current_word = {
                        'number': num,
                        'term_en': term,
                        'pos': pos,
                        'frequency': freq,
                        'meaning_uz': '',
                        'synonyms': '',
                        'example_en': ''
                    }
                    state = 'AFTER_HEADER'
                    continue

            if current_word:
                if line == 'TARJIMA':
                    state = 'TARJIMA'
                    i += 1
                    continue
                elif line == 'SINONIMLAR':
                    state = 'SINONIMLAR'
                    i += 1
                    continue
                elif line == 'MISOL':
                    state = 'MISOL'
                    i += 1
                    continue

                # Strip page number at bottom
                if state == 'MISOL' and re.match(r'^\d+$', line) and int(line) == page_num + 1:
                    i += 1
                    continue

                if state == 'TARJIMA':
                    current_word['meaning_uz'] += (' ' if current_word['meaning_uz'] else '') + line
                elif state == 'SINONIMLAR':
                    current_word['synonyms'] += (' ' if current_word['synonyms'] else '') + line
                elif state == 'MISOL':
                    current_word['example_en'] += (' ' if current_word['example_en'] else '') + line

            i += 1

    if current_word:
        words.append(current_word)

    print(f"Extracted {len(words)} words total.")
    return words

def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "/home/patrickb/Downloads/Telegram Desktop/IELTS_10-14_Top_2000_Vocabulary_ALL.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        sys.exit(1)

    words = parse_pdf(pdf_path)
    if len(words) != 2000:
        print(f"WARNING: Expected 2000 words, but got {len(words)}!")
    else:
        print("SUCCESS: Exactly 2000 words extracted without omission!")

    # Clean whitespace in fields
    for w in words:
        w['meaning_uz'] = ' '.join(w['meaning_uz'].split()).strip()
        w['synonyms'] = ' '.join(w['synonyms'].split()).strip()
        w['example_en'] = ' '.join(w['example_en'].split()).strip()
        # Clean any trailing page numbers from example
        w['example_en'] = re.sub(r'\s*\d{1,3}\s*$', '', w['example_en']).strip()

    # Save standalone JSON
    standalone_path = "prisma/ielts_2000_words.json"
    with open(standalone_path, "w", encoding="utf-8") as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print(f"Saved standalone file: {standalone_path}")

    # Update seed_words.json
    seed_json_path = "prisma/seed_words.json"
    if os.path.exists(seed_json_path):
        with open(seed_json_path, "r", encoding="utf-8") as f:
            seed_data = json.load(f)
        seed_data["ielts_top_2000"] = words
        with open(seed_json_path, "w", encoding="utf-8") as f:
            json.dump(seed_data, f, ensure_ascii=False, indent=2)
        print(f"Updated {seed_json_path} with ielts_top_2000 key (2000 words).")

if __name__ == "__main__":
    main()
