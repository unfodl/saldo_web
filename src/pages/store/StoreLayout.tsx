import { Outlet } from "react-router-dom";
import { TopBar } from "../../components/TopBar";
import { CategoryRail } from "../../components/CategoryRail";

export function StoreLayout() {
  return (
    <div className="flex h-screen flex-col bg-cream">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <CategoryRail />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
