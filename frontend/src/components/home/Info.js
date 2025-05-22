import React from 'react';
import '../../App.css';

const Info = () => {
  return (
    <div className="container">
      <main>
        <section>
          <h1>Asystent AI do oceny projektów informatycznych</h1>
          <p>
            Nasza aplikacja to inteligentny asystent stworzony z myślą o studentach kierunków informatycznych. 
            Umożliwia on szybkie i automatyczne generowanie feedbacku do projektów programistycznych — zarówno indywidualnych, jak i zespołowych.
          </p>
        </section>
        <section>
          <h1>Jak to działa?</h1>
          <p>
            Wystarczy, że wgrasz swój kod lub opis projektu, a asystent AI przeanalizuje jego jakość, strukturę i funkcjonalność. 
            Ocenia projekt w kilku kluczowych kategoriach, takich jak jakość kodu, dokumentacja, innowacyjność, czy doświadczenie użytkownika (UX). 
            Dzięki temu możesz szybciej poprawić swoje rozwiązania i przygotować się do zaliczenia lub prezentacji.
          </p>
        </section>
        <section>
          <h1>Dla kogo jest ta aplikacja?</h1>
          <p>
            Narzędzie zostało zaprojektowane z myślą o studentach, prowadzących oraz mentorach akademickich, którzy chcą usprawnić proces oceny i uzyskiwania informacji zwrotnej na temat projektów zaliczeniowych.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Info;
