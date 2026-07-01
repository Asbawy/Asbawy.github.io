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
  Shield,
  Crosshair,
  Code2,
  Cpu,
  Award,
  MapPin,
  GraduationCap,
  Linkedin,
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
        content: "Red Team Consultant | Penetration Tester ",
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
          const duration = 1400;
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
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span
      ref={ref}
      className="text-3xl md:text-4xl font-mono text-neon-green text-glow-green tabular-nums"
    >
      {count}
      {suffix}
    </span>
  );
}

/* ── stagger reveal ── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── skill progress bar ── */
function SkillBar({
  label,
  level,
  icon: Icon,
}: {
  label: string;
  level: number;
  icon: typeof Shield;
}) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(level), 200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [level]);

  return (
    <div ref={ref} className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 font-mono text-xs text-foreground/80">
          <Icon className="h-3.5 w-3.5 text-neon-green" />
          {label}
        </div>
        <span className="font-mono text-[10px] text-neon-green/70">{level}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-panel-border/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-green/70 to-neon-green transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            boxShadow: width > 0 ? "0 0 8px rgba(0, 255, 136, 0.3)" : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ── main page ── */
function AboutPage() {
  const skillBars = [
    { label: "Web / API Pentesting", level: 95, icon: Crosshair },
    { label: "Mobile (Android/iOS)", level: 85, icon: Cpu },
    { label: "Network & Active Directory", level: 90, icon: Shield },
    { label: "Source Code Review", level: 80, icon: Code2 },
  ];

  const tools = [
    { cat: "Languages", items: ["Python", "Bash", "Golang", "C++"] },
    { cat: "Frameworks", items: ["MITRE ATT&CK", "PCI-DSS", "ISO 27001", "Cyber Kill Chain"] },
    { cat: "Platforms", items: ["Burp Suite", "Metasploit", "BloodHound", "Frida / Ghidra"] },
  ];

  const hallOfFame = ["Vimeo", "AT&T", "Elisa Oyj", "Mezmo", "Atlassian", "Doximity", "KnowBe4"];

  const certs = [
    { name: "Advanced Penetration Testing", issuer: "Cybrary" },
    { name: "Penetration Tester", issuer: "Cybrary" },
    { name: "AI for Red Teams", issuer: "Cybrary" },
    { name: "Offensive Security Ops", issuer: "Cybrary" },
    { name: "Cybersecurity Training", issuer: "Cisco" },
    { name: "CompTIA PenTest+ Path", issuer: "TryHackMe" },
    { name: "CyberOps Associate", issuer: "Cisco" },
    { name: "Cybersecurity Job Simulation", issuer: "Mastercard" },
    { name: "Reversing .NET with dnSpy", issuer: "Udemy" },
    { name: "Android Hacking", issuer: "Udemy" },
  ];

  const socials = [
    { icon: Github, label: "github.com/Asbawy", href: "https://github.com/Asbawy" },
    { icon: BookOpen, label: "asbawy.medium.com", href: "https://asbawy.medium.com" },
    {
      icon: Linkedin,
      label: "linkedin.com/in/mhmmdashraf",
      href: "https://linkedin.com/in/mhmmdashraf",
    },
    { icon: Mail, label: "eng.mhmmd@yahoo.com", href: "mailto:eng.mhmmd@yahoo.com" },
  ];

  return (
    <CyberLayout>
      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER — Full-width immersive header
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-panel-border">
        {/* Background layers */}
        <div className="absolute inset-0">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-neon-green/[0.03]" />
          {/* Animated grid dots */}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          {/* Scanlines */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
          {/* Radial glow behind avatar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/[0.03] rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative px-6 md:px-10 py-16 md:py-24 max-w-5xl">
          {/* Breadcrumb */}
          <div className="font-mono text-[11px] text-muted-foreground mb-8">
            <span className="text-neon-green">asbawy</span>:
            <span className="text-neon-green">~/about</span>$ cat identity.txt
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            {/* ── Avatar/Logo in circle view ── */}
            <Reveal className="shrink-0">
              <div className="relative rounded-full overflow-hidden bg-neon-green/5 p-2.5 border border-neon-green/30 shadow-[0_0_25px_rgba(0,255,136,0.15)] hover:border-neon-green/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all duration-300 backdrop-blur-md">
                {/* Soft glowing backdrop to illuminate the dark logo */}
                <div className="absolute inset-1.5 rounded-full bg-neon-green/25 blur-xl pointer-events-none" />
                <img
                  src="/eye-of-ra.png"
                  alt="Eye of Ra"
                  className="relative z-10 h-36 w-36 md:h-44 md:w-44 object-contain hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Reveal>

            {/* ── Identity info ── */}
            <Reveal delay={150} className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                Mohammed Al-Kasabi
              </h1>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-neon-green/5 px-3 py-1 font-mono text-[11px] text-neon-green">
                  <Crosshair className="h-3 w-3" />
                  Red Team Consultant
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/40 bg-neon-green/5 px-3 py-1 font-mono text-[11px] text-neon-green">
                  <Shield className="h-3 w-3" />
                  Penetration Tester
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-threat-mid/40 bg-threat-mid/5 px-3 py-1 font-mono text-[11px] text-threat-mid">
                  <Bug className="h-3 w-3" />
                  Bug Bounty Hunter
                </span>
              </div>

              {/* Terminal-style bio */}
              <div className="mt-6 rounded-lg border border-panel-border bg-panel/60 p-4 md:p-5 font-mono text-xs space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.25_25)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.18_80)]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-neon-green" />
                  <span className="ml-2 text-[10px] uppercase tracking-widest">identity.txt</span>
                </div>
                <div>
                  <span className="text-neon-green">$</span>{" "}
                  <span className="text-muted-foreground">alias:</span>{" "}
                  <span className="text-neon-green text-glow-green font-semibold">Asbawy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                  <span className="text-muted-foreground">location:</span>{" "}
                  <span className="text-foreground">Egypt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                  <span className="text-muted-foreground">edu:</span>{" "}
                  <span className="text-foreground">
                    B.Eng Electronics & Communications — Mansoura University
                  </span>
                </div>
                <div className="!mt-3 pt-3 border-t border-panel-border/50 text-muted-foreground leading-relaxed">
                  Red Team operator specializing in web, mobile, network, and AD penetration
                  testing. Recognized Bug Bounty Hunter by Atlassian, Doximity, Canva, Mezmo, and
                  50+ organizations worldwide.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT SECTIONS
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-10 max-w-5xl space-y-8">
        {/* ── Stats row ── */}
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Stat 1: Vulnerabilities Found */}
            <div className="group rounded-xl border border-panel-border bg-panel/60 p-5 text-center hover:border-neon-green/30 hover:bg-neon-green/[0.02] transition-all duration-300 flex flex-col items-center justify-center min-h-[135px]">
              <AnimatedCount target={250} suffix="+" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                vulns_found
              </div>
            </div>

            {/* Stat 2: Organizations Recognized */}
            <div className="group rounded-xl border border-panel-border bg-panel/60 p-5 text-center hover:border-neon-green/30 hover:bg-neon-green/[0.02] transition-all duration-300 flex flex-col items-center justify-center min-h-[135px]">
              <AnimatedCount target={50} suffix="+" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                orgs_recognized
              </div>
            </div>

            {/* Stat 3: Hack The Box Global Rank */}
            <a
              href="https://profile.hackthebox.com/profile/019dc6a8-c662-7226-a4e9-fe02c60c2ccd"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-panel-border bg-panel/60 p-5 text-center hover:border-neon-green/30 hover:bg-neon-green/[0.02] hover:shadow-[0_0_20px_rgba(0,255,136,0.05)] transition-all duration-300 flex flex-col justify-between min-h-[135px] focus:outline-none focus-visible:ring-1 focus-visible:ring-neon-green"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <AnimatedCount target={320} />
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  htb_global_rank
                </div>
              </div>
              <div className="mt-3 pt-2 w-full border-t border-panel-border/30 font-mono text-[10px] text-muted-foreground/80 group-hover:text-neon-green/80 transition-colors flex items-center justify-center gap-1.5">
                <span>Asbawy</span>
                <span className="text-neon-green font-semibold">(Pro Hacker)</span>
              </div>
            </a>

            {/* Stat 4: Years of Experience */}
            <div className="group rounded-xl border border-panel-border bg-panel/60 p-5 text-center hover:border-neon-green/30 hover:bg-neon-green/[0.02] transition-all duration-300 flex flex-col items-center justify-center min-h-[135px]">
              <AnimatedCount target={5} suffix="y" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                experience
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Skills with animated progress bars ── */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill bars */}
            <Panel title="offensive_capabilities">
              <div className="space-y-4">
                {skillBars.map((s) => (
                  <SkillBar key={s.label} {...s} />
                ))}
              </div>
            </Panel>

            {/* Tools & Frameworks */}
            <div className="space-y-4">
              {tools.map((g) => (
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
          </div>
        </Reveal>

        {/* ── Hall of fame ── */}
        <Reveal delay={150}>
          <Panel title="hall_of_fame // bug_bounties">
            <p className="font-mono text-[11px] text-muted-foreground/70 mb-4">
              Recognized by the following organizations for responsibly disclosed vulnerabilities:
            </p>
            <div className="flex flex-wrap gap-2">
              {hallOfFame.map((org) => (
                <span
                  key={org}
                  className="group inline-flex items-center gap-2 rounded-lg border border-neon-green/20 bg-neon-green/[0.03] px-4 py-2 font-mono text-[12px] text-neon-green hover:bg-neon-green/10 hover:border-neon-green/40 hover:shadow-[0_0_15px_rgba(0,255,136,0.08)] transition-all duration-300"
                >
                  <Bug className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  {org}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-panel-border px-4 py-2 font-mono text-[12px] text-muted-foreground">
                <span className="text-neon-green/50">+</span>42 more
              </span>
            </div>
          </Panel>
        </Reveal>

        {/* ── Certifications ── */}
        <Reveal delay={200}>
          <Panel title="certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {certs.map((c) => (
                <div
                  key={c.name}
                  className="group flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-neon-green/[0.03] transition-colors"
                >
                  <div className="shrink-0 rounded-md bg-threat-mid/10 border border-threat-mid/20 p-1.5">
                    <Award className="h-3.5 w-3.5 text-threat-mid" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-foreground/80 truncate">{c.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground/60">{c.issuer}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        {/* ── Connect ── */}
        <Reveal delay={250}>
          <Panel title="connect">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 rounded-lg border border-panel-border bg-background/30 px-5 py-4 font-mono text-xs text-muted-foreground hover:border-neon-green/40 hover:text-neon-green hover:bg-neon-green/[0.03] transition-all duration-300 overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-green/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <s.icon className="h-4.5 w-4.5 shrink-0 relative z-10" />
                  <span className="truncate relative z-10">{s.label}</span>
                  <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-1 relative z-10" />
                </a>
              ))}
            </div>
          </Panel>
        </Reveal>

        {/* ── Footer terminal ── */}
        <Reveal delay={300}>
          <div className="rounded-xl border border-panel-border bg-panel/60 p-5 font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.25_25)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.18_80)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-neon-green" />
              <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                terminal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-neon-green" />
              <span>
                <span className="text-neon-green">asbawy</span>@kali:~$ echo &quot;Always learning,
                always breaking.&quot;
              </span>
            </div>
            <div className="mt-1.5 text-foreground text-sm">Always learning, always breaking.</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-neon-green">asbawy</span>@kali:~$
              <span className="inline-block w-2 h-4 bg-neon-green/80 animate-pulse rounded-sm" />
            </div>
          </div>
        </Reveal>
      </section>
    </CyberLayout>
  );
}
