import React from "react";
import { Container } from "react-bootstrap";
import "./DevPath.css";

const DevPath = ({ developmentPath }) => {
  return (
    <Container className="development-path-container mt-3">
      <h3 className="development-path-header">Propozycja ścieżki rozwoju</h3>
      <p className="development-path-content">
        {developmentPath || "Brak danych."}
      </p>
    </Container>
  );
};

export default DevPath;
