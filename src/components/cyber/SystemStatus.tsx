import { useEffect, useState } from "react";
import { Panel } from "./Layout";
import { Activity, Cpu, MemoryStick, Wifi } from "lucide-react";

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const threatLevels = [
  { name: "LOW", color: "text-threat-low", bar: "bg-threat-low", weight: 0.6 },
  { name: "ELEVATED", color: "text-threat-mid", bar: "bg-threat-mid", weight: 0.3 },
  { name: "CRITICAL", color: "text-threat-high", bar: "bg-threat-high", weight: 0.1 },
];

export function SystemStatus() {
  const [metrics, setMetrics] = useState({
    uptime: 412932,
    mem: 38,
    cpu: 22,
    net: 412,
  });
  const [threat, setThreat] = useState(threatLevels[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics((prev) => ({
        uptime: prev.uptime + 1,
        mem: Math.max(18, Math.min(92, prev.mem + (Math.random() - 0.5) * 6)),
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        net: Math.max(80, Math.min(1200, prev.net + (Math.random() - 0.5) * 80)),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const r = Math.random();
      let acc = 0;
      for (const lvl of threatLevels) {
        acc += lvl.weight;
        if (r <= acc) {
          setThreat(lvl);
          break;
        }
      }
    }, 5200);
    return () => clearInterval(id);
  }, []);

  const Bar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-secondary/60">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );

  return (
    <Panel
      title="system status"
      right={
        <span className="flex items-center gap-2 text-[10px]">
          <span className="h-2 w-2 rounded-full bg-neon-green pulse-dot" />
          <span className="text-neon-green">ONLINE</span>
        </span>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5" />uptime</span>
            <span className="text-foreground">{fmtUptime(metrics.uptime)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-2"><Wifi className="h-3.5 w-3.5" />throughput</span>
            <span className="text-neon-green">{metrics.net.toFixed(0)} kB/s</span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />cpu</span>
              <span className="text-foreground">{metrics.cpu.toFixed(0)}%</span>
            </div>
            <Bar value={metrics.cpu} color="bg-neon-green" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />mem</span>
              <span className="text-foreground">{metrics.mem.toFixed(0)}%</span>
            </div>
            <Bar value={metrics.mem} color="bg-neon-green" />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-panel-border bg-background/60 p-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>threat level</span>
          <span className={`${threat.color} font-semibold`}>{threat.name}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const intensity =
              threat.name === "LOW" ? i < 8 : threat.name === "ELEVATED" ? i < 16 : i < 24;
            return (
              <div
                key={i}
                className={`h-3 flex-1 rounded-[1px] ${
                  intensity ? `${threat.bar} ${threat.color}` : "bg-secondary/50"
                }`}
                style={intensity ? { boxShadow: `0 0 8px currentColor` } : undefined}
              />
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

