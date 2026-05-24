import React from "react";
import RegistrationForm from "../auth/RegistrationForm";
import "./Info.css";

const Info = () => {
  const scrollToRegistration = () => {
    const element = document.getElementById("register-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container">
      <main className="info-container">
        <section className="hero-section">
          <h1 className="hero-title">PRAETOR</h1>
          <p className="hero-subtitle">
            Wieloagentowy audyt repozytorium GitHub: bezpieczeństwo, architektura, jakość kodu, testowalność,
            wydajność, dokumentacja i konkretne rekomendacje napraw.
          </p>
          <button className="hero-button" onClick={scrollToRegistration} type="button">
            Utwórz konto
          </button>
        </section>

        <section className="info-cards">
          <div className="info-card">
            <h2>Audyt z linku GitHub</h2>
            <p>Podajesz publiczny URL repozytorium, a PRAETOR indeksuje kod i przygotowuje techniczny raport.</p>
          </div>
          <div className="info-card">
            <h2>Agenci specjalistyczni</h2>
            <p>Osobne perspektywy dla bezpieczeństwa, architektury, jakości kodu oraz testów i niezawodności.</p>
          </div>
          <div className="info-card">
            <h2>Rekomendacje napraw</h2>
            <p>Każdy wynik zawiera poziom ryzyka, dowód, plik, opis problemu i konkretny następny krok.</p>
          </div>
        </section>

        <section id="register-section" className="register-section">
          <div className="register-card">
            <h1>Rozpocznij audyt</h1>
            <p>Załóż konto i przeanalizuj pierwsze repozytorium lokalnie w ramach MVP.</p>
            <RegistrationForm />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Info;
