import requests
import json
import os

API_URL = "https://remotive.com/api/remote-jobs?category=software-dev&limit=15"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "backend")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "oferty.json")

try:
    # Wykonanie zapytania GET do API
    response = requests.get(API_URL, timeout=15)
    response.raise_for_status()

    # Pobranie danych JSON
    data = response.json()
    jobs_raw = data.get("jobs", [])

    # Przetwarzanie ofert
    jobs_processed = []
    for idx, job in enumerate(jobs_raw):
        tags = job.get("tags", [])
        offer = {
            "id": job.get("id", idx + 1),
            "title": job.get("title", ""),
            "company": job.get("company_name", ""),
            "salary_min": 5000,
            "salary_max": 10000,
            "technologies": tags[:3],
            "link": job.get("url", ""),
        }
        jobs_processed.append(offer)

    # Utworzenie folderu docelowego, jeśli nie istnieje
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Zapis do pliku JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(jobs_processed, f, ensure_ascii=False, indent=4)

    print(f"Sukces! Zapisano {len(jobs_processed)} ofert do pliku: {OUTPUT_FILE}")

except requests.exceptions.RequestException as e:
    print(f"Błąd podczas pobierania danych z API: {e}")
except (json.JSONDecodeError, KeyError) as e:
    print(f"Błąd podczas przetwarzania danych JSON: {e}")
except OSError as e:
    print(f"Błąd podczas zapisu pliku: {e}")
except Exception as e:
    print(f"Nieoczekiwany błąd: {e}")
