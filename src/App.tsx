import { AdminAuthProvider } from "./auth/adminAuth";
import { UserAuthProvider } from "./auth/userAuth";
import { AppRouter } from "./routes/AppRouter";

export function App() {
  return (
    <AdminAuthProvider>
      <UserAuthProvider>
        <AppRouter />
      </UserAuthProvider>
    </AdminAuthProvider>
  );
}
