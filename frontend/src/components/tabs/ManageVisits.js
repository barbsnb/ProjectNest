import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserVisitsContext } from "../../contexts/UserVisitsContext";


import client from "../../axiosClient"; // Ensure the path is correct
import { Row, Col, Container, Card, Table, Button } from "react-bootstrap";
import "./ManageVisits.css";
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

   const handleCancelRequest = (visit) => {
      console.log(visit.id);

      const newEndDate = moment(visit.end_date)
         .add(1, "days")
         .format("YYYY-MM-DD");
      const newEndTime = visit.end_time;
      client
         .post(`/api/cancel_visit/${visit.id}`, {})
         .then((response) => {
            setShowModal(false);
            setGetUserVisits(true);
            console.log("Appointment canceled successfully:", response);
         })
         .catch((error) => {
            console.error("Failed to canceled appointment:", error);
            setErrors({ extension: "Failed to canceled appointment" });
         });
   };

   const getStatusText = (status) => {
      if (status === "Inprogress") {
         return "W trakcie";
      } else if (status === "Cancelled") {
         return "Anulowana";
      } else if (status === "Completed") {
         return "Zakończona";
      } else if (status === "Pending") {
         return "Zaplanowana";
      }
   };

   const getExtentionText = (status) => {
      if (status === "Approved") {
         return "Zaakceptowany";
      } else if (status === "Rejected") {
         return "Odrzucony";
      } else if (status === "Pending") {
         return "Oczekujący";
      } else {
         return " - ";
      }
   };

   const formatTime = (timeString) => {
      return timeString.substr(0, 5); // Trims string to format HH:mm
   };

   const events = userVisits.map(visit => {
        const startDateTimeStr = visit.start_date + "T" + visit.start_time;
        const startDateTime = new Date(startDateTimeStr);

        const endDateTimeStr = visit.end_date + "T" + visit.end_time;
        const endDateTime = new Date(endDateTimeStr);

        return {
            title: visit.guest_first_name + " " + visit.guest_last_name,
            start: startDateTime,
            end: endDateTime,
            backgroundColor: "#2c3e50",
            groupId: getStatusText(visit.status)
        }

    });

   if (isLoading) {
      return <div>Loading...</div>; // Display a loading message while fetching user data
   }

   return (
      <>
         <Container className="user_data_container mt-3 mb-5">
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
                              <strong>Zarządzaj wizytami:</strong>
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
                                                      Status Wizyty:
                                                   </strong>
                                                </td>
                                                <td colSpan="2">
                                                   {getStatusText(visit.status)}
                                                </td>
                                             </tr>
                                             <tr>
                                                <td>
                                                   <strong>
                                                      Status przedłużenia:
                                                   </strong>
                                                </td>
                                                <td colSpan="2">
                                                   {getExtentionText(
                                                      visit.extensionStatus
                                                   )}
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

                                       <div className="button-container">
                                          <Button
                                             className="btn-custom"
                                             onClick={() =>
                                                handleCancelRequest(visit)
                                             }
                                             disabled={
                                                visit.status !== "Pending"
                                             }
                                          >
                                             Anuluj wizytę
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
                        <h3>Zarządzaj wizytami:</h3>
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
