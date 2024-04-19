import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { Row, Col, Container } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { userVisits } = useContext(UserVisitsContext);

  return (
    <Container fluid>
      <Row>
        <Col md={3}> 
          <Container className="user_data_container">
            {currentUser && currentUser.user && currentUser.user.first_name &&(
              <div >
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
          </Container>
        </Col>
        <Col md={8}>
          <Container className="user_visits_container">
            {userVisits &&  userVisits.length > 0 && (
              <div> 
                <h3>Twoje wizyty:</h3>
                <Row>
                  {userVisits.map((visit, index) => (
                    <Col md={6} key={index}> {/* 6/12 width for medium screen and above */}
                      <ul>
                        <li>
                          <p>Dzień rozpoczęcia wizyty: {visit.start_date}</p>
                          <p>Czas rozpoczęcia wizyty: {visit.start_time}</p>
                          <p>Dzień zakończenia wizyty: {visit.end_date}</p>
                          <p>Czas zakończenia wizyty: {visit.end_time}</p>
                          <p>Imię gościa: {visit.guest_first_name}</p>
                          <p>Nazwisko gościa: {visit.guest_last_name}</p>
                        </li>
                      </ul>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
            {userVisits &&  userVisits.length === 0 &&(
              <div>
              <h3>Twoje wizyty:</h3>
                <p>Brak nadchodzących wizyt</p>
              </div>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
