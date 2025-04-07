
import { Link } from "react-router-dom";
import RuutsLogo from "@/assets/ruuts-blanco.svg";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src={RuutsLogo} alt="Ruuts Logo" className="h-10 mb-4" />
            <p className="text-white/70 text-sm">
              Tu camino hacia la regeneración
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-white/70 hover:text-white transition-colors">
                  Regen Analytics
                </Link>
              </li>
              <li>
                <Link to="#" className="text-white/70 hover:text-white transition-colors">
                  Mediciones y Monitoreos
                </Link>
              </li>
              <li>
                <Link to="#" className="text-white/70 hover:text-white transition-colors">
                  Programas de carbono
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Recursos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-white/70 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="text-white/70 hover:text-white transition-colors">
                  Guías prácticas
                </Link>
              </li>
              <li>
                <Link to="#" className="text-white/70 hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:info@ruuts.com" className="text-white/70 hover:text-white transition-colors">
                  info@ruuts.com
                </a>
              </li>
              <li className="text-white/70">
                Buenos Aires, Argentina
              </li>
            </ul>
            
            <div className="mt-6">
              <span className="text-white/70 text-sm">
                © {new Date().getFullYear()} Ruuts. Todos los derechos reservados.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
