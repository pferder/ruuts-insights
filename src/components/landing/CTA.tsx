
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpModal } from "./SignUpModal";
import { useTranslation } from "react-i18next";

export function CTA() {
  const { t } = useTranslation();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  
  return (
    <section id="signup" className="py-16 md:py-20 bg-theme-brown-primary text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t("landing.ctaTitle", "Comienza tu camino hacia la regeneración")}
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
          {t("landing.ctaDescription", "Únete a la comunidad de agricultores regenerativos y transforma tu establecimiento con Ruuts Regen Analytics.")}
        </p>
        <Button 
          size="lg" 
          onClick={() => setIsSignUpOpen(true)}
          className="bg-theme-green-primary hover:bg-farm-green-600 border-none"
        >
          {t("landing.ctaButton", "Crear cuenta gratis")}
          <ArrowRight className="ml-2" size={18} />
        </Button>
        
        <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
      </div>
    </section>
  );
}
