import React, { useContext, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import client from "../../axiosClient";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const { setCurrentUser, setGetCurrentUser } = useContext(AuthContext);
  const { setGetUserProjects } = useContext(UserProjectsContext);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};

    if (!email) {
      nextErrors.email = "Adres e-mail jest wymagany.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Adres e-mail jest nieprawidłowy.";
    }

    if (!username) {
      nextErrors.username = "Nazwa użytkownika jest wymagana.";
    }

    if (!password) {
      nextErrors.password = "Hasło jest wymagane.";
    } else if (password.length < 8) {
      nextErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Hasła nie pasują do siebie.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const register = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await client.post("/api/register", {
        email,
        username,
        password,
      });

      if (response.data.token) {
        window.localStorage.setItem("praetorAuthToken", response.data.token);
      }
      setCurrentUser(response.data.user);
      setGetCurrentUser(true);
      setGetUserProjects(true);
      navigate("/home");
    } catch (error) {
      const data = error.response?.data;
      if (data && typeof data === "object") {
        setErrors((current) => ({ ...current, ...data }));
      }
      setFormError("Rejestracja nie powiodła się. Sprawdź dane i spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <Form onSubmit={register}>
        <h3>Utwórz konto PRAETOR</h3>
        {formError && <Alert variant="danger">{formError}</Alert>}

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Adres e-mail</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicUsername">
          <Form.Label>Nazwa użytkownika</Form.Label>
          <Form.Control
            type="text"
            placeholder="praetor-user"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            isInvalid={!!errors.username}
          />
          <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Minimum 8 znaków"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
          <Form.Label>Potwierdź hasło</Form.Label>
          <Form.Control
            type="password"
            placeholder="Powtórz hasło"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            isInvalid={!!errors.confirmPassword}
          />
          <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
        </Form.Group>

        <Button id="form_btn" variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Tworzenie konta..." : "Utwórz konto"}
        </Button>
      </Form>
    </div>
  );
};

export default RegistrationForm;
