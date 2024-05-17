import React, { useState, useEffect, useContext } from "react";
import { AllVisitsContext } from "../../contexts/AllVisitsContext";
import { AuthContext } from "../../contexts/AuthContext";
import "./AllVisitsList.css";

const AllVisitsList = () => {
   const { AllVisits } = useContext(AllVisitsContext);
   const { currentUser } = useContext(AuthContext);
   const [filteredVisits, setFilteredVisits] = useState(AllVisits);
   const [searchFilter, setSearchFilter] = useState("");
   const [filterType, setFilterType] = useState("guest");
   const [startDateFilter, setStartDateFilter] = useState("");
   const [startTimeFilter, setStartTimeFilter] = useState("");
   const [endDateFilter, setEndDateFilter] = useState("");
   const [endTimeFilter, setEndTimeFilter] = useState("");

   useEffect(() => {
      const filtered = AllVisits.filter((visit) => {
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

         return matchesSearchFilter && matchesDateFilter;
      });

      setFilteredVisits(filtered);
   }, [
      AllVisits,
      searchFilter,
      filterType,
      startDateFilter,
      startTimeFilter,
      endDateFilter,
      endTimeFilter,
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
   };

   const getStatus = (startDate, startTime, endDate, endTime) => {
      // Do zmiany jak będzie flaga czy gość rozpoczął wizytę, czy nie, teraz bazuje na datach

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

   return (
      <div className="container mt-4">
         <h2>Filtruj wyniki</h2>
         <h4>Według danych osoby</h4>
         <form className="mb-4">
            <div className="mb-3">
               <label className="form-check-label me-2 fs-5">
                  <input
                     type="radio"
                     value="guest"
                     checked={filterType === "guest"}
                     onChange={handleFilterTypeChange}
                     className="form-check-input"
                  />
                  Gość
               </label>

               <label className="form-check-label fs-5">
                  <input
                     type="radio"
                     value="host"
                     checked={filterType === "host"}
                     onChange={handleFilterTypeChange}
                     className="form-check-input"
                  />
                  Host
               </label>
            </div>
            <div className="mb-3">
               <h6>
                  Wpisz imię, nazwisko, telefon lub email wybranego użytkownika
               </h6>
               <input
                  type="text"
                  placeholder="imię/nazwisko/telefon/email"
                  value={searchFilter}
                  onChange={handleFilterChange}
                  className="form-control"
               />
            </div>
            <div className="mb-3">
               <h4>Według daty i czasu wizyty</h4>
               <div className="row">
                  <div className="col">
                     <label>Data rozpoczęcia:</label>
                     <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="form-control"
                     />
                  </div>
                  <div className="col">
                     <label>Czas rozpoczęcia:</label>
                     <input
                        type="time"
                        value={startTimeFilter}
                        onChange={(e) => setStartTimeFilter(e.target.value)}
                        className="form-control"
                     />
                  </div>
               </div>
               <div className="row mt-3">
                  <div className="col">
                     <label>Data zakończenia:</label>
                     <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="form-control"
                     />
                  </div>
                  <div className="col">
                     <label>Czas zakończenia:</label>
                     <input
                        type="time"
                        value={endTimeFilter}
                        onChange={(e) => setEndTimeFilter(e.target.value)}
                        className="form-control"
                     />
                  </div>
               </div>
            </div>
            <button type="button" id="filter_btn" onClick={handleFilterReset}>
               Resetuj filtrowanie
            </button>
         </form>

         <div>
            <h1>Lista wizyt</h1>
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
                  </tr>
               </thead>
               <tbody>
                  {filteredVisits.map((visit) => (
                     <tr key={visit.id}>
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
                        <td>
                           {getStatus(
                              visit.start_date,
                              visit.start_time,
                              visit.end_date,
                              visit.end_time
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default AllVisitsList;
