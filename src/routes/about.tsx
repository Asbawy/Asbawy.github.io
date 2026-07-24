import { createFileRoute } from "@tanstack/react-router";
import { CyberLayout, Panel, Tag } from "@/components/cyber/Layout";
import { EyeOfRa } from "@/components/cyber/EyeOfRa";
import {
  Bug,
  Crosshair,
  Terminal,
  Mail,
  Github,
  BookOpen,
  Shield,
  Code2,
  Cpu,
  MapPin,
  GraduationCap,
  Linkedin,
  Lock,
  Unlock,
  Radio,
  Wifi,
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
    <span ref={ref} className="text-3xl md:text-4xl font-mono text-foreground font-bold tracking-tight">
      {count}
      {suffix}
    </span>
  );
}

/* ── typewriter ── */
function TypewriterText({ text, delay = 0, speed = 30, cursor = true }: { text: string; delay?: number; speed?: number; cursor?: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setTimeout(() => setStarted(true), delay);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, started, speed]);

  return (
    <span ref={ref} className="whitespace-pre-wrap">
      {displayed}
      {cursor && !done && <span className="animate-pulse bg-foreground text-transparent ml-0.5">_</span>}
      {cursor && done && <span className="animate-pulse opacity-50 ml-0.5">_</span>}
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

/* ── segmented skill bar (HUD style) ── */
function SegmentedSkillBar({ label, level, icon: Icon }: { label: string; level: number; icon: any }) {
  const [activeBlocks, setActiveBlocks] = useState(0);
  const totalBlocks = 20;
  const targetBlocks = Math.round((level / 100) * totalBlocks);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setActiveBlocks(targetBlocks), 200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetBlocks]);

  return (
    <div ref={ref} className="group font-mono">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-xs text-foreground/90 font-semibold">
          <Icon className="h-3.5 w-3.5 text-accent-primary" />
          {label}
        </div>
        <span className="text-[10px] text-accent-primary opacity-80">[{level}%]</span>
      </div>
      <div className="flex gap-[2px]">
        {Array.from({ length: totalBlocks }).map((_, i) => {
          const isActive = i < activeBlocks;
          return (
            <div
              key={i}
              className={`h-2.5 w-full rounded-[1px] transition-all duration-300 ${isActive
                  ? "bg-accent-primary shadow-[0_0_5px_var(--color-accent-primary)]"
                  : "bg-foreground/10"
                }`}
              style={{ transitionDelay: `${i * 20}ms` }}
            />
          );
        })}
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
    { cat: "Platforms", items: ["Burp Suite", "Metasploit", "BloodHound", "Frida", "Ghidra"] },
  ];

  const hallOfFame = ["Vimeo", "AT&T", "Elisa Oyj", "Mezmo", "Atlassian", "Doximity", "KnowBe4"];

  const certs = [
    { name: "Advanced Penetration Testing", issuer: "Cybrary", code: "SYS_AUTH", color: "text-accent-primary" },
    { name: "Penetration Tester", issuer: "Cybrary", code: "SYS_AUTH", color: "text-accent-primary" },
    { name: "AI for Red Teams", issuer: "Cybrary", code: "AI_MODULE", color: "text-accent-secondary" },
    { name: "Offensive Security Ops", issuer: "Cybrary", code: "OP_SEC", color: "text-threat-mid" },
    { name: "Cybersecurity Training", issuer: "Cisco", code: "NET_INFRA", color: "text-blue-500" },
    { name: "CompTIA PenTest+ Path", issuer: "TryHackMe", code: "PTH_CERT", color: "text-purple-500" },
    { name: "CyberOps Associate", issuer: "Cisco", code: "NET_INFRA", color: "text-blue-500" },
    { name: "Cybersecurity Job Simulation", issuer: "Mastercard", code: "FIN_SEC", color: "text-amber-500" },
    { name: "Reversing .NET with dnSpy", issuer: "Udemy", code: "REV_ENG", color: "text-pink-500" },
    { name: "Android Hacking", issuer: "Udemy", code: "MOB_SEC", color: "text-green-400" },
  ];

  const socials = [
    { icon: Github, label: "github.com/Asbawy", href: "https://github.com/Asbawy" },
    { icon: BookOpen, label: "asbawy.medium.com", href: "https://asbawy.medium.com" },
    { icon: Linkedin, label: "linkedin.com/in/mhmmdashraf", href: "https://linkedin.com/in/mhmmdashraf" },
    { icon: Mail, label: "eng.mhmmd@yahoo.com", href: "mailto:eng.mhmmd@yahoo.com" },
  ];

  return (
    <CyberLayout>
      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER — The Dossier Boot Sequence
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-foreground/10 min-h-[400px] flex items-center">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-accent-primary/[0.03]" />
          <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none" />
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
        </div>

        <div className="relative px-6 md:px-10 py-16 w-full max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">

            {/* ── Avatar / Logo ── */}
            <Reveal className="shrink-0">
              <div className="relative rounded-full overflow-hidden bg-white p-2.5 border border-foreground/10 dark:border-white/30 shadow-[0_0_25px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:border-foreground/30 dark:hover:border-white hover:shadow-[0_0_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 backdrop-blur-md">
                {/* Soft glowing backdrop to illuminate the logo */}
                <div className="absolute inset-1.5 rounded-full bg-white/50 blur-xl pointer-events-none" />
                <EyeOfRa className="relative z-10 h-36 w-36 md:h-44 md:w-44 object-contain hover:scale-105 transition-transform duration-500 text-black" />
              </div>
            </Reveal>

            {/* ── Terminal Boot Info ── */}
            <div className="flex-1 min-w-0 font-mono w-full">
              <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-threat-mid" />
                <span><TypewriterText text="DECRYPTING DOSSIER..." speed={50} cursor={false} /></span>
              </div>

              <Reveal delay={800}>
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight uppercase relative group cursor-default">
                  <span className="relative z-10">Mohammed Al-Kasabi</span>
                  <span className="absolute inset-0 text-accent-primary opacity-0 group-hover:opacity-50 group-hover:animate-glitch-1 z-0 mix-blend-screen -translate-x-[2px]">Mohammed Al-Kasabi</span>
                  <span className="absolute inset-0 text-threat-high opacity-0 group-hover:opacity-50 group-hover:animate-glitch-2 z-0 mix-blend-screen translate-x-[2px]">Mohammed Al-Kasabi</span>
                </h1>

                <div className="mt-3 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold text-background bg-accent-primary rounded-sm shadow-[0_0_10px_var(--color-accent-primary)]">
                    <Crosshair className="h-3.5 w-3.5" />
                    RED_TEAM_CONSULTANT
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-foreground/30 bg-foreground/5 px-3 py-1 font-mono text-xs text-foreground rounded-sm">
                    <Shield className="h-3 w-3" />
                    PEN_TESTER
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-threat-mid/40 bg-threat-mid/10 px-3 py-1 font-mono text-xs text-threat-mid rounded-sm">
                    <Bug className="h-3 w-3" />
                    BUG_BOUNTY_HUNTER
                  </span>
                </div>

                <div className="mt-6 font-mono text-sm space-y-2 max-w-2xl text-foreground/80 border-l-2 border-accent-primary/50 pl-4 py-1">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">ALIAS</span>
                    <span className="text-accent-primary">Asbawy</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">LOCATION</span>
                    <span>Egypt</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 shrink-0">EDU</span>
                    <span>B.Eng Electronics & Comm. — Mansoura Univ.</span>
                  </div>
                  <div className="pt-2 text-muted-foreground leading-relaxed">
                    <TypewriterText
                      delay={1200}
                      speed={15}
                      text="Red Team operator specializing in web, mobile, network, and AD penetration testing. Recognized by Atlassian, Doximity, Canva, Mezmo, and 50+ organizations worldwide."
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT SECTIONS
      ═══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-10 max-w-5xl space-y-8">

        {/* ── Dashboard Metrics ── */}
        <Reveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative group rounded border border-foreground/10 bg-foreground/5 p-5 flex flex-col items-center justify-center min-h-[120px] overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:10px_10px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <AnimatedCount target={250} suffix="+" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-primary font-semibold">Vulns_Found</div>
            </div>

            <div className="relative group rounded border border-foreground/10 bg-foreground/5 p-5 flex flex-col items-center justify-center min-h-[120px] overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:10px_10px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <AnimatedCount target={50} suffix="+" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-secondary font-semibold">Orgs_Recognized</div>
            </div>

            <a
              href="https://profile.hackthebox.com/profile/019dc6a8-c662-7226-a4e9-fe02c60c2ccd"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group rounded border border-foreground/10 bg-foreground/5 p-5 flex flex-col justify-between min-h-[120px] hover:border-threat-mid/40 transition-colors overflow-hidden"
            >
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:10px_10px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-threat-mid transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <AnimatedCount target={120} />
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-threat-mid font-semibold">HTB_Global_Rank</div>
              </div>
              <div className="mt-2 text-center text-[10px] font-mono text-muted-foreground relative z-10">
                [Elite Hacker]
              </div>
            </a>

            <div className="relative group rounded border border-foreground/10 bg-foreground/5 p-5 flex flex-col items-center justify-center min-h-[120px] overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:10px_10px]" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              <AnimatedCount target={5} suffix="y" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-semibold">Experience</div>
            </div>
          </div>
        </Reveal>

        {/* ── Skills & Tech ── */}
        <Reveal delay={300}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="sys.offensive_capabilities" icon={<Radio className="w-4 h-4" />}>
              <div className="space-y-5 p-2">
                {skillBars.map((s) => (
                  <SegmentedSkillBar key={s.label} {...s} />
                ))}
              </div>
            </Panel>

            <div className="space-y-4">
              {tools.map((g) => (
                <Panel key={g.cat} title={`sys.${g.cat.toLowerCase()}`} icon={<Terminal className="w-4 h-4" />}>
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

        {/* ── Bounty Board ── */}
        <Reveal delay={400}>
          <Panel title="bounty_board.targets_neutralized" icon={<Crosshair className="w-4 h-4" />}>
            <p className="font-mono text-[11px] text-muted-foreground mb-4 flex items-center gap-2">
              <Unlock className="w-3 h-3" />
              Confirmed responsible disclosures & secured bounties:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {hallOfFame.map((org) => (
                <div key={org} className="group relative overflow-hidden border border-threat-mid/20 bg-threat-mid/5 p-3 rounded hover:border-threat-mid/50 hover:bg-threat-mid/10 transition-all cursor-crosshair">
                  <div className="absolute top-0 right-0 p-1.5 opacity-50 group-hover:opacity-100 group-hover:animate-ping">
                    <Crosshair className="w-3 h-3 text-threat-mid" />
                  </div>
                  <div className="font-mono text-[9px] text-threat-mid/70 uppercase mb-1">Target</div>
                  <div className="font-mono text-sm font-bold text-foreground truncate">{org}</div>
                </div>
              ))}
              <div className="relative border border-foreground/10 border-dashed bg-foreground/5 p-3 rounded flex items-center justify-center opacity-70">
                <div className="font-mono text-xs font-bold text-foreground">+42 MORE</div>
              </div>
            </div>
          </Panel>
        </Reveal>

        {/* ── Certifications Event Log ── */}
        <Reveal delay={500}>
          <Panel title="certifications" icon={<Shield className="w-4 h-4" />}>
            <div className="bg-foreground/[0.02] dark:bg-black/50 p-4 rounded border border-foreground/10 space-y-1 overflow-hidden font-mono text-xs">
              {certs.map((c, i) => (
                <div key={c.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 hover:bg-foreground/5 border-l-2 border-transparent hover:border-accent-primary px-2 transition-colors group">
                  <span className="text-muted-foreground w-28 shrink-0">
                    [{new Date().getFullYear() - Math.floor(i / 3)}-{String(12 - (i % 12)).padStart(2, '0')}]
                  </span>
                  <span className={`${c.color} font-bold shrink-0 w-24 group-hover:animate-pulse`}>[{c.code}]</span>
                  <span className="text-foreground flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground shrink-0 hidden sm:inline-block">AUTH: {c.issuer}</span>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        {/* ── Connect ── */}
        <Reveal delay={600}>
          <Panel title="sys.establish_connection" icon={<Wifi className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-3 rounded border border-foreground/10 bg-foreground/5 px-5 py-4 font-mono text-xs text-muted-foreground hover:border-accent-primary/40 hover:text-foreground transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <s.icon className="h-4.5 w-4.5 shrink-0 relative z-10 group-hover:text-accent-primary transition-colors" />
                  <span className="truncate relative z-10">{s.label}</span>
                  <Terminal className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-1 relative z-10 text-accent-primary" />
                </a>
              ))}
            </div>
          </Panel>
        </Reveal>

      </section>
    </CyberLayout>
  );
}
