import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "⌂" },
  { to: "/projects", label: "Projects", icon: "▣" },
  { to: "/tasks", label: "Tasks", icon: "✓" },
  { to: "/team", label: "Team", icon: "♙" },
  { to: "/dashboard", label: "Favorites", icon: "☆" },
  { to: "/team", label: "Settings", icon: "⚙" },
];

function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-logo">P</div>
        <span>ProjectFlow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-title">WORKSPACE</p>

        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}

        {/* Admin only */}
        {user?.role === "admin" && (
          <NavLink
            to="/users"
            end
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span>♙</span>
            Users
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* Upgrade card */}
        <div className="upgrade-card">
          <div className="upgrade-icon">✦</div>

          <h4>Upgrade workspace</h4>

          <p>Unlock advanced project features.</p>

          <button type="button">Upgrade</button>
        </div>

        {/* Current user */}
        <div className="sidebar-user">
          <div className="avatar">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.username || "User"}</strong>

            <span>{user?.role || "member"}</span>
          </div>

          <span className="user-menu">⋮</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
