import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Cpu,
  Layers,
  Terminal,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Lock,
  Unlock,
} from "lucide-react";

export interface StackSlot {
  address: string;
  offset: string;
  name: string;
  role: "buffer" | "local" | "ebp" | "eip" | "shellcode";
  originalHex: string;
  originalAscii: string;
  currentHex: string;
  currentAscii: string;
  isOverwritten: boolean;
  isHijacked?: boolean;
  isShellcode?: boolean;
}

interface StepData {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  instruction: string;
  registers: {
    eip: string;
    esp: string;
    ebp: string;
    eax: string;
  };
  payloadBytes: string;
  status: "safe" | "warning" | "danger" | "pwned";
  slots: StackSlot[];
}

const STAGES: StepData[] = [
  {
    id: 1,
    title: "Stage 1: Normal Stack Frame (auth entry)",
    subtitle: "Clean memory layout inside auth() before password input",
    summary:
      "When auth() is called, the CPU allocates a 16-byte userpass buffer and pushes the saved frame pointer (EBP) and saved return address (EIP) onto the stack. Saved EIP points back to handle() at 0x080489b0.",
    instruction: "auth(\"admin\", password) initialized. Stack pointer ESP = 0xffffd610.",
    registers: {
      eip: "0x080488f2 (auth+0)",
      esp: "0xffffd610",
      ebp: "0xffffd628",
      eax: "0x00000000",
    },
    payloadBytes: "[ No Input Sent Yet ]",
    status: "safe",
    slots: [
      {
        address: "0xffffd630",
        offset: "+0x20 (32)",
        name: "Caller Stack (handle memory)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd62c",
        offset: "+0x1c (28)",
        name: "Saved EIP (Return Address)",
        role: "eip",
        originalHex: "0x080489b0",
        originalAscii: "..^.",
        currentHex: "0x080489b0",
        currentAscii: "..^.",
        isOverwritten: false,
      },
      {
        address: "0xffffd628",
        offset: "+0x18 (24)",
        name: "Saved EBP (Frame Pointer)",
        role: "ebp",
        originalHex: "0xffffd648",
        originalAscii: "..H.",
        currentHex: "0xffffd648",
        currentAscii: "..H.",
        isOverwritten: false,
      },
      {
        address: "0xffffd624",
        offset: "+0x14 (20)",
        name: "char *response (Local Pointer)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd620",
        offset: "+0x10 (16)",
        name: "userpass[12..15] (Buffer Tail)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd61c",
        offset: "+0x0c (12)",
        name: "userpass[8..11]",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd618",
        offset: "+0x08 (8)",
        name: "userpass[4..7]",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd610",
        offset: "+0x00 (0)",
        name: "userpass[0..3] (Buffer Start - Leaked)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
    ],
  },
  {
    id: 2,
    title: "Stage 2: Safe Password Input (15 bytes)",
    subtitle: "Sending valid length password '1974jailbreak!'",
    summary:
      "When a normal password is provided, strcpy() copies exactly 15 ASCII bytes plus a null terminator '\\0'. The input stays completely inside userpass[16]. Saved EBP and Saved EIP remain untouched, and the function returns normally.",
    instruction: "strcpy(userpass, \"1974jailbreak!\") -> Stays within 16-byte boundary.",
    registers: {
      eip: "0x08048924 (auth+50)",
      esp: "0xffffd610",
      ebp: "0xffffd628",
      eax: "0x00000001",
    },
    payloadBytes: "PASS 1974jailbreak!\\0  (16 bytes total)",
    status: "safe",
    slots: [
      {
        address: "0xffffd630",
        offset: "+0x20 (32)",
        name: "Caller Stack (handle memory)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd62c",
        offset: "+0x1c (28)",
        name: "Saved EIP (Return Address - SAFE)",
        role: "eip",
        originalHex: "0x080489b0",
        originalAscii: "..^.",
        currentHex: "0x080489b0",
        currentAscii: "..^.",
        isOverwritten: false,
      },
      {
        address: "0xffffd628",
        offset: "+0x18 (24)",
        name: "Saved EBP (Frame Pointer - SAFE)",
        role: "ebp",
        originalHex: "0xffffd648",
        originalAscii: "..H.",
        currentHex: "0xffffd648",
        currentAscii: "..H.",
        isOverwritten: false,
      },
      {
        address: "0xffffd624",
        offset: "+0x14 (20)",
        name: "char *response (Local Pointer)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd620",
        offset: "+0x10 (16)",
        name: "userpass[12..15] (Tail)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00216b61",
        currentAscii: "ak!\\0",
        isOverwritten: true,
      },
      {
        address: "0xffffd61c",
        offset: "+0x0c (12)",
        name: "userpass[8..11]",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x6572626c",
        currentAscii: "lbre",
        isOverwritten: true,
      },
      {
        address: "0xffffd618",
        offset: "+0x08 (8)",
        name: "userpass[4..7]",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x69616a34",
        currentAscii: "4jai",
        isOverwritten: true,
      },
      {
        address: "0xffffd610",
        offset: "+0x00 (0)",
        name: "userpass[0..3] (Buffer Start)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x34373931",
        currentAscii: "1974",
        isOverwritten: true,
      },
    ],
  },
  {
    id: 3,
    title: "Stage 3: 28-Byte Buffer Overflow (Padding)",
    subtitle: "Sending 28 bytes of 'A' (0x41) to smash through Saved EBP",
    summary:
      "Because strcpy() has no bounds check, sending 28 bytes overflows past userpass[16], smashes the response pointer (4 bytes), and completely overwrites Saved EBP (4 bytes). The next 4 bytes will overwrite Saved EIP.",
    instruction: "strcpy() writes 28 bytes of 0x41. Memory up to Saved EIP is flooded.",
    registers: {
      eip: "0x0804891a (strcpy finished)",
      esp: "0xffffd610",
      ebp: "0x41414141 (SMASHED)",
      eax: "0x00000000",
    },
    payloadBytes: "b'A' * 28  (28 bytes of padding: 16 buffer + 4 ptr + 4 EBP + 4 reach)",
    status: "warning",
    slots: [
      {
        address: "0xffffd630",
        offset: "+0x20 (32)",
        name: "Caller Stack (handle memory)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
      },
      {
        address: "0xffffd62c",
        offset: "+0x1c (28)",
        name: "Saved EIP (Targeted for Hijack!)",
        role: "eip",
        originalHex: "0x080489b0",
        originalAscii: "..^.",
        currentHex: "0x080489b0",
        currentAscii: "..^.",
        isOverwritten: false,
      },
      {
        address: "0xffffd628",
        offset: "+0x18 (24)",
        name: "Saved EBP (SMASHED)",
        role: "ebp",
        originalHex: "0xffffd648",
        originalAscii: "..H.",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd624",
        offset: "+0x14 (20)",
        name: "char *response (SMASHED)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd620",
        offset: "+0x10 (16)",
        name: "userpass[12..15] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd61c",
        offset: "+0x0c (12)",
        name: "userpass[8..11] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd618",
        offset: "+0x08 (8)",
        name: "userpass[4..7] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd610",
        offset: "+0x00 (0)",
        name: "userpass[0..3] (Buffer Start)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
    ],
  },
  {
    id: 4,
    title: "Stage 4: Hijacking Saved EIP (+4 bytes address)",
    subtitle: "Overwriting Saved EIP with 0xffffd630 (buffer_addr + 32)",
    summary:
      "We append p32(0xffffd630) directly at offset 28. The CPU now holds 0xffffd630 in Saved EIP. When auth() executes the 'ret' instruction, it will NOT return to handle() - it will jump directly to the stack address 0xffffd630!",
    instruction: "Saved EIP overwritten with 0xffffd630. ret instruction will jump to stack.",
    registers: {
      eip: "0xffffd630 (HIJACKED -> STACK)",
      esp: "0xffffd630",
      ebp: "0x41414141",
      eax: "0x00000000",
    },
    payloadBytes: "b'A' * 28 + p32(0xffffd630)  (32 bytes total)",
    status: "danger",
    slots: [
      {
        address: "0xffffd630",
        offset: "+0x20 (32)",
        name: "Jump Target on Stack (0xffffd630)",
        role: "shellcode",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x00000000",
        currentAscii: "....",
        isOverwritten: false,
        isShellcode: true,
      },
      {
        address: "0xffffd62c",
        offset: "+0x1c (28)",
        name: "Saved EIP (HIJACKED -> 0xffffd630)",
        role: "eip",
        originalHex: "0x080489b0",
        originalAscii: "..^.",
        currentHex: "0xffffd630",
        currentAscii: "0...\\xd6\\xff",
        isOverwritten: true,
        isHijacked: true,
      },
      {
        address: "0xffffd628",
        offset: "+0x18 (24)",
        name: "Saved EBP (SMASHED)",
        role: "ebp",
        originalHex: "0xffffd648",
        originalAscii: "..H.",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd624",
        offset: "+0x14 (20)",
        name: "char *response (SMASHED)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd620",
        offset: "+0x10 (16)",
        name: "userpass[12..15] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd61c",
        offset: "+0x0c (12)",
        name: "userpass[8..11] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd618",
        offset: "+0x08 (8)",
        name: "userpass[4..7] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd610",
        offset: "+0x00 (0)",
        name: "userpass[0..3] (Buffer Start)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
    ],
  },
  {
    id: 5,
    title: "Stage 5: Shellcode Execution via -z execstack",
    subtitle: "CPU lands on 0xffffd630 and executes dup2(1,0) + execve('/bin//sh')",
    summary:
      "Because the binary was compiled with -z execstack, the stack is marked RWX (Executable). The CPU executes our 27-byte shellcode directly from memory, binds stdin to the network socket, spawns /bin/sh, and hands us a remote shell as nobody (UID 99)!",
    instruction: "EIP = 0xffffd630. Shellcode executes -> Interactive shell granted.",
    registers: {
      eip: "0xffffd630 (RUNNING SHELLCODE)",
      esp: "0xffffd620",
      ebp: "0x41414141",
      eax: "0x0000000b (sys_execve)",
    },
    payloadBytes: "b'A'*28 + p32(0xffffd630) + SHELLCODE  (59 bytes total)",
    status: "pwned",
    slots: [
      {
        address: "0xffffd630",
        offset: "+0x20 (32)",
        name: "Shellcode (dup2 + execve('/bin//sh'))",
        role: "shellcode",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x583f6a (push 0x3f; pop eax...)",
        currentAscii: "j?Xj",
        isOverwritten: true,
        isShellcode: true,
      },
      {
        address: "0xffffd62c",
        offset: "+0x1c (28)",
        name: "Saved EIP (JUMPED -> 0xffffd630)",
        role: "eip",
        originalHex: "0x080489b0",
        originalAscii: "..^.",
        currentHex: "0xffffd630",
        currentAscii: "0...\\xd6\\xff",
        isOverwritten: true,
        isHijacked: true,
      },
      {
        address: "0xffffd628",
        offset: "+0x18 (24)",
        name: "Saved EBP (SMASHED)",
        role: "ebp",
        originalHex: "0xffffd648",
        originalAscii: "..H.",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd624",
        offset: "+0x14 (20)",
        name: "char *response (SMASHED)",
        role: "local",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd620",
        offset: "+0x10 (16)",
        name: "userpass[12..15] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd61c",
        offset: "+0x0c (12)",
        name: "userpass[8..11] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd618",
        offset: "+0x08 (8)",
        name: "userpass[4..7] (Overflowed)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
      {
        address: "0xffffd610",
        offset: "+0x00 (0)",
        name: "userpass[0..3] (Buffer Start)",
        role: "buffer",
        originalHex: "0x00000000",
        originalAscii: "....",
        currentHex: "0x41414141",
        currentAscii: "AAAA",
        isOverwritten: true,
      },
    ],
  },
];

export function BufferOverflowVisualizer() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const step = STAGES[currentStepIdx];

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= STAGES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.min(STAGES.length - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  return (
    <div className="my-8 rounded-xl border border-border bg-card/90 font-sans shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Stack_Memory_Inspector
              </span>
              <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-red-400">
                x86 32-bit (execstack)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Live simulation of jail.c auth() buffer overflow & EIP hijack
            </p>
          </div>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {STAGES.map((s, idx) => {
            const isActive = idx === currentStepIdx;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(idx);
                }}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background font-bold shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>S{s.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Controls & Stack / Right Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5">
        {/* Left Column: Stack Memory Tower (5 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-accent-primary" />
              Stack Memory Tower (High -&gt; Low)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              ESP: <strong className="text-foreground">{step.registers.esp}</strong>
            </span>
          </div>

          {/* Stack Slots */}
          <div className="space-y-1.5">
            {step.slots.map((slot, sIdx) => {
              let borderCol = "border-border/60 bg-muted/20";
              let badgeCol = "bg-muted text-muted-foreground";

              if (slot.isShellcode) {
                borderCol = "border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.2)]";
                badgeCol = "bg-cyan-500/20 text-cyan-300 font-bold";
              } else if (slot.isHijacked) {
                borderCol = "border-red-500/80 bg-red-500/15 shadow-[0_0_12px_rgba(239,68,68,0.25)] animate-pulse";
                badgeCol = "bg-red-500/30 text-red-300 font-bold";
              } else if (slot.role === "eip") {
                borderCol = "border-amber-500/50 bg-amber-500/5";
                badgeCol = "bg-amber-500/20 text-amber-300";
              } else if (slot.isOverwritten) {
                borderCol = "border-red-500/40 bg-red-500/5";
                badgeCol = "bg-red-500/10 text-red-400";
              }

              return (
                <div
                  key={sIdx}
                  className={`rounded-lg border p-2.5 transition-all duration-300 ${borderCol}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-foreground">
                        {slot.address}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {slot.offset}
                      </span>
                    </div>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${badgeCol}`}>
                      {slot.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground truncate max-w-[200px]" title={slot.name}>
                      {slot.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-foreground">
                        {slot.currentHex}
                      </span>
                      <span className="rounded bg-background/80 px-1 py-0.5 text-[10px] text-muted-foreground border border-border/40">
                        {slot.currentAscii}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center text-[10px] text-muted-foreground font-mono gap-1 pt-1">
            <ArrowDown className="h-3 w-3" /> Stack grows downward towards lower memory
          </div>
        </div>

        {/* Right Column: Interactive State HUD & Exploit Breakdown (7 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Stage Title Card */}
            <div className="rounded-lg border border-border/70 bg-background/50 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-primary">
                  {step.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-mono uppercase ${
                    step.status === "pwned"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : step.status === "danger"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : step.status === "warning"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {step.status === "pwned" && <Zap className="h-3 w-3" />}
                  {step.status === "danger" && <ShieldAlert className="h-3 w-3" />}
                  {step.status === "warning" && <AlertTriangle className="h-3 w-3" />}
                  {step.status === "safe" && <CheckCircle2 className="h-3 w-3" />}
                  {step.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">
                {step.subtitle}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.summary}
              </p>
            </div>

            {/* Live CPU Registers Box */}
            <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 font-mono">
              <div className="flex items-center justify-between text-xs font-bold text-foreground border-b border-border/40 pb-1.5 mb-2">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-accent-primary" /> CPU Registers
                </span>
                <span className="text-[10px] text-muted-foreground">x86 Intel State</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded bg-muted/40 p-1.5 border border-border/30">
                  <span className="text-muted-foreground font-bold">EIP:</span>
                  <span className={`font-bold ${currentStepIdx >= 3 ? "text-red-400" : "text-foreground"}`}>
                    {step.registers.eip}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 p-1.5 border border-border/30">
                  <span className="text-muted-foreground font-bold">ESP:</span>
                  <span className="text-foreground">{step.registers.esp}</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 p-1.5 border border-border/30">
                  <span className="text-muted-foreground font-bold">EBP:</span>
                  <span className={`font-bold ${currentStepIdx >= 2 ? "text-amber-400" : "text-foreground"}`}>
                    {step.registers.ebp}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 p-1.5 border border-border/30">
                  <span className="text-muted-foreground font-bold">EAX:</span>
                  <span className="text-foreground">{step.registers.eax}</span>
                </div>
              </div>
            </div>

            {/* Active Payload Buffer Preview */}
            <div className="rounded-lg border border-border/70 bg-background/50 p-3.5 font-mono">
              <div className="flex items-center justify-between text-xs font-bold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-accent-primary" /> Network PASS Payload
                </span>
              </div>
              <div className="rounded bg-muted/50 p-2 text-xs text-accent-primary overflow-x-auto border border-border/40 select-all">
                <code>{step.payloadBytes}</code>
              </div>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Reset simulation"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="flex items-center gap-1 rounded-md border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-1 rounded-md px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  isPlaying
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "bg-accent-primary text-background hover:opacity-90"
                }`}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isPlaying ? "Pause" : "Auto-Play"}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIdx === STAGES.length - 1}
                className="flex items-center gap-1 rounded-md border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
