import { useState, useMemo } from "react";
import { Code2, Copy, Check, Sparkles, Key, AlertTriangle } from "lucide-react";

function rot13(str: string) {
  return str.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function asciiToHex(str: string) {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join(" ");
}

function hexToAscii(hex: string) {
  const clean = hex.replace(/[\s0x]/g, "");
  if (clean.length % 2 !== 0) return null;
  try {
    let out = "";
    for (let i = 0; i < clean.length; i += 2) {
      out += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
    }
    return out;
  } catch {
    return null;
  }
}

function asciiToBinary(str: string) {
  return Array.from(str)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

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

export function CyberCodec() {
  const [input, setInput] = useState("admin' OR '1'='1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversions = useMemo(() => {
    let b64Enc = "";
    let b64Dec = "";
    try {
      b64Enc = btoa(input);
    } catch {
      b64Enc = "(invalid for Latin1 btoa)";
    }
    try {
      b64Dec = atob(input.trim());
    } catch {
      b64Dec = "(invalid base64)";
    }

    let urlEnc = "";
    let urlDec = "";
    try {
      urlEnc = encodeURIComponent(input);
      urlDec = decodeURIComponent(input);
    } catch {
      urlDec = "(invalid url sequence)";
    }

    const hexEnc = asciiToHex(input);
    const hexDec = hexToAscii(input);

    const binaryEnc = asciiToBinary(input);
    const rot = rot13(input);

    // JWT analysis
    let jwtData: { header: string | null; payload: string | null; sig: string; alg: string | null; expDate: string | null } | null = null;
    const parts = input.trim().split(".");
    if (parts.length === 3) {
      const h = safeJsonPretty(b64urlDecode(parts[0]));
      const p = safeJsonPretty(b64urlDecode(parts[1]));
      let alg = null;
      let expDate = null;
      try {
        if (h) alg = JSON.parse(h).alg;
        if (p) {
          const parsedP = JSON.parse(p);
          if (parsedP.exp) {
            expDate = new Date(parsedP.exp * 1000).toISOString();
          }
        }
      } catch {}
      jwtData = { header: h, payload: p, sig: parts[2], alg, expDate };
    }

    return {
      b64Enc,
      b64Dec,
      urlEnc,
      urlDec,
      hexEnc,
      hexDec,
      binaryEnc,
      rot,
      jwtData,
    };
  }, [input]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Input Header Box */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Cyber Multi-Codec & JWT Inspector</h2>
              <p className="text-xs text-muted-foreground">
                Real-time bidirectional conversion across encodings, ciphers, and tokens
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwibmFtZSI6IkFzYmF3eSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc5ODc2MTYwMH0.signature_sample")}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            >
              Load JWT
            </button>
            <button
              onClick={() => setInput("<script>alert('XSS')</script>")}
              className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
            >
              Load XSS
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>INPUT TEXT OR CIPHERTEXT</span>
            <span>Length: {input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Type or paste payload to convert..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/80 text-foreground font-mono text-xs focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/30 transition-all break-all"
          />
        </div>
      </div>

      {/* JWT Inspector (if detected) */}
      {conversions.jwtData && (
        <div className="rounded-xl border border-fuchsia-500/40 bg-card p-5 space-y-4 shadow-[0_0_20px_rgba(232,121,249,0.08)]">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-fuchsia-400">
                JSON Web Token (JWT) Detected
              </span>
            </div>
            {conversions.jwtData.alg && (
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                  conversions.jwtData.alg === "none"
                    ? "bg-destructive/20 text-destructive border-destructive/40"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold"
                }`}
              >
                alg: {conversions.jwtData.alg}
              </span>
            )}
          </div>

          {conversions.jwtData.alg === "none" && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>WARNING: alg=none detected — potential signature verification bypass!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase">Header</span>
              <pre className="p-3 rounded-lg border border-border bg-background/70 text-emerald-300 overflow-x-auto max-h-[160px]">
                {conversions.jwtData.header || "null"}
              </pre>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase">Payload</span>
              <pre className="p-3 rounded-lg border border-border bg-background/70 text-cyan-300 overflow-x-auto max-h-[160px]">
                {conversions.jwtData.payload || "null"}
              </pre>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground uppercase">Signature</span>
              <div className="p-3 rounded-lg border border-border bg-background/70 text-muted-foreground break-all max-h-[160px] overflow-y-auto">
                {conversions.jwtData.sig || "(empty)"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Multi-Conversions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Base64 Encoded", value: conversions.b64Enc, key: "b64enc" },
          { label: "Base64 Decoded", value: conversions.b64Dec, key: "b64dec" },
          { label: "URL Encoded", value: conversions.urlEnc, key: "urlenc" },
          { label: "URL Decoded", value: conversions.urlDec, key: "urldec" },
          { label: "Hexadecimal (Hex)", value: conversions.hexEnc, key: "hexenc" },
          { label: "Hex to ASCII", value: conversions.hexDec || "(not hex)", key: "hexdec" },
          { label: "ROT13 Cipher", value: conversions.rot, key: "rot" },
          { label: "Binary (8-bit)", value: conversions.binaryEnc, key: "bin" },
        ].map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-fuchsia-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                {item.label}
              </span>
              <button
                onClick={() => handleCopy(item.value, item.key)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={`Copy ${item.label}`}
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <pre className="p-2.5 rounded-lg border border-border bg-background/60 text-xs font-mono text-foreground break-all whitespace-pre-wrap max-h-[90px] overflow-y-auto select-all">
              {item.value}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
