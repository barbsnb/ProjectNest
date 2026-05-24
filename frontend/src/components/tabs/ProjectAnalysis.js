import React, { useEffect, useState } from "react";
import { Alert, Container, Spinner, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";

import client from "../../axiosClient";
import Chat from "../chat/Chat";
import AuditRunPanel from "./AuditRunPanel";
import "./ProjectAnalysis.css";
import ProjectSuggestions from "./ProjectSuggestions";

const SECTION_MAP = {
  "Jakość kodu": ["readability", "structure", "principles"],
  "Architektura i projekt": ["modularity", "extensibility", "design_patterns"],
  Bezpieczeństwo: ["input_validation", "permission_management", "vulnerabilities"],
  Testowalność: ["test_coverage", "test_quality", "test_automation"],
  Wydajność: ["performance"],
  Dokumentacja: ["comments_quality", "documentation", "installation_instructions"],
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
  const [project, setProject] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [activeTab, setActiveTab] = useState("audit");
  const [assistantContext, setAssistantContext] = useState(null);

  useEffect(() => {
    setAssistantContext(null);

    const fetchProject = async () => {
      try {
        const response = await client.get(`/api/projects/${projectId}/`);
        setProject(response.data);
      } catch (error) {
        console.error("Nie udało się pobrać projektu:", error);
      }
    };

    const fetchLegacyAnalysis = async () => {
      try {
        setAnalysisLoading(true);
        setAnalysisError("");
        const response = await client.get(`/api/analysis/${projectId}/`);
        setAnalysis(response.data);
      } catch (error) {
        setAnalysis(null);
        setAnalysisError("Raport LLM nie został jeszcze wygenerowany dla tego projektu.");
        console.error("Nie udało się pobrać raportu LLM:", error);
      } finally {
        setAnalysisLoading(false);
      }
    };

    fetchProject();
    fetchLegacyAnalysis();
  }, [projectId]);

  const renderLegacyAnalysis = () => {
    if (analysisLoading) {
      return (
        <Container className="analysis-container text-center py-4">
          <Spinner animation="border" role="status" />
        </Container>
      );
    }

    if (!analysis) {
      return (
        <Container className="analysis-container mt-3">
          <Alert variant="info">{analysisError || "Brak danych analizy LLM."}</Alert>
        </Container>
      );
    }

    return (
      <Container className="analysis-container">
        <h2 className="analysis-header">
          Analiza projektu: {project ? project.name : "(ładowanie...)"}
        </h2>
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
                    title="Kliknij, aby rozwinac lub zwinac"
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
    );
  };

  return (
    <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || "audit")} id="analysis-tabs" className="report-tabs">
      <Tab eventKey="audit" title="Audyt">
        <AuditRunPanel
          projectId={projectId}
          project={project}
          onAskAssistant={(finding) => {
            setAssistantContext(finding);
            setActiveTab("chat");
          }}
        />
      </Tab>

      <Tab eventKey="analysis" title="Raport klasyczny">
        {renderLegacyAnalysis()}
      </Tab>

      <Tab eventKey="suggestions" title="Sugestie ulepszeń">
        <ProjectSuggestions projectId={projectId} />
      </Tab>

      <Tab eventKey="chat" title="Asystent">
        <Chat projectId={projectId} findingContext={assistantContext} />
      </Tab>
    </Tabs>
  );
};

export default ProjectAnalysis;
