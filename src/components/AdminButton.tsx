import React, { useState } from 'react';
import { Shield, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminButtonProps {
  isAdmin?: boolean;
  className?: string;
}

const AdminButton: React.FC<AdminButtonProps> = ({ isAdmin = false, className = '' }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleClick = () => {
    navigate('/admin');
  };

  return (
    <Button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`
        relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 
        hover:from-purple-700 hover:to-blue-700 text-white font-semibold 
        px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
        transition-all duration-300 transform hover:scale-105 active:scale-95
        border-0 ${className}
      `}
      style={{
        transform: `scale(${isPressed ? 0.95 : isHovered ? 1.05 : 1})`,
      }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sparkles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-2 left-2 transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>
        <div className={`absolute top-2 right-2 transition-all duration-500 delay-100 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        <div className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : 'rotate-0'}`}>
          <Shield className="w-5 h-5" />
        </div>
        <span className="font-bold">Admin Panel</span>
        <div className={`transition-transform duration-300 ${isHovered ? '-rotate-12' : 'rotate-0'}`}>
          <Crown className="w-5 h-5 text-yellow-300" />
        </div>
      </div>

      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-white/20 transform scale-0 rounded-full transition-transform duration-500 ease-out" />
      </div>
    </Button>
  );
};

export default AdminButton;
