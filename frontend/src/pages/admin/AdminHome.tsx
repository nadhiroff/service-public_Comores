import { useAuth } from "../../context/AuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ServiceAdminDashboard from "./ServiceAdminDashboard";

export default function AdminHome() {
  const { user } = useAuth();
  if (user?.role === "super_admin") return <SuperAdminDashboard />;
  if (user?.role === "admin_service") return <ServiceAdminDashboard />;
  return null;
}
