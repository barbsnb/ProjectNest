import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import { MessageSquare, Play, Search } from "lucide-react";

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
  not_started: "secondary",
};

const sourceLabels = {
  tool: "Tool",
  ai: "AI",
};

const riskOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

const AuditRunPanel = ({ projectId, project, onAskAssistant }) => {
  const [summary, setSummary] = useState(null);
  const [run, setRun] = useState(null);
  const [findings, setFindings] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const response = await client.get(`/api/projects/${projectId}/report-summary/`);
      setSummary(response.data);
      setRun(response.data.latest_run);
      if (response.data.top_findings?.length) {
        setSelectedFinding(response.data.top_findings[0]);
      }
      return response.data;
    } catch (error) {
      setError("Nie udalo sie pobrac podsumowania raportu.");
      console.error("Report summary loading failed:", error);
      return null;
    } finally {
      setIsLoadingSummary(false);
    }
  }, [projectId]);

  const loadFindings = useCallback(
    async (runId, nextPage = 1) => {
      if (!runId) {
        setFindings([]);
        return;
      }

      setIsLoadingFindings(true);
      try {
        const params = new URLSearchParams({ page: String(nextPage), page_size: "25" });
        if (severityFilter !== "all") params.set("severity", severityFilter);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        if (search.trim()) params.set("search", search.trim());

        const response = await client.get(`/api/analysis-runs/${runId}/findings/?${params.toString()}`);
        const data = response.data.results ? response.data : { results: response.data, count: response.data.length };
        setFindings(data.results);
        setPagination({ count: data.count || 0, next: data.next, previous: data.previous });
        if (!selectedFinding && data.results.length) {
          setSelectedFinding(data.results[0]);
        }
      } catch (error) {
        setError("Nie udalo sie pobrac wynikow audytu.");
        console.error("Findings loading failed:", error);
      } finally {
        setIsLoadingFindings(false);
      }
    },
    [categoryFilter, search, selectedFinding, severityFilter, sourceFilter]
  );

  useEffect(() => {
    loadSummary().then((data) => {
      if (data?.latest_run?.id) {
        loadFindings(data.latest_run.id, 1);
      }
    });
  }, [loadFindings, loadSummary]);

  useEffect(() => {
    if (run?.id) {
      setPage(1);
      loadFindings(run.id, 1);
    }
  }, [categoryFilter, severityFilter, sourceFilter, search, run?.id, loadFindings]);

  const categories = useMemo(() => {
    const fromSummary = Object.keys(summary?.category_counts || {});
    const fromFindings = findings.map((finding) => finding.category);
    return Array.from(new Set([...fromSummary, ...fromFindings])).sort();
  }, [findings, summary]);

  const topFindings = useMemo(() => {
    const risks = summary?.top_findings || [];
    return [...risks].sort((a, b) => riskOrder[a.severity] - riskOrder[b.severity]).slice(0, 3);
  }, [summary]);

  const runAudit = async () => {
    setError("");
    setIsRunning(true);
    setFindings([]);
    setSelectedFinding(null);

    try {
      const response = await client.post(`/api/projects/${projectId}/analysis-runs/`);
      setRun(response.data);
      const nextSummary = await loadSummary();
      const runId = nextSummary?.latest_run?.id || response.data.id;
      await loadFindings(runId, 1);
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

  const goToPage = (nextPage) => {
    setPage(nextPage);
    loadFindings(run.id, nextPage);
  };

  const agentResults = summary?.agent_results || run?.agent_results || [];
  const categoryScores = summary?.category_scores || run?.category_scores || {};
  const criticalHighCount = (summary?.critical_count || 0) + (summary?.high_count || 0);

  return (
    <div className="report-page">
      <div className="report-header">
        <div>
          <p className="audit-kicker">Repository report</p>
          <h1>{project ? project.name : "Audit report"}</h1>
          <p>{project?.repo_url || "Run an audit to generate a repository risk report."}</p>
        </div>
        <Button type="button" onClick={runAudit} disabled={isRunning} className="run-audit-button">
          {isRunning ? <Spinner animation="border" size="sm" /> : <Play size={16} />}
          {isRunning ? "Analyzing" : "Run audit"}
        </Button>
      </div>

      {error && <Alert variant={run?.status === "failed" ? "warning" : "danger"}>{error}</Alert>}

      <div className="report-overview-grid">
        <div className="score-card">
          <span>Total score</span>
          {isLoadingSummary ? <div className="skeleton-line wide" /> : <strong>{summary?.score_total ?? "-"}</strong>}
          <p>{summary?.status || "not_started"}</p>
        </div>
        <div>
          <span>Critical / High</span>
          {isLoadingSummary ? <div className="skeleton-line" /> : <strong>{criticalHighCount}</strong>}
          <p>{summary?.critical_count || 0} critical, {summary?.high_count || 0} high</p>
        </div>
        <div>
          <span>Findings</span>
          {isLoadingSummary ? <div className="skeleton-line" /> : <strong>{run?.findings_count ?? 0}</strong>}
          <p>{pagination.count || run?.findings_count || 0} visible in current report</p>
        </div>
        <div>
          <span>Last analysis</span>
          {isLoadingSummary ? (
            <div className="skeleton-line" />
          ) : (
            <strong>{run?.finished_at ? new Date(run.finished_at).toLocaleDateString() : "-"}</strong>
          )}
          <p>
            <Badge bg={statusVariant[summary?.status] || "secondary"}>{summary?.status || "not_started"}</Badge>
          </p>
        </div>
      </div>

      <section className="top-risk-section">
        <div className="section-heading-row">
          <div>
            <h2>Top 3 risks</h2>
            <p>Most important findings to review first.</p>
          </div>
        </div>
        <div className="top-risk-grid">
          {isLoadingSummary ? (
            [0, 1, 2].map((item) => <div className="top-risk-card skeleton-card" key={item} />)
          ) : topFindings.length ? (
            topFindings.map((finding) => (
              <button
                key={finding.id}
                className="top-risk-card"
                type="button"
                onClick={() => setSelectedFinding(finding)}
              >
                <Badge bg={severityVariant[finding.severity] || "secondary"}>{finding.severity}</Badge>
                <strong>{finding.title}</strong>
                <span>{finding.file_path || "repository"}</span>
              </button>
            ))
          ) : (
            <Alert variant="light" className="report-empty">
              No top risks yet. Run an audit to generate prioritized findings.
            </Alert>
          )}
        </div>
      </section>

      {Object.keys(categoryScores).length > 0 && (
        <div className="category-score-grid">
          {Object.entries(categoryScores).map(([category, score]) => (
            <div key={category}>
              <span>{category}</span>
              <strong>{score}/100</strong>
            </div>
          ))}
        </div>
      )}

      {agentResults.length > 0 && (
        <section className="agent-results-section">
          <div className="agent-results-header">
            <h2>Agent Results</h2>
            <span>{agentResults.length} reviewers/tools</span>
          </div>
          <div className="agent-results-grid">
            {agentResults.map((agent) => (
              <div key={agent.id} className="agent-result-card">
                <div className="agent-result-title">
                  <strong>{agent.agent_name}</strong>
                  <Badge bg={statusVariant[agent.status] || "secondary"}>{agent.status}</Badge>
                </div>
                <p>{agent.summary || agent.error_message || "No summary."}</p>
                <div className="agent-result-meta">
                  <span>Findings: {agent.findings_count}</span>
                  <span>{agent.prompt_version || "deterministic"}</span>
                  {agent.model && <span>{agent.model}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="findings-workspace">
        <div className="findings-main">
          <div className="findings-toolbar">
            <div className="findings-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title or file path"
              />
            </div>
            <Form.Select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
              <option value="all">All severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </Form.Select>
            <Form.Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
            <Form.Select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
              <option value="all">All sources</option>
              <option value="tool">Tools</option>
              <option value="ai">AI agents</option>
            </Form.Select>
          </div>

          <div className="audit-table-wrap">
            <Table responsive hover className="audit-findings-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>File path</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingFindings ? (
                  [0, 1, 2, 3, 4].map((item) => (
                    <tr key={item}>
                      <td colSpan="6"><div className="skeleton-line table-line" /></td>
                    </tr>
                  ))
                ) : findings.length ? (
                  findings.map((finding) => (
                    <tr
                      key={finding.id}
                      className={selectedFinding?.id === finding.id ? "selected" : ""}
                      onClick={() => setSelectedFinding(finding)}
                    >
                      <td><Badge bg={severityVariant[finding.severity] || "secondary"}>{finding.severity}</Badge></td>
                      <td><span className="category-chip">{finding.category}</span></td>
                      <td><strong>{finding.title}</strong></td>
                      <td className="file-path-cell">{finding.file_path || "-"}{finding.line_start ? `:${finding.line_start}` : ""}</td>
                      <td>
                        <Badge bg={finding.source === "ai" ? "primary" : "dark"}>
                          {sourceLabels[finding.source] || finding.source}
                        </Badge>
                      </td>
                      <td>{finding.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <Alert variant="light" className="report-empty">
                        No findings match the current filters.
                      </Alert>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <div className="pagination-row">
            <span>{pagination.count} findings</span>
            <div>
              <Button variant="outline-secondary" size="sm" disabled={!pagination.previous} onClick={() => goToPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline-secondary" size="sm" disabled={!pagination.next} onClick={() => goToPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <aside className="finding-detail-panel">
          {selectedFinding ? (
            <>
              <div className="finding-detail-header">
                <Badge bg={severityVariant[selectedFinding.severity] || "secondary"}>{selectedFinding.severity}</Badge>
                <span>{selectedFinding.status}</span>
              </div>
              <h2>{selectedFinding.title}</h2>
              <dl>
                <dt>Category</dt>
                <dd>{selectedFinding.category}</dd>
                <dt>File</dt>
                <dd>{selectedFinding.file_path || "-"}{selectedFinding.line_start ? `:${selectedFinding.line_start}` : ""}</dd>
                <dt>Evidence</dt>
                <dd>{selectedFinding.evidence || "No evidence provided."}</dd>
                <dt>Description</dt>
                <dd>{selectedFinding.description}</dd>
                <dt>Recommendation</dt>
                <dd>{selectedFinding.recommendation}</dd>
                <dt>Confidence</dt>
                <dd>{Math.round((selectedFinding.confidence || 0) * 100)}%</dd>
              </dl>
              <Button type="button" onClick={() => onAskAssistant?.(selectedFinding)} className="ask-assistant-button">
                <MessageSquare size={16} />
                Ask assistant
              </Button>
            </>
          ) : (
            <Alert variant="light" className="report-empty">
              Select a finding to inspect evidence and remediation.
            </Alert>
          )}
        </aside>
      </section>
    </div>
  );
};

export default AuditRunPanel;
