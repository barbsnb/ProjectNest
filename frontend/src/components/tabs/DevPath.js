import React from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import "./DevPath.css";

const DevPath = ({
  personalizedRecommendations,
  competenceMap,
  suggestedMaterials,
  progressTracker,
}) => {
  return (
    <Container className="development-path-container mt-3">
      <h3 className="development-path-header">Plan rozwoju</h3>
      <Tabs defaultActiveKey="recommendations" id="devpath-tabs">
        <Tab eventKey="recommendations" title="Rekomendacje">
          <div className="development-path-section">
            <h4>Rekomendacje</h4>
            <p>{personalizedRecommendations || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="competences" title="Mapa kompetencji">
          <div className="development-path-section">
            <h4>Mapa kompetencji</h4>
            <p>{competenceMap || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="materials" title="Materiały">
          <div className="development-path-section">
            <h4>Proponowane materiały</h4>
            <p>{suggestedMaterials || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="progress" title="Postęp">
          <div className="development-path-section">
            <h4>Śledzenie postępu</h4>
            <p>{progressTracker || "Brak danych."}</p>
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default DevPath;
