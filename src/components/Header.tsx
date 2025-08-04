import { Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const navItems = [
    "Accueil",
    "Maths", 
    "Actualités",
    "Classements",
    "Vidéos",
    "Transfert"
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-sport-green to-sport-blue rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-sport-dark">SportApp</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-foreground hover:text-sport-green transition-colors font-medium"
                >
                  {item}
                </a>
              ))}
              <button className="text-foreground hover:text-sport-green">
                <span className="text-2xl">...</span>
              </button>
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Entrer pour rechercher..."
                className="pl-10 w-64 bg-sport-light border-border"
              />
            </div>
            
            <Button variant="default" className="bg-sport-green hover:bg-sport-green/90">
              Connecter
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;