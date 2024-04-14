// src/components/home/Home.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Row, Col } from 'react-bootstrap';
import './Home.css'

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const onButtonClick = () => {
    if (currentUser) {
      navigate('/logout'); // Przekierowanie do strony wylogowania
    } else {
      navigate('/login'); // Przekierowanie do strony logowania
    }
  };

  return (
    <Row>
      <Col> 
      {currentUser && (
          <div>
            <div>
              <h2>Witaj {currentUser.first_name}</h2>
            </div>
            <div>
              <h2>Akademik: {currentUser.dormitory}</h2>
            </div>
            <div>
              <h2>Numer pokoju: {currentUser.room_number}</h2>
            </div>
          </div>
        )}
      </Col>
      <Col>
        <div className={'buttonContainer'}>
          <input
            className={'inputButton'}
            type="button"
            onClick={onButtonClick}
            value={currentUser ? 'Log out' : 'Log in'}
          />
          {currentUser ? <div>Your email address is {currentUser.email}</div> : <div />}
        </div>
        </Col>
    </Row>
  )
}

export default Home;
