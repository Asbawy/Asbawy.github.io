import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Panel } from "./Layout";
import { Copy, Check, Maximize, Minimize } from "lucide-react";

let mermaidInitialized = false;

function initMermaid() {
  if (mermaidInitialized) return;
  mermaidInitialized = true;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      darkMode: true,
      background: "transparent",
      primaryColor: "rgba(0, 255, 136, 0.08)",
      primaryTextColor: "#00ff88",
      primaryBorderColor: "#00ff88",
      lineColor: "#00ff88",
      secondaryColor: "rgba(0, 255, 136, 0.04)",
      tertiaryColor: "rgba(0, 255, 136, 0.02)",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "13px",
      // Sequence diagram
      actorTextColor: "#00ff88",
      actorBorder: "#00ff88",
      actorBkg: "rgba(0, 255, 136, 0.06)",
      actorLineColor: "#00ff8866",
      signalColor: "#00ff88",
      signalTextColor: "#e0e0e0",
      noteBkgColor: "rgba(0, 255, 136, 0.08)",
      noteTextColor: "#e0e0e0",
      noteBorderColor: "#00ff8844",
      activationBorderColor: "#00ff88",
      activationBkgColor: "rgba(0, 255, 136, 0.1)",
      sequenceNumberColor: "#000",
      // Flowchart
      nodeBorder: "#00ff88",
      clusterBkg: "rgba(0, 255, 136, 0.04)",
      clusterBorder: "#00ff8844",
      titleColor: "#00ff88",
      edgeLabelBackground: "transparent",
    },
    flowchart: {
      padding: 16,
      htmlLabels: true,
      curve: "basis",
    },
    sequence: {
      mirrorActors: false,
      actorMargin: 80,
      messageMargin: 40,
      boxMargin: 8,
      useMaxWidth: false,
    },
  });
}

let renderCounter = 0;

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initMermaid();

    const id = `mermaid-render-${++renderCounter}`;
    const trimmed = chart.trim();

    mermaid
      .render(id, trimmed)
      .then((result) => {
        // Post-process the SVG to fix layout issues:
        // 1. Remove hardcoded width/height to make it responsive
        // 2. Ensure proper viewBox for tight fit
        let processedSvg = result.svg;

        // Remove fixed width/height attributes and let viewBox control sizing
        processedSvg = processedSvg
          .replace(/(<svg[^>]*)\s+style="[^"]*"/i, "$1")
          .replace(/(<svg[^>]*)\s+width="\d+(\.\d+)?"/i, "$1")
          .replace(/(<svg[^>]*)\s+height="\d+(\.\d+)?"/i, "$1");

        // Add responsive width and auto height
        processedSvg = processedSvg.replace(
          /(<svg)/i,
          '$1 style="width:100%;height:auto;max-height:none"'
        );

        setSvg(processedSvg);
        setError("");
      })
      .catch((e) => {
        console.error("Mermaid render error:", e);
        setError(e?.message || "Failed to render diagram");
      });
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Panel title="diagram" className="my-8 relative group">
      {/* Toolbar — visible on hover */}
      <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-panel-border/80 text-muted-foreground hover:text-neon-green rounded transition-colors"
          title="Copy mermaid source"
        >
          {copied ? <Check size={14} className="text-neon-green" /> : <Copy size={14} />}
        </button>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1.5 bg-panel-border/80 text-muted-foreground hover:text-neon-green rounded transition-colors"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>

      {/* Diagram content */}
      <div
        className={`overflow-x-auto overflow-y-hidden transition-all duration-300 ${
          expanded ? "max-h-none" : "max-h-[600px]"
        }`}
      >
        {error ? (
          <div className="py-6 px-4 text-center">
            <div className="text-threat-high font-mono text-sm mb-2">
              // diagram render error
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-w-lg mx-auto">
              {error}
            </pre>
          </div>
        ) : svg ? (
          <div
            ref={containerRef}
            dangerouslySetInnerHTML={{ __html: svg }}
            className="w-full flex justify-center [&_svg]:max-w-full [&_.node_rect]:rx-[4px] [&_.label]:font-mono [&_.edgeLabel]:font-mono [&_.edgeLabel]:text-[11px]"
          />
        ) : (
          <div className="flex items-center justify-center py-10 gap-2 animate-pulse text-neon-green font-mono text-sm">
            <span className="inline-block w-2 h-4 bg-neon-green/80 animate-pulse rounded-sm" />
            Rendering diagram...
          </div>
        )}
      </div>

      {/* Expand hint for tall diagrams */}
      {!expanded && svg && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-panel/90 to-transparent pointer-events-none rounded-b-lg" />
      )}
    </Panel>
  );
}
