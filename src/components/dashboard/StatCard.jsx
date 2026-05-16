import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ label, value, icon: Icon, glowColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 group hover:border-primary/30 transition-all duration-300"
    >
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.12]"
        style={{ background: glowColor || "hsl(183 100% 50%)" }}
      />
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <p className="text-3xl font-outfit font-bold mt-2 text-primary">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}