import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useUserAuth } from "../auth/userAuth";

export function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { email, logout } = useUserAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-forest px-6 text-cream">
      <Link to="/store" className="flex items-center gap-3">
        <Logo size={32} />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Saldo</span>
          <span className="text-xs text-cream/60">{email}</span>
        </div>
      </Link>

      <nav className="flex items-center gap-5 text-sm">
        <Link to="/store" className={pathname === "/store" ? "text-amber" : "text-cream/85 hover:text-amber"}>
          Inicio
        </Link>
        <Link to="/dashboard" className="text-cream/85 hover:text-amber">
          Mi cuenta
        </Link>
        <button type="button" onClick={handleLogout} className="text-cream/70 hover:text-amber">
          Salir
        </button>
      </nav>
    </header>
  );
}
