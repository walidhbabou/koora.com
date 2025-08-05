import { Search, Settings, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: "الرئيسية", path: "/" },
    { name: "المباريات", path: "/matches" },
    { name: "الأخبار", path: "/news" },
    { name: "الترتيب", path: "/standings" },
    { name: "الفيديوهات", path: "/videos" },
    { name: "الانتقالات", path: "/transfers" }
  ];

  return (
    <>
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <img 
                    src="/koora-logo/image.png" 
                    alt="Koora Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <img 
                    src="/public/koora-logo/black-logo.png" 
                    alt="Koora Logo" 
                    className="w-8 h-8 object-contain hidden sm:block"
                  />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex space-x-8">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative text-foreground hover:text-sport-green transition-all duration-300 font-medium py-2 px-1 group ${
                    location.pathname === item.path ? 'text-sport-green' : ''
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-sport-green to-sport-blue transform transition-transform duration-300 ${
                    location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
              <button className="text-foreground hover:text-sport-green transition-colors">
                <span className="text-2xl hover:scale-110 transition-transform duration-200">•••</span>
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Search - Hidden on very small screens */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ادخل للبحث..."
                  className="pl-10 w-48 lg:w-64 bg-sport-light border-border"
                />
              </div>
              
              {/* Login Button - Hidden on small screens */}
              <Button variant="default" className="hidden sm:flex bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium px-4 lg:px-6">
                تسجيل الدخول
              </Button>
              
              {/* Settings - Hidden on small screens */}
              <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
                <Settings className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="ادخل للبحث..."
                className="pl-10 w-full bg-sport-light border-border"
              />
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block text-foreground hover:text-sport-green transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-sport-green/10 ${
                    location.pathname === item.path ? 'text-sport-green bg-sport-green/10' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
              <Button variant="default" className="flex-1 bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg transition-all duration-300 font-medium">
                تسجيل الدخول
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;