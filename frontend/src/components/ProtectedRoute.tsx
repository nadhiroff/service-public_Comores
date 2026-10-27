import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export default function ProtectedRoute({
  children,
  allow
}: {
  children: ReactNode;
  allow: Role[];
}) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/connexion" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
