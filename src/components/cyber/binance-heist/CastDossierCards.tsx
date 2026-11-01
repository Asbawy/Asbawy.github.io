import React, { useState } from "react";
import { Users, Shield, AlertTriangle, Search, Lock, Landmark } from "lucide-react";
import { CAST_MEMBERS, type CastMember } from "./data";

const ROLES = [
  "All",
  "Exchange",
  "Suspect",
  "Forensics",
  "Freeze Switch",
  "Law Enforcement",
] as const;

function roleStyle(role: CastMember["roleTag"]) {
  switch (role) {
    case "Exchange":
      return {
        badge: "border-amber-500/35 bg-amber-500/12 text-amber-300",
        icon: <Landmark className="h-3.5 w-3.5 text-amber-400" />,
      };
    case "Suspect":
      return {
        badge: "border-red-500/40 bg-red-500/15 text-red-300",
        icon: <AlertTriangle className="h-3.5 w-3.5 text-red-400" />,
      };
    case "Forensics":
      return {
        badge: "border-cyan-500/35 bg-cyan-500/12 text-cyan-300",
        icon: <Search className="h-3.5 w-3.5 text-cyan-400" />,
      };
    case "Freeze Switch":
      return {
        badge: "border-emerald-500/35 bg-emerald-500/12 text-emerald-300",
        icon: <Lock className="h-3.5 w-3.5 text-emerald-400" />,
      };
    case "Law Enforcement":
      return {
        badge: "border-blue-500/35 bg-blue-500/12 text-blue-300",
        icon: <Shield className="h-3.5 w-3.5 text-blue-400" />,
      };
  }
}

export function CastDossierCards() {
  const [roleFilter, setRoleFilter] = useState<(typeof ROLES)[number]>("All");
  const [selectedId, setSelectedId] = useState<string>(CAST_MEMBERS[0].id);

  const visible = CAST_MEMBERS.filter((m) => roleFilter === "All" || m.roleTag === roleFilter);
  const active = visible.find((m) => m.id === selectedId) || visible[0] || CAST_MEMBERS[0];
  const activeStyle = roleStyle(active.roleTag);

  return (
    <section
      aria-label="Interactive Cast of Characters Dossier"
      className="my-8 max-w-[82ch] rounded-xl border border-border bg-card overflow-hidden shadow-lg"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2.5 font-mono">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15 border border-cyan-500/30">
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-foreground">
              Interactive Dossier: Who Was Involved?
            </div>
            <div className="text-[11px] text-muted-foreground font-sans">
              Select any player to see their exact role in the 72-hour crisis
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 font-mono text-[11px]">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={roleFilter === role}
              onClick={() => {
                setRoleFilter(role);
                const next = CAST_MEMBERS.filter((m) => role === "All" || m.roleTag === role);
                if (next.length > 0 && !next.some((m) => m.id === selectedId)) {
                  setSelectedId(next[0].id);
                }
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                roleFilter === role
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 font-bold"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/60 bg-background/30">
        {visible.map((member) => {
          const isSelected = member.id === active.id;
          const st = roleStyle(member.roleTag);
          return (
            <button
              key={member.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(member.id)}
              className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "border-cyan-400/60 bg-cyan-500/10 shadow-sm"
                  : "border-border/60 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                {st.icon}
                <span className="truncate">{member.roleTag}</span>
              </div>
              <div className="mt-1 font-mono text-xs font-bold text-foreground truncate">
                {member.name}
              </div>
            </button>
          );
        })}
      </div>

      <div
        key={active.id}
        aria-live="polite"
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200"
      >
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-mono text-base font-bold text-foreground m-0">{active.name}</h4>
            <span
              className={`rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${activeStyle.badge}`}
            >
              {active.headline}
            </span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed m-0 font-sans">
            {active.summary}
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-border bg-muted/30 px-3.5 py-2.5 font-mono text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Key Metric
          </div>
          <div className="mt-0.5 text-xs font-bold text-cyan-300">{active.keyStat}</div>
        </div>
      </div>
    </section>
  );
}
