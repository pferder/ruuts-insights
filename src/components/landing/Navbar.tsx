
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import RuutsLogo from "@/assets/ruuts-blanco.svg";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <nav className="bg-sidebar text-sidebar-foreground sticky top-0 z-50 px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={RuutsLogo} alt="Ruuts Logo" className="h-10" />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/dashboard" 
            className="text-white hover:text-sidebar-accent transition-colors"
          >
            Regen Analytics
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
              className="flex items-center text-white hover:text-sidebar-accent transition-colors"
            >
              Mediciones y Monitoreos
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            {isSubmenuOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-sidebar rounded-md shadow-lg py-2 z-10 border border-sidebar-border">
                <Link 
                  to="#" 
                  className="block px-4 py-2 text-white hover:bg-sidebar-accent/50 transition-colors"
                  onClick={() => setIsSubmenuOpen(false)}
                >
                  GRASS
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            to="#" 
            className="text-white hover:text-sidebar-accent transition-colors"
          >
            Programas de carbono
          </Link>
        </div>

        {/* Dashboard Button */}
        <div className="hidden md:block">
          <Button asChild className="bg-theme-green-primary hover:bg-farm-green-600 text-white">
            <Link to="/dashboard">Acceder al Dashboard</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-2 py-4 space-y-4">
          <Link 
            to="/dashboard" 
            className="block px-3 py-2 rounded-md text-white hover:bg-sidebar-accent/50 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Regen Analytics
          </Link>
          
          <div>
            <button
              onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
              className="flex items-center w-full px-3 py-2 rounded-md text-white hover:bg-sidebar-accent/50 transition-colors"
            >
              Mediciones y Monitoreos
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            {isSubmenuOpen && (
              <div className="ml-4 mt-2 space-y-2">
                <Link 
                  to="#" 
                  className="block px-3 py-2 rounded-md text-white hover:bg-sidebar-accent/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  GRASS
                </Link>
              </div>
            )}
          </div>
          
          <Link 
            to="#" 
            className="block px-3 py-2 rounded-md text-white hover:bg-sidebar-accent/50 transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            Programas de carbono
          </Link>
          
          <div className="pt-2">
            <Button asChild className="w-full bg-theme-green-primary hover:bg-farm-green-600 text-white">
              <Link 
                to="/dashboard" 
                onClick={() => setIsMenuOpen(false)}
              >
                Acceder al Dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
