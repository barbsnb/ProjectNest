import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import client from '../axiosClient';  // Ensure you have the axiosClient setup correctly to handle requests

const ScheduleAppointment = () => {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hostFirstName, setHostFirstName] = useState('');
  const [hostLastName, setHostLastName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();  // Prevent the form from being submitted in the traditional way
    const appointmentData = {
      startDateTime: `${startDate}T${startTime}`,
      endDateTime: `${endDate}T${endTime}`,
      hostFirstName: hostFirstName,
      hostLastName: hostLastName,
      building: buildingName,
      room: roomNumber
    };

    // Posting data to the server
    client.post('/api/schedule', appointmentData)
      .then(response => {
        console.log('Appointment scheduled successfully:', response);
        // Optionally reset form or give feedback to the user
      })
      .catch(error => {
        console.error('Failed to schedule appointment:', error);
        // Handle errors, e.g., show an error message
      });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formStartDate">
          <Form.Label>Start Date</Form.Label>
          <Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formStartTime">
          <Form.Label>Start Time</Form.Label>
          <Form.Control type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formEndDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formEndTime">
          <Form.Label>End Time</Form.Label>
          <Form.Control type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formHostFirstName">
          <Form.Label>Host First Name</Form.Label>
          <Form.Control type="text" placeholder="Enter host's first name" value={hostFirstName} onChange={e => setHostFirstName(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formHostLastName">
          <Form.Label>Host Last Name</Form.Label>
          <Form.Control type="text" placeholder="Enter host's last name" value={hostLastName} onChange={e => setHostLastName(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formBuildingName">
          <Form.Label>Building Name</Form.Label>
          <Form.Control type="text" placeholder="Enter building name" value={buildingName} onChange={e => setBuildingName(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="formRoomNumber">
          <Form.Label>Room Number</Form.Label>
          <Form.Control type="text" placeholder="Enter room number" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} />
        </Form.Group>
        <Button variant="primary" type="submit">
          Schedule Visit
        </Button>
      </Form>
    </Container>
  );
};

export default ScheduleAppointment;