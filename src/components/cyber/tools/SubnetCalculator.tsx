import { useState, useMemo } from "react";
import { Network, Globe, Shield, Sparkles, Copy, Check } from "lucide-react";

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let res = 0;
  for (const p of parts) {
    const n = Number(p);
    if (isNaN(n) || n < 0 || n > 255) return null;
    res = (res << 8) | n;
  }
  return res >>> 0;
}

function intToIp(int: number): string {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join(".");
}

function intToBinary(int: number): string {
  return (int >>> 0).toString(2).padStart(32, "0");
}

function getRfcScope(int: number): { label: string; type: "private" | "public" | "special" } {
  // 10.0.0.0/8: 0x0A000000 to 0x0AFFFFFF
  if ((int & 0xff000000) === 0x0a000000) {
    return { label: "RFC 1918 Private (Class A)", type: "private" };
  }
  // 172.16.0.0/12: 0xAC100000 to 0xAC1FFFFF
  if ((int & 0xfff00000) === 0xac100000) {
    return { label: "RFC 1918 Private (Class B)", type: "private" };
  }
  // 192.168.0.0/16: 0xC0A80000 to 0xC0A8FFFF
  if ((int & 0xffff0000) === 0xc0a80000) {
    return { label: "RFC 1918 Private (Class C)", type: "private" };
  }
  // 127.0.0.0/8: Loopback
  if ((int & 0xff000000) === 0x7f000000) {
    return { label: "Loopback Address (127.0.0.0/8)", type: "special" };
  }
  // 169.254.0.0/16: Link-Local
  if ((int & 0xffff0000) === 0xa9fe0000) {
    return { label: "Link-Local / APIPA (169.254.0.0/16)", type: "special" };
  }
  return { label: "Public Internet Address", type: "public" };
}

