import React, { useMemo, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Table } from "react-bootstrap";

import client from "../../axiosClient";

const severityVariant = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "secondary",
  info: "info",
};

const statusVariant = {
  queued: "secondary",
  ingesting: "info",
  analyzing: "primary",
  completed: "success",
  failed: "danger",
};

const runSteps = ["queued", "ingesting", "analyzing", "completed"];

const AuditRunPanel = ({ projectId, project }) => {
  const [run, setRun] = useState(null);
  const [findings, setFindings] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);
  const [error, setError] = useState("");

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const severityMatches = severityFilter === "all" || finding.severity === severityFilter;
      const categoryMatches = categoryFilter === "all" || finding.category === categoryFilter;
      return severityMatches && categoryMatches;
    });
  }, [findings, severityFilter, categoryFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(findings.map((finding) => finding.category))).sort();
  }, [findings]);

  const runAudit = async () => {
    setError("");
    setIsRunning(true);
    setFindings([]);

    try {
      const response = await client.post(`/api/projects/${projectId}/analysis-runs/`);
      setRun(response.data);
      if (response.data.status === "completed") {
        await loadFindings(response.data.id);
      }
      if (response.data.status === "failed") {
        setError(response.data.error_message || "Audyt zakonczyl sie bledem.");
      }
    } catch (error) {
      setError("Nie udalo sie uruchomic audytu.");
      console.error("Audit run failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const loadFindings = async (runId) => {
    setIsLoadingFindings(true);
    try {
      const response = await client.get(`/api/analysis-runs/${runId}/findings/`);
      setFindings(response.data);
    } catch (error) {
      setError("Nie udalo sie pobrac wynikow audytu.");
      console.error("Findings loading failed:", error);
    } finally {
      setIsLoadingFindings(false);
    }
  };

  const currentStatus = isRunning ? "analyzing" : run?.status || "queued";

  return (
    <div className="audit-panel">
      <div className="audit-panel-header">
        <div>
          <p className="audit-kicker">Deterministic pipeline</p>
          <h2>{project ? project.name : "Audit run"}</h2>
        </div>
        <div className="audit-header-actions">
          {run && (
            <Badge bg={statusVariant[run.status] || "secondary"} className="audit-status-badge">
              {run.status}
            </Badge>
          )}
          <Button type="button" onClick={runAudit} disabled={isRunning}>
            {isRunning ? "Analyzing..." : "Run audit"}
          </Button>
        </div>
      </div>

      {error && <Alert variant={run?.status === "failed" ? "warning" : "danger"}>{error}</Alert>}

      <div className="audit-progress">
        {runSteps.map((step) => (
          <div
            key={step}
            className={`audit-step ${
              run?.status === "failed"
                ? "failed"
                : runSteps.indexOf(step) <= runSteps.indexOf(currentStatus)
                  ? "active"
                  : ""
            }`}
          >
            <span>{step}</span>
          </div>
        ))}
      </div>

      {isRunning && (
        <div className="audit-loading">
          <Spinner animation="border" size="sm" />
          <span>Uruchamiam skany deterministyczne i normalizuje findings.</span>
        </div>
      )}

      {run && (
        <div className="audit-summary-grid">
          <div>
            <span>Score</span>
            <strong>{run.score_total}/100</strong>
          </div>
          <div>
            <span>Findings</span>
            <strong>{run.findings_count}</strong>
          </div>
          <div>
            <span>Started</span>
            <strong>{new Date(run.started_at).toLocaleString()}</strong>
          </div>
          <div>
            <span>Finished</span>
            <strong>{run.finished_at ? new Date(run.finished_at).toLocaleString() : "-"}</strong>
          </div>
        </div>
      )}

      <div className="audit-filters">
        <Form.Group controlId="severityFilter">
          <Form.Label>Severity</Form.Label>
          <Form.Select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="categoryFilter">
          <Form.Label>Category</Form.Label>
          <Form.Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {isLoadingFindings ? (
        <div className="audit-loading">
          <Spinner animation="border" size="sm" />
          <span>Laduje findings...</span>
        </div>
      ) : filteredFindings.length > 0 ? (
        <div className="audit-table-wrap">
          <Table responsive hover className="audit-findings-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Category</th>
                <th>Title</th>
                <th>File path</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((finding) => (
                <tr key={finding.id}>
                  <td>
                    <Badge bg={severityVariant[finding.severity] || "secondary"}>{finding.severity}</Badge>
                  </td>
                  <td>{finding.category}</td>
                  <td>
                    <strong>{finding.title}</strong>
                    <p>{finding.recommendation}</p>
                  </td>
                  <td>
                    {finding.file_path || "-"}
                    {finding.line_start ? `:${finding.line_start}` : ""}
                  </td>
                  <td>{finding.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <Alert variant="light" className="audit-empty-state">
          {run ? "Brak findings dla wybranych filtrow." : "Uruchom audyt, aby zobaczyc findings."}
        </Alert>
      )}
    </div>
  );
};

export default AuditRunPanel;
