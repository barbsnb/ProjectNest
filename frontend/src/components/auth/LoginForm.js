import React, { useContext, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import { UserVisitsContext } from "../../contexts/UserVisitsContext";
import { AllVisitsContext } from "../../contexts/AllVisitsContext";

import client from "../../axiosClient";
import "./LoginForm.css";

const LoginForm = () => {
   const { setGetCurrentUser } = useContext(AuthContext);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const { setGetUserVisits } = useContext(UserVisitsContext);
   const { setGetAllVisits } = useContext(AllVisitsContext);
   const [errors, setErrors] = useState({});

   const validate = () => {
      const errors = {};

      if (!email) {
         errors.email = "Adres e-mail jest wymagany";
      }

      if (!password) {
         errors.password = "Hasło jest wymagane";
      }

      setErrors(errors);
      return Object.keys(errors).length === 0;
   };

   function submitLogin(e) {
      e.preventDefault();

      if (!validate()) {
         return;
      }

      client
         .post("/api/login", { email, password })
         .then((res) => {
            setGetCurrentUser(true);
            setGetUserVisits(true);
            setGetAllVisits(true);
         })
         .catch((err) => {
            console.error("Login failed: ", err);
         });
   }

   return (
      <div className="form-container">
         <Form onSubmit={submitLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
               <Form.Label>Adres e-mail</Form.Label>
               <Form.Control
                  type="email"
                  placeholder="Wprowadź adres e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!errors.email}
               />
               <Form.Control.Feedback type="invalid">
                  {errors.email}
               </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
               <Form.Label>Hasło</Form.Label>
               <Form.Control
                  type="password"
                  placeholder="Wprowadź hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!errors.password}
               />
               <Form.Control.Feedback type="invalid">
                  {errors.password}
               </Form.Control.Feedback>
            </Form.Group>
            <Button id="form_btn" variant="primary" type="submit">
               Zaloguj
            </Button>
         </Form>
      </div>
   );
};

export default LoginForm;
