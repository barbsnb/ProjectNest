import React, { useContext, useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [dormitory, setDormitory] = useState('');
  const [room_number, setRoomNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const dormitories = [
    'DS Akademik',
    'DS Babilon',
    'DS Bratniak-Muszelka',
    'DS Mikrus',
    'DS Pineska-Tulipan',
    'DS Riviera',
    'DS Tatrzańska',
    'DS Ustronie',
    'DS Wcześniak',
    'DS Żaczek'
  ];

  const validate = () => {
    const errors = {};

    // Walidacja email
    if (!email) {
      errors.email = 'Adres e-mail jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Adres e-mail jest nieprawidłowy';
    }

    // Walidacja hasła
    if (!password) {
      errors.password = 'Hasło jest wymagane';
    } else if (password.length <= 8) {
      errors.password = 'Hasło musi mieć więcej niż 8 znaków';
    }

    // Potwierdzenie hasła
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Hasła nie pasują do siebie';
    }

    // Walidacja numeru telefonu
    if (!phone_number) {
      errors.phone_number = 'Numer telefonu jest wymagany';
    } else if (!/^\d{9}$/.test(phone_number)) {
      errors.phone_number = 'Numer telefonu musi mieć 9 cyfr i składać się wyłącznie z cyfr';
    }

    // Walidacja imienia i nazwiska
    if (!first_name) {
      errors.first_name = 'Imię jest wymagane';
    } else if (/\d/.test(first_name)) {
      errors.first_name = 'Imię nie może zawierać cyfr';
    }

    if (!last_name) {
      errors.last_name = 'Nazwisko jest wymagane';
    } else if (/\d/.test(last_name)) {
      errors.last_name = 'Nazwisko nie może zawierać cyfr';
    }

    // Walidacja innych pól
    if (!username) errors.username = 'Nazwa użytkownika jest wymagana';
    if (!dormitory) errors.dormitory = 'Akademik jest wymagany';
    if (!room_number) errors.room_number = 'Numer pokoju jest wymagany';

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
      first_name, 
      last_name,
      phone_number,
      dormitory,
      room_number
    })
      .then(res => {
        setCurrentUser(res.data);
        window.location.href = '/'; // Przekierowanie na stronę główną po rejestracji
      })
      .catch(err => console.error("Registration failed: ", err));
  };

  return (
    <div className="form-container">
      <Form onSubmit={submitRegistration}>
        {formError && <Alert variant="danger">{formError}</Alert>}
        <Row>
          <Col>
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
                placeholder="Hasło powinno zawierać przynajmniej 8 znaków" 
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
          </Col>

          <Col>
            <Form.Group className="mb-3" controlId="formBasicFirstName">
              <Form.Label>Imię</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Wprowadź imię" 
                value={first_name} 
                onChange={e => setFirstName(e.target.value)} 
                isInvalid={!!errors.first_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.first_name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicLastName">
              <Form.Label>Nazwisko</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Wprowadź nazwisko" 
                value={last_name} 
                onChange={e => setLastName(e.target.value)} 
                isInvalid={!!errors.last_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.last_name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPhoneNumber">
              <Form.Label>Numer telefonu</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Wprowadź numer telefonu" 
                value={phone_number} 
                onChange={e => setPhoneNumber(e.target.value)} 
                isInvalid={!!errors.phone_number}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone_number}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDormitory">
              <Form.Label>Akademik</Form.Label>
              <Form.Control 
                as="select"
                value={dormitory}
                onChange={e => setDormitory(e.target.value)} 
                isInvalid={!!errors.dormitory}
              >
                <option value="">Wybierz akademik</option>
                {dormitories.map(dorm => (
                  <option key={dorm} value={dorm}>{dorm}</option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.dormitory}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicRoomNumber">
              <Form.Label>Numer pokoju</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Wprowadź numer pokoju" 
                value={room_number} 
                onChange={e => setRoomNumber(e.target.value)} 
                isInvalid={!!errors.room_number}
              />
              <Form.Control.Feedback type="invalid">
                {errors.room_number}
              </Form.Control.Feedback>
            </Form.Group>
            <Button id="form_btn" variant="primary" type="submit">
              Zarejestruj
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default RegistrationForm;
