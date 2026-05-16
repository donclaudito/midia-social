import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Sparkles, Menu, X, Bot, Download } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Todos os Posts", path: "/posts", icon: FileText },
  { label: "Gerador IA", path: "/gerar", icon: Sparkles },
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { canInstall, install } = usePWAInstall();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const NavContent = () => (
    <>
      <div className="mb-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-outfit font-bold text-primary tracking-tight">
            PostArchitect
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
        <a
          href="https://agente007.base44.app/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <Bot className="w-[18px] h-[18px]" />
          Agente
        </a>

        {canInstall && (
          <button
            onClick={() => { install(); setMobileOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-primary hover:text-primary-foreground hover:bg-primary/20 border border-primary/30 mt-2"
          >
            <Download className="w-[18px] h-[18px]" />
            Instalar App
          </button>
        )}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-border">
          <div className="px-4 py-3 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user.full_name || "Usuário"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 text-[11px] text-destructive hover:underline"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border p-6 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}