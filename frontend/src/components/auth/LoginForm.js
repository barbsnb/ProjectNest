import React, { useContext, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import client from "../../axiosClient";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import "./LoginForm.css";

const LoginForm = () => {
  const { setCurrentUser, setGetCurrentUser } = useContext(AuthContext);
  const { setGetUserProjects } = useContext(UserProjectsContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};

    if (!email) {
      nextErrors.email = "Adres e-mail jest wymagany.";
    }

    if (!password) {
      nextErrors.password = "Hasło jest wymagane.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitLogin = (event) => {
    event.preventDefault();
    if (!validate()) return;

    client
      .post("/api/login", { email, password }, { withCredentials: true })
      .then((res) => {
        if (res.data.token) {
          window.localStorage.setItem("praetorAuthToken", res.data.token);
        }
        setCurrentUser(res.data.user);
        setGetCurrentUser(true);
        setGetUserProjects(true);
        setLoginError("");
        navigate("/home");
      })
      .catch((error) => {
        setLoginError("Podano błędne dane logowania. Spróbuj ponownie.");
        console.error("Logowanie nie powiodło się:", error);
      });
  };

  return (
    <div className="login-page-wrapper">
      <div className="form-container">
        <Form onSubmit={submitLogin}>
          <h4>Zaloguj się do PRAETOR</h4>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adres e-mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Wprowadź adres e-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Hasło</Form.Label>
            <Form.Control
              type="password"
              placeholder="Wprowadź hasło"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              isInvalid={!!errors.password}
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>
          <Button id="form_btn" variant="primary" type="submit">
            Zaloguj
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
