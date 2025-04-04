import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, LayoutDashboard, LineChart, Plus, Settings, Menu, X, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LanguageSelector } from "./LanguageSelector";
import RuutsLogo from "@/assets/ruuts-blanco.svg";

export function Sidebar() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col w-64 transition-transform duration-300 border-r bg-sidebar text-sidebar-foreground border-sidebar-border",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col items-center px-4 py-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center">
              <img
                src={RuutsLogo}
                alt="Ruuts Logo"
                className="w-32"
              />
            </div>
            <p className="text-xs text-sidebar-foreground/70">Regenerative Insights</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NavItem
            to="/"
            icon={<LayoutDashboard size={20} />}
            label={t("common.dashboard")}
            end
          />
          <NavItem
            to="/farms"
            icon={<Home size={20} />}
            label={t("common.farms")}
          />
          <NavItem
            to="/analytics"
            icon={<LineChart size={20} />}
            label={t("common.analytics")}
          />
          <NavItem
            to="/export"
            icon={<Download size={20} />}
            label={t("common.export")}
          />
          <NavItem
            to="/add-farm"
            icon={<Plus size={20} />}
            label={t("common.addFarm")}
            className="mt-8 bg-farm-green-700 text-white hover:bg-farm-green-800"
          />
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <NavItem
                to="/settings"
                icon={<Settings size={20} />}
                label={t("common.settings")}
              />
              <LanguageSelector className="text-sidebar-foreground hover:text-sidebar-accent-foreground" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
  end?: boolean;
}

function NavItem({ to, icon, label, className, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
          className
        )
      }
      end={end}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
}
