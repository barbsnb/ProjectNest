import React, { useContext, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";

import client from "../../axiosClient";
import "./LoginForm.css";

const LoginForm = () => {
   const { setGetCurrentUser } = useContext(AuthContext);
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const { setGetUserProjects } = useContext(UserProjectsContext);
   const [errors, setErrors] = useState({});
   const [loginError, setLoginError] = useState("");

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
            setGetUserProjects(true);
            setLoginError(""); // Reset login error on successful login
         })
         .catch((err) => {
            setLoginError("Podano błędne dane logowania. Proszę spróbować ponownie.");
            console.error("Login failed: ", err);
         });
   }

   return (
      <div className="form-container">
         <Form onSubmit={submitLogin}>
            {loginError && <Alert variant="danger">{loginError}</Alert>}
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
