// src/components/home/Home.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Row, Col } from 'react-bootstrap';
import './Home.css'

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser)
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
                Witaj {currentUser.user.first_name}
              </div>
              <div>
                Akademik: {currentUser.user.dormitory}
              </div>
              <div>
                Numer pokoju: {currentUser.user.room_number}
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
          {currentUser ? <div>Your email address is {currentUser.user.email}</div> : <div />}
        </div>
        </Col>
    </Row>
  )
}

export default Home;
