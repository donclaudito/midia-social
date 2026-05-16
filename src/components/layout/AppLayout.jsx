import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-10 pt-16 lg:pt-10 pb-24 lg:pb-10">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}