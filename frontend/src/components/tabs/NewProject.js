import React, { useContext, useState } from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { ChatContext } from '../../contexts/ChatContext';
import { UserProjectsContext } from '../../contexts/UserProjectsContext';
import client from '../../axiosClient';
import './NewProject.css';
import { useNavigate } from 'react-router-dom';

const NewProject = () => {
  const { currentUser } = useContext(AuthContext);
  const { setChatStarted, setProjectData } = useContext(ChatContext);
  const { setGetUserProjects } = useContext(UserProjectsContext);

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Nazwa projektu jest wymagana';
    }

    if (!description.trim()) {
      errors.description = 'Opis projektu jest wymagany';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleSubmit = (event) => {
  event.preventDefault();
  if (!validate()) return;

  setIsLoading(true);

  client
    .post("/api/project/", {
      name,
      description,
      user: currentUser.user.user_id,
    }, { withCredentials: true })
    .then((response) => {
      const projectId = response.data.id;
      setProjectData(response.data);
      setGetUserProjects(true);

      // 🔹 TWORZENIE SESJI CZATU
      return client
        .post("/api/chat/sessions/", {
          project_id: projectId,
          title: "Rozmowa z asystentem",
        }, { withCredentials: true })
        .then((sessionRes) => {
          console.log("Utworzono sesję:", sessionRes.data.session_id);

          // 🔹 GENERUJ ANALIZĘ
          return client.post(`/api/project/${projectId}/generate_analysis/`);
        })
        .then((analysisRes) => {
          console.log("Analiza:", analysisRes.data.data);

          // 🔹 GENERUJ SUGESTIE
          return client.post(`/api/project/${projectId}/generate_suggestions/`);
        })
        .then((suggestionsRes) => {
          console.log("Sugestie:", suggestionsRes.data.data);
          setChatStarted(true);
          navigate(`/analysis/${projectId}`);
        });
    })
    .catch((error) => {
      console.error("Błąd:", error);
    })
    .finally(() => setIsLoading(false));
};


  return (
    <div className="login-page-wrapper">
      <div className="form-container">
        {isLoading ? (
          <div className="loading-container text-center py-4">
            <p className="analysis-header">Analizuję przekazane dane...</p>
            <Spinner animation="border" style={{ color: '#333' }} />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group controlId="formProjectName">
                  <Form.Label>Nazwa projektu</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wprowadź nazwę projektu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formProjectDescription" className="mt-3">
                  <Form.Label>Opis projektu</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Wprowadź opis projektu"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button id="form_btn" variant="primary" type="submit" className="mt-4">
                  Rozpocznij czat z asystentem
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    </div>
  );
};

export default NewProject;
