import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Sparkles, Bot, Download, LogOut } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { base44 } from "@/api/base44Client";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Posts", path: "/posts", icon: FileText },
  { label: "Gerar IA", path: "/gerar", icon: Sparkles },
  { label: "Agente", path: null, href: "https://agente007.base44.app/", icon: Bot, external: true },
];

export default function BottomNav() {
  const location = useLocation();
  const { canInstall, install } = usePWAInstall();

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 px-2">
        {canInstall && (
          <button
            onClick={install}
            className="flex flex-col items-center gap-1 px-2 py-1 text-primary"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] font-medium">Instalar</span>
          </button>
        )}
        {navItems.map((item) => {
          const isActive = !item.external && location.pathname === item.path;
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 px-2 py-1 text-muted-foreground"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-2 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_rgba(0,242,255,0.8)]" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full -translate-y-full" />
              )}
            </Link>
          );
        })}
        {/* Botão de Logout Mobile */}
        <button
          onClick={handleLogout}
          title="Sair (Logout)"
          className="flex flex-col items-center gap-1 px-2 py-1 text-destructive hover:text-destructive/80 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sair</span>
        </button>
      </div>
    </nav>
  );
}