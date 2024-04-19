import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { Row, Col, Container, Card } from 'react-bootstrap';
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
                <h2 ><strong>Twoje wizyty:</strong></h2>
              </Row>
              <Row >
                {userVisits.map((visit, index) => (
                  <Col md={4} key={index} className="mb-4"> {/* Każda wizyta w osobnej kolumnie */}
                    <Card className='card-hover'>
                      <Card.Header>
                        <strong>{visit.guest_first_name} {visit.guest_last_name}</strong> {/* Imię i nazwisko gościa na górze kafelka */}
                      </Card.Header>
                      <Card.Body>
                        <Card.Title>
                          Rozpoczęcie: {visit.start_date} - {visit.start_time}<br /><br />
                          Zakończenie: {visit.end_date} - {visit.end_time}<br />
                        </Card.Title> {/* Data rozpoczęcia i zakończenia wizyty */}
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
