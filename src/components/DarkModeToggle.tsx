import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const getInitialMode = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
};

interface DarkModeToggleProps {
  readonly variant?: "header" | "standalone";
  readonly size?: "sm" | "default" | "lg";
}

export default function DarkModeToggle({ variant = "standalone", size = "default" }: DarkModeToggleProps) {
  const [mode, setMode] = useState(getInitialMode());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle("dark", mode === "dark");
    window.localStorage.setItem("theme", mode);
  }, [mode]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  if (variant === "header") {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "icon"}
        onClick={toggleMode}
        className={`
          ${size === "sm" ? 'h-8 w-8' : 'h-10 w-10'} 
          bg-gradient-to-r from-amber-50 to-blue-50 
          hover:from-amber-100 hover:to-blue-100 
          dark:from-gray-800 dark:to-gray-800
          dark:hover:from-gray-700 dark:hover:to-gray-700
          border border-amber-200 dark:border-gray-600
          transition-all duration-300 
          hover:shadow-lg hover:scale-105
          text-foreground hover:text-amber-600 dark:hover:text-blue-400
          backdrop-blur-sm
        `}
        aria-label={mode === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      >
        <div className="relative">
          <Sun 
            className={`h-4 w-4 transition-all duration-300 ${
              mode === "dark" 
                ? "rotate-90 scale-0 opacity-0" 
                : "rotate-0 scale-100 opacity-100"
            }`} 
          />
          <Moon 
            className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${
              mode === "dark" 
                ? "rotate-0 scale-100 opacity-100" 
                : "-rotate-90 scale-0 opacity-0"
            }`} 
          />
        </div>
      </Button>
    );
  }

  return (
    <button
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      onClick={toggleMode}
      aria-label={mode === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 text-amber-500 ${
            mode === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`} 
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 text-blue-500 ${
            mode === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>
    </button>
  );
}
