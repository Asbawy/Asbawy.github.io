import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CyberLayout } from "@/components/cyber/Layout";
import { GithubTools } from "@/components/cyber/GithubTools";
import { RevShellGen } from "@/components/cyber/tools/RevShellGen";
import { HashIdentifier } from "@/components/cyber/tools/HashIdentifier";
import { SubnetCalculator } from "@/components/cyber/tools/SubnetCalculator";
import { CyberCodec } from "@/components/cyber/tools/CyberCodec";
import { Wrench, Zap, Hash, Network, Code2, Github } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Offensive Security Tools — Browser Pentest Utilities" },
      {
        name: "description",
        content:
          "Zero-telemetry client-side pentester utilities — Reverse shell generator, hash identifier, subnet calculator, and cyber multi-codec by Asbawy.",
      },
    ],
  }),
  component: ToolsPage,
});

const tabs = [
  { id: "revshell", label: "Reverse Shells", icon: Zap, color: "emerald" },
  { id: "hashid", label: "Hash Identifier", icon: Hash, color: "cyan" },
  { id: "subnet", label: "Subnet & CIDR", icon: Network, color: "emerald" },
  { id: "codec", label: "Cyber Codec & JWT", icon: Code2, color: "fuchsia" },
  { id: "github", label: "GitHub Tools", icon: Github, color: "amber" },
] as const;

function ToolsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("revshell");

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <Wrench className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-emerald-400 bg-clip-text text-transparent">
                Offensive Tools
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Client-side offensive security and pentester utilities. 100% private, zero network telemetry — everything computes directly in your browser memory.
            </p>
          </div>

          {/* Tab Navigation Bar */}
          <div className="rounded-xl bg-card/60 border border-border p-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 rounded-lg p-1 border border-border/60">
              {tabs.map((t) => {
                const isActive = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.15)] font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tool View */}
          <div className="pt-2">
            {tab === "revshell" && <RevShellGen />}
            {tab === "hashid" && <HashIdentifier />}
            {tab === "subnet" && <SubnetCalculator />}
            {tab === "codec" && <CyberCodec />}
            {tab === "github" && <GithubTools />}
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
