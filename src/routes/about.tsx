import { createFileRoute } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag } from "@/components/cyber/Layout";
import {
  Bug,
  Trophy,
  ExternalLink,
  Terminal,
  Mail,
  Github,
  BookOpen,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "/about — Asbawy" },
      {
        name: "description",
        content:
          "Mohammed Al-Kasabi (Asbawy) — Red Team Consultant, Penetration Tester, and Bug Bounty Hunter.",
      },
      { property: "og:title", content: "/about — Asbawy" },
      {
        property: "og:description",
        content:
          "Red Team Consultant | Penetration Tester ",
      },
    ],
  }),
  component: AboutPage,
});

/* ── animated counter ── */
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = Math.ceil(target / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-2xl md:text-3xl font-mono text-neon-green text-glow-green">
      {count}
      {suffix}
    </span>
  );
}

/* ── main page ── */
function AboutPage() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    { label: "vulns_found", value: 250, suffix: "+" },
    { label: "orgs_recognized", value: 50, suffix: "+" },
    { label: "thm_rank", value: 1, suffix: "%" },
    { label: "experience", value: 5, suffix: "y" },
  ];

  const skills = [
    { cat: "Offensive", items: ["Web / API Pentesting", "Mobile (Android/iOS)", "Network & AD", "Source Code Review"] },
    { cat: "Tooling", items: ["Python", "Bash", "Golang", "C++"] },
    { cat: "Frameworks", items: ["MITRE ATT&CK", "PCI-DSS", "ISO 27001", "Cyber Kill Chain"] },
    { cat: "Platforms", items: ["Burp Suite", "Metasploit", "BloodHound", "Frida / Ghidra"] },
  ];

  const hallOfFame = [
    "Vimeo", "AT&T", "Elisa Oyj", "Mezmo",
    "Atlassian", "Doximity", "KnowBe4",
  ];

  const certs = [
    "Advanced Penetration Testing — Cybrary",
    "Penetration Tester — Cybrary",
    "AI for Red Teams — Cybrary",
    "Offensive Security Ops — Cybrary",
    "Cybersecurity Training — Cisco",
    "CompTIA PenTest+ Path — TryHackMe",
    "CyberOps Associate — Cisco",
    "Cybersecurity Job Simulation — Mastercard ",
    "Reversing .NET with dnSpy — Udemy",
    "Android Hacking — Udemy",
  ];

  const socials = [
    { icon: Github, label: "github.com/Asbawy", href: "https://github.com/Asbawy" },
    { icon: BookOpen, label: "asbawy.medium.com", href: "https://asbawy.medium.com" },
    { icon: ExternalLink, label: "linkedin.com/in/mhmmdashraf", href: "https://linkedin.com/in/mhmmdashraf" },
    { icon: Mail, label: "eng.mhmmd@yahoo.com", href: "mailto:eng.mhmmd@yahoo.com" },
  ];

  return (
    <CyberLayout>
      <section
        className={`px-6 md:px-10 py-10 max-w-5xl transition-all duration-700 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* ── breadcrumb ── */}
        <div className="font-mono text-[11px] text-muted-foreground">
          <span className="text-neon-green">asbawy</span>:
          <span className="text-neon-blue">~/about</span>$ cat identity.txt
        </div>
        <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
          /about <span className="text-muted-foreground">— whoami</span>
        </h1>

        {/* ── identity card ── */}
        <Panel title="identity" className="mt-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* avatar */}
            <div className="relative shrink-0 group">
              <div className="rounded-md border border-neon-green/40 bg-panel/60 p-[3px] shadow-[0_0_12px_rgba(0,255,136,0.08)] group-hover:border-neon-green/70 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] transition-all duration-400">
                <div className="rounded overflow-hidden">
                  <img
                    src="/asbawy.webp"
                    alt="Asbawy"
                    className="h-24 w-24 md:h-28 md:w-28 object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
              {/* status dot */}
              <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background bg-neon-green pulse-dot" />
            </div>

            {/* bio terminal */}
            <div className="font-mono text-xs space-y-1.5 min-w-0">
              <div>
                <span className="text-muted-foreground">name:</span>{" "}
                <span className="text-foreground">Mohammed Al-Kasabi</span>
              </div>
              <div>
                <span className="text-muted-foreground">alias:</span>{" "}
                <span className="text-neon-green text-glow-green">Asbawy</span>
              </div>
              <div>
                <span className="text-muted-foreground">role:</span>{" "}
                <span className="text-foreground">Red Team Consultant · Penetration Tester</span>
              </div>
              <div>
                <span className="text-muted-foreground">location:</span>{" "}
                <span className="text-foreground">Egypt</span>
              </div>
              <div>
                <span className="text-muted-foreground">education:</span>{" "}
                <span className="text-foreground">
                  B.Eng Electronics & Communications — Mansoura University
                </span>
              </div>
              <p className="!mt-3 text-muted-foreground leading-relaxed max-w-xl">
                Red Team operator specializing in web, mobile, network, and AD penetration testing.
                Recognized Bug Bounty Hunter by Atlassian, Doximity, Canva, Mezmo, and 50+ orgs.
              </p>
            </div>
          </div>
        </Panel>

        {/* ── stats ── */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-panel-border bg-panel/60 p-4 text-center"
            >
              <AnimatedCount target={s.value} suffix={s.suffix} />
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── skills grid ── */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((g) => (
            <Panel key={g.cat} title={g.cat.toLowerCase()}>
              <div className="flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <Tag key={item} variant="green">
                    {item}
                  </Tag>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        {/* ── hall of fame ── */}
        <Panel title="hall_of_fame" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {hallOfFame.map((org) => (
              <span
                key={org}
                className="inline-flex items-center gap-1.5 rounded-md border border-neon-blue/30 bg-neon-blue/5 px-3 py-1.5 font-mono text-[11px] text-neon-blue hover:bg-neon-blue/10 transition-colors"
              >
                <Bug className="h-3 w-3" />
                {org}
              </span>
            ))}
            <span className="inline-flex items-center rounded-md border border-panel-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              +42 more
            </span>
          </div>
        </Panel>

        {/* ── certs ── */}
        <Panel title="certifications" className="mt-6">
          <ul className="space-y-2 font-mono text-xs">
            {certs.map((c) => (
              <li key={c} className="flex items-start gap-2 text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 shrink-0 mt-0.5 text-threat-mid" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* ── links ── */}
        <Panel title="connect" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-md border border-panel-border bg-background/40 px-4 py-3 font-mono text-xs text-muted-foreground hover:border-neon-green/40 hover:text-neon-green transition-all"
              >
                <s.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{s.label}</span>
                <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </Panel>

        {/* ── footer terminal ── */}
        <div className="mt-8 rounded-md border border-panel-border bg-background/60 p-4 font-mono text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-neon-green" />
            <span>
              <span className="text-neon-green">asbawy</span>@kali:~$ echo "Always learning,
              always breaking."
            </span>
          </div>
          <div className="mt-1 text-foreground">Always learning, always breaking.</div>
        </div>
      </section>
    </CyberLayout>
  );
}
