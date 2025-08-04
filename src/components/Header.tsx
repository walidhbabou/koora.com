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
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-[var(--gradient-hero)] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-primary-foreground font-bold text-xl">⚽</span>
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-sport-green to-sport-blue bg-clip-text text-transparent">
                SportLive
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`relative text-foreground hover:text-sport-green transition-all duration-300 font-medium py-2 px-1 group ${
                    index === 2 ? 'text-sport-green' : ''
                  }`}
                >
                  {item}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-sport-green to-sport-blue transform transition-transform duration-300 ${
                    index === 2 ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </a>
              ))}
              <button className="text-foreground hover:text-sport-green transition-colors">
                <span className="text-2xl hover:scale-110 transition-transform duration-200">•••</span>
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
            
            <Button variant="default" className="bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium px-6">
              Connecter
            </Button>
            
            <Button variant="ghost" size="icon" className="hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;