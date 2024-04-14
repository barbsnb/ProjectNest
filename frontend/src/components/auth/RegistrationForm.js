import React, { useContext, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';
import './RegistrationForm.css'

const RegistrationForm = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [dormitory, setDormitory] = useState('');
  const [room_number, setRoomNumber] = useState('');
  

  function submitRegistration(e) {
    e.preventDefault();
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
  }

  return (
    <div className="form-container">
      <Form onSubmit={submitRegistration}>
      <Row> 
          <Col>
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
            </Col>

            <Col>
            <Form.Group className="mb-3" controlId="formBasicFirstName">
              <Form.Label>Imię</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź imię" value={first_name} onChange={e => setFirstName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicLastName">
              <Form.Label>Nazwisko</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź nazwisko" value={last_name} onChange={e => setLastName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPhoneNumber">
              <Form.Label>Numer telefonu</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź numer telefonu" value={phone_number} onChange={e => setPhoneNumber(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDormitory">
              <Form.Label>Akademik</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź nazwę akademika" value={dormitory} onChange={e => setDormitory(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicRoomNumber">
              <Form.Label>Numer pokoju</Form.Label>
              <Form.Control type="text" placeholder="Wprowadź numer pokoju" value={room_number} onChange={e => setRoomNumber(e.target.value)} />
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
