import React, { useEffect, useState } from "react";
import { Alert, Container, Spinner, Tab, Tabs } from "react-bootstrap";
import { useParams } from "react-router-dom";

import client from "../../axiosClient";
import Chat from "../chat/Chat";
import AuditRunPanel from "./AuditRunPanel";
import "./ProjectAnalysis.css";
import ProjectSuggestions from "./ProjectSuggestions";

const SECTION_MAP = {
  "Jakosc kodu": ["readability", "structure", "principles"],
  "Architektura i projekt": ["modularity", "extensibility", "design_patterns"],
  Bezpieczenstwo: ["input_validation", "permission_management", "vulnerabilities"],
  Testowalnosc: ["test_coverage", "test_quality", "test_automation"],
  Wydajnosc: ["performance"],
  Dokumentacja: ["comments_quality", "documentation", "installation_instructions"],
  "Dobre praktyki": ["coding_style", "tools_usage"],
};

const FIELD_LABELS = {
  readability: "Czytelnosc",
  structure: "Struktura",
  principles: "Zasady (DRY / KISS / YAGNI)",
  modularity: "Modularnosc",
  extensibility: "Rozszerzalnosc",
  design_patterns: "Wzorce projektowe i spojnosc",
  input_validation: "Walidacja danych wejsciowych",
  permission_management: "Zarzadzanie uprawnieniami",
  vulnerabilities: "Unikanie podatnosci",
  test_coverage: "Pokrycie testami",
  test_quality: "Jakosc testow",
  test_automation: "Automatyzacja testow",
  performance: "Wydajnosc",
  comments_quality: "Komentarze w kodzie",
  documentation: "Dokumentacja techniczna",
  installation_instructions: "Instrukcja uruchomienia",
  coding_style: "Styl kodowania",
  tools_usage: "CI/CD i narzedzia",
};

const ProjectAnalysis = () => {
  const { projectId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [expandedFields, setExpandedFields] = useState({});
  const [project, setProject] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [activeTab, setActiveTab] = useState("audit");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await client.get(`/api/projects/${projectId}/`);
        setProject(response.data);
      } catch (error) {
        console.error("Project loading failed:", error);
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
        setAnalysisError("Raport LLM nie zostal jeszcze wygenerowany dla tego projektu.");
        console.error("Analysis loading failed:", error);
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
          Analiza projektu: {project ? project.name : "(ladowanie...)"}
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
      <Tab eventKey="audit" title="Audit run">
        <AuditRunPanel projectId={projectId} project={project} onAskAssistant={() => setActiveTab("chat")} />
      </Tab>

      <Tab eventKey="analysis" title="Raport LLM">
        {renderLegacyAnalysis()}
      </Tab>

      <Tab eventKey="suggestions" title="Sugestie ulepszen">
        <ProjectSuggestions projectId={projectId} />
      </Tab>

      <Tab eventKey="chat" title="Czat z asystentem">
        <Chat projectId={projectId} />
      </Tab>
    </Tabs>
  );
};

export default ProjectAnalysis;
