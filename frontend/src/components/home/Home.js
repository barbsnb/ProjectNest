import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";  // import kontekstu
import { Row, Col, Container, Button, Card } from "react-bootstrap";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { currentUser, isLoading } = useContext(AuthContext);
  const { userProjects } = useContext(UserProjectsContext);  // pobieramy projekty z kontekstu
  const [chatStarted, setChatStarted] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const startChat = () => {
    navigate("/project"); 
  };

  return (
    <Container className="user_data_container mt-3 mb-5">
      <Row>
        <Col>
          {currentUser && currentUser.user && (
            <div>
              <div className="info_text_bold">
                <h2>
                  <strong>Witaj {currentUser.user.username}!</strong>
                </h2>
              </div>
              {!chatStarted ? (
                <Button variant="primary" onClick={startChat}>
                  Rozpocznij czat z asystentem
                </Button>
              ) : (
                <div className="chat-container mt-3">
                  <h4>Czat z asystentem rozpoczęty!</h4>
                  <p>
                    Tutaj możesz pisać wiadomości do asystenta. (Implementacja
                    czatu w trakcie)
                  </p>
                </div>
              )}

              {/* Lista projektów z kontekstu */}
              <div className="projects-list mt-5">
                <h3>Twoje projekty:</h3>
                {userProjects.length === 0 ? (
                  <p>Brak dodanych projektów.</p>
                ) : (
                  userProjects.map((project) => (
                    <Card key={project.id} className="mb-3">
                      <Card.Body>
                        <Card.Title>{project.name}</Card.Title>
                        <Card.Text>{project.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
