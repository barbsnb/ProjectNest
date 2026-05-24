import React, { useContext, useMemo, useState } from "react";
import { BarChart3, FilePlus, Gauge, Home, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { UserProjectsContext } from "../../contexts/UserProjectsContext";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProjects } = useContext(UserProjectsContext);
  const [filter, setFilter] = useState("");

  const filteredProjects = useMemo(() => {
    return userProjects.filter((project) => project.name.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, userProjects]);

  const isActive = (path) => location.pathname === path;
  const isProjectActive = (projectId) => location.pathname === `/analysis/${projectId}`;

  return (
    <aside className="sidebar-container">
      <div className="sidebar-section">
        <p className="sidebar-label">Obszar pracy</p>
        <button className={isActive("/home") ? "active" : ""} onClick={() => navigate("/home")} type="button">
          <Home size={18} />
          <span>Panel</span>
        </button>
        <button className={isActive("/project") ? "active" : ""} onClick={() => navigate("/project")} type="button">
          <FilePlus size={18} />
          <span>Nowy audyt</span>
        </button>
        <button className={isActive("/devpath") ? "active" : ""} onClick={() => navigate("/devpath")} type="button">
          <Gauge size={18} />
          <span>Plan rozwoju</span>
        </button>
      </div>

      <div className="sidebar-section audits-section">
        <div className="sidebar-title-row">
          <p className="sidebar-label">Audyty</p>
          <span>{userProjects.length}</span>
        </div>
        <div className="sidebar-filter">
          <Search size={15} />
          <input
            type="text"
            placeholder="Filtruj audyty"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>

        <div className="sidebar-projects">
          {filteredProjects.length === 0 ? (
            <p className="sidebar-empty">Brak pasujących audytów.</p>
          ) : (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                className={isProjectActive(project.id) ? "sidebar-project-item active" : "sidebar-project-item"}
                onClick={() => navigate(`/analysis/${project.id}`)}
                type="button"
              >
                <BarChart3 size={16} />
                <span>{project.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
