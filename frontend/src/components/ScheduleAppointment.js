import React, { useContext, useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import client from '../axiosClient';  // Ensure you have the axiosClient setup correctly to handle requests
import './auth/RegistrationForm.css'
import { Row, Col } from 'react-bootstrap';

const ScheduleAppointment = () => {
  // to do zmiany na pewno bo trzeba zeby ustawial globalnie i dodawal do bazy
  const [visit, setVisit ] = useState(''); 

  const [visitFormToggle, setvisitFormToggle] = useState(false);
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
        setVisit(response.data)
        setvisitFormToggle(true)
        console.log('Appointment scheduled successfully:', response);
        // Optionally reset form or give feedback to the user
      })
      .catch(error => {
        console.error('Failed to schedule appointment:', error);
        // Handle errors, e.g., show an error message
      });
  };

  // const handleNewAppointment = () => {
  //   setVisitFormToggle(false);
  //   // Dodaj tutaj kod do resetowania stanu formularza, jeśli to konieczne
  // };

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
              </Col>
              <Col>
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
              </Col>
            </Row>
          </Form>
        </div>
          
        
    )}
    </>
  );
  
};

export default ScheduleAppointment;