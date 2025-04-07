
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="bg-gradient-to-br from-theme-green-primary/90 to-theme-teal-secondary/80 text-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ruuts, tu camino hacia la regeneración
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Transforma tu establecimiento con prácticas regenerativas y monitorea el impacto de tus decisiones en tiempo real.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-theme-green-primary hover:bg-white/90">
              <Link to="/dashboard">
                Acceder a Ruuts Regen Analytics
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
              <a href="#features">
                Conocer más
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
