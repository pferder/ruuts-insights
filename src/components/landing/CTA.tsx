
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="py-16 md:py-20 bg-theme-brown-primary text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Comienza tu camino hacia la regeneración
        </h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
          Únete a la comunidad de agricultores regenerativos y transforma tu establecimiento
          con Ruuts Regen Analytics.
        </p>
        <Button asChild size="lg" className="bg-theme-green-primary hover:bg-farm-green-600 border-none">
          <Link to="/dashboard">
            Acceder al Dashboard
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </Button>
      </div>
    </section>
  );
}
