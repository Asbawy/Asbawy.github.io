import { useMemo, useState } from "react";
import { Panel } from "./Layout";

function b64urlDecode(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  try {
    return decodeURIComponent(
      Array.from(atob(s))
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
  } catch {
    return null;
  }
}

function safeJsonPretty(s: string | null) {
  if (!s) return null;
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export function JwtDecoder() {
  const [input, setInput] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiU2VjUmVzZWFyY2hlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcxNjI2OTAyMn0.signaturE_placeholdeR",
  );

  const parts = input.split(".");
  const header = parts[0] ? safeJsonPretty(b64urlDecode(parts[0])) : null;
  const payload = parts[1] ? safeJsonPretty(b64urlDecode(parts[1])) : null;
  const sig = parts[2] ?? "";

  const alg = useMemo(() => {
    try {
      return header ? JSON.parse(header).alg : null;
    } catch {
      return null;
    }
  }, [header]);

  return (
    <Panel title="jwt decoder / token analyzer">
      <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        input // paste token
      </label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value.trim())}
        rows={4}
        className="w-full resize-none rounded-md border border-panel-border bg-background/80 p-3 font-mono text-[12px] text-neon-blue focus:outline-none focus:border-neon-green/50 break-all"
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <Slot label="header" tone="green" content={header} />
        <Slot label="payload" tone="blue" content={payload} />
        <Slot label="signature" tone="muted" content={sig || "(none)"} />
      </div>

      {alg && (
        <div
          className={`mt-4 rounded-md border px-3 py-2 font-mono text-[11px] ${
            alg === "none"
              ? "border-threat-high/50 bg-threat-high/10 text-threat-high"
              : "border-neon-green/40 bg-neon-green/5 text-neon-green"
          }`}
        >
          {alg === "none"
            ? "⚠ alg=none detected — signature bypass possible"
            : `✓ alg=${alg} — verify against secret/key`}
        </div>
      )}
    </Panel>
  );
}

function Slot({
  label,
  content,
  tone,
}: {
  label: string;
  content: string | null;
  tone: "green" | "blue" | "muted";
}) {
  const color =
    tone === "green"
      ? "text-neon-green"
      : tone === "blue"
      ? "text-neon-blue"
      : "text-muted-foreground";
  return (
    <div className="rounded-md border border-panel-border bg-background/60">
      <div className="border-b border-panel-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <pre className={`max-h-48 overflow-auto p-3 text-[11px] break-all whitespace-pre-wrap ${color}`}>
        {content ?? "// invalid"}
      </pre>
    </div>
  );
}

function toHex(s: string) {
  return Array.from(new TextEncoder().encode(s))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}
function fromHex(s: string) {
  try {
    const clean = s.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) return null;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function PayloadEncoder() {
  const [text, setText] = useState("admin' OR 1=1 --");

  const b64 = useMemo(() => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch {
      return "";
    }
  }, [text]);
  const hex = useMemo(() => toHex(text), [text]);
  const url = useMemo(() => encodeURIComponent(text), [text]);
  const htmlEntities = useMemo(
    () =>
      text.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
      ),
    [text],
  );

  const tryDecode = (val: string) => {
    const variants: { label: string; out: string | null }[] = [
      { label: "base64", out: b64urlDecode(val) },
      { label: "hex", out: fromHex(val) },
      { label: "url", out: (() => { try { return decodeURIComponent(val); } catch { return null; } })() },
    ];
    return variants.filter((v) => v.out && v.out !== val);
  };

  const decoded = tryDecode(text);

  return (
    <Panel title="payload encoder/decoder">
      <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        input // text or payload
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-md border border-panel-border bg-background/80 p-3 font-mono text-[12px] text-foreground focus:outline-none focus:border-neon-blue/50"
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
        <Slot label="base64" tone="green" content={b64} />
        <Slot label="hex" tone="blue" content={hex} />
        <Slot label="url-encoded" tone="green" content={url} />
        <Slot label="html entities" tone="blue" content={htmlEntities} />
      </div>

      {decoded.length > 0 && (
        <div className="mt-4 rounded-md border border-neon-blue/30 bg-neon-blue/5 p-3 font-mono text-[11px]">
          <div className="text-neon-blue mb-1">// auto-detected decodings</div>
          {decoded.map((d) => (
            <div key={d.label} className="text-foreground/80 break-all">
              <span className="text-muted-foreground">{d.label}:</span> {d.out}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}