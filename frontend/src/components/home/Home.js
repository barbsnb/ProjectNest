import React, { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Spinner } from "react-bootstrap";
import { ArrowRight, BarChart3, Clock, FilePlus, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import client from "../../axiosClient";
import { AuthContext } from "../../contexts/AuthContext";
import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import { labelOrValue, statusLabels } from "../../utils/auditLabels";
import "./Home.css";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const Home = () => {
  const { currentUser, authLoading } = useContext(AuthContext);
  const { userProjects } = useContext(UserProjectsContext);
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  useEffect(() => {
    const loadSummaries = async () => {
      if (!userProjects.length) {
        setSummaries({});
        return;
      }

      setLoadingSummaries(true);
      try {
        const responses = await Promise.all(
          userProjects.map((project) =>
            client
              .get(`/api/projects/${project.id}/report-summary/`)
              .then((response) => [project.id, response.data])
              .catch(() => [project.id, null])
          )
        );
        setSummaries(Object.fromEntries(responses));
      } finally {
        setLoadingSummaries(false);
      }
    };

    loadSummaries();
  }, [userProjects]);

  const dashboardStats = useMemo(() => {
    const summaryList = Object.values(summaries).filter(Boolean);
    return {
      audits: userProjects.length,
      completed: summaryList.filter((summary) => summary.status === "completed").length,
      critical: summaryList.reduce((total, summary) => total + (summary.critical_count || 0), 0),
      high: summaryList.reduce((total, summary) => total + (summary.high_count || 0), 0),
    };
  }, [summaries, userProjects.length]);

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <Spinner animation="border" size="sm" />
        <span>Ładowanie przestrzeni roboczej...</span>
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="page-kicker">Przestrzeń audytów</p>
          <h1>Audyty projektów</h1>
          <p className="page-subtitle">
            {currentUser?.username ? `${currentUser.username}, ` : ""}sprawdź ryzyka repozytorium w jednym widoku.
          </p>
        </div>
        <Button onClick={() => navigate("/project")} className="primary-action">
          <FilePlus size={17} />
          Nowy audyt
        </Button>
      </div>

      <div className="dashboard-metrics">
        <div>
          <span>Wszystkie audyty</span>
          <strong>{dashboardStats.audits}</strong>
        </div>
        <div>
          <span>Zakończone analizy</span>
          <strong>{dashboardStats.completed}</strong>
        </div>
        <div>
          <span>Krytyczne problemy</span>
          <strong>{dashboardStats.critical}</strong>
        </div>
        <div>
          <span>Wysokie problemy</span>
          <strong>{dashboardStats.high}</strong>
        </div>
      </div>

      {loadingSummaries && (
        <div className="dashboard-loading">
          <Spinner animation="border" size="sm" />
          <span>Odświeżanie podsumowań audytów...</span>
        </div>
      )}

      {userProjects.length === 0 ? (
        <Alert variant="light" className="dashboard-empty">
          Nie masz jeszcze audytów. Utwórz pierwszy audyt z linku do repozytorium GitHub.
        </Alert>
      ) : (
        <div className="audit-card-grid">
          {userProjects.map((project) => {
            const summary = summaries[project.id];
            const latestRun = summary?.latest_run;
            const topFinding = summary?.top_findings?.[0];

            return (
              <article key={project.id} className="audit-card">
                <div className="audit-card-top">
                  <div className="audit-card-icon">
                    <BarChart3 size={20} />
                  </div>
                  <Badge bg={summary?.status === "completed" ? "success" : "secondary"}>
                    {labelOrValue(statusLabels, summary?.status || "not_started")}
                  </Badge>
                </div>
                <h2>{project.name}</h2>
                <p>{project.repo_url || project.description || "Audyt repozytorium"}</p>
                <div className="audit-card-facts">
                  <div>
                    <ShieldAlert size={15} />
                    <span>{summary ? `${summary.critical_count || 0} krytyczne / ${summary.high_count || 0} wysokie` : "-"}</span>
                  </div>
                  <div>
                    <Clock size={15} />
                    <span>{formatDate(latestRun?.finished_at || project.updated_at)}</span>
                  </div>
                </div>
                {topFinding && (
                  <div className="audit-card-risk">
                    <span>Najważniejsze ryzyko</span>
                    <strong>{topFinding.title}</strong>
                  </div>
                )}
                <Button variant="outline-primary" onClick={() => navigate(`/analysis/${project.id}`)}>
                  Otwórz raport
                  <ArrowRight size={16} />
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Home;
