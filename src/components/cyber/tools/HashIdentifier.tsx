import { useState, useMemo } from "react";
import { Search, Copy, Check, Terminal, Shield, Sparkles, Hash } from "lucide-react";

interface HashMatch {
  name: string;
  category: "Operating System" | "Raw Digest" | "Kerberos / Active Directory" | "Web & CMS" | "Network / Equipment";
  confidence: "High" | "Medium" | "Low";
  hashcatMode: string;
  johnFormat: string;
  sampleCommand?: string;
  notes?: string;
}

function identifyHash(raw: string): HashMatch[] {
  const hash = raw.trim();
  if (!hash) return [];

  const matches: HashMatch[] = [];
  const len = hash.length;
  const isHex = /^[0-9a-fA-F]+$/.test(hash);

  // Kerberoast TGS-REP
  if (hash.startsWith("$krb5tgs$")) {
    matches.push({
      name: "Kerberos 5 TGS-REP etype 23 (Kerberoasting)",
      category: "Kerberos / Active Directory",
      confidence: "High",
      hashcatMode: "13100",
      johnFormat: "krb5tgs",
      notes: "Active Directory service account ticket extracted via Kerberoasting.",
    });
  }

  // AS-REP Roasting
  if (hash.startsWith("$krb5asrep$")) {
    matches.push({
      name: "Kerberos 5 AS-REP etype 23 (AS-REP Roasting)",
      category: "Kerberos / Active Directory",
      confidence: "High",
      hashcatMode: "18200",
      johnFormat: "krb5asrep",
      notes: "Active Directory user ticket with DONT_REQ_PREAUTH enabled.",
    });
  }

  // bcrypt
  if (/^\$2[aby]?\$\d{2}\$[./0-9A-Za-z]{53}$/.test(hash)) {
    matches.push({
      name: "bcrypt / Blowfish",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "3200",
      johnFormat: "bcrypt",
      notes: "Modern adaptive key derivation hash with salt and cost factor.",
    });
  }

  // Argon2
  if (hash.startsWith("$argon2id$") || hash.startsWith("$argon2i$")) {
    matches.push({
      name: "Argon2id / Argon2i",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "7300",
      johnFormat: "argon2",
      notes: "Memory-hard password hashing winner of the Password Hashing Competition.",
    });
  }

  // Unix MD5 crypt ($1$)
  if (/^\$1\$[./0-9A-Za-z]{1,8}\$[./0-9A-Za-z]{22}$/.test(hash)) {
    matches.push({
      name: "MD5 Crypt (Unix / Linux)",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "500",
      johnFormat: "md5crypt",
      notes: "Legacy Unix shadow file password format.",
    });
  }

  // SHA-256 crypt ($5$)
  if (/^\$5\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{43}$/.test(hash)) {
    matches.push({
      name: "SHA-256 Crypt (Unix / Linux)",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "7400",
      johnFormat: "sha256crypt",
      notes: "Linux /etc/shadow password hash with rounds.",
    });
  }

  // SHA-512 crypt ($6$)
  if (/^\$6\$(rounds=\d+\$)?[./0-9A-Za-z]{1,16}\$[./0-9A-Za-z]{86}$/.test(hash)) {
    matches.push({
      name: "SHA-512 Crypt (Unix / Linux)",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "1800",
      johnFormat: "sha512crypt",
      notes: "Default standard modern Linux shadow password hash.",
    });
  }

  // WordPress / phpBB phpass ($P$ or $H$)
  if (/^\$[PH]\$[./0-9A-Za-z]{31}$/.test(hash)) {
    matches.push({
      name: "WordPress / phpBB (phpass)",
      category: "Web & CMS",
      confidence: "High",
      hashcatMode: "400",
      johnFormat: "phpass",
      notes: "Portable PHP password hash with iterative MD5 stretching.",
    });
  }

  // MySQL 4.1+ (*HASH)
  if (hash.startsWith("*") && hash.length === 41 && /^[0-9a-fA-F]+$/.test(hash.slice(1))) {
    matches.push({
      name: "MySQL 4.1+ / MySQL 5 (SHA-1 double)",
      category: "Web & CMS",
      confidence: "High",
      hashcatMode: "300",
      johnFormat: "mysql-sha1",
      notes: "SHA1(SHA1(password)) format prefixed with asterisk.",
    });
  }

  // Length 32 Hex: MD5 or NTLM
  if (len === 32 && isHex) {
    if (hash.toLowerCase() === "aad3b435b51404eeaad3b435b51404ee") {
      matches.push({
        name: "LM Hash (Empty / Disabled)",
        category: "Operating System",
        confidence: "High",
        hashcatMode: "3000",
        johnFormat: "lm",
        notes: "Standard blank LM hash placeholder indicating LM authentication is disabled.",
      });
    }
    matches.push({
      name: "NTLM (Windows NT)",
      category: "Operating System",
      confidence: "High",
      hashcatMode: "1000",
      johnFormat: "nt",
      notes: "MD4(UTF-16LE(password)) used across Windows Active Directory & SAM databases.",
    });
    matches.push({
      name: "MD5 (Message Digest 5)",
      category: "Raw Digest",
      confidence: "High",
      hashcatMode: "0",
      johnFormat: "raw-md5",
      notes: "Standard raw 128-bit cryptographic hash.",
    });
    matches.push({
      name: "MD4",
      category: "Raw Digest",
      confidence: "Medium",
      hashcatMode: "900",
      johnFormat: "raw-md4",
      notes: "Older MD4 digest.",
    });
  }

  // Length 40 Hex: SHA-1
  if (len === 40 && isHex) {
    matches.push({
      name: "SHA-1",
      category: "Raw Digest",
      confidence: "High",
      hashcatMode: "100",
      johnFormat: "raw-sha1",
      notes: "Standard raw 160-bit SHA-1 hash.",
    });
    matches.push({
      name: "MySQL 4.1+ (without asterisk)",
      category: "Web & CMS",
      confidence: "Medium",
      hashcatMode: "300",
      johnFormat: "mysql-sha1",
    });
  }

  // Length 64 Hex: SHA-256
  if (len === 64 && isHex) {
    matches.push({
      name: "SHA-256",
      category: "Raw Digest",
      confidence: "High",
      hashcatMode: "1400",
      johnFormat: "raw-sha256",
      notes: "Standard SHA-2 family 256-bit hash.",
    });
    matches.push({
      name: "NTLMv2 / NetNTLMv2 Response fragment",
      category: "Operating System",
      confidence: "Medium",
      hashcatMode: "5600",
      johnFormat: "netntlmv2",
    });
  }

  // Length 128 Hex: SHA-512
  if (len === 128 && isHex) {
    matches.push({
      name: "SHA-512",
      category: "Raw Digest",
      confidence: "High",
      hashcatMode: "1700",
      johnFormat: "raw-sha512",
      notes: "Standard SHA-2 family 512-bit hash.",
    });
    matches.push({
      name: "Whirlpool",
      category: "Raw Digest",
      confidence: "Medium",
      hashcatMode: "6100",
      johnFormat: "whirlpool",
    });
  }

  return matches;
}

