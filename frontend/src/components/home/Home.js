import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import { Row, Col, Container, Button, Card } from "react-bootstrap";
import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { currentUser, isLoading } = useContext(AuthContext);
  const { userProjects } = useContext(UserProjectsContext);
  const [chatStarted, setChatStarted] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const startChat = () => {
    navigate("/project");
  };

  const goToAnalysis = (projectId) => {
    navigate(`/analysis/${projectId}`);
  };

  return (
    <Container className="user_data_container mt-3 mb-5">
      <Row>
        <Col>
          {currentUser && currentUser.user && (
            <div>
              {/* Lista projektów z kontekstu */}
              <div className="projects-list mt-2">
                <h2 className="projects-heading"> Twoje analizy projektów</h2>
                {userProjects.length === 0 ? (
                  <p>Brak dodanych projektów.</p>
                ) : (
                  <div className="info-cards">
                    {userProjects.map((project) => (
                      <div key={project.id} className="info-card">
                        <h2>{project.name}</h2>
                        <p>{project.description}</p>
                        <Button 
                          id="chat_btn2"
                          onClick={() => goToAnalysis(project.id)}
                        >
                          Przejdź do analizy
                        </Button>
                      </div>
                    ))}
                  </div>
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
