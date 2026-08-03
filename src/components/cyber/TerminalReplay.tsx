import React, { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, ChevronDown, ChevronUp, Copy, Check, Terminal, Zap } from "lucide-react";

/* ── Types ───────────────────────────────────────────── */

export interface TerminalStep {
  /** Label shown in the step indicator (e.g. "Step 1/5") */
  label?: string;
  /** The command being "executed" */
  command?: string;
  /** Lines of output, each with optional color */
  output: OutputLine[];
  /** Delay before showing next step (ms) */
  delayAfter?: number;
}

export interface OutputLine {
  text: string;
  color?: "green" | "red" | "yellow" | "blue" | "cyan" | "magenta" | "white" | "muted";
}

export interface FlagItem {
  label?: string;
  flag: string;
}

interface TerminalReplayProps {
  /** Title shown in the terminal title bar */
  title?: string;
  /** The sequence of steps to replay */
  steps: TerminalStep[];
  /** Raw bash script for the "View Full Script" collapsible */
  rawScript?: string;
  /** Single flag string (backward compatibility) */
  flag?: string;
  /** Multiple flags (e.g. user.txt & root.txt) */
  flags?: Array<FlagItem | string>;
  /** Optional summary notes displayed in the flag capture box */
  flagSummary?: string[];
}

/* ── Color map ───────────────────────────────────────── */

const colorMap: Record<string, string> = {
  green: "text-emerald-400",
  red: "text-red-400",
  yellow: "text-yellow-300",
  blue: "text-blue-400",
  cyan: "text-cyan-400",
  magenta: "text-purple-400",
  white: "text-white font-bold",
  muted: "text-white/40",
};

/* ── Component ───────────────────────────────────────── */

