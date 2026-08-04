import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CyberLayout } from "@/components/cyber/Layout";
import { JwtDecoder, PayloadEncoder } from "@/components/cyber/Tools";
import { GithubTools } from "@/components/cyber/GithubTools";
import { Wrench, Key, Code2, Github } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — Browser Utilities & GitHub Repositories" },
      {
        name: "description",
        content:
          "Browser-only utilities — JWT decoder, payload encoder, and GitHub tools by Asbawy.",
      },
    ],
  }),
  component: ToolsPage,
});

const tabs = [
  { id: "github", label: "GitHub Tools", icon: Github },
  { id: "jwt", label: "JWT Decoder", icon: Key },
  { id: "payload", label: "Payload Codec", icon: Code2 },
] as const;

function ToolsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("github");

  return (
    <CyberLayout>
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-amber-400 bg-clip-text text-transparent">
                Tools
              </h1>
            </div>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Everything below runs locally in your browser. No network tracking — paste away.
            </p>
          </div>

          {/* Tab Navigation Bar */}
          <div className="rounded-xl bg-card/50 border border-border/50 p-2">
            <div className="flex flex-wrap items-center gap-1 bg-muted/40 rounded-full p-1 border border-border/60 w-fit">
              {tabs.map((t) => {
                const isActive = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-500/15 text-amber-400 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                        : "text-muted-foreground hover:text-foreground"
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
            {tab === "github" && <GithubTools />}
            {tab === "jwt" && <JwtDecoder />}
            {tab === "payload" && <PayloadEncoder />}
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
