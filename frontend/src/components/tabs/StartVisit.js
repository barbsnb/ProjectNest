import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const StartVisit = () => {
   const { visitId } = useParams();
   const navigate = useNavigate();

   useEffect(() => {
      const startVisit = async () => {
         try {
            const response = await axios.post(`/api/change_status/${visitId}/`);
            if (response.status === 200) {
               alert("Wizyta została rozpoczęta");
               navigate("/"); // Przekierowanie do strony głównej lub innej strony po rozpoczęciu wizyty
            }
         } catch (error) {
            console.error("Błąd przy rozpoczynaniu wizyty:", error);
            alert("Wystąpił błąd przy rozpoczynaniu wizyty");
         }
      };

      startVisit();
   }, [visitId, navigate]);

   return (
      <div>
         <h2>Rozpoczynanie wizyty...</h2>
      </div>
   );
};

export default StartVisit;
