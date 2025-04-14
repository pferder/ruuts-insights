
import { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

interface NavbarProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

export function Navbar({ onLoginClick, onSignUpClick }: NavbarProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/60 px-4 md:px-6 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <img src="/ruuts-blanco.svg" alt="Ruuts Logo" className="h-8" />
          <span className="text-lg font-semibold ml-2">Ruuts</span>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <HashLink smooth to="/#features" className="text-gray-700 hover:text-theme-green-primary transition-colors">
            {t("landing.navFeatures", "Características")}
          </HashLink>
          <HashLink smooth to="/#about" className="text-gray-700 hover:text-theme-green-primary transition-colors">
            {t("landing.navAbout", "Nosotros")}
          </HashLink>
          <div className="flex items-center gap-2 ml-4">
            <LanguageSelector />
            <Button variant="outline" onClick={onLoginClick}>
              {t("landing.navLogin", "Iniciar sesión")}
            </Button>
            <Button className="bg-theme-green-primary hover:bg-theme-green-primary/90" onClick={onSignUpClick}>
              {t("landing.navSignUp", "Registrarse")}
            </Button>
          </div>
        </div>

        <div className="flex md:hidden gap-2 items-center">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-1"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden py-4 px-2">
          <div className="flex flex-col gap-4">
            <HashLink
              smooth to="/#features"
              className="px-2 py-1 text-gray-700 hover:text-theme-green-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("landing.navFeatures", "Características")}
            </HashLink>
            <HashLink
              smooth to="/#about"
              className="px-2 py-1 text-gray-700 hover:text-theme-green-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("landing.navAbout", "Nosotros")}
            </HashLink>
            <div className="flex flex-col gap-2 mt-2">
              <Button variant="outline" onClick={() => { onLoginClick(); setIsMenuOpen(false); }}>
                {t("landing.navLogin", "Iniciar sesión")}
              </Button>
              <Button className="bg-theme-green-primary hover:bg-theme-green-primary/90" onClick={() => { onSignUpClick(); setIsMenuOpen(false); }}>
                {t("landing.navSignUp", "Registrarse")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
