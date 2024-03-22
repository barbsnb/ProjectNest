import React, { useContext, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import client from '../../axiosClient';  // Ensure you have the axiosClient setup correctly to handle requests
import './ScheduleForm.css';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { AllVisitsContext } from '../../contexts/AllVisitsContext';

const ScheduleAppointment = () => {
  const { currentUser, setGetCurrentUser } = useContext(AuthContext);
  const { setGetUserVisits } = useContext(UserVisitsContext);
  const { setGetAllVisits } = useContext(AllVisitsContext);


  const [visit, setVisit] = useState(''); 
  const [visitFormToggle, setvisitFormToggle] = useState(false);
  const [start_date, setStartDate] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_date, setEndDate] = useState('');
  const [end_time, setEndTime] = useState('');
  const [guest_first_name, setGuestFirstName] = useState('');
  const [guest_last_name, setGuestLastName] = useState('');
  const [guest_phone_nr, setGuestPhoneNr] = useState('');
  const [guest_email, setGuestEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    const now = new Date();
    const start = new Date(`${start_date}T${start_time}`);
    const end = new Date(`${end_date}T${end_time}`);

    // Walidacja daty i godziny rozpoczęcia
    if (!start_date || !start_time) {
      errors.start = 'Data i czas rozpoczęcia są wymagane';
    } else if (start < now) {
      errors.start = 'Data i czas rozpoczęcia nie mogą być wcześniejsze niż obecna data i czas';
    }

    // Walidacja daty i godziny zakończenia
    if (!end_date || !end_time) {
      errors.end = 'Data i czas zakończenia są wymagane';
    } else if (end <= start) {
      errors.end = 'Data i czas zakończenia nie mogą być wcześniejsze niż data i czas rozpoczęcia';
    } else {
      const endOfDay = new Date(start_date);
      endOfDay.setHours(23, 0, 0, 0);
      if (end > endOfDay) {
        errors.end = 'Koniec wizyty nie może przekraczać 23:00 tego samego dnia';
      }
    }

    // Walidacja imienia i nazwiska gościa
    if (!guest_first_name) {
      errors.guest_first_name = 'Imię gościa jest wymagane';
    } else if (/\d/.test(guest_first_name)) {
      errors.guest_first_name = 'Imię gościa nie może zawierać cyfr';
    }

    if (!guest_last_name) {
      errors.guest_last_name = 'Nazwisko gościa jest wymagane';
    } else if (/\d/.test(guest_last_name)) {
      errors.guest_last_name = 'Nazwisko gościa nie może zawierać cyfr';
    }

    // Walidacja numeru telefonu gościa
    if (!guest_phone_nr) {
      errors.guest_phone_nr = 'Numer telefonu gościa jest wymagany';
    } else if (!/^\d{9}$/.test(guest_phone_nr)) {
      errors.guest_phone_nr = 'Numer telefonu gościa musi mieć 9 cyfr i składać się wyłącznie z cyfr';
    }

    // Walidacja adresu e-mail gościa
    if (!guest_email) {
      errors.guest_email = 'Adres e-mail gościa jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(guest_email)) {
      errors.guest_email = 'Adres e-mail gościa jest nieprawidłowy';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();  // Prevent the form from being submitted in the traditional way

    if (!validate()) {
      return;
    }

    // Posting data to the server
    client.post('/api/schedule', {
      start_date,
      start_time,
      end_date,
      end_time,
      guest_first_name,
      guest_last_name,
      guest_phone_nr,
      guest_email,
      status: 'Pending',
      user: currentUser.user.user_id,
      dormitory: currentUser.user.dormitory
    })
    .then(response => {
      setVisit(response.data);
      setGetCurrentUser(true);
      setGetUserVisits(true);
      setGetAllVisits(true);
      setvisitFormToggle(true);
      console.log('Appointment scheduled successfully:', response);
    })
    .catch(error => {
      console.error('Failed to schedule appointment:', error);
    });
  };

  return (
    <>
      {visitFormToggle ? (
        <div className="visit_info">
          <h3>Dane planowanej wizyty:</h3>
          {visit && (
            <div>
              <p>Data rozpoczęcia: {visit.start_date}</p>
              <p>Czas rozpoczęcia: {visit.start_time}</p>
              <p>Data zakończenia: {visit.end_date}</p>
              <p>Czas zakończenia: {visit.end_time}</p>
              <p>Imię gościa: {visit.guest_first_name}</p>
              <p>Nazwisko gościa: {visit.guest_last_name}</p>
              <p>Numer telefonu gościa: {visit.guest_phone_nr}</p>
              <p>Adres e-mail gościa: {visit.guest_email}</p>
              <Button id="form_btn" onClick={() => setvisitFormToggle(!visitFormToggle)} variant="light">
                Zaplanuj kolejną wizytę
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="form-container">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group controlId="formStartDate">
                  <Form.Label>Data rozpoczęcia wizyty</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={start_date} 
                    onChange={e => setStartDate(e.target.value)} 
                    isInvalid={!!errors.start}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.start}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formStartTime">
                  <Form.Label>Czas rozpoczęcia wizyty</Form.Label>
                  <Form.Control 
                    type="time" 
                    value={start_time} 
                    onChange={e => setStartTime(e.target.value)} 
                    isInvalid={!!errors.start}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.start}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formEndDate">
                  <Form.Label>Data zakończenia wizyty</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={end_date} 
                    onChange={e => setEndDate(e.target.value)} 
                    isInvalid={!!errors.end}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formEndTime">
                  <Form.Label>Czas zakończenia wizyty</Form.Label>
                  <Form.Control 
                    type="time" 
                    value={end_time} 
                    onChange={e => setEndTime(e.target.value)} 
                    isInvalid={!!errors.end}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.end}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formGuestFirstName">
                  <Form.Label>Imię gościa</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Wprowadź imię gościa" 
                    value={guest_first_name} 
                    onChange={e => setGuestFirstName(e.target.value)} 
                    isInvalid={!!errors.guest_first_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.guest_first_name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formGuestLastName">
                  <Form.Label>Nazwisko gościa</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Wprowadź nazwisko gościa" 
                    value={guest_last_name} 
                    onChange={e => setGuestLastName(e.target.value)} 
                    isInvalid={!!errors.guest_last_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.guest_last_name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formGuestPhoneNr">
                  <Form.Label>Numer telefonu gościa</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Wprowadź numer telefonu gościa" 
                    value={guest_phone_nr} 
                    onChange={e => setGuestPhoneNr(e.target.value)} 
                    isInvalid={!!errors.guest_phone_nr}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.guest_phone_nr}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="formGuestEmail">
                  <Form.Label>Adres e-mail gościa</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Wprowadź e-mail gościa" 
                    value={guest_email} 
                    onChange={e => setGuestEmail(e.target.value)} 
                    isInvalid={!!errors.guest_email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.guest_email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Button id="form_btn" variant="primary" type="submit">
                  Zaplanuj wizytę
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
};

export default ScheduleAppointment;
