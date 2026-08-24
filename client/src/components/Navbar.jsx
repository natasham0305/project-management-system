import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/team": "Team",
};

function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage = pageTitles[location.pathname] || "Workspace";

  return (
    <header className="navbar">
      <div className="breadcrumb">
        <span>Workspace</span>
        <b>/</b>
        <strong>{currentPage}</strong>
      </div>

      <div className="navbar-actions">
        <button className="icon-button" aria-label="Search">
          ⌕
        </button>

        <button className="icon-button notification" aria-label="Notifications">
          ♢<span></span>
        </button>

        <div className="user-area">
          <div className="navbar-avatar">
            {user?.username?.charAt(0).toUpperCase() || "N"}
          </div>

          <div className="user-info">
            <strong>{user?.username || "User"}</strong>
            <span>{user?.role || ""}</span>
          </div>

          <button type="button" className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
