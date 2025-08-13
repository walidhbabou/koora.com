import React, { useEffect, useState } from "react";

const getInitialMode = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
};

export default function DarkModeToggle() {
  const [mode, setMode] = useState(getInitialMode());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    window.localStorage.setItem("theme", mode);
  }, [mode]);

  return (
    <button
      className="button"
      style={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}
      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
    >
      {mode === "dark" ? "☀️ " : "🌙 "}
    </button>
  );
}
