import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../../auth/userAuth";
import { Button } from "../../components/Button";
import { Logo } from "../../components/Logo";

export function UserDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useUserAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-forest px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl bg-cream px-8 py-10 text-center">
        <Logo size={64} />
        <h1 className="text-2xl font-bold text-forest">Sesión iniciada</h1>
        <Button onClick={handleLogout}>Cerrar sesión</Button>
      </div>
    </div>
  );
}
