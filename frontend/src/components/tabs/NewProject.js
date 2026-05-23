import React, { useContext, useState } from "react";
import { Alert, Badge, Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import client from "../../axiosClient";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import "./NewProject.css";

const STATUS_LABELS = {
  idle: "Ready",
  validating: "Validating URL",
  ingesting: "Indexing repository",
  indexed: "Repository indexed",
  failed: "Failed",
};

const isValidGithubUrl = (value) => {
  try {
    const parsed = new URL(value.trim());
    const pathParts = parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    return ["http:", "https:"].includes(parsed.protocol) && parsed.hostname === "github.com" && pathParts.length === 2;
  } catch {
    return false;
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (!data) return "Nie udalo sie utworzyc audytu. Sprobuj ponownie.";
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  if (data.repo_url) return data.repo_url.join ? data.repo_url.join(" ") : data.repo_url;
  return "Nie udalo sie utworzyc audytu. Sprawdz dane i sprobuj ponownie.";
};

const NewProject = () => {
  const { setGetUserProjects } = useContext(UserProjectsContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [projectId, setProjectId] = useState(null);

  const isLoading = status === "validating" || status === "ingesting";

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) {
      nextErrors.name = "Nazwa audytu jest wymagana.";
    }
    if (!repoUrl.trim()) {
      nextErrors.repoUrl = "Link GitHub jest wymagany.";
    } else if (!isValidGithubUrl(repoUrl)) {
      nextErrors.repoUrl = "Podaj publiczny URL w formacie https://github.com/owner/repo.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSnapshot(null);

    if (!validate()) {
      setStatus("idle");
      return;
    }

    try {
      setStatus("validating");
      const projectResponse = await client.post("/api/project/", {
        name: name.trim(),
        description: description.trim(),
        repo_url: repoUrl.trim(),
      });

      const createdProjectId = projectResponse.data.id;
      setProjectId(createdProjectId);
      setStatus("ingesting");

      const ingestResponse = await client.post(`/api/projects/${createdProjectId}/ingest/`);
      await client.post("/api/chat/sessions/", {
        project_id: createdProjectId,
        title: "Rozmowa z audytorem",
      });

      setSnapshot(ingestResponse.data);
      setGetUserProjects(true);
      setStatus("indexed");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      setStatus("failed");
    }
  };

  return (
    <div className="new-audit-page">
      <div className="new-audit-shell">
        <div className="new-audit-header">
          <div>
            <p className="new-audit-kicker">PRAETOR</p>
            <h1>New Audit</h1>
          </div>
          <Badge bg={status === "failed" ? "danger" : status === "indexed" ? "success" : "secondary"}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>

        <Form onSubmit={handleSubmit} className="new-audit-form">
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {snapshot && (
            <Alert variant="success" className="new-audit-result">
              <div className="result-title">Repozytorium zostalo zindeksowane.</div>
              <div className="result-grid">
                <span>Branch</span>
                <strong>{snapshot.branch || "-"}</strong>
                <span>Commit</span>
                <strong>{snapshot.commit_sha ? snapshot.commit_sha.slice(0, 12) : "-"}</strong>
                <span>Pliki tekstowe</span>
                <strong>{snapshot.file_count}</strong>
                <span>Rozmiar indeksu</span>
                <strong>{formatBytes(snapshot.total_size_bytes)}</strong>
              </div>
            </Alert>
          )}

          <Row>
            <Col lg={6}>
              <Form.Group controlId="formProjectName">
                <Form.Label>Nazwa audytu</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="np. SaaS MVP backend"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  isInvalid={!!errors.name}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col lg={6}>
              <Form.Group controlId="formRepoUrl">
                <Form.Label>GitHub repository URL</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(event) => setRepoUrl(event.target.value)}
                  isInvalid={!!errors.repoUrl}
                  disabled={isLoading}
                />
                <Form.Control.Feedback type="invalid">{errors.repoUrl}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="formProjectDescription" className="mt-3">
            <Form.Label>Kontekst projektu</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Krotko opisz cel produktu, technologie albo znane ryzyka."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isLoading}
            />
          </Form.Group>

          <div className="new-audit-actions">
            {isLoading && (
              <div className="new-audit-progress">
                <Spinner animation="border" size="sm" />
                <span>{STATUS_LABELS[status]}...</span>
              </div>
            )}
            <div className="new-audit-buttons">
              {projectId && status === "indexed" && (
                <>
                  <Button variant="outline-secondary" type="button" onClick={() => navigate("/home")}>
                    Wroc do projektow
                  </Button>
                  <Button variant="outline-primary" type="button" onClick={() => navigate(`/analysis/${projectId}`)}>
                    Przejdz do audytu
                  </Button>
                </>
              )}
              <Button id="form_btn" variant="primary" type="submit" disabled={isLoading}>
                {status === "indexed" ? "Utworz kolejny audyt" : "Index repository"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default NewProject;
