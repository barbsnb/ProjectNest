import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Button, Tabs, Tab } from "react-bootstrap";
import "./ProjectAnalysis.css";
import { useNavigate } from "react-router-dom";
import DevPath from "./DevPath"


const SECTION_MAP = {
  "Jakość kodu": ["readability", "structure", "principles"],
  "Architektura i projekt": ["modularity", "extensibility", "design_patterns"],
  "Bezpieczeństwo": ["input_validation", "permission_management", "vulnerabilities"],
  "Testowalność": ["test_coverage", "test_quality", "test_automation"],
  "Wydajność": ["performance"],
  "Dokumentacja": ["comments_quality", "documentation", "installation_instructions"],
  "Dobre praktyki": ["coding_style", "tools_usage"],
};

const FIELD_LABELS = {
  readability: "Czytelność",
  structure: "Struktura",
  principles: "Zasady (DRY / KISS / YAGNI)",
  modularity: "Modularność",
  extensibility: "Rozszerzalność",
  design_patterns: "Wzorce projektowe i spójność",
  input_validation: "Walidacja danych wejściowych",
  permission_management: "Zarządzanie uprawnieniami",
  vulnerabilities: "Unikanie podatności",
  test_coverage: "Pokrycie testami",
  test_quality: "Jakość testów",
  test_automation: "Automatyzacja testów",
  performance: "Wydajność",
  comments_quality: "Komentarze w kodzie",
  documentation: "Dokumentacja techniczna",
  installation_instructions: "Instrukcja uruchomienia",
  coding_style: "Styl kodowania",
  tools_usage: "CI/CD i narzędzia",
};

const ProjectAnalysis = () => {
  const { projectId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [expandedFields, setExpandedFields] = useState({});
  const navigate = useNavigate();



  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/analysis/${projectId}/`, { withCredentials: true });
        setAnalysis(response.data);
      } catch (error) {
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
        } else {
          console.error("Błąd:", error.message);
        }
      }
    };

    fetchAnalysis();
  }, [projectId]);

  if (!analysis) {
    return <div>Ładowanie analizy...</div>;
  }

  return (
    <Tabs defaultActiveKey="analysis" id="analysis-tabs">
      <Tab eventKey="analysis" title="Analiza projektu">
        <Container className="analysis-container">

          <h2 className="analysis-header">Analiza projektu</h2>
          <div className="section-cards">
            {Object.entries(SECTION_MAP).map(([sectionTitle, fields]) => (
              <div key={sectionTitle} className="section-card">
                <h3>{sectionTitle}</h3>
                {fields.map((field) => {
                const content = analysis[field] || "Brak danych.";
                const isExpanded = expandedFields[field];

                const toggleExpanded = () => {
                    setExpandedFields((prev) => ({
                    ...prev,
                    [field]: !prev[field],
                    }));
                };

                return (
                    <div
                    key={field}
                    className={`analysis-field ${isExpanded ? "expanded" : ""}`}
                    onClick={toggleExpanded}
                    title="Kliknij, aby rozwinąć / zwinąć"
                    style={{ cursor: "pointer" }}
                    >
                    <strong>{FIELD_LABELS[field]}:</strong>
                    <p>{content}</p>
                    </div>
                );
                })}
              </div>
            ))}
          </div>
        </Container>
      </Tab>

      <Tab eventKey="path" title="Ścieżka rozwoju">
        <DevPath developmentPath={analysis.development_path} />
      </Tab>
    </Tabs>
  );
};

export default ProjectAnalysis;
