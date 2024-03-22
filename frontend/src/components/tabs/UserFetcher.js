import React, { useState, useEffect } from "react";
import client from "../../axiosClient";

const UserFetcher = ({ userId, children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchUser = async () => {
         try {
            const response = await client.get(`/api/user/${userId}`);
            setUser(response.data);
         } catch (error) {
            setError(error);
         } finally {
            setLoading(false);
         }
      };

      fetchUser();
   }, [userId]);

   if (loading) return <div>Loading...</div>;
   if (error) return <div>Error: {error.message}</div>;

   return children(user);
};

export default UserFetcher;