export function TerminalReplay({
  title = "exploit.sh",
  steps,
  rawScript,
  flag,
  flags,
  flagSummary,
}: TerminalReplayProps) {
  const flagList: FlagItem[] = [];
  if (flags && flags.length > 0) {
    flags.forEach((f) => {
      if (typeof f === "string") {
        flagList.push({ flag: f });
      } else {
        flagList.push(f);
      }
    });
  } else if (flag) {
    flagList.push({ flag });
  }

  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [typingIdx, setTypingIdx] = useState(0); // chars typed of current command
  const [showOutput, setShowOutput] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = setTimeout(resolve, ms);
      // Allow cancellation check
      const check = setInterval(() => {
        if (cancelRef.current) {
          clearTimeout(id);
          clearInterval(check);
          resolve();
        }
      }, 50);
    });

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [visibleSteps, typingIdx, showOutput, scrollToBottom]);

  const runReplay = useCallback(async () => {
    cancelRef.current = false;
    setPhase("running");
    setVisibleSteps(0);
    setShowOutput(false);
    setTypingIdx(0);

    for (let i = 0; i < steps.length; i++) {
      if (cancelRef.current) return;

      setVisibleSteps(i + 1);
      setShowOutput(false);
      setTypingIdx(0);

      // Type command character by character
      const cmd = steps[i].command || "";
      if (cmd.length > 0) {
        for (let c = 0; c <= cmd.length; c++) {
          if (cancelRef.current) return;
          setTypingIdx(c);
          await sleep(18 + Math.random() * 25);
        }
      }

      // Brief pause then show output
      await sleep(300);
      if (cancelRef.current) return;
      setShowOutput(true);

      // Wait before next step
      await sleep(steps[i].delayAfter ?? 800);
    }

    if (!cancelRef.current) {
      setPhase("done");
    }
  }, [steps]);

  const handleReset = useCallback(() => {
    cancelRef.current = true;
    setPhase("idle");
    setVisibleSteps(0);
    setShowOutput(false);
    setTypingIdx(0);
  }, []);

  const handleCopyScript = useCallback(() => {
    if (rawScript) {
      navigator.clipboard.writeText(rawScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [rawScript]);

  return (
    <div className="my-10 max-w-[80ch]">
      {/* Terminal Window */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.3)]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.3)]" />
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-xs font-mono">
              <Terminal className="h-3 w-3" />
              <span>{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase === "idle" && (
              <button
                onClick={runReplay}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider
                  bg-emerald-500/20 border border-emerald-500/40 text-emerald-400
                  hover:bg-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]
                  transition-all duration-200 cursor-pointer"
              >
                <Play className="h-3 w-3" />
                Run Exploit
              </button>
            )}
            {phase === "running" && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-yellow-400/80">
                  <Zap className="h-3 w-3 animate-pulse" />
                  Executing...
                </span>
              </div>
            )}
            {phase === "done" && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider
                  bg-white/10 border border-white/20 text-white/70
                  hover:bg-white/15 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="p-4 font-mono text-[13px] leading-relaxed max-h-[500px] overflow-y-auto
            scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          {phase === "idle" ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-white/30">
              <Terminal className="h-10 w-10 opacity-30" />
              <p className="text-sm font-sans">
                Click <strong className="text-emerald-400/60">Run Exploit</strong> to start the
                automated exploitation
              </p>
              <p className="text-xs font-sans text-white/20">
                {steps.length} steps · fully automated
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.slice(0, visibleSteps).map((step, idx) => {
                const isCurrentStep = idx === visibleSteps - 1;
                const isTyping = isCurrentStep && phase === "running";
                const cmdToShow =
                  isTyping && step.command ? step.command.slice(0, typingIdx) : step.command || "";
                const showStepOutput = isCurrentStep ? showOutput : true;

                return (
                  <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Step label */}
                    {step.label && (
                      <div className="text-[10px] text-blue-400/60 uppercase tracking-widest font-bold mb-1">
                        {step.label}
                      </div>
                    )}

                    {/* Command line - only render if command exists */}
                    {step.command && (
                      <>
                        <div className="flex items-start gap-0">
                          <span className="text-emerald-400 shrink-0 select-none">
                            <span className="text-blue-400">┌──(</span>
                            <span className="text-emerald-400 font-bold">root㉿kali</span>
                            <span className="text-blue-400">)-[</span>
                            <span className="text-white/80">~</span>
                            <span className="text-blue-400">]</span>
                          </span>
                        </div>
                        <div className="flex items-start gap-0">
                          <span className="text-blue-400 select-none">└─</span>
                          <span className="text-blue-400 select-none">$ </span>
                          <span className="text-white/90">{cmdToShow}</span>
                          {isTyping && !showOutput && (
                            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5 translate-y-[2px]" />
                          )}
                        </div>
                      </>
                    )}

                    {/* Output */}
                    {showStepOutput && step.output.length > 0 && (
                      <div className="mt-1.5 pl-3 border-l border-white/[0.06] space-y-0.5 animate-in fade-in duration-300">
                        {step.output.map((line, lineIdx) => (
                          <div
                            key={lineIdx}
                            className={`text-[12.5px] ${colorMap[line.color || "muted"]}`}
                          >
                            {line.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Flag capture box */}
              {phase === "done" && flagList.length > 0 && (
                <div className="mt-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/[0.07] p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      🏁 {flagList.length > 1 ? "FLAGS CAPTURED" : "FLAG CAPTURED"}
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {flagList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center gap-x-2.5 font-mono text-lg font-bold text-white tracking-wide"
                        >
                          {item.label && (
                            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                              {item.label}:
                            </span>
                          )}
                          <span>{item.flag}</span>
                        </div>
                      ))}
                    </div>
                    {flagSummary && flagSummary.length > 0 && (
                      <div className="mt-3 space-y-1 pl-4 text-xs text-purple-400/80 font-mono">
                        {flagSummary.map((line, i) => (
                          <div key={i}>[*] {line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Full Script collapsible */}
      {rawScript && (
        <div className="mt-3">
          <button
            onClick={() => setShowScript(!showScript)}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02]
              text-xs font-mono text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
          >
            {showScript ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            <span className="uppercase tracking-widest font-bold text-[10px]">
              {showScript ? "Hide" : "View"} Full Script
            </span>
            <span className="flex-1" />
            {showScript && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyScript();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 bg-white/5
                  text-[10px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </button>

          {showScript && (
            <div className="mt-1 rounded-lg border border-white/[0.06] bg-[#0d1117] overflow-hidden animate-in slide-in-from-top-2 duration-300">
              <pre
                className="p-4 text-[12px] font-mono text-white/70 leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
              >
                {rawScript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
