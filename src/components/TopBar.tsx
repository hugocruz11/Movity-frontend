"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-sand bg-cream px-6">
      <button
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-sand text-sm transition-colors hover:bg-sand-light"
        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      {user && (
        <span className="text-sm text-muted">{user.email}</span>
      )}
      <button
        className="text-sm text-muted hover:text-ink transition-colors"
        onClick={logout}
      >
        Cerrar sesión
      </button>
    </header>
  );
}
