import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand-group">
          <Link to="/experiments" className="brand">
            Bayesian A/B Lab
          </Link>
          <nav className="nav-links">
            <NavLink to="/experiments">Experiments</NavLink>
            <NavLink to="/experiments/new">Create Experiment</NavLink>
            {user?.role === "admin" ? <NavLink to="/admin">Admin Dashboard</NavLink> : null}
          </nav>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <Button variant="secondary" size="sm" type="button" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="content content-with-navbar">
        <Outlet />
      </main>
    </div>
  );
}
