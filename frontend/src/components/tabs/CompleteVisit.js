import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CompleteVisit = () => {
   const { visitId } = useParams();
   const navigate = useNavigate();

   useEffect(() => {
      const completeVisit = async () => {
         try {
            const response = await axios.post(
               `/api/complete_visit/${visitId}/`
            );
            if (response.status === 200) {
               alert("Wizyta została zakończona");
               navigate("/"); // Przekierowanie do strony głównej lub innej strony po zakończeniu wizyty
            }
         } catch (error) {
            console.error("Błąd przy zakończaniu wizyty:", error);
            alert("Wystąpił błąd przy zakończaniu wizyty");
         }
      };

      completeVisit();
   }, [visitId, navigate]);

   return (
      <div>
         <h2>Zakończanie wizyty...</h2>
      </div>
   );
};

export default CompleteVisit;