const SAMPLE_HASHES = [
  { label: "MD5", hash: "5d41402abc4b2a76b9719d911017c592" },
  { label: "NTLM", hash: "b4b9b02e6f09a9bd760f388b67351e2b" },
  { label: "Kerberoast", hash: "$krb5tgs$23$*user$realm$test/spn*$a1b2c3d4e5f6..." },
  { label: "bcrypt", hash: "$2a$12$R9h/cIPz0gi.URNNXRkh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW" },
  { label: "SHA-512", hash: "ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413" },
];

export function HashIdentifier() {
  const [input, setInput] = useState("b4b9b02e6f09a9bd760f388b67351e2b");
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  const matches = useMemo(() => identifyHash(input), [input]);

  const handleCopyCommand = (mode: string) => {
    const cmd = `hashcat -m ${mode} -a 0 hash.txt /usr/share/wordlists/rockyou.txt`;
    navigator.clipboard.writeText(cmd);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Input Header Box */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Hash className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Hash Identifier & Mode Finder</h2>
              <p className="text-xs text-muted-foreground">
                Classifies hash types and provides exact Hashcat modes & John formats
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">Samples:</span>
            {SAMPLE_HASHES.map((sample) => (
              <button
                key={sample.label}
                onClick={() => setInput(sample.hash)}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>INPUT HASH STRING</span>
            <span>
              Length: <span className="text-cyan-400 font-bold">{input.trim().length}</span> chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value.trim())}
            placeholder="Paste your hash here (e.g. 5d41402abc4b2a76b9719d911017c592)..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background/80 text-foreground font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all break-all resize-none"
          />
        </div>
      </div>

      {/* Identification Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Detection Results ({matches.length} matches found)</span>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">No recognized hash formats</p>
            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
              Please check that the string contains valid hex characters or recognizable prefixes ($2a$, $krb5tgs$, etc.).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m, idx) => {
              const isCopied = copiedMode === m.hashcatMode;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-5 hover:border-cyan-500/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-semibold">
                        {m.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          m.confidence === "High"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {m.confidence} Confidence
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground leading-snug">{m.name}</h3>

                    {m.notes && (
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        {m.notes}
                      </p>
                    )}
                  </div>

                  {/* Mode & Format Flags */}
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-background/60 p-2 rounded-lg border border-border">
                        <span className="text-[10px] text-muted-foreground block uppercase">Hashcat Mode</span>
                        <span className="text-cyan-400 font-bold">-m {m.hashcatMode}</span>
                      </div>
                      <div className="bg-background/60 p-2 rounded-lg border border-border">
                        <span className="text-[10px] text-muted-foreground block uppercase">John Format</span>
                        <span className="text-emerald-400 font-bold">--format={m.johnFormat}</span>
                      </div>
                    </div>

                    {/* Quick Command Button */}
                    <button
                      onClick={() => handleCopyCommand(m.hashcatMode)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 text-xs font-mono text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                    >
                      <span className="truncate">hashcat -m {m.hashcatMode} -a 0 ...</span>
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
