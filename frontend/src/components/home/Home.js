import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { UserVisitsContext } from '../../contexts/UserVisitsContext';
import { Row, Col, Container } from 'react-bootstrap';
import './Home.css'

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { userVisits } = useContext(UserVisitsContext)

  return (
    <Row>
      <Col> 
      <Container className="user_data_container">
        {currentUser && currentUser.user && currentUser.user.first_name &&(
            <div >
              <div className='info_text_bold'>
                Witaj {currentUser.user.first_name}
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
      <Col>
        <Container className="user_visits_container">
        {userVisits &&  userVisits.length > 0 && (
          <div> 
            <h3>Twoje wizyty:</h3>
            <ul>
              {userVisits.map((visit, index) => (
                <li key={index}>
                  <p>Dzień rozpoczęcia wizyty: {visit.start_date}</p>
                  <p>Czas rozpoczęcia wizyty: {visit.start_time}</p>
                  <p>Dzień zakończenia wizyty: {visit.end_date}</p>
                  <p>Czas zakończenia wizyty: {visit.end_time}</p>
                  <p>Imię gościa: {visit.guest_first_name}</p>
                  <p>Nazwisko gościa: {visit.guest_last_name}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {userVisits &&  userVisits.length === 0 &&(
          <h3>Brak nadchodzących wizyt</h3>
        )}
        </Container>
      </Col>
    </Row>
  )
}


export default Home;
















// import React, { useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../contexts/AuthContext';
// import { Row, Col, Container, Spinner } from 'react-bootstrap';
// import './Home.css';

// const Home = () => {
//   const { currentUser } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [first_name, setFirstName] = useState(null)
//   const [dormitory, setDormitory] = useState(null)
//   const [room_number, setRoomNumber] = useState(null)
//   const [email, setEmail] = useState(null)

//   useEffect(() => {
//     if (currentUser) {
//       setFirstName(currentUser.user.first_name);
//       setDormitory(currentUser.user.dormitory);
//       setRoomNumber(currentUser.user.room_number);
//       setEmail(currentUser.user.email);
//       // Ustaw opóźnienie na 1 sekundę przed zakończeniem ładowania
//       const timer = setTimeout(() => {
//         setLoading(false);
//       }, 1000);
//       return () => clearTimeout(timer); // Wyczyszczenie timera przy odmontowaniu komponentu
//     }
//   }, [currentUser]);

//   const onButtonClick = () => {
//     if (currentUser) {
//       navigate('/logout'); // Przekierowanie do strony wylogowania
//     } else {
//       navigate('/login'); // Przekierowanie do strony logowania
//     }
//   };


//   return (
//     <Row>
//       <Col> 
//         <Container className="user_data_container">
//           {loading ? ( // Wyświetl spinner podczas ładowania
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           ) : (
//             <>
//               <div className='info_text'>
//                 Witaj {first_name}
//               </div>
//               <div className='info_text'>
//                 Akademik: {currentUser.user.dormitory}
//               </div>
//               <div className='info_text'>
//                 Numer pokoju: {currentUser.user.room_number}
//               </div>
//               <div className='info_text'>
//                 Twój adres e-mail: {currentUser.user.email}
//               </div>
//             </>
//           )}
//         </Container>
//       </Col>
//     </Row>
//   );
// };

// export default Home;
