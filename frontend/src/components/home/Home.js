// src/components/home/Home.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

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
    <div className="mainContainer">
      <div className={'titleContainer'}>
        <div>Welcome!</div>
      </div>
      <div>This is the home page.</div>
      <div className={'buttonContainer'}>
        <input
          className={'inputButton'}
          type="button"
          onClick={onButtonClick}
          value={currentUser ? 'Log out' : 'Log in'}
        />
        {currentUser ? <div>Your email address is {currentUser.email}</div> : <div />}
      </div>
    </div>
  )
}

export default Home;
