import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserVisitsContext } from "../../contexts/UserVisitsContext";
import client from "../../axiosClient"; // Ensure the path is correct
import { Row, Col, Container, Card, Table, Button } from "react-bootstrap";
import "./Home.css";
import moment from "moment";

import { Calendar } from 'fullcalendar'
import Fullcalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import * as bootstrap from 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

function formatHours(date)
{
    let hours = date.getHours();
    let minutes = date.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes;
}


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
         return "Wniosek zaakceptowany";
      } else if (status === "Rejected") {
         return "Wniosek odrzucony";
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
                        <Fullcalendar
                            //plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView={"dayGridMonth"}
                            headerToolbar = {{
                            start: "today prev, next",
                            center: "title",
                            end: "dayGridMonth,timeGridWeek,timeGridDay",
                            }}
                            height={"auto"}
                            eventColor={"#2c3e50"}
                            eventDisplay={"block"}
                            events = {events}
                            eventDidMount={(info) => {
                                return new bootstrap.Popover(info.el, {
                                    title: info.event.title,
                                    placement: "auto",
                                    trigger: "hover",
                                    customClass: "popoverStyle",
                                    content:
                                      "<p> Godzina rozpoczęcia: " + formatHours(info.event.start) + "<br>Godzina zakończenia: " + formatHours(info.event.end) +
                                      "<br>Status wizyty: " + info.event.groupId + "</p>",
                                    html: true,
                                    sanitize: false,
                                    });
                                    }}
                            />
                        <br></br>
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
