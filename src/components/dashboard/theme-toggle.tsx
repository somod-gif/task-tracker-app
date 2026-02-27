"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const fromStorage = localStorage.getItem("theme");
    if (fromStorage) {
      return fromStorage === "dark";
    }

    return document.documentElement.classList.contains("dark");
  });

  function toggleTheme() {
    setDark((state) => !state);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
      localStorage.setItem("theme", dark ? "dark" : "light");
    }
  }, [dark]);

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
