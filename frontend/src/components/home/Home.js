import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { Row, Col, Container, Card, Table } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { userVisits } = useContext(UserVisitsContext);

  const formatTime = (timeString) => {
    return timeString.substr(0, 5); // Przycina string do formatu HH:mm
  };

  return (
    <>
      
        <Container className="user_data_container mt-3 mb-5">
          <Row>
            <Col>
            {currentUser && currentUser.user && currentUser.user.first_name && (
              <div>
                <div className='info_text_bold'>
                  <h2><strong>Witaj {currentUser.user.first_name}!</strong></h2>
                </div>
                <div className='info_text'>
                  <h5>Akademik: {currentUser.user.dormitory}</h5>
                </div>
                <div className='info_text'>
                  <h5>Numer pokoju: {currentUser.user.room_number}</h5>
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
              <Row className='mb-3'>
                <h2><strong>Twoje wizyty:</strong></h2>
              </Row>
              <Row>
                {userVisits.map((visit, index) => (
                  <Col md={3} key={index} className="mb-4"> {/* Każda wizyta w osobnej kolumnie */}
                    <Card className='card-hover'>
                      <Card.Header className='card_header'>
                        <strong>{visit.guest_first_name} {visit.guest_last_name}</strong> {/* Imię i nazwisko gościa na górze kafelka */}
                      </Card.Header>
                      <Card.Body>
                        {/* Użycie tabeli do prezentacji dat i godzin */}
                        <Table borderless size="sm">
                          <tbody>
                            <tr>
                              <td><strong>Rozpoczęcie:</strong></td>
                              <td>{visit.start_date}</td>
                              <td>{formatTime(visit.start_time)}</td>
                            </tr>
                            <tr>
                              <td><strong>Zakończenie:</strong></td>
                              <td>{visit.end_date}</td>
                              <td>{formatTime(visit.end_time)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
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
