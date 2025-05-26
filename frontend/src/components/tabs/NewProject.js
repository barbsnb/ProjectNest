import React, { useContext, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../../contexts/AuthContext';
import { ChatContext } from '../../contexts/ChatContext';
import client from '../../axiosClient';
import './NewProject.css';
import { useNavigate } from 'react-router-dom';

const NewProject = () => {
  const { currentUser, setGetCurrentUser } = useContext(AuthContext);
  const { setChatStarted, setProjectData } = useContext(ChatContext);

  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projectFormToggle, setProjectFormToggle] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

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

    client.post('/api/project/', {
      name,
      description,
      user: currentUser.user.user_id,
    })
      .then(response => {
        setProject(response.data);
        setProjectData(response.data); 
        setChatStarted(true); 
        // setGetCurrentUser(true);
        setProjectFormToggle(true);
        console.log('Projekt został utworzony:', response.data);
        navigate('/chat');
      })
      .catch(error => {
        console.error('Błąd podczas tworzenia projektu:', error);
      });
  };

  return (
    <>
      {projectFormToggle ? (
        <div className="project_info">
          <h3>Nowy projekt został utworzony:</h3>
          {project && (
            <div>
              <p><strong>Nazwa:</strong> {project.name}</p>
              <p><strong>Opis:</strong> {project.description}</p>
              <Button id="form_btn" onClick={() => setProjectFormToggle(false)} variant="light">
                Dodaj kolejny projekt
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="login-page-wrapper">
          <div className="form-container">
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

                  <Form.Group controlId="formProjectDescription">
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

                  <Button id="form_btn" variant="primary">
                    Dodaj pliki źródłowe
                  </Button>

                  <Button id="form_btn" variant="primary" type="submit">
                    Rozpocznij czat z asystentem
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      )}
    </>
  );
};

export default NewProject;
