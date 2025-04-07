
import { BarChart3, LeafyGreen, LineChart, BarChart, Scale, Sprout } from "lucide-react";

const features = [
  {
    title: "Análisis de Carbono",
    description: "Monitorea la huella de carbono de tu establecimiento y descubre oportunidades de mejora.",
    icon: <Scale className="w-10 h-10 text-theme-green-primary" />,
  },
  {
    title: "Prácticas Regenerativas",
    description: "Implementa y haz seguimiento de prácticas que mejoran la salud del suelo y los ecosistemas.",
    icon: <Sprout className="w-10 h-10 text-theme-green-primary" />,
  },
  {
    title: "Métricas de Sostenibilidad",
    description: "Visualiza indicadores clave de sostenibilidad y rendimiento de tu establecimiento.",
    icon: <BarChart className="w-10 h-10 text-theme-green-primary" />,
  },
  {
    title: "Proyecciones a Futuro",
    description: "Anticipa el impacto de tus decisiones con proyecciones a corto y largo plazo.",
    icon: <LineChart className="w-10 h-10 text-theme-green-primary" />,
  },
  {
    title: "Salud del Ecosistema",
    description: "Evalúa la biodiversidad y salud general del ecosistema de tu establecimiento.",
    icon: <LeafyGreen className="w-10 h-10 text-theme-green-primary" />,
  },
  {
    title: "Analítica Avanzada",
    description: "Obtén insights profundos basados en datos para mejorar la gestión de tu establecimiento.",
    icon: <BarChart3 className="w-10 h-10 text-theme-green-primary" />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-brown-primary mb-4">
            Ruuts Regen Analytics
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Descubre todas las herramientas que necesitas para transformar tu establecimiento con prácticas regenerativas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-theme-brown-primary">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
