import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserVisitsContext } from "../../contexts/UserVisitsContext";
import client from "../../axiosClient"; // Ensure the path is correct
import { Row, Col, Container, Card, Table, Button } from "react-bootstrap";
import "./Home.css";
import moment from "moment";

const Home = () => {
   const { currentUser, isAuthenticated, isLoading } = useContext(AuthContext);
   const { userVisits, getUserVisits, setGetUserVisits } =
      useContext(UserVisitsContext);
   const [showModal, setShowModal] = useState(false);
   const [selectedVisit, setSelectedVisit] = useState(null);
   const [comment, setComment] = useState("");
   const [errors, setErrors] = useState({});

   const handleExtensionRequest = (visit) => {
      const newEndDate = moment(visit.end_date)
         .add(1, "days")
         .format("YYYY-MM-DD");
      const newEndTime = visit.end_time; // Assuming the end time remains the same

      client
         .post("/api/request-extension", {
            visit: visit.id,
            new_end_date: newEndDate,
            new_end_time: newEndTime,
            status: "Pending",
            comment: comment,
         })
         .then((response) => {
            setShowModal(false);
            setGetUserVisits(true);
            console.log("Appointment extended successfully:", response);
         })
         .catch((error) => {
            console.error("Failed to extend appointment:", error);
            setErrors({ extension: "Failed to extend appointment" });
         });
   };

   const formatTime = (timeString) => {
      return timeString.substr(0, 5); // Trims string to format HH:mm
   };

   if (isLoading) {
      return <div>Loading...</div>; // Display a loading message while fetching user data
   }

   return (
      <>
         <Container className="user_data_container mt-3 mb-5">
            <Row>
               <Col>
                  {currentUser &&
                     currentUser.user &&
                     currentUser.user.first_name && (
                        <div>
                           <div className="info_text_bold">
                              <h2>
                                 <strong>
                                    Witaj {currentUser.user.first_name}!
                                 </strong>
                              </h2>
                           </div>
                           <div className="info_text">
                              <h5>Akademik: {currentUser.user.dormitory}</h5>
                           </div>
                           <div className="info_text">
                              <h5>
                                 Numer pokoju: {currentUser.user.room_number}
                              </h5>
                           </div>
                        </div>
                     )}
               </Col>
            </Row>
         </Container>
         <Container>
            <Row className="row d-flex justify-content-center">
               <Col>
                  {errors.fetch && (
                     <div className="alert alert-danger">{errors.fetch}</div>
                  )}
                  {userVisits && userVisits.length > 0 && (
                     <div>
                        <Row className="mb-3">
                           <h2>
                              <strong>Twoje wizyty:</strong>
                           </h2>
                        </Row>
                        <Row>
                           {userVisits.map((visit, index) => (
                              <Col md={3} key={index} className="mb-4">
                                 <Card className="card-hover">
                                    <Card.Header className="card_header">
                                       <strong>
                                          {visit.guest_first_name}{" "}
                                          {visit.guest_last_name}
                                       </strong>
                                    </Card.Header>
                                    <Card.Body>
                                       <Table borderless size="sm">
                                          <tbody>
                                             <tr>
                                                <td>
                                                   <strong>Rozpoczęcie:</strong>
                                                </td>
                                                <td>{visit.start_date}</td>
                                                <td>
                                                   {formatTime(
                                                      visit.start_time
                                                   )}
                                                </td>
                                             </tr>
                                             <tr>
                                                <td>
                                                   <strong>Zakończenie:</strong>
                                                </td>
                                                <td>{visit.end_date}</td>
                                                <td>
                                                   {formatTime(visit.end_time)}
                                                </td>
                                             </tr>
                                             <tr>
                                                <td>
                                                   <strong>
                                                      Status przedłużenia:
                                                   </strong>
                                                </td>
                                                <td colSpan="2">
                                                   {visit.extensionStatus}
                                                </td>
                                             </tr>
                                          </tbody>
                                       </Table>
                                       <div className="button-container">
                                          <Button
                                             className="btn-custom"
                                             onClick={() =>
                                                handleExtensionRequest(visit)
                                             }
                                             disabled={
                                                visit.extensionStatus !== "Brak"
                                             }
                                          >
                                             Przedłuż wizytę
                                          </Button>
                                       </div>
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
