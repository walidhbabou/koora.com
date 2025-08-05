const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <img 
              src="/koora-logo/green-logo.png" 
              alt="Koora Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="font-bold text-lg bg-gradient-to-r from-sport-green to-sport-blue bg-clip-text text-transparent">
              Koora
            </span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground mb-1">
              🚀 <strong>Projet de Démonstration</strong> - Portfolio de développement web
            </p>
            <p className="text-xs text-muted-foreground">
              Construit avec React, TypeScript, Tailwind CSS & Vite
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Koora Demo - Tous droits réservés | 
            <span className="ml-1 font-medium text-sport-green">Version Portfolio</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
