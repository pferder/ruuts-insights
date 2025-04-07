
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-theme-brown-primary mb-6">
              Impulsa el potencial regenerativo de tu establecimiento
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              Nuestra plataforma de análisis te proporciona las herramientas para 
              tomar decisiones informadas que beneficien tanto tu producción como 
              el medio ambiente.
            </p>
            <p className="text-lg text-slate-600 mb-6">
              Con Ruuts Regen Analytics podrás medir, gestionar y visualizar el 
              impacto de tus prácticas agrícolas, maximizando la salud del suelo 
              y la rentabilidad de tu establecimiento.
            </p>
            <Button asChild className="bg-theme-green-primary hover:bg-farm-green-600 text-white">
              <Link to="/dashboard">
                Comenzar ahora
              </Link>
            </Button>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-theme-green-primary/20 rounded-lg transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80" 
                alt="Establecimiento regenerativo" 
                className="relative z-10 rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
