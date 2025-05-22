import React, { useContext, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const validate = () => {
    const errors = {};

    // Walidacja email
    if (!email) {
      errors.email = 'Adres e-mail jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Adres e-mail jest nieprawidłowy';
    }

    // Walidacja username
    if (!username) {
      errors.username = 'Nazwa użytkownika jest wymagana';
    }

    // Walidacja hasła
    if (!password) {
      errors.password = 'Hasło jest wymagane';
    } else if (password.length < 8) {
      errors.password = 'Hasło musi mieć co najmniej 8 znaków';
    }

    // Potwierdzenie hasła
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

    client.post("/api/register", { 
      email, 
      username,
      password, 
    })
    .then(res => {
      // setCurrentUser(res.data.user);
      window.location.href = '/'; // Przekierowanie po rejestracji
    })
    .catch(err => {
      setFormError('Rejestracja nie powiodła się. Spróbuj ponownie.');
      console.error("Registration failed: ", err);
    });
  };

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
