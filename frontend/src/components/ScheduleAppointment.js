import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import client from '../axiosClient';  // Ensure you have the axiosClient setup correctly to handle requests
import './auth/RegistrationForm.css'

const ScheduleAppointment = () => {
  // const { setVisit } = useContext(AuthContext);

  const [start_date, setStartDate] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_date, setEndDate] = useState('');
  const [end_time, setEndTime] = useState('');
  const [guest_first_name, setGuestFirstName] = useState('');
  const [guest_last_name, setGuestLastName] = useState('');
  const [guest_phone_nr, setGuestPhoneNr] = useState('');
  const [guest_email, setGuestEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();  // Prevent the form from being submitted in the traditional way
    console.log("Inside handle sumbit")
    // Posting data to the server
    console.log({start_date, 
      start_time, 
      end_date,
      end_time, 
      guest_first_name, 
      guest_last_name,
      guest_phone_nr, 
      guest_email})

    client.post('/api/schedule', {
      start_date, 
      start_time, 
      end_date,
      end_time, 
      guest_first_name, 
      guest_last_name,
      guest_phone_nr, 
      guest_email 
    })
      .then(response => {
        // setVisit(response.data)
        console.log('Appointment scheduled successfully:', response);
        // Optionally reset form or give feedback to the user
      })
      .catch(error => {
        console.error('Failed to schedule appointment:', error);
        // Handle errors, e.g., show an error message
      });
  };

  return (
    <div className="form-container">
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formStartDate">
          <Form.Label>Data rozpoczęcia wizyty</Form.Label>
          <Form.Control type="date" value={start_date} onChange={e => setStartDate(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formStartTime">
          <Form.Label>Czas rozpoczęcia wizyty</Form.Label>
          <Form.Control type="time" value={start_time} onChange={e => setStartTime(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formEndDate">
          <Form.Label>Data zakończnia wizyty</Form.Label>
          <Form.Control type="date" value={end_date} onChange={e => setEndDate(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formEndTime">
          <Form.Label>Czas zakończnia wizyty</Form.Label>
          <Form.Control type="time" value={end_time} onChange={e => setEndTime(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formHostFirstName">
          <Form.Label>Imię gościa</Form.Label>
          <Form.Control type="text" placeholder="Wprowadź imię gościa" value={guest_first_name} onChange={e => setGuestFirstName(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formHostLastName">
          <Form.Label>Nazwisko gościa</Form.Label>
          <Form.Control type="text" placeholder="Wprowadź nazwisko gościa" value={guest_last_name} onChange={e => setGuestLastName(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formBuildingName">
          <Form.Label>Numer telefonu gościa</Form.Label>
          <Form.Control type="text" placeholder="Wprowadź numer telefonu gościa" value={guest_phone_nr} onChange={e => setGuestPhoneNr(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formRoomNumber">
          <Form.Label>Adres e-mail gościa</Form.Label>
          <Form.Control type="text" placeholder="Wprowadź e-mail gościa" value={guest_email} onChange={e => setGuestEmail(e.target.value)} />
        </Form.Group>
        <Button id="form_btn" variant="primary" type="submit">
          Zaplanuj wizytę
        </Button>
      </Form>
    </Container>
    </div>
  );
};

export default ScheduleAppointment;