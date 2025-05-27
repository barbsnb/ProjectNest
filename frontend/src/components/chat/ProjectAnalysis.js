import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container } from "react-bootstrap";
import "./ProjectAnalysis.css";

const ProjectAnalysis = () => {
  const { projectId } = useParams();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        console.log(`${projectId}`);
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
    <Container className="analysis-container">
      <h2 className="analysis-header">Analiza projektu</h2>
      <div className="info-cards">
        {Object.entries(analysis).map(([key, value]) => {
          if (["id", "project", "created_at"].includes(key)) return null;

          return (
            <div key={key} className="info-card">
              <h2>{formatKey(key)}</h2>
              <p>{value || "Brak danych."}</p>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

const formatKey = (key) => {
  const map = {
    readability: "Czytelność",
    structure: "Struktura",
    // Dodane/poprawione tłumaczenia:
    principles: "Zasady (DRY / KISS / YAGNI)", // Zgodnie z nazwą pola w modelu
    modularity: "Modularność",
    extensibility: "Rozszerzalność",
    design_patterns: "Wzorce projektowe i spójność", // Zgodnie z nazwą pola w modelu
    input_validation: "Walidacja danych wejściowych", // Zgodnie z nazwą pola w modelu
    permission_management: "Zarządzanie uprawnieniami", // Zgodnie z nazwą pola w modelu
    vulnerabilities: "Unikanie podatności", // Krótsza, ale nadal zgodna
    test_coverage: "Pokrycie testami", // Zgodnie z nazwą pola w modelu
    test_quality: "Jakość testów",
    test_automation: "Automatyzacja testów",
    performance: "Wydajność",
    comments_quality: "Komentarze w kodzie", // Zgodnie z nazwą pola w modelu
    documentation: "Dokumentacja techniczna", // Zgodnie z nazwą pola w modelu
    installation_instructions: "Instrukcja uruchomienia", // Zgodnie z nazwą pola w modelu
    coding_style: "Styl kodowania",
    tools_usage: "CI/CD i narzędzia", // Zgodnie z nazwą pola w modelu
  };

  return map[key] || key;
};


export default ProjectAnalysis;
