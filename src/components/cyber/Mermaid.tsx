import React, { useEffect, useState } from "react";
import mermaid from "mermaid";
import { Panel } from "./Layout";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    darkMode: true,
    background: "transparent",
    primaryColor: "#111",
    primaryTextColor: "#0f0", // neon green text inside nodes
    primaryBorderColor: "#0f0", // neon green borders
    lineColor: "#0f0", // neon green lines
    secondaryColor: "#111",
    tertiaryColor: "#111",
    fontFamily: "JetBrains Mono, monospace",
  },
});

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    mermaid.render(id, chart).then((result) => {
      setSvg(result.svg);
    }).catch((e) => {
      setSvg(`<div class="text-threat-high">Error rendering diagram</div>`);
    });
  }, [chart, id]);

  return (
    <Panel title="diagram" className="my-8 relative group">
      <TransformWrapper initialScale={1} minScale={0.5} maxScale={4} centerOnInit={true}>
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => zoomIn()} className="p-1.5 bg-panel-border text-neon-green hover:bg-neon-green hover:text-black rounded transition-colors">
                <ZoomIn size={16} />
              </button>
              <button onClick={() => zoomOut()} className="p-1.5 bg-panel-border text-neon-green hover:bg-neon-green hover:text-black rounded transition-colors">
                <ZoomOut size={16} />
              </button>
              <button onClick={() => resetTransform()} className="p-1.5 bg-panel-border text-neon-green hover:bg-neon-green hover:text-black rounded transition-colors">
                <Maximize size={16} />
              </button>
            </div>
            <TransformComponent wrapperClass="!w-full !h-full cursor-move" contentClass="w-full flex justify-center p-4 min-h-[300px]">
              {svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center pointer-events-none" />
              ) : (
                <div className="text-neon-green animate-pulse text-sm font-mono p-4">
                  // Rendering diagram...
                </div>
              )}
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </Panel>
  );
}
