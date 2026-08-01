import { createFileRoute } from "@tanstack/react-router";
import { CyberLayout } from "@/components/cyber/Layout";
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
  Linkedin,
  Unlock,
  Radio,
  Wifi,
  Award,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Asbawy" },
      {
        name: "description",
        content:
          "Mohammed Al-Kasabi (Asbawy) — Red Team Consultant, Penetration Tester, and Bug Bounty Hunter.",
      },
    ],
  }),
  component: AboutPage,
});

/* ── Animated counter ── */
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
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span
      ref={ref}
      className="text-3xl md:text-4xl font-extrabold font-sans text-foreground tracking-tight"
    >
      {count}
      {suffix}
    </span>
  );
}

/* ── Segmented Skill Bar ── */
function SegmentedSkillBar({
  label,
  level,
  icon: Icon,
}: {
  label: string;
  level: number;
  icon: any;
}) {
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
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetBlocks]);

  return (
    <div ref={ref} className="space-y-2 font-sans">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <Icon className="h-4 w-4 text-emerald-400" />
          <span>{label}</span>
        </div>
        <span className="text-xs font-bold text-emerald-400">{level}%</span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: totalBlocks }).map((_, i) => {
          const isActive = i < activeBlocks;
          return (
            <div
              key={i}
              className={`h-2.5 w-full rounded-sm transition-all duration-300 ${
                isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-muted"
              }`}
              style={{ transitionDelay: `${i * 20}ms` }}
            />
          );
        })}
      </div>
    </div>
  );
}

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
    {
      name: "Advanced Penetration Testing",
      issuer: "Cybrary",
      code: "SYS_AUTH",
      color: "text-emerald-400",
    },
    { name: "Penetration Tester", issuer: "Cybrary", code: "SYS_AUTH", color: "text-emerald-400" },
    { name: "AI for Red Teams", issuer: "Cybrary", code: "AI_MODULE", color: "text-fuchsia-400" },
    { name: "Offensive Security Ops", issuer: "Cybrary", code: "OP_SEC", color: "text-amber-400" },
    { name: "Cybersecurity Training", issuer: "Cisco", code: "NET_INFRA", color: "text-cyan-400" },
    {
      name: "CompTIA PenTest+ Path",
      issuer: "TryHackMe",
      code: "PTH_CERT",
      color: "text-purple-400",
    },
    { name: "CyberOps Associate", issuer: "Cisco", code: "NET_INFRA", color: "text-cyan-400" },
    {
      name: "Cybersecurity Job Simulation",
      issuer: "Mastercard",
      code: "FIN_SEC",
      color: "text-amber-400",
    },
    { name: "Reversing .NET with dnSpy", issuer: "Udemy", code: "REV_ENG", color: "text-rose-400" },
    { name: "Android Hacking", issuer: "Udemy", code: "MOB_SEC", color: "text-emerald-400" },
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
      <div className="w-full min-h-full bg-background text-foreground py-12 px-6 md:px-12 lg:px-16 font-sans space-y-10">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Profile Hero Card */}
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar Logo */}
              <div className="shrink-0">
                <div className="relative rounded-full overflow-hidden bg-white p-3 border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                  <EyeOfRa className="h-32 w-32 md:h-40 md:w-40 object-contain text-zinc-950" />
                </div>
              </div>

              {/* Info Details */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
                    Mohammed Al-Kasabi
                  </h2>
                  <p className="text-base font-medium text-emerald-400">Alias: Asbawy · Egypt</p>
                </div>

                {/* Roles Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Crosshair className="w-3.5 h-3.5" />
                    Red Team Consultant
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <Shield className="w-3.5 h-3.5" />
                    Penetration Tester
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Bug className="w-3.5 h-3.5" />
                    Bug Bounty Hunter
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl pt-2">
                  Red Team operator specializing in web, mobile, network, and Active Directory
                  penetration testing. Recognized by Atlassian, Doximity, Canva, Mezmo, and 50+
                  organizations worldwide. Graduated with a B.Eng in Electronics & Communications
                  from Mansoura University.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <AnimatedCount target={250} suffix="+" />
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mt-2">
                Vulns Found
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <AnimatedCount target={50} suffix="+" />
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mt-2">
                Orgs Recognized
              </div>
            </div>

            <a
              href="https://profile.hackthebox.com/profile/019dc6a8-c662-7226-a4e9-fe02c60c2ccd"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-border bg-card p-5 text-center hover:border-amber-500/40 transition-colors"
            >
              <AnimatedCount target={120} />
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mt-2">
                HTB Global Rank
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">[Elite Hacker]</div>
            </a>

            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <AnimatedCount target={5} suffix="y" />
              <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mt-2">
                Experience
              </div>
            </div>
          </div>

          {/* Skills & Capability Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Offensive Capabilities */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-foreground">Offensive Capabilities</h2>
              </div>
              <div className="space-y-5">
                {skillBars.map((s) => (
                  <SegmentedSkillBar key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* Technical Stack */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-foreground">Technical Stack & Frameworks</h2>
              </div>
              <div className="space-y-4">
                {tools.map((g) => (
                  <div key={g.cat} className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {g.cat}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-emerald-400 border border-emerald-500/30"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bounty Board Neutralized Targets */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-foreground">
                Bounty Board — Neutralized Targets
              </h2>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              Confirmed responsible disclosures & secured bounties:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {hallOfFame.map((org) => (
                <div
                  key={org}
                  className="rounded-lg border border-border bg-muted p-3 text-center hover:border-amber-500/40 transition-colors"
                >
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Target
                  </div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{org}</div>
                </div>
              ))}
              <div className="rounded-lg border border-dashed border-border bg-muted p-3 flex items-center justify-center text-xs font-bold text-emerald-400">
                +42 MORE
              </div>
            </div>
          </div>

          {/* Certifications Log */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Award className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-lg font-bold text-foreground">Certifications & Accreditations</h2>
            </div>
            <div className="space-y-2">
              {certs.map((c, i) => (
                <div
                  key={c.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted border border-border hover:border-fuchsia-500/30 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${c.color}`}>{c.code}</span>
                    <span className="font-bold text-foreground">{c.name}</span>
                  </div>
                  <span className="text-muted-foreground">Issuer: {c.issuer}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Establish Connection Links */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wifi className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-foreground">Establish Connection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted px-5 py-4 text-sm font-medium text-foreground hover:border-emerald-400/40 hover:text-emerald-400 transition-all"
                >
                  <s.icon className="w-5 h-5 text-emerald-400" />
                  <span className="truncate">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
