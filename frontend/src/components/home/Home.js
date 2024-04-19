import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { Row, Col, Container, Table } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { userVisits } = useContext(UserVisitsContext);

  return (
    <>
      
        <Container className="user_data_container mt-3 mb-5">
          <Row>
            <Col>
            {currentUser && currentUser.user && currentUser.user.first_name && (
              <div>
                <div className='info_text_bold'>
                  <h3>Witaj {currentUser.user.first_name}</h3>
                </div>
                <div className='info_text'>
                  Akademik: {currentUser.user.dormitory}
                </div>
                <div className='info_text'>
                  Numer pokoju: {currentUser.user.room_number}
                </div>
              </div>
            )}
            </Col>
          </Row>
        </Container>
      <Container>
      <Row className='row d-flex justify-content-center'>
        <Col>
            {userVisits && userVisits.length > 0 && (
              <div>
                <h3>Twoje wizyty:</h3>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Dzień rozpoczęcia wizyty</th>
                      <th>Czas rozpoczęcia wizyty</th>
                      <th>Dzień zakończenia wizyty</th>
                      <th>Czas zakończenia wizyty</th>
                      <th>Imię gościa</th>
                      <th>Nazwisko gościa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userVisits.map((visit, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{visit.start_date}</td>
                        <td>{visit.start_time}</td>
                        <td>{visit.end_date}</td>
                        <td>{visit.end_time}</td>
                        <td>{visit.guest_first_name}</td>
                        <td>{visit.guest_last_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
            {userVisits && userVisits.length === 0 && (
              <div>
                <h3>Twoje wizyty:</h3>
                <p>Brak nadchodzących wizyt</p>
              </div>
            )}
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default Home;
