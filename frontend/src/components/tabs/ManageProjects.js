import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";

import { Row, Col, Container, Card, Table } from "react-bootstrap";
import "./ManageProjects.css";

const Projects = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  const { userProjects, getUserProjects, setGetUserProjects } = useContext(UserProjectsContext);

  // Jeśli chcesz wymusić ponowne pobranie projektów np. przy jakimś zdarzeniu:
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     setGetUserProjects(true);
  //   }
  // }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Musisz być zalogowany, aby zobaczyć projekty.</div>;
  }

  return (
    <Container className="mt-3 mb-5">
      <h2>Zarządzaj projektami:</h2>

      {userProjects.length > 0 ? (
        <Row>
          {userProjects.map((project) => (
            <Col md={4} key={project.id} className="mb-4">
              <Card className="card-hover">
                <Card.Header className="card_header">
                  <strong>{project.name}</strong>
                </Card.Header>
                <Card.Body>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Opis:</strong></td>
                        <td>{project.description || "Brak opisu"}</td>
                      </tr>
                      <tr>
                        <td><strong>Data rozpoczęcia:</strong></td>
                        <td>{project.start_date}</td>
                      </tr>
                      <tr>
                        <td><strong>Data zakończenia:</strong></td>
                        <td>{project.end_date}</td>
                      </tr>
                      <tr>
                        <td><strong>Status:</strong></td>
                        <td>{project.status}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p>Brak przypisanych projektów.</p>
      )}
    </Container>
  );
};

export default Projects;
