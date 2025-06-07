import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import client from '../../axiosClient';
import './RegistrationForm.css';

const Survey = ({ onComplete, onBackToRegistration }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState([]);
  const [focus, setFocus] = useState([]);
  const [experience, setExperience] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [challenges, setChallenges] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [techLevels, setTechLevels] = useState({});

  const toggleSelection = (option, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(option)) {
      setSelectedArray(selectedArray.filter((item) => item !== option));
    } else {
      setSelectedArray([...selectedArray, option]);
    }
  };

  const handleTechLevelChange = (tech, level) => {
    setTechLevels(prev => ({ ...prev, [tech]: level }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    const allData = {
      direction,
      focus,
      experience,
      timeAvailable,
      challenges,
      technologies: technologies.map(tech => ({ name: tech, level: techLevels[tech] || "" }))
    };
    onComplete(allData);
  };

  const allTechOptions = [
      "HTML", "CSS", "JavaScript", "React", "Vue.js", "Angular", "Node.js", "Express", "Python", "Django",
      "Flask", "Java", "Spring", "SQL", "MongoDB", "GraphQL", "Git", "Docker", "Kubernetes", "AWS"
    ];

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial" }}>
      <Form onSubmit={handleSubmit}>
        {step === 1 && (
          <>
            <h2>Krok 1: Kierunek rozwoju</h2>
            <p>W jakim kierunku chcesz się rozwijać?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Frontend", "Backend", "Fullstack", "Data Science", "AI", "DevOps", "Cyberbezpieczeństwo"].map((opt) => (
                <label key={opt} style={getOptionStyle(direction.includes(opt))}>
                  <input
                    type="checkbox"
                    value={opt}
                    checked={direction.includes(opt)}
                    onChange={() => toggleSelection(opt, direction, setDirection)}
                    style={{ display: "none" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <StepButtons disabled={direction.length === 0} onNext={nextStep} onBack={onBackToRegistration} />
          </>
        )}

        {step === 2 && (
          <>
            <h2>Krok 2: Priorytety w portfolio</h2>
            <p>Na co chcesz kłaść nacisk w swoim portfolio?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Projekty praktyczne", "Technologie i narzędzia", "Czytelność kodu", "Dobre praktyki", "Testy i jakość"]
                .map((opt) => (
                  <label key={opt} style={getOptionStyle(focus.includes(opt))}>
                    <input
                      type="checkbox"
                      value={opt}
                      checked={focus.includes(opt)}
                      onChange={() => toggleSelection(opt, focus, setFocus)}
                      style={{ display: "none" }}
                    />
                    {opt}
                  </label>
              ))}
            </div>
            <StepButtons onBack={prevStep} disabled={focus.length === 0} onNext={nextStep} />
          </>
        )}

        {step === 3 && (
          <>
            <h2>Krok 3: Poziom i dostępność</h2>
            <Form.Group controlId="experienceSelect" style={{ marginBottom: "1rem", textAlign: "center" }}>
              <p>Poziom doświadczenia:</p>
              <Form.Control
                as="select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                style={{ width: '100%', height: '50px', margin: '0 auto' }}>
                <option value="">Wybierz...</option>
                <option value="Początkujący">Początkujący</option>
                <option value="Średniozaawansowany">Średniozaawansowany</option>
                <option value="Zaawansowany">Zaawansowany</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="timeAvailableSelect" style={{ marginBottom: "1rem", textAlign: "center" }}>
              <p>Ile czasu tygodniowo możesz poświęcić na naukę i projekty?</p>
              <Form.Control
                as="select"
                value={timeAvailable}
                onChange={(e) => setTimeAvailable(e.target.value)}
                required
                style={{ width: '100%', height: '50px', margin: '0 auto' }}>
                <option value="">Wybierz...</option>
                <option value="<2">Mniej niż 2h</option>
                <option value="2-5">2–5h</option>
                <option value="5-10">5–10h</option>
                <option value=">10">Ponad 10h</option>
              </Form.Control>
            </Form.Group>

            <StepButtons onBack={prevStep} disabled={!experience || !timeAvailable} onNext={nextStep} />
          </>
        )}

        {step === 4 && (
          <>
            <h2>Krok 4: Technologie i poziom zaawansowania</h2>
            <p style={{ textAlign: 'center' }}>Zaznacz znane Ci technologie i określ poziom znajomości</p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem"
            }}>
              {allTechOptions.map((tech) => (
                <div key={tech} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <label style={{ ...getOptionStyle(technologies.includes(tech)), width: "100%" }}>
                    <input
                      type="checkbox"
                      checked={technologies.includes(tech)}
                      onChange={() => toggleSelection(tech, technologies, setTechnologies)}
                      style={{ display: "none" }}
                    />
                    {tech}
                  </label>
                  {technologies.includes(tech) && (
                    <Form.Control
                      as="select"
                      value={techLevels[tech] || ""}
                      onChange={(e) => handleTechLevelChange(tech, e.target.value)}
                      style={{ width: '90%', marginTop: '0.5rem', height: '45px', textAlign: 'center' }}
                      required>
                      <option value="">Wybierz poziom</option>
                      <option value="1">1 – bardzo podstawowy</option>
                      <option value="2">2 – podstawowy</option>
                      <option value="3">3 – średni</option>
                      <option value="4">4 – dobry</option>
                      <option value="5">5 – bardzo dobry</option>
                    </Form.Control>
                  )}
                </div>
              ))}
            </div>
            <StepButtons onBack={prevStep} disabled={technologies.length === 0} onNext={nextStep} />
          </>
        )}

        {step === 5 && (
          <>
            <h2>Krok 5: Największe wyzwania w nauce</h2>
            <p style={{ textAlign: 'center' }}>Co jest dla Ciebie największym wyzwaniem w nauce programowania?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Trudność z organizacją nauki", "Zrozumienie dokumentacji", "Przeskok z tutoriali do własnych projektów", "Nie wiem, czego się uczyć dalej", "Brak motywacji / feedbacku"].map((opt) => (
                <label key={opt} style={getOptionStyle(challenges.includes(opt))}>
                  <input
                    type="checkbox"
                    value={opt}
                    checked={challenges.includes(opt)}
                    onChange={() => toggleSelection(opt, challenges, setChallenges)}
                    style={{ display: "none" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
            <StepButtons onBack={prevStep} isSubmit disabled={challenges.length === 0} />
          </>
        )}
      </Form>
    </div>
  );
};


const getOptionStyle = (selected) => ({
  border: selected ? "2px solid #333" : "2px solid #ccc",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
  backgroundColor: selected ? "#eee" : "white",
  userSelect: "none",
  flex: "0 0 auto"
});

const StepButtons = ({ onBack, onNext, isSubmit = false, disabled = false }) => (
  <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between" }}>
    {onBack && (
      <Button id="form_btn" variant="primary" onClick={onBack} type="button">
        Wstecz
      </Button>
    )}
    {isSubmit ? (
      <Button id="form_btn" variant="primary" disabled={disabled} type="submit">
        Zarejestruj
      </Button>
    ) : (
      <Button id="form_btn" variant="primary" onClick={onNext} disabled={disabled} type="button">
        Dalej
      </Button>
    )}
  </div>
);

const RegistrationForm = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [showSurvey, setShowSurvey] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Adres e-mail jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Adres e-mail jest nieprawidłowy';
    }

    if (!username) {
      errors.username = 'Nazwa użytkownika jest wymagana';
    }

    if (!password) {
      errors.password = 'Hasło jest wymagane';
    } else if (password.length < 8) {
      errors.password = 'Hasło musi mieć co najmniej 8 znaków';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Hasła nie pasują do siebie';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setShowSurvey(true);
    }
  };

  const handleSurveyComplete = (surveyData) => {
    const payload = {
      email,
      username,
      password,
      survey: surveyData,
    };

    client.post("/api/register", payload)
      .then(() => {
        window.location.href = '/';
      })
      .catch(() => {
        setFormError('Rejestracja nie powiodła się. Spróbuj ponownie.');
      });
  };

  if (showSurvey) {
    return <Survey onComplete={handleSurveyComplete} onBackToRegistration={() => setShowSurvey(false)} />;
  }

  return (
    <div className="form-container">
      <Form onSubmit={handleFormSubmit}>
        <h3>Wprowadź dane logowania </h3>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Adres e-mail</Form.Label>
          <Form.Control
            type="email"
            placeholder="Wprowadź adres e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Nazwa użytkownika</Form.Label>
          <Form.Control
            type="text"
            placeholder="Wprowadź nazwę użytkownika"
            value={username}
            onChange={e => setUsername(e.target.value)}
            isInvalid={!!errors.username}
          />
          <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Hasło powinno mieć co najmniej 8 znaków"
            value={password}
            onChange={e => setPassword(e.target.value)}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
          <Form.Label>Potwierdź Hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Potwierdź hasło"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            isInvalid={!!errors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
        </Form.Group>

        <Button id="form_btn" variant="primary" type="submit">
          Dalej
        </Button>
      </Form>
    </div>
  );
};

export default RegistrationForm;