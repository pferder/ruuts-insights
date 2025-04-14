
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-100">
      <div className="px-4 flex h-14 justify-between items-center md:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium px-4 py-8">
                <Link to="/dashboard">{t("nav.dashboard", "Dashboard")}</Link>
                <Link to="/farms">{t("nav.farms", "Farms")}</Link>
                <Link to="/add-farm">{t("nav.addFarm", "Add Farm")}</Link>
                <Link to="/analytics">{t("nav.analytics", "Analytics")}</Link>
                <Link to="/export">{t("nav.export", "Export Data")}</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center gap-2">
            <img
              alt="Ruuts Logo"
              className="h-8"
              src="/ruuts-blanco.svg"
            />
            <div className="text-lg font-semibold">Ruuts</div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              {t("auth.logout", "Cerrar sesión")}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
