# PRAETOR

PRAETOR to wieloagentowy asystent audytu technicznego repozytoriów. Użytkownik podaje link do publicznego repozytorium GitHub, a aplikacja indeksuje kod i generuje priorytetyzowany raport obejmujący bezpieczeństwo, architekturę, jakość kodu, testowalność, wydajność, dokumentację oraz konkretne rekomendacje napraw.

Projekt jest MVP przygotowywanym na przedmiot ZPDS na Politechnice Warszawskiej. Docelowe doświadczenie produktu to: konto użytkownika -> link GitHub -> indeksowanie repozytorium -> audyt -> raport -> rozmowa z asystentem o konkretnych wynikach.

## Zakres Produktu

PRAETOR jest projektowany dla studentów, małych zespołów, założycieli startupów i osób budujących produkt bez pełnego doświadczenia inżynierskiego. Aplikacja ma pełnić rolę prywatnego starszego programisty i audytora, który:

1. Pobiera publiczne repozytorium GitHub.
2. Tworzy snapshot metadanych repozytorium.
3. Uruchamia deterministyczne narzędzia analizy.
4. Uruchamia wyspecjalizowanych agentów LLM.
5. Normalizuje wyniki do jednego formatu.
6. Pokazuje raport z dowodami, priorytetami i rekomendacjami.
7. Pozwala zapytać asystenta o wybrany problem.

## Funkcje MVP

- Django REST API z kontrolą logowania i ownership projektów.
- Reactowy frontend z rejestracją, logowaniem, tworzeniem audytu z linku GitHub, raportem i czatem.
- Indeksowanie publicznych repozytoriów GitHub z limitami rozmiaru, liczby plików i ignorowaniem katalogów vendorowych.
- Deterministyczny pipeline wykrywający sekrety, manifesty zależności, wyniki `npm audit`, placeholder audytu zależności Python oraz metryki repozytorium.
- Multi-agent review: audytor bezpieczeństwa, recenzent architektury, recenzent jakości kodu oraz recenzent testów i niezawodności.
- Profesjonalny raport z top ryzykami, tabelą wyników, filtrami, paginacją, szczegółem wyniku i przejściem do asystenta.
- Asystent raportu korzystający z kontekstu projektu, wybranego wyniku, najnowszego przebiegu analizy, historii rozmowy i fragmentów kodu.
- Konfiguracja przez zmienne środowiskowe bez sekretów w repozytorium.

## Stack Technologiczny

- Backend: Django 5, Django REST Framework, django-cors-headers.
- Frontend: React 18, React Bootstrap, React Router, Axios.
- LLM: OpenAI API albo lokalny endpoint kompatybilny z GPT4All/OpenAI.
- Baza lokalna: SQLite.

## Struktura Repozytorium

```text
backend/
  config/          ustawienia Django i routing
  user_api/        model użytkownika oraz endpointy auth
  projects_api/    projekty, snapshoty, audyty, wyniki i sugestie
    services/      indeksowanie repozytorium i pipeline audytu
  llm_api/         integracja LLM, sesje czatu i asystent raportu
frontend/
  src/             kod aplikacji React
```

## Bezpieczeństwo

Nie commituj sekretów, kluczy API, lokalnych baz danych, wirtualnych środowisk, `node_modules`, buildów frontendu ani bytecode Pythona. Do konfiguracji lokalnej używaj `.env.example`.

Jeśli klucz API kiedykolwiek pojawił się w repozytorium albo w widocznym kontekście IDE, należy go natychmiast unieważnić u dostawcy i wygenerować nowy.

## Uruchomienie Backendu

Z katalogu głównego repozytorium:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
cd backend
python manage.py migrate
python manage.py runserver
```

Domyślny adres API:

```text
http://127.0.0.1:8000/
```

## Uruchomienie Frontendu

W drugim terminalu:

```powershell
cd frontend
npm install
npm start
```

Domyślny adres frontendu:

```text
http://127.0.0.1:3000/
```

Jeśli backend działa pod innym adresem, utwórz `frontend/.env`:

```text
REACT_APP_API_URL=http://127.0.0.1:8000
```

## Najważniejsze Zmienne Środowiskowe

```text
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
REACT_APP_API_URL=http://127.0.0.1:8000
```

Dla lokalnego endpointu kompatybilnego z GPT4All/OpenAI:

```text
LLM_PROVIDER=gpt4all
GPT4ALL_URL=http://localhost:4891/v1/chat/completions
GPT4ALL_MODEL=Llama 3 8B Instruct
```

## Komendy Walidacyjne

Backend:

```powershell
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Frontend:

```powershell
cd frontend
npm run build
npm audit --omit=dev
```

## Ścieżka Demo

Użyj małego publicznego repozytorium GitHub. Obecne limity indeksowania to 500 plików tekstowych, 300 KB na plik i 20 MB tekstu łącznie.

1. Zarejestruj się albo zaloguj.
2. Otwórz **Nowy audyt**.
3. Podaj link w formacie `https://github.com/<owner>/<repo>`.
4. Poczekaj na indeksowanie repozytorium.
5. Przejdź do raportu i uruchom audyt.
6. Otwórz najważniejszy problem krytyczny lub wysoki.
7. Użyj akcji **Zapytaj asystenta o ten problem**, aby pokazać edukacyjne rekomendacje naprawy.

## Polityka Cleanup

Repozytorium powinno zawierać tylko kod źródłowy, lockfile, migracje, dokumentację publiczną i statyczne assety źródłowe. Lokalnie wygenerowane artefakty muszą pozostać poza gitem:

- `node_modules/`
- `frontend/build/`
- `backend/db.sqlite3`
- `.env`
- `__pycache__/`
- `*.pyc`
- `docs/` z lokalnymi planami sprintów i notatkami audytowymi

## Status Projektu

MVP obsługuje główną ścieżkę Demo Day: konto -> link GitHub -> indeksowanie -> audyt -> raport -> szczegół problemu -> asystent. Na tym etapie aplikacja, komunikaty audytu i dokumentacja publiczna są prowadzone po polsku. Wersja wielojęzykowa może zostać dodana później jako osobna warstwa i18n.
