"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved);
      // eslint-disable-next-line react-hooks/immutability
      applyTheme(saved);
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (t: "light" | "dark") => {
    const root = document.documentElement;

    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", t);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}