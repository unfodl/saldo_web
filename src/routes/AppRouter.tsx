import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAdminAuth, RequireUserAuth } from "../auth/RequireAuth";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { UserLoginPage } from "../pages/user/UserLoginPage";
import { UserDashboardPage } from "../pages/user/UserDashboardPage";
import { StoreLayout } from "../pages/store/StoreLayout";
import { StoreOverviewPage } from "../pages/store/StoreOverviewPage";
import { StorePayPage } from "../pages/store/StorePayPage";
import { StoreHistoryPage } from "../pages/store/StoreHistoryPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<UserLoginPage />} />
        <Route element={<RequireUserAuth />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/store" element={<StoreLayout />}>
            <Route index element={<StoreOverviewPage />} />
            <Route path="pay" element={<StorePayPage />} />
            <Route path="history" element={<StoreHistoryPage />} />
          </Route>
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
