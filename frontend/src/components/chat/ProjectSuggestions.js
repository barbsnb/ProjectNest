import React from "react";
import { Container } from "react-bootstrap";
import "./ProjectSuggestions.css";

const ProjectSuggestions = ({ suggestionPath }) => {
  return (
    <Container className="suggestion-container mt-3">
      <h3 className="suggestion-header">Sugestie ulepszeń</h3>
      <p className="suggestion-content">
        {suggestionPath || "Brak danych."}
      </p>
    </Container>
  );
};

export default ProjectSuggestions;
