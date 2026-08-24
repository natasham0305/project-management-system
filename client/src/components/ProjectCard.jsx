import { useNavigate } from "react-router-dom";

function ProjectCard({
  project,
  onDelete,
  onEdit
}) {
  const navigate = useNavigate();
 
  const priorityClass =
    project.priority?.toLowerCase() || 'medium';

  const statusClass =
    project.status
      ?.toLowerCase()
      .replace(/\s+/g, '-') || 'planning';

  return (
    <article className="project-card">

      <div className="card-top">
        <div className="project-icon">
          {project.name?.charAt(0).toUpperCase()}
        </div>

        <button className="card-menu">
          ⋮
        </button>
      </div>

      <div className="card-content">

        <h3>{project.name}</h3>

        <p className="project-description">
          {project.description || 'No description provided.'}
        </p>

        <div className="project-meta">

          <div>
            <span className="meta-label">
              Priority
            </span>

            <span className={`badge priority-${priorityClass}`}>
              <i></i>
              {project.priority}
            </span>
          </div>

          <div>
            <span className="meta-label">
              Status
            </span>

            <span className={`badge status-${statusClass}`}>
              <i></i>
              {project.status}
            </span>
          </div>

        </div>
      </div>

      <div className="card-footer">

        <div className="members">
          <div className="mini-avatar avatar-one">A</div>
          <div className="mini-avatar avatar-two">J</div>
          <div className="mini-avatar avatar-three">+</div>
        </div>

        <div className="card-actions">
          <button
            className="view-button"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
           View
          </button>

          <button
            className="edit-button"
            onClick={() => onEdit(project)}
          >
            Edit
          </button>

          <button
            className="delete-button"
            onClick={() => onDelete(project.id)}
          >
            Delete
          </button>
        </div>

      </div>
    </article>
  );
}

export default ProjectCard;