import React, { useContext, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';

const RegistrationForm = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function submitRegistration(e) {
    e.preventDefault();
    client.post("/api/register", { email, username, password })
      .then(res => {
        setCurrentUser(res.data);
        window.location.href = '/'; // Przekierowanie na stronę główną po rejestracji
      })
      .catch(err => console.error("Registration failed: ", err));
  }

  return (
    <div className="center">
      <Form onSubmit={submitRegistration}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Adres e-mail</Form.Label>
          <Form.Control type="email" placeholder="Wprowadź adres e-mail" value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Nazwa użytkownika</Form.Label>
          <Form.Control type="text" placeholder="Wprowadź nazwę użytkownika" value={username} onChange={e => setUsername(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Hasło</Form.Label>
          <Form.Control type="password" placeholder="Hasło powinno zawierać przynajmniej 8 znaków" value={password} onChange={e => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Zarejestruj
        </Button>
      </Form>
    </div>
  );
};

export default RegistrationForm;
