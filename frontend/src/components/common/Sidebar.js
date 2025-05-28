import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button} from "react-bootstrap";
import './Sidebar.css';
import { Home, FilePlus } from 'lucide-react';
import { UserProjectsContext } from '../../contexts/UserProjectsContext';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { userProjects } = useContext(UserProjectsContext);
  const [filter, setFilter] = useState('');

  const goTo = (path) => {
    navigate(path);
  };

  const goToAnalysis = (projectId) => {
    navigate(`/analysis/${projectId}`);
  };

  // Filtrujemy projekty wg wpisanego tekstu (case insensitive)
  const filteredProjects = userProjects.filter(project =>
    project.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <button onClick={() => goTo('/home')}>
          <Home size={18} /> <span>Strona główna</span>
        </button>
        <button onClick={() => goTo('/project')}>
          <FilePlus size={18} /> <span>Nowy projekt</span>
        </button>

        {/* Nowy przycisk do rozpoczęcia czatu */}
        
        <Button 
            id="chat_btn"
            onClick={() => navigate('/project')}
        >
            Rozpocznij czat
        </Button>

        <div style={{ marginTop: '1rem', padding: '0 0.5rem' }}>
          <h5 style={{ marginBottom: '0.3rem' }}>Twoje analizy</h5>
          <div className="section-divider"></div>
        </div>

        {/* Pole do filtrowania */}
        <div className="sidebar-filter" style={{ marginTop: '0rem', padding: '0 0.5rem' }}>
          <input
            type="text"
            placeholder="Filtruj projekty..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Lista projektów */}
        <div className="sidebar-projects" style={{ marginTop: '1rem' }}>
          {filteredProjects.length === 0 ? (
            <p>Brak dopasowanych projektów.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {filteredProjects.map(project => (
                <li key={project.id} style={{ marginBottom: '0.3rem' }}>
                  <button
                    onClick={() => goToAnalysis(project.id)}
                    className="sidebar-project-item"
                    type="button"
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
