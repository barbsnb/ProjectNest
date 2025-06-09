ask_project_suggestions = """
Prześlę Ci treść projektu, a na końcu chcę uzyskać listę sugestii dotyczących ulepszeń.  
Pole "priority" musi mieć wartość jednej z trzech: "low", "medium", "high".  

Odpowiedz wyłącznie poprawnym JSON-em (lista obiektów) bez dodatkowego tekstu.  
Przykład formatu odpowiedzi:

[
  {
    "title": "Tytuł ulepszenia",
    "description": "Opis problemu",
    "priority": "high",
    "recommendations": "Co sugerujesz, aby to poprawić"
  }
]

To jest zawartość projektu:
"""


ask_project_analysis = """
Prześlę Ci treść projektu, a na końcu chcę, żebyś odpowiedział w dokładnie takim formacie, bez dodatkowej treści: 
[{"readability": "Czy kod jest czytelny? Czy nazwy plików, klas, zmiennych są odpowiednie? Czy komentarze są jasne?",
"structure": "Czy kod ma dobrą strukturę?",
"principles": "Czy kod stosuje zasady DRY, KISS, YAGNI?",
"modularity": "Czy kod jest modułowy? Czy odpowiedzialności są rozdzielone na osobne komponenty lub moduły?",
"extensibility": "Czy łatwo można dodać nowe funkcje bez dużych zmian w istniejącym kodzie?",
"design_patterns": "Czy użyto odpowiednich wzorców projektowych? Czy architektura jest spójna i łatwa w utrzymaniu?",
"input_validation": "Czy dane wejściowe użytkownika są odpowiednio walidowane po stronie klienta i serwera?",
"permission_management": "Czy kontrola dostępu jest odpowiednio zarządzana (role, uprawnienia)?",
"vulnerabilities": "Czy typowe podatności, takie jak SQL injection czy XSS, są ograniczane dzięki odpowiedniemu oczyszczaniu danych?",
"test_coverage": "Jaki procent kodu jest objęty testami? Czy testowane są kluczowe obszary?",
"test_quality": "Czy testy są dobrze napisane, sensowne i łatwe do utrzymania?",
"test_automation": "Czy testy są zautomatyzowane i zintegrowane z procesem CI/CD?",
"performance": "Czy kod jest wydajny pod względem czasu i zużycia pamięci?",
"comments_quality": "Czy komentarze w kodzie są jasne, zwięzłe i pomocne przy zrozumieniu logiki?",
"documentation": "Czy dostępna jest dokumentacja techniczna (np. README, opisy architektury)?",
"installation_instructions": "Czy instrukcje instalacji i konfiguracji są jasno opisane i łatwe do wykonania?",
"coding_style": "Czy kod stosuje się do standardów stylu (np. PEP8)? Czy formatowanie jest spójne?",
"tools_usage": "Czy skutecznie wykorzystywane są narzędzia takie jak CI/CD, lintery, formatery?"}]
To jest zawartość projektu:
"""

keyword_project_extraction = """
Przeanalizuj zawartość projektu i wygeneruj listę słów kluczowych oddzielonych przecinkami - trafi to jako informacja zwrotna do aplikacji.  
Słowa te powinny umożliwić późniejsze wygenerowanie pomysłów na kolejne projekty dla użytkownika,  
głównie w kontekście doszlifowania umiejętności oraz zaproponowanie użytkownikowi ścieżki rozwoju kariery.

Lista ta będzie wykorzystana w kodzie, więc koniecznie zwróć odpowiedź we wspomnianej wyżej formie.
"""

suggest_development_path = {"suggested_development_path": ("Na podstawie słów kluczowych z projektów oraz ich analiz, podanych poniżej, "
                                                           "zaproponuj użytkownikowi ściężkę rozwoju. Uwzględnij kontekst umiejętności użytkownika"
                                                           "tak, by zaproponować konkretną drogę dalszego rozwoju umiejętności oraz przynajniej 2 propozycje kariery. "
                                                           "Uwzględnij informację o "
                                                           "umiejętnościach, które są już na dobrym poziomie oraz tych, które należałoby nieco doszlifować "
                                                           "(jeśli rzeczywiście jest to potrzebne), "
                                                           "aby rozpocząć proponowaną ścieżkę/ścieżki kariery. \n\n"
                                                           "Słowa kluczowe: {keywords} \n\n"
                                                           "Ankiety użytkownika: "
                                                           "kierunek: {direction},"
                                                           "skupienie na: {focus},"
                                                           "doświadczenie: {experience},"
                                                           "dostępność: {time_availability},"
                                                           "wyzwania: {challanges},"
                                                           "technologie: {technologies}"

                                                           )}

chat = """
Jesteś ekspertem technicznym, który pomaga rozwiązywać problemy programistyczne, podając dokładne instrukcje i przykłady kodu.
Pomagasz użytkownikowi, udzielając jasnych, zwięzłych i przyjaznych odpowiedzi. Zawsze staraj się:

- Rozumieć kontekst pytania.
- Dostarczać konkretne i praktyczne rozwiązania.
- Jeśli pytanie jest niejasne, poproś o doprecyzowanie.
- Unikaj długich i skomplikowanych wyjaśnień, chyba że jest to konieczne.
- W przypadku kodu, podawaj czytelne i dobrze sformatowane fragmenty.
- Zachowuj profesjonalny, ale uprzejmy ton.

Tłumacz zagadnienia w prosty sposób, używając analogii i przykładów, tak aby nawet początkujący mogli zrozumieć.
Pomagasz użytkownikowi znaleźć i naprawić błędy w kodzie, analizując podane fragmenty i sugerując poprawki.

Na końcu każdej odpowiedzi dodaj krótkie podsumowanie najważniejszych punktów.
Jeśli pytanie jest niejasne, zachęć użytkownika do podania więcej szczegółów.
Podawaj kod w odpowiednio sformatowanych blokach, aby był czytelny.

"""
