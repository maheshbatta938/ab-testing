import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types";

export function ProtectedRoute({
  children,
  role
}: {
  children: ReactNode;
  role?: Role;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/experiments" replace />;
  }

  return <>{children}</>;
}
