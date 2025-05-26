import React from 'react';
import './Info.css';
import LoginForm from '../auth/LoginForm';
import RegistrationForm from '../auth/RegistrationForm';

const Info = () => {
  const scrollToRegistration = () => {
    const element = document.getElementById("register-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="container">
      <main className="info-container">
        
        {/* Hero section */}
        <section className="hero-section">
          <h1 className="hero-title">Chcesz ulepszyć swój projekt informatyczny?</h1>
          <p className="hero-subtitle">
            Korzystaj z inteligentnych analiz, automatycznego feedbacku i buduj portfolio gotowe na rynek pracy.
          </p>
          <button className="hero-button" onClick={scrollToRegistration}>
            Zarejestruj się za darmo
          </button>
        </section>

        {/* Info Cards */}
        <section className="info-cards">
          <div className="info-card">
            <h2>Automatyczny feedback</h2>
            <p>Wgraj projekt, a nasz AI przeanalizuje jakość kodu, strukturę i funkcjonalność.</p>
          </div>
          <div className="info-card">
            <h2>Konsultacje projektów</h2>
            <p>Otrzymuj szczegółowe uwagi i propozycje ulepszeń — jakbyś miał osobistego mentora.</p>
          </div>
          <div className="info-card">
            <h2>Buduj portfolio</h2>
            <p>Twórz spersonalizowane CV i dokumentuj swoje projekty zgodnie z oczekiwaniami rynku.</p>
          </div>
        </section>

        {/* Rejestracja */}
        <section id="register-section" className="register-section">
          <div className="register-card">
            <h1>Nie masz konta?</h1>
            <p>Odpowiedz na kilka pytań, a dostosujemy asystenta AI do Twoich potrzeb.</p>
            <RegistrationForm />
          </div>
        </section>

      </main>
    </div>
  );
};

export default Info;
