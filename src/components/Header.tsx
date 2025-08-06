import { Search, Settings, Home, Trophy, Newspaper, BarChart3, Video, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "المباريات", path: "/matches", icon: Trophy },
    { name: "الأخبار", path: "/news", icon: Newspaper },
    { name: "الترتيب", path: "/standings", icon: BarChart3 },
    { name: "الفيديوهات", path: "/videos", icon: Video },
    { name: "الانتقالات", path: "/transfers", icon: ArrowLeftRight }
  ];
  return (
    <>
      {/* Desktop Header */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 hidden lg:block">
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
                    className="w-8 h-8 object-contain"
                  />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="flex space-x-8">
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ادخل للبحث..."
                  className="pl-10 w-48 lg:w-64 bg-sport-light border-border"
                />
              </div>
              
              {/* Login Button */}
              <Button variant="default" className="bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium px-4 lg:px-6">
                تسجيل الدخول
              </Button>
              
              {/* Settings */}
              <Button variant="ghost" size="icon" className="hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Only Logo and Search */}
      <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                  <img 
                    src="/koora-logo/image.png" 
                    alt="Koora Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <img 
                    src="/public/koora-logo/black-logo.png" 
                    alt="Koora Logo" 
                    className="w-6 h-6 object-contain hidden sm:block"
                  />
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Icon */}
              <Button variant="ghost" size="icon" className="hover:bg-sport-green/10 hover:text-sport-green transition-all duration-300">
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Login Button - Compact */}
              <Button variant="default" className="bg-gradient-to-r from-sport-green to-sport-blue hover:shadow-lg transition-all duration-300 font-medium px-3 py-1 text-sm">
                دخول
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Similar to Image 1 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 6).map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300 ${
                  isActive 
                    ? 'text-sport-green' 
                    : 'text-muted-foreground hover:text-sport-green'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-sport-green/10' : 'hover:bg-sport-green/5'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium truncate w-full text-center leading-tight">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer for mobile bottom navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default Header;