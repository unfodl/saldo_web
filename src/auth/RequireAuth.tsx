import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "./adminAuth";
import { useUserAuth } from "./userAuth";

export function RequireAdminAuth() {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export function RequireUserAuth() {
  const { isAuthenticated } = useUserAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
