ask_project_suggestions = """
Prześlę Ci treść projektu. Zwróć listę sugestii ulepszeń po polsku.
Pole "priority" musi mieć jedną z wartości: "low", "medium", "high".

Odpowiedz wyłącznie poprawnym JSON-em, czyli listą obiektów bez dodatkowego tekstu.
Format odpowiedzi:

[
  {
    "title": "Tytuł ulepszenia",
    "description": "Opis problemu",
    "priority": "high",
    "recommendations": "Konkretna rekomendacja naprawy"
  }
]

Treść projektu:
"""


ask_project_analysis = """
Prześlę Ci treść projektu. Odpowiedz po polsku wyłącznie poprawnym JSON-em w dokładnie takim formacie:
[
  {
    "readability": "Czy kod jest czytelny? Czy nazwy plików, klas i zmiennych są odpowiednie? Czy komentarze są jasne?",
    "structure": "Czy kod ma dobrą strukturę?",
    "principles": "Czy kod stosuje zasady DRY, KISS i YAGNI?",
    "modularity": "Czy kod jest modułowy? Czy odpowiedzialności są rozdzielone na osobne komponenty lub moduły?",
    "extensibility": "Czy łatwo można dodać nowe funkcje bez dużych zmian w istniejącym kodzie?",
    "design_patterns": "Czy użyto odpowiednich wzorców projektowych? Czy architektura jest spójna i łatwa w utrzymaniu?",
    "input_validation": "Czy dane wejściowe użytkownika są odpowiednio walidowane po stronie klienta i serwera?",
    "permission_management": "Czy kontrola dostępu jest odpowiednio zarządzana?",
    "vulnerabilities": "Czy typowe podatności, takie jak SQL injection czy XSS, są ograniczane dzięki odpowiedniej obsłudze danych?",
    "test_coverage": "Czy kluczowe obszary są objęte testami?",
    "test_quality": "Czy testy są dobrze napisane, sensowne i łatwe do utrzymania?",
    "test_automation": "Czy testy są zautomatyzowane i zintegrowane z procesem CI/CD?",
    "performance": "Czy kod jest wydajny pod względem czasu działania i zużycia pamięci?",
    "comments_quality": "Czy komentarze w kodzie są jasne, zwięzłe i pomocne przy zrozumieniu logiki?",
    "documentation": "Czy dostępna jest dokumentacja techniczna, np. README albo opis architektury?",
    "installation_instructions": "Czy instrukcje instalacji i konfiguracji są jasno opisane i łatwe do wykonania?",
    "coding_style": "Czy kod trzyma się standardów stylu i spójnego formatowania?",
    "tools_usage": "Czy projekt skutecznie wykorzystuje narzędzia takie jak CI/CD, lintery i formatery?"
  }
]

Treść projektu:
"""


chat = """
Jesteś technicznym asystentem PRAETOR. Pomagasz użytkownikowi rozumieć raport audytu, analizować problemy w kodzie
i planować bezpieczne poprawki.

Zasady:
- Odpowiadaj po polsku.
- Dawaj konkretne, praktyczne kroki.
- Jeśli pytanie jest niejasne, poproś o doprecyzowanie.
- Nie wymyślaj plików, numerów linii ani podatności.
- Kod pokazuj w czytelnych blokach.
- Na końcu dodaj krótkie podsumowanie najważniejszych punktów.
"""
