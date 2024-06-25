import React, { useState, useEffect, useContext } from "react";
import { AllVisitsContext } from "../../contexts/AllVisitsContext";
import { AuthContext } from "../../contexts/AuthContext";

// import UserFetcher from "../tabs/UserFetcher";
import client from "../../axiosClient";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./AllVisitsList.css";

const AllVisitsList = () => {
   const { AllVisits } = useContext(AllVisitsContext);
   const { currentUser } = useContext(AuthContext);

   const [visitsWithUserData, setVisitsWithUserData] = useState([]);
   const [filteredVisits, setFilteredVisits] = useState([]);
   const [searchFilter, setSearchFilter] = useState("");
   const [filterType, setFilterType] = useState("guest");
   const [startDateFilter, setStartDateFilter] = useState("");
   const [startTimeFilter, setStartTimeFilter] = useState("");
   const [endDateFilter, setEndDateFilter] = useState("");
   const [endTimeFilter, setEndTimeFilter] = useState("");
   const [sortOrder, setSortOrder] = useState("newest");
   const [visitStatusFilter, setVisitStatusFilter] = useState("all");
   const [extensionStatusFilter, setExtensionStatusFilter] = useState("all");

   const [showCancelModal, setShowCancelModal] = useState(false);
   const [selectedVisit, setSelectedVisit] = useState(null);

   const [showRejectModal, setShowRejectModal] = useState(false);
   const [selectedExtention, setSelectedExtention] = useState(null);
   const [selectedAction, setSelectedAction] = useState(null);

   const [cancelReason, setCancelReason] = useState("");
   const [extentionRejectionReason, setExtentionRejectionReason] = useState("");

   const handleCancelClick = (visit) => {
      setSelectedVisit(visit);
      setShowCancelModal(true);
   };

   const handleRejectClick = (extention, action) => {
      setSelectedExtention(extention);
      setSelectedAction(action);
      setShowRejectModal(true);
   };

   const handleActionClick = async (
      extensionId,
      action,
      extentionRejectionReason
   ) => {
      try {
         const response = await client.put(
            `/api/approve_reject_extension/${extensionId}/${action}/`
         );
         console.log(response.data);
         setVisitsWithUserData((prevVisits) =>
            prevVisits.map((visit) =>
               visit.extensionId === extensionId
                  ? {
                       ...visit,
                       extensionStatus:
                          action === "approve" ? "Approved" : "Rejected",
                    }
                  : visit
            )
         );
      } catch (error) {
         console.error("Error updating extension status:", error);
      }
   };

   const handleRejectionSubmit = async () => {
      console.log(selectedExtention);
      console.log(selectedAction);
      console.log(extentionRejectionReason);

      if (selectedAction === "reject") {
         if (!extentionRejectionReason) {
            alert("Please provide a reason for cancellation.");
            return;
         }
      }
      try {
         const response = await client.put(
            `/api/approve_reject_extension/${selectedExtention}/${selectedAction}/`,
            { comment: extentionRejectionReason }
         );
         console.log(response.data);
         setVisitsWithUserData((prevVisits) =>
            prevVisits.map((visit) =>
               visit.extensionId === selectedExtention
                  ? {
                       ...visit,
                       extensionStatus:
                          selectedAction === "approve"
                             ? "Approved"
                             : "Rejected",
                    }
                  : visit
            )
         );
         setShowRejectModal(false);
         setExtentionRejectionReason("");
         // setGetAllRequests(true)
         setSelectedExtention(null);
         setSelectedAction(null);
      } catch (error) {
         console.error("Error updating extension status:", error);
      }
   };

   const handleCancelSubmit = async () => {
      if (!cancelReason) {
         alert("Please provide a reason for cancellation.");
         return;
      }
      try {
         const response = await client.post(
            `/api/admin_cancel_visit/${selectedVisit.id}/`,
            { description: cancelReason },
            { withCredentials: true } // Ensure credentials are included
         );
         console.log(response.data);
         setVisitsWithUserData((prevVisits) =>
            prevVisits.map((visit) =>
               visit.id === selectedVisit.id
                  ? { ...visit, status: "Expelled", description: cancelReason }
                  : visit
            )
         );
         setShowCancelModal(false);
         setCancelReason("");
      } catch (error) {
         console.error("Error cancelling visit:", error);
      }
   };

   useEffect(() => {
      const fetchUserData = async (visits) => {
         const visitsWithUserData = await Promise.all(
            visits.map(async (visit) => {
               const userResponse = await client.get(`/api/user/${visit.user}`);
               let extensionStatus = "Brak";
               let extensionId = null;

               try {
                  const extensionResponse = await client.get(
                     `/api/all_extension_request_list`
                  );
                  const extension = extensionResponse.data.find(
                     (ext) => ext.visit === visit.id
                  );
                  if (extension) {
                     extensionStatus = extension.status;
                     extensionId = extension.id;
                  }
               } catch (error) {
                  console.error("Error fetching extension status:", error);
               }

               return {
                  ...visit,
                  user: userResponse.data,
                  extensionStatus,
                  extensionId,
               };
            })
         );

         setVisitsWithUserData(visitsWithUserData);
      };

      if (AllVisits.length > 0) {
         fetchUserData(AllVisits);
      }
   }, [AllVisits]);

   useEffect(() => {
      const sortVisits = (visits, order) => {
         return visits.sort((a, b) => {
            const dateA = new Date(`${a.start_date}T${a.start_time}`);
            const dateB = new Date(`${b.start_date}T${b.start_time}`);
            return order === "newest" ? dateB - dateA : dateA - dateB;
         });
      };

      const filtered = visitsWithUserData.filter((visit) => {
         const fullNameGuest =
            visit.guest_first_name + " " + visit.guest_last_name;
         const fullNameHost =
            visit.user.first_name + " " + visit.user.last_name;

         let matchesSearchFilter = true;
         if (filterType === "guest") {
            matchesSearchFilter =
               fullNameGuest
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase()) ||
               visit.guest_phone_nr
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase()) ||
               visit.guest_email
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase());
         } else if (filterType === "host") {
            matchesSearchFilter =
               fullNameHost
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase()) ||
               visit.user.phone_number
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase()) ||
               visit.user.email
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase());
         }

         const visitStart = new Date(`${visit.start_date}T${visit.start_time}`);
         const visitEnd = new Date(`${visit.end_date}T${visit.end_time}`);
         const filterStart = startDateFilter
            ? new Date(`${startDateFilter}T${startTimeFilter || "00:00"}`)
            : null;
         const filterEnd = endDateFilter
            ? new Date(`${endDateFilter}T${endTimeFilter || "23:59"}`)
            : null;

         let matchesDateFilter = true;
         if (filterStart && filterEnd) {
            matchesDateFilter =
               visitStart >= filterStart && visitEnd <= filterEnd;
         } else if (filterStart) {
            matchesDateFilter = visitStart >= filterStart;
         } else if (filterEnd) {
            matchesDateFilter = visitEnd <= filterEnd;
         }

         let matchesVisitStatusFilter =
            visitStatusFilter === "all" || visit.status === visitStatusFilter;

         let matchesExtensionStatusFilter =
            extensionStatusFilter === "all" ||
            visit.extensionStatus === extensionStatusFilter;

         return (
            matchesSearchFilter &&
            matchesDateFilter &&
            matchesVisitStatusFilter &&
            matchesExtensionStatusFilter
         );
      });

      setFilteredVisits(sortVisits(filtered, sortOrder));
   }, [
      visitsWithUserData,
      searchFilter,
      filterType,
      startDateFilter,
      startTimeFilter,
      endDateFilter,
      endTimeFilter,
      sortOrder,
      visitStatusFilter,
      extensionStatusFilter,
   ]);

   const handleFilterChange = (event) => {
      setSearchFilter(event.target.value);
   };

   const handleFilterTypeChange = (event) => {
      setFilterType(event.target.value);
   };

   const handleFilterReset = () => {
      setSearchFilter("");
      setFilterType("guest");
      setStartDateFilter("");
      setStartTimeFilter("");
      setEndDateFilter("");
      setEndTimeFilter("");
      setVisitStatusFilter("all");
      setExtensionStatusFilter("all");
   };

   const getStatus = (startDate, startTime, endDate, endTime) => {
      const now = new Date();
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (now < startDateTime) {
         return "nierozpoczęta";
      } else if (now >= startDateTime && now <= endDateTime) {
         return "trwa";
      } else {
         return "zakończona";
      }
   };

   const handleSortOrderChange = (event) => {
      setSortOrder(event.target.value);
   };

   const handleVisitStatusFilterChange = (event) => {
      setVisitStatusFilter(event.target.value);
   };

   const handleExtensionStatusFilterChange = (event) => {
      setExtensionStatusFilter(event.target.value);
   };

   const isOverdueInProgress = (endDate, endTime, status) => {
      const now = new Date();
      const endDateTime = new Date(`${endDate}T${endTime}`);
      return status === "Inprogress" && endDateTime < now;
   };

   const getStatusText = (status) => {
      if (status === "Inprogress" || status === "inprogress") {
         return "W trakcie";
      } else if (status === "Cancelled" || status === "cancelled") {
         return "Anulowana";
      } else if (status === "Completed" || status === "completed") {
         return "Zakończona";
      } else if (status === "Pending" || status === "pending") {
         return "Zaplanowana";
      } else if (status === "expelled" || status === "Expelled") {
         return "Gość wyrzucony";
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

   return (
      <div className="container mt-4">
         <h2>Filtruj wyniki</h2>
         <Form className="mb-4">
            <Row className="mb-3">
               <Col>
                  <h4>Według danych osoby</h4>
                  <Form.Check
                     type="radio"
                     id="filterTypeGuest"
                     label="Gość"
                     value="guest"
                     checked={filterType === "guest"}
                     onChange={handleFilterTypeChange}
                     inline
                  />
                  <Form.Check
                     type="radio"
                     id="filterTypeHost"
                     label="Host"
                     value="host"
                     checked={filterType === "host"}
                     onChange={handleFilterTypeChange}
                     inline
                  />
               </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                  <h6>
                     Wpisz imię, nazwisko, telefon lub email wybranego
                     użytkownika
                  </h6>
                  <Form.Control
                     type="text"
                     placeholder="imię/nazwisko/telefon/email"
                     value={searchFilter}
                     onChange={handleFilterChange}
                  />
               </Col>
            </Row>

            <Row className="mb-3">
               <Col>
                  <h4>Według danych wizyty</h4>
                  <Form.Group as={Row} controlId="startDateFilter">
                     <Form.Label column sm="2">
                        Data rozpoczęcia:
                     </Form.Label>
                     <Col sm="4">
                        <Form.Control
                           type="date"
                           value={startDateFilter}
                           onChange={(e) => setStartDateFilter(e.target.value)}
                           style={{ minHeight: "38px" }}
                        />
                     </Col>
                     <Form.Label column sm="2">
                        Czas rozpoczęcia:
                     </Form.Label>
                     <Col sm="4">
                        <Form.Control
                           type="time"
                           value={startTimeFilter}
                           onChange={(e) => setStartTimeFilter(e.target.value)}
                           style={{ minHeight: "38px" }}
                        />
                     </Col>
                  </Form.Group>
               </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                  <Form.Group as={Row} controlId="endDateFilter">
                     <Form.Label column sm="2">
                        Data zakończenia:
                     </Form.Label>
                     <Col sm="4">
                        <Form.Control
                           type="date"
                           value={endDateFilter}
                           onChange={(e) => setEndDateFilter(e.target.value)}
                           style={{ minHeight: "38px" }}
                        />
                     </Col>
                     <Form.Label column sm="2">
                        Czas zakończenia:
                     </Form.Label>
                     <Col sm="4">
                        <Form.Control
                           type="time"
                           value={endTimeFilter}
                           onChange={(e) => setEndTimeFilter(e.target.value)}
                           style={{ minHeight: "38px" }}
                        />
                     </Col>
                  </Form.Group>
               </Col>
            </Row>
            <Row className="mb-3">
               <Col>
                  <Form.Group controlId="visitStatusFilter">
                     <Form.Label>Status wizyty:</Form.Label>
                     <Form.Control
                        as="select"
                        value={visitStatusFilter}
                        onChange={handleVisitStatusFilterChange}
                        style={{ minHeight: "38px" }}
                     >
                        <option value="all">Wszystkie</option>
                        <option value="Pending">Zaplanowana</option>
                        <option value="Inprogress">Trwa</option>
                        <option value="Completed">Zakończona</option>
                        <option value="Expelled">Gość wyrzucony</option>
                        <option value="Cancelled">Anulowana</option>
                     </Form.Control>
                  </Form.Group>
               </Col>
               <Col>
                  <Form.Group controlId="extensionStatusFilter">
                     <Form.Label>Status wniosku o przedłużenie:</Form.Label>
                     <Form.Control
                        as="select"
                        value={extensionStatusFilter}
                        onChange={handleExtensionStatusFilterChange}
                        style={{ minHeight: "38px" }}
                     >
                        <option value="all">Wszystkie</option>
                        <option value="Brak">Brak</option>
                        <option value="Pending">Oczekujący</option>
                        <option value="Approved">Zatwierdzony</option>
                        <option value="Rejected">Odrzucony</option>
                     </Form.Control>
                  </Form.Group>
               </Col>
            </Row>
            <Row>
               <Col>
                  <button id="filter_btn" onClick={handleFilterReset}>
                     Resetuj filtrowanie
                  </button>
               </Col>
            </Row>
         </Form>
         <Row className="mb-2">
            <Col>
               <Form.Group controlId="sortOrder">
                  <Form.Label>
                     <h5>Sortuj według:</h5>
                  </Form.Label>
                  <Form.Control
                     as="select"
                     value={sortOrder}
                     onChange={handleSortOrderChange}
                     style={{ minHeight: "38px" }}
                  >
                     <option value="newest">Od najnowszych</option>
                     <option value="oldest">Od najstarszych</option>
                  </Form.Control>
               </Form.Group>
            </Col>
         </Row>
         <div>
            <h1>Lista wizyt</h1>
            {currentUser?.user?.is_receptionist === true && (
               <table className="visits-table">
                  <thead>
                     <tr>
                        <th>Gość</th>
                        <th>Data rozpoczęcia</th>
                        <th>Godzina rozpoczęcia</th>
                        <th>Data zakończenia</th>
                        <th>Godzina zakończenia</th>
                        <th>Host</th>
                        <th>Status wizyty</th>
                        {/* <th>Wniosek o przedłużenie</th> */}
                        {/* <th>Decyzja</th> */}
                        <th>Akcje</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredVisits.map((visit) => (
                        <tr
                           key={visit.id}
                           className={
                              isOverdueInProgress(
                                 visit.end_date,
                                 visit.end_time,
                                 visit.status
                              )
                                 ? "overdue-inprogress"
                                 : ""
                           }
                        >
                           <td>
                              {visit.guest_first_name} {visit.guest_last_name}
                           </td>
                           <td>{visit.start_date}</td>
                           <td>{visit.start_time}</td>
                           <td>{visit.end_date}</td>
                           <td>{visit.end_time}</td>
                           <td>
                              {visit.user.first_name} {visit.user.last_name}
                           </td>
                           <td>{getStatusText(visit.status)}</td>

                           <td>
                              {visit.status.toLowerCase() ===
                                 ("inprogress" || "expelled") && (
                                 <Button
                                    variant="danger"
                                    disabled={
                                       visit.status.toLowerCase() === "expelled"
                                    }
                                    onClick={() => handleCancelClick(visit)}
                                 >
                                    Wyrzuć
                                 </Button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
            {currentUser?.user?.is_community_member === true && (
               <table className="visits-table">
                  <thead>
                     <tr>
                        <th>Gość</th>
                        <th>Data rozpoczęcia</th>
                        <th>Godzina rozpoczęcia</th>
                        <th>Data zakończenia</th>
                        <th>Godzina zakończenia</th>
                        <th>Host</th>
                        <th>Status wizyty</th>
                        <th>Wniosek o przedłużenie</th>
                        <th>Decyzja</th>
                        {/* <th>Akcje</th> */}
                     </tr>
                  </thead>
                  <tbody>
                     {filteredVisits.map((visit) => (
                        <tr
                           key={visit.id}
                           className={
                              isOverdueInProgress(
                                 visit.end_date,
                                 visit.end_time,
                                 visit.status
                              )
                                 ? "overdue-inprogress"
                                 : ""
                           }
                        >
                           <td>
                              {visit.guest_first_name} {visit.guest_last_name}
                           </td>
                           <td>{visit.start_date}</td>
                           <td>{visit.start_time}</td>
                           <td>{visit.end_date}</td>
                           <td>{visit.end_time}</td>
                           <td>
                              {visit.user.first_name} {visit.user.last_name}
                           </td>
                           <td>{getStatusText(visit.status)}</td>
                           <td>{getExtentionText(visit.extensionStatus)}</td>
                           <td>
                              {visit.extensionStatus === "Pending" && (
                                 <div className="button-container">
                                    <Button
                                       variant="success"
                                       onClick={() =>
                                          handleActionClick(
                                             visit.extensionId,
                                             "approve"
                                          )
                                       }
                                    >
                                       Zaakceptuj
                                    </Button>
                                    <Button
                                       variant="danger"
                                       onClick={() =>
                                          handleRejectClick(
                                             visit.extensionId,
                                             "reject"
                                          )
                                       }
                                    >
                                       Odrzuć
                                    </Button>
                                 </div>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>

         <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>Cancel Visit</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <Form>
                  <Form.Group controlId="cancelReason">
                     <Form.Label>Reason for Cancellation</Form.Label>
                     <Form.Control
                        as="textarea"
                        rows={3}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                     />
                  </Form.Group>
               </Form>
            </Modal.Body>
            <Modal.Footer>
               <Button
                  variant="secondary"
                  onClick={() => setShowCancelModal(false)}
               >
                  Close
               </Button>
               <Button variant="danger" onClick={handleCancelSubmit}>
                  Cancel Visit
               </Button>
            </Modal.Footer>
         </Modal>

         <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
            <Modal.Header closeButton>
               <Modal.Title>Reject Visit Extension</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <Form>
                  <Form.Group controlId="rejectReason">
                     <Form.Label>Reason for Rejection</Form.Label>
                     <Form.Control
                        as="textarea"
                        rows={3}
                        value={extentionRejectionReason}
                        onChange={(e) =>
                           setExtentionRejectionReason(e.target.value)
                        }
                     />
                  </Form.Group>
               </Form>
            </Modal.Body>
            <Modal.Footer>
               <Button
                  variant="secondary"
                  onClick={() => setShowRejectModal(false)}
               >
                  Close
               </Button>
               <Button variant="danger" onClick={handleRejectionSubmit}>
                  Reject Visit Extension
               </Button>
            </Modal.Footer>
         </Modal>
      </div>
   );
};

export default AllVisitsList;
