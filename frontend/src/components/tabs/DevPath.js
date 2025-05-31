import React from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import "./DevPath.css";

const DevPath = ({
  personalizedRecommendations,
  competenceMap,
  suggestedMaterials,
  progressTracker,
}) => {
  return (
    <Container className="development-path-container mt-3">
      <h3 className="development-path-header">Twoja ścieżka rozwoju</h3>
      <Tabs defaultActiveKey="recommendations" id="devpath-tabs">
        <Tab eventKey="recommendations" title="Personalizowane rekomendacje">
          <div className="development-path-section">
            <h4>Personalizowane rekomendacje</h4>
            <p>{personalizedRecommendations || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="competence-map" title="Mapa kompetencji">
          <div className="development-path-section">
            <h4>Mapa kompetencji</h4>
            <p>{competenceMap || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="materials" title="Proponowane materiały">
          <div className="development-path-section">
            <h4>Proponowane materiały</h4>
            <p>{suggestedMaterials || "Brak danych."}</p>
          </div>
        </Tab>

        <Tab eventKey="progress" title="Śledź postęp">
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
