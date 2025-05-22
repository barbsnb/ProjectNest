import React, { useContext, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';
import './RegistrationForm.css';

const optionsDirection = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Data Science",
  "DevOps",
];

const optionsFocus = [
  "Projekty praktyczne",
  "Technologie i narzędzia",
  "Umiejętności miękkie",
  "Certyfikaty",
];

const Survey = ({ onComplete }) => {
  const [direction, setDirection] = useState([]);
  const [focus, setFocus] = useState([]);

  const toggleSelection = (option, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(option)) {
      setSelectedArray(selectedArray.filter((item) => item !== option));
    } else {
      setSelectedArray([...selectedArray, option]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (direction.length > 0 && focus.length > 0) {
      onComplete({ direction, focus });
    } else {
      alert("Proszę wybrać przynajmniej jedną opcję w obu kategoriach.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>Ankieta dotycząca kierunku rozwoju</h2>
      <form onSubmit={handleSubmit}>

        <div>
          <p><strong>Wybierz kierunek rozwoju:</strong></p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {optionsDirection.map((opt) => (
              <label
                key={opt}
                style={{
                  border: direction.includes(opt) ? "2px solid #333" : "2px solid #ccc",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: direction.includes(opt) ? "#eee" : "white",
                  display: "inline-block",
                }}
              >
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
        </div>

        <div style={{ marginTop: "2rem" }}>
          <p><strong>Na co chcesz kłaść nacisk w portfolio?</strong></p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {optionsFocus.map((opt) => (
              <label
                key={opt}
                style={{
                  border: focus.includes(opt) ? "2px solid #333" : "2px solid #ccc",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: focus.includes(opt) ? "#eee" : "white",
                  display: "inline-block",
                }}
              >
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
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#333",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontFamily: "Arial",
            marginTop: "2rem",
            display: "block",
          }}
        >
          Dalej
        </button>
      </form>
    </div>
  );
};

const RegistrationForm = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [surveyData, setSurveyData] = useState(null);

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

  const submitRegistration = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      email,
      username,
      password,
      survey: surveyData, // można wysłać dane ankiety do backendu, jeśli potrzebujesz
    };

    client.post("/api/register", payload)
      .then(res => {
        // setCurrentUser(res.data.user);
        window.location.href = '/';
      })
      .catch(err => {
        setFormError('Rejestracja nie powiodła się. Spróbuj ponownie.');
        console.error("Registration failed: ", err);
      });
  };

  if (!surveyCompleted) {
    return <Survey onComplete={(data) => { setSurveyCompleted(true); setSurveyData(data); }} />;
  }

  return (
    <div className="form-container">
      <Form onSubmit={submitRegistration}>
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
          <Form.Control.Feedback type="invalid">
            {errors.email}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.username}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.password}
          </Form.Control.Feedback>
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
          <Form.Control.Feedback type="invalid">
            {errors.confirmPassword}
          </Form.Control.Feedback>
        </Form.Group>

        <Button id="form_btn" variant="primary" type="submit">
          Zarejestruj
        </Button>
      </Form>
    </div>
  );
};

export default RegistrationForm;
