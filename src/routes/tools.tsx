

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CyberLayout } from "@/components/cyber/Layout";
import { JwtDecoder, PayloadEncoder } from "@/components/cyber/Tools";

export const Route = createFileRoute("/tools")({

  head: () => ({
    meta: [
      { title: "/tools — Asbawy Blog" },
      { name: "description", content: "Browser-only utilities — JWT decoder, payload encoder, and more." },
      { property: "og:title", content: "/tools — Asbawy Blog" },
      { property: "og:description", content: "Interactive tools by Asbawy. Everything runs in your browser." },
    ],
  }),
  component: ToolsPage,
});


const tabs = [
  { id: "jwt", label: "jwt_decoder" },
  { id: "payload", label: "payload_codec" },
] as const;

function ToolsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("jwt");

  return (
    <CyberLayout>
      <section className="px-6 md:px-10 py-10 max-w-5xl">

        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-neon-green">asbawy</span>:<span className="text-neon-green">~/tools</span>$ ./run
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /tools <span className="text-muted-foreground">— offline_utils</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Everything below runs in your browser. No network calls — paste away.
        </p>


        <div className="mt-6 flex gap-2 border-b border-panel-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative -mb-px border-b-2 px-4 py-2 font-mono text-xs transition-colors ${
                tab === t.id
                  ? "border-neon-green text-neon-green text-glow-green"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>


        <div className="mt-6">
          {tab === "jwt" ? <JwtDecoder /> : <PayloadEncoder />}
        </div>
      </section>
    </CyberLayout>
  );
}

