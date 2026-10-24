import asyncio
from pathlib import Path
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from unittest.mock import AsyncMock, MagicMock
import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_backend():
    print("Testing Lexora FastAPI backend with Auth & Multi-User isolation...")
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Health check
            res = await client.get("/health")
            assert res.status_code == 200

            # 2. Register User A with unique timestamp
            ts = int(asyncio.get_event_loop().time() * 1000)
            username_a = f"dilshod_{ts}"
            email_a = f"dilshod_{ts}@example.uz"
            register_payload_a = {
                "username": username_a,
                "email": email_a,
                "password": "SecurePassword123!"
            }
            res = await client.post("/api/auth/register", json=register_payload_a)
            assert res.status_code == 201
            auth_a = res.json()
            assert "access_token" in auth_a
            token_a = auth_a["access_token"]
            headers_a = {"Authorization": f"Bearer {token_a}"}
            user_a_id = auth_a["user"]["id"]
            assert auth_a["user"]["username"] == username_a

            # 3. Login User A
            login_payload = {
                "email_or_username": email_a,
                "password": "SecurePassword123!"
            }
            res = await client.post("/api/auth/login", json=login_payload)
            assert res.status_code == 200
            assert "access_token" in res.json()

            # 4. Telegram Auth (User B)
            tg_id = 900000000 + (ts % 10000000)
            tg_payload = {
                "telegram_id": tg_id,
                "username": f"shaxzoda_{ts}",
                "first_name": "Shaxzoda",
                "avatar_url": "https://t.me/i/userpic/320/avatar.jpg"
            }
            res = await client.post("/api/auth/telegram", json=tg_payload)
            assert res.status_code == 200
            auth_b = res.json()
            token_b = auth_b["access_token"]
            headers_b = {"Authorization": f"Bearer {token_b}"}
            assert auth_b["user"]["telegram_id"] == tg_id


            # 5. GET /api/auth/me for User A
            res = await client.get("/api/auth/me", headers=headers_a)
            assert res.status_code == 200
            me_a = res.json()
            assert me_a["id"] == user_a_id
            assert me_a["username"] == username_a
            assert me_a["streak_count"] >= 1


            # 6. Flagship deck exists and is public
            res = await client.get("/api/decks")
            assert res.status_code == 200
            decks = res.json()
            flagship = next((d for d in decks if "47 Core Words" in d["title"]), None)
            assert flagship is not None
            assert flagship["card_count"] == 47
            flagship_id = flagship["id"]

            # 7. User A creates a PRIVATE custom deck
            user_a_deck_payload = {
                "title": "Dilshod's Secret Idioms",
                "description": "Band 8.5 Speaking collocations",
                "level": "C2",
                "is_public": False,
                "cards": [
                    {
                        "term_en": "bite the bullet",
                        "meaning_uz": "og'ir vaziyatga bardosh berib chidamoq",
                        "synonyms": "face the music, endure",
                        "example_en": "We must bite the bullet and invest heavily in clean energy."
                    }
                ]
            }
            res = await client.post("/api/decks", json=user_a_deck_payload, headers=headers_a)
            assert res.status_code == 201
            custom_deck_a = res.json()
            assert custom_deck_a["is_owner"] is True
            assert custom_deck_a["user_id"] == user_a_id
            custom_card_id = custom_deck_a["cards"][0]["id"]

            # 8. Multi-User Deck Visibility Isolation:
            # User B should NOT see User A's private deck
            res_b_decks = await client.get("/api/decks", headers=headers_b)
            assert res_b_decks.status_code == 200
            b_deck_titles = [d["title"] for d in res_b_decks.json()]
            assert "Dilshod's Secret Idioms" not in b_deck_titles

            # User A DOES see their private deck
            res_a_decks = await client.get("/api/decks", headers=headers_a)
            assert res_a_decks.status_code == 200
            a_deck_titles = [d["title"] for d in res_a_decks.json()]
            assert "Dilshod's Secret Idioms" in a_deck_titles

            # 9. Multi-User StudyProgress Isolation:
            # User A reviews custom card (correct = True)
            review_res_a = await client.post(
                "/api/progress/review",
                json={"card_id": custom_card_id, "correct": True},
                headers=headers_a
            )
            assert review_res_a.status_code == 200
            assert review_res_a.json()["box_level"] == 1

            # User B also reviews a flagship card (card 1) as correct
            flagship_card_res = await client.get(f"/api/decks/{flagship_id}")
            flagship_card_1 = flagship_card_res.json()["cards"][0]["id"]

            review_res_b = await client.post(
                "/api/progress/review",
                json={"card_id": flagship_card_1, "correct": True},
                headers=headers_b
            )
            assert review_res_b.status_code == 200
            assert review_res_b.json()["box_level"] == 1

            # 10. Verify /api/review/due for User A
            res_due_a = await client.get("/api/review/due", headers=headers_a)
            assert res_due_a.status_code == 200
            assert "total_due" in res_due_a.json()

            # 11. AI extract-vocab test
            sample_article = (
                "The corporate board began to scrutinize the tech behemoth for exploitative labor practices. "
                "Although executives claimed their philanthropy was genuine, critics dismissed it as window dressing "
                "designed to obscure corporate overreach and exacerbate polarization."
            )
            res_ai = await client.post("/api/ai/extract-vocab", json={"text": sample_article, "level": "C1", "count": 5})
            assert res_ai.status_code == 200
            assert res_ai.json()["total_extracted"] >= 1

            # 12. AI check-sentence test
            sentence_payload = {
                "target_term": "window dressing",
                "sentence": "The company's green policy was merely window dressing to pacify public outrage.",
                "deck_title": "IELTS Reading Advanced"
            }
            res_eval = await client.post("/api/ai/check-sentence", json=sentence_payload)
            # 13. Deep-Linking Telegram Auth Flow:
            # Step A: POST /api/auth/telegram/init (anonymous)
            res_tg_init = await client.post("/api/auth/telegram/init")
            assert res_tg_init.status_code == 200
            tg_init_data = res_tg_init.json()
            assert "session_token" in tg_init_data
            assert "bot_url" in tg_init_data
            sess_token = tg_init_data["session_token"]
            assert "start=auth_" in tg_init_data["bot_url"]

            # Step B: GET /api/auth/telegram/status/{session_token} -> pending
            res_status_pending = await client.get(f"/api/auth/telegram/status/{sess_token}")
            assert res_status_pending.status_code == 200
            assert res_status_pending.json()["status"] == "pending"

            # Step C: Simulate Telegram Bot handling /start auth_<session_token>
            from bot.handlers import handle_start
            mock_tg_id = 800000000 + (ts % 10000000)
            mock_msg = MagicMock()
            mock_msg.from_user.id = mock_tg_id
            mock_msg.from_user.username = f"telegram_auth_user_{ts}"
            mock_msg.from_user.first_name = "AuthTester"
            mock_msg.answer = AsyncMock()

            mock_cmd = MagicMock()
            mock_cmd.args = f"auth_{sess_token}"

            await handle_start(mock_msg, mock_cmd)
            mock_msg.answer.assert_called_once()
            assert "muvaffaqiyatli ulandi" in mock_msg.answer.call_args[0][0]

            # Step D: GET /api/auth/telegram/status/{session_token} -> completed
            res_status_completed = await client.get(f"/api/auth/telegram/status/{sess_token}")
            assert res_status_completed.status_code == 200
            status_data = res_status_completed.json()
            assert status_data["status"] == "completed"
            assert status_data["access_token"] is not None
            assert status_data["user"]["telegram_id"] == mock_tg_id

            # Step E: POST /api/auth/telegram/init (logged-in user account linking)
            res_link_init = await client.post("/api/auth/telegram/init", headers=headers_a)
            assert res_link_init.status_code == 200
            link_sess_token = res_link_init.json()["session_token"]

            mock_link_tg_id = 700000000 + (ts % 10000000)
            mock_link_msg = MagicMock()
            mock_link_msg.from_user.id = mock_link_tg_id
            mock_link_msg.from_user.username = username_a
            mock_link_msg.from_user.first_name = "Dilshod"
            mock_link_msg.answer = AsyncMock()

            mock_link_cmd = MagicMock()
            mock_link_cmd.args = f"auth_{link_sess_token}"

            await handle_start(mock_link_msg, mock_link_cmd)
            res_link_completed = await client.get(f"/api/auth/telegram/status/{link_sess_token}")
            assert res_link_completed.status_code == 200
            assert res_link_completed.json()["status"] == "completed"
            assert res_link_completed.json()["user"]["id"] == user_a_id
            assert res_link_completed.json()["user"]["telegram_id"] == mock_link_tg_id

    print("\n All Auth, Deep-Link Telegram Auth, Multi-User Isolation, SRS, and AI tests passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_backend())