export function SubnetCalculator() {
  const [ip, setIp] = useState("10.10.10.150");
  const [cidr, setCidr] = useState(24);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const ipInt = ipToInt(ip);
    if (ipInt === null) return null;

    const maskInt = cidr === 0 ? 0 : ((0xffffffff << (32 - cidr)) >>> 0);
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (ipInt | wildcardInt) >>> 0;

    let firstUsableInt = networkInt + 1;
    let lastUsableInt = broadcastInt - 1;
    let usableHosts = Math.pow(2, 32 - cidr) - 2;

    if (cidr === 31) {
      firstUsableInt = networkInt;
      lastUsableInt = broadcastInt;
      usableHosts = 2; // RFC 3021 point-to-point
    } else if (cidr === 32) {
      firstUsableInt = networkInt;
      lastUsableInt = networkInt;
      usableHosts = 1;
    }

    const totalHosts = Math.pow(2, 32 - cidr);
    const scope = getRfcScope(ipInt);

    return {
      ip,
      cidr,
      network: intToIp(networkInt),
      broadcast: intToIp(broadcastInt),
      firstUsable: intToIp(firstUsableInt),
      lastUsable: intToIp(lastUsableInt),
      subnetMask: intToIp(maskInt),
      wildcardMask: intToIp(wildcardInt),
      hexMask: "0x" + maskInt.toString(16).toUpperCase().padStart(8, "0"),
      totalHosts,
      usableHosts: Math.max(0, usableHosts),
      binaryIp: intToBinary(ipInt),
      binaryMask: intToBinary(maskInt),
      scope,
    };
  }, [ip, cidr]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const quickCidrs = [8, 16, 24, 27, 28, 29, 30, 32];

  return (
    <div className="space-y-6 font-sans">
      {/* Input Header Box */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Network className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">IPv4 Subnet & CIDR Calculator</h2>
              <p className="text-xs text-muted-foreground">
                Network range, host boundaries, wildcard masks, and binary bitwise analysis
              </p>
            </div>
          </div>

          {/* Quick CIDR Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">Prefix:</span>
            {quickCidrs.map((c) => (
              <button
                key={c}
                onClick={() => setCidr(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  cidr === c
                    ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                /{c}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
              IP Address
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value.trim())}
              placeholder="10.10.10.150"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/40 text-foreground font-mono text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          <div className="sm:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground uppercase">CIDR Prefix</span>
              <span className="text-emerald-400 font-bold">/{cidr}</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {parsed ? (
        <div className="space-y-6">
          {/* Main Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Network Address",
                value: `${parsed.network}/${parsed.cidr}`,
                color: "text-emerald-400",
                key: "net",
              },
              {
                label: "Broadcast Address",
                value: parsed.broadcast,
                color: "text-fuchsia-400",
                key: "bcast",
              },
              {
                label: "Usable Host Range",
                value: `${parsed.firstUsable} - ${parsed.lastUsable}`,
                color: "text-cyan-400",
                key: "range",
              },
              {
                label: "Usable Hosts",
                value: parsed.usableHosts.toLocaleString(),
                color: "text-amber-400",
                key: "hosts",
              },
              {
                label: "Subnet Mask",
                value: parsed.subnetMask,
                color: "text-foreground",
                key: "mask",
              },
              {
                label: "Wildcard Mask",
                value: parsed.wildcardMask,
                color: "text-muted-foreground",
                key: "wildcard",
              },
              {
                label: "Hex Subnet Mask",
                value: parsed.hexMask,
                color: "text-muted-foreground",
                key: "hex",
              },
              {
                label: "Scope / Type",
                value: parsed.scope.label,
                color:
                  parsed.scope.type === "private"
                    ? "text-emerald-400"
                    : parsed.scope.type === "public"
                      ? "text-cyan-400"
                      : "text-amber-400",
                key: "scope",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between space-y-2 hover:border-emerald-500/30 transition-all"
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-mono text-sm font-semibold truncate ${item.color}`}>
                    {item.value}
                  </span>
                  <button
                    onClick={() => handleCopy(item.value, item.key)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                    title={`Copy ${item.label}`}
                  >
                    {copiedKey === item.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 32-Bit Binary Bitwise Visualizer */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                32-Bit Binary Breakdown
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/50 inline-block" />
                  Network ({parsed.cidr} bits)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/30 border border-cyan-500/50 inline-block" />
                  Host ({32 - parsed.cidr} bits)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-background/70 border border-border font-mono text-xs overflow-x-auto">
              <div className="space-y-2">
                {/* IP Bits */}
                <div className="flex items-center gap-4">
                  <span className="w-16 text-muted-foreground shrink-0 uppercase text-[10px]">
                    IP Bits:
                  </span>
                  <div className="flex gap-2 text-sm tracking-widest font-bold">
                    {[0, 1, 2, 3].map((oct) => {
                      const octetBits = parsed.binaryIp.slice(oct * 8, (oct + 1) * 8);
                      return (
                        <span key={oct} className="flex">
                          {octetBits.split("").map((bit, bitIdx) => {
                            const globalBitIdx = oct * 8 + bitIdx;
                            const isNet = globalBitIdx < parsed.cidr;
                            return (
                              <span
                                key={bitIdx}
                                className={isNet ? "text-emerald-400" : "text-cyan-400"}
                              >
                                {bit}
                              </span>
                            );
                          })}
                          {oct < 3 && <span className="text-muted-foreground/40 mx-1">.</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Mask Bits */}
                <div className="flex items-center gap-4">
                  <span className="w-16 text-muted-foreground shrink-0 uppercase text-[10px]">
                    Mask Bits:
                  </span>
                  <div className="flex gap-2 text-sm tracking-widest text-muted-foreground/60">
                    {[0, 1, 2, 3].map((oct) => {
                      const octetBits = parsed.binaryMask.slice(oct * 8, (oct + 1) * 8);
                      return (
                        <span key={oct} className="flex">
                          {octetBits.split("").map((bit, bitIdx) => {
                            const globalBitIdx = oct * 8 + bitIdx;
                            const isNet = globalBitIdx < parsed.cidr;
                            return (
                              <span
                                key={bitIdx}
                                className={isNet ? "text-emerald-500/70" : "text-muted-foreground/30"}
                              >
                                {bit}
                              </span>
                            );
                          })}
                          {oct < 3 && <span className="text-muted-foreground/40 mx-1">.</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-destructive/40 bg-destructive/5 text-destructive text-center font-mono text-sm">
          Invalid IPv4 format. Please enter a valid address (e.g. 192.168.1.1).
        </div>
      )}
    </div>
  );
}
