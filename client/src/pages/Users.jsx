import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchUsers, updateUserRole } from "../services/projectService";

function Users() {
  const { token, user } = useAuth();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);

      try {
        const usersData = await fetchUsers(token);
        setUsers(usersData);
      } catch (error) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [token]);

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole, token);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? { ...currentUser, role: newRole }
            : currentUser,
        ),
      );
    } catch (error) {
      setError("Failed to update user role");
    }
  }
  if (user?.role !== "admin") {
    return (
      <main className="main-content">
        <div className="state-card error-state">
          <div className="state-icon">!</div>
          <h3>Access denied</h3>
          <p>Only administrators can manage user roles.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content users-page">
      <div className="page-header">
        <div>
          <span className="page-eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>
            Manage users and their roles across the project management system.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <h3>Loading users...</h3>
          <p>Please wait while we fetch the users.</p>
        </div>
      ) : error ? (
        <div className="state-card error-state">
          <div className="state-icon">!</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      ) : (
        <section className="users-card">
          <div className="users-card-header">
            <div>
              <span className="card-eyebrow">USERS</span>
              <h2>All Users</h2>
            </div>

            <span className="user-count">
              {users.length} {users.length === 1 ? "User" : "Users"}
            </span>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((currentUser) => (
                  <tr key={currentUser.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {currentUser.username?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{currentUser.username}</strong>
                          <span>User #{currentUser.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>{currentUser.email}</td>

                    <td>
                      <span className={`role-badge role-${currentUser.role}`}>
                        {currentUser.role}
                      </span>
                    </td>

                    <td>
                      <select
                        className="role-select"
                        value={currentUser.role}
                        onChange={(event) =>
                          handleRoleChange(currentUser.id, event.target.value)
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

export default Users;
