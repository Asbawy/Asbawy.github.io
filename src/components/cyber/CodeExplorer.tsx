import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import hljs from "highlight.js";
import {
  FileCode2,
  Terminal,
  Download,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  WrapText,
  Search,
  Folder,
  Code2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────── */

export interface AttachedFile {
  name: string;
  description?: string;
  language?: string;
  code: string;
  size?: string;
  author?: string;
  tags?: string[];
}

export interface ScriptVaultProps {
  title?: string;
  description?: string;
  files: AttachedFile[];
  defaultOpenIndex?: number;
  className?: string;
}

export interface FileAttachmentProps {
  name: string;
  description?: string;
  language?: string;
  code: string;
  className?: string;
}

export interface FileButtonProps {
  name: string;
  description?: string;
  language?: string;
  code: string;
  children?: React.ReactNode;
  className?: string;
}

interface CodeExplorerModalProps {
  files: AttachedFile[];
  initialActiveIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

/* ── Language & Icon Helpers ─────────────────────────── */

export function detectLanguage(filename: string, explicitLang?: string): string {
  if (explicitLang) return explicitLang.toLowerCase();
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "py":
      return "python";
    case "sh":
    case "bash":
      return "bash";
    case "ps1":
    case "psm1":
      return "powershell";
    case "c":
    case "h":
      return "c";
    case "cpp":
    case "cc":
    case "cxx":
      return "cpp";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
    case "mts":
      return "typescript";
    case "json":
      return "json";
    case "yaml":
    case "yml":
      return "yaml";
    case "sql":
      return "sql";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "html":
    case "xml":
      return "xml";
    case "css":
      return "css";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

function getLanguageColor(lang: string): { bg: string; text: string; border: string } {
  switch (lang) {
    case "python":
      return {
        bg: "bg-blue-500/10 light:bg-blue-50",
        text: "text-blue-400 light:text-blue-700",
        border: "border-blue-500/30 light:border-blue-300",
      };
    case "bash":
    case "shell":
    case "sh":
      return {
        bg: "bg-emerald-500/10 light:bg-emerald-50",
        text: "text-emerald-400 light:text-emerald-700",
        border: "border-emerald-500/30 light:border-emerald-300",
      };
    case "powershell":
      return {
        bg: "bg-cyan-500/10 light:bg-cyan-50",
        text: "text-cyan-400 light:text-cyan-700",
        border: "border-cyan-500/30 light:border-cyan-300",
      };
    case "c":
    case "cpp":
      return {
        bg: "bg-purple-500/10 light:bg-purple-50",
        text: "text-purple-400 light:text-purple-700",
        border: "border-purple-500/30 light:border-purple-300",
      };
    case "javascript":
    case "typescript":
      return {
        bg: "bg-yellow-500/10 light:bg-amber-50",
        text: "text-yellow-400 light:text-amber-800",
        border: "border-yellow-500/30 light:border-amber-300",
      };
    case "json":
    case "yaml":
      return {
        bg: "bg-amber-500/10 light:bg-orange-50",
        text: "text-amber-400 light:text-orange-700",
        border: "border-amber-500/30 light:border-orange-300",
      };
    default:
      return {
        bg: "bg-zinc-500/10 light:bg-zinc-100",
        text: "text-zinc-400 light:text-zinc-700",
        border: "border-zinc-500/30 light:border-zinc-300",
      };
  }
}

function downloadCodeFile(filename: string, code: string) {
  const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Safely splits highlighted HTML into lines while keeping HTML tags balanced per line.
 */
function splitHtmlIntoLines(html: string): string[] {
  const lines: string[] = [];
  let currentLine = "";
  const openTags: string[] = [];

  const tagRegex = /(<\/?[a-z0-9]+[^>]*>)|(\r?\n)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const textChunk = html.slice(lastIndex, match.index);
    currentLine += textChunk;
    lastIndex = tagRegex.lastIndex;

    const [, tag, newline] = match;

    if (newline) {
      let closedLine = currentLine;
      for (let i = openTags.length - 1; i >= 0; i--) {
        const tagName = openTags[i].match(/<([a-z0-9]+)/i)?.[1];
        if (tagName) closedLine += `</${tagName}>`;
      }
      lines.push(closedLine);
      currentLine = openTags.join("");
    } else if (tag) {
      if (tag.startsWith("</")) {
        openTags.pop();
      } else if (!tag.endsWith("/>")) {
        openTags.push(tag);
      }
      currentLine += tag;
    }
  }

  currentLine += html.slice(lastIndex);
  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }

  return lines;
}

/* ── Code Explorer Modal ─────────────────────────────── */

export function CodeExplorerModal({
  files,
  initialActiveIndex = 0,
  isOpen,
  onClose,
  title = "Exploit Artifacts & Code Vault",
}: CodeExplorerModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(initialActiveIndex);
      setCopied(false);
      setSearchTerm("");
      setShowSearch(false);
    }
  }, [isOpen, initialActiveIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSearch) {
          setShowSearch(false);
          setSearchTerm("");
        } else {
          onClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, showSearch, onClose]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const activeFile = files[activeIndex] || files[0];
  const lang = activeFile ? detectLanguage(activeFile.name, activeFile.language) : "plaintext";
  const langStyle = getLanguageColor(lang);

  // High-accuracy multi-line syntax highlighting
  const highlightedLines = useMemo(() => {
    if (!activeFile?.code) return [];
    try {
      const codeString = activeFile.code;
      const validLanguage = hljs.getLanguage(lang) ? lang : "plaintext";
      const highlightedHtml = hljs.highlight(codeString, { language: validLanguage, ignoreIllegals: true }).value;
      const rawLines = codeString.split("\n");
      const htmlLines = splitHtmlIntoLines(highlightedHtml);

      return rawLines.map((raw, idx) => ({
        html: htmlLines[idx] || (raw ? raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "&nbsp;"),
        raw,
      }));
    } catch {
      return activeFile.code.split("\n").map((line) => ({
        html: line ? line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "&nbsp;",
        raw: line,
      }));
    }
  }, [activeFile, lang]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    downloadCodeFile(activeFile.name, activeFile.code);
  };

  if (!isOpen || !activeFile) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative flex flex-col w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-300 light:bg-white light:border-border light:shadow-[0_20px_50px_rgba(0,0,0,0.15)] ${
          isFullscreen ? "h-[98vh] max-w-[98vw]" : "h-[85vh] max-h-[900px] max-w-6xl"
        }`}
      >
        {/* ── Top Header / Window Chrome ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 light:bg-zinc-100/90 select-none shrink-0">
          {/* Left: Window Controls + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer border border-red-600/30"
                title="Close"
              />
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer border border-yellow-600/30"
                title="Toggle Fullscreen"
              />
              <button
                onClick={() => setWordWrap((prev) => !prev)}
                className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer border border-emerald-600/30"
                title="Toggle Wrap"
              />
            </div>
            <div className="h-4 w-px bg-border shrink-0" />
            <div className="flex items-center gap-2 min-w-0 font-mono text-xs text-foreground">
              <Terminal className="h-3.5 w-3.5 text-accent-primary shrink-0" />
              <span className="font-bold text-foreground truncate">{title}</span>
              <span className="text-muted-foreground/40 hidden sm:inline">::</span>
              <span className="text-muted-foreground hidden sm:inline truncate">
                {activeFile.name}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                showSearch
                  ? "bg-accent-primary/20 border-accent-primary/50 text-accent-primary light:bg-emerald-100 light:border-emerald-400 light:text-emerald-800"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted light:bg-zinc-200/60 light:border-zinc-300 light:text-zinc-700 light:hover:bg-zinc-200"
              }`}
              title="Search in code (Ctrl+F)"
            >
              <Search className="h-3.5 w-3.5" />
            </button>

            {/* Word Wrap Toggle */}
            <button
              onClick={() => setWordWrap((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                wordWrap
                  ? "bg-accent-primary/20 border-accent-primary/50 text-accent-primary light:bg-emerald-100 light:border-emerald-400 light:text-emerald-800"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted light:bg-zinc-200/60 light:border-zinc-300 light:text-zinc-700 light:hover:bg-zinc-200"
              }`}
              title="Toggle Word Wrap"
            >
              <WrapText className="h-3.5 w-3.5" />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                copied
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 light:bg-emerald-100 light:border-emerald-400 light:text-emerald-800"
                  : "bg-muted/50 border-border text-foreground hover:bg-muted light:bg-zinc-200/60 light:border-zinc-300 light:text-zinc-800 light:hover:bg-zinc-200"
              }`}
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg border border-accent-primary/40 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 light:bg-emerald-600 light:border-emerald-600 light:text-white light:hover:bg-emerald-700 transition-colors cursor-pointer text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
              title={`Download ${activeFile.name}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted light:bg-zinc-200/60 light:border-zinc-300 light:text-zinc-700 light:hover:bg-zinc-200 transition-colors cursor-pointer hidden md:flex"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 light:bg-zinc-200/60 light:border-zinc-300 light:text-zinc-700 light:hover:bg-red-50 light:hover:text-red-600 transition-colors cursor-pointer ml-1"
              title="Close window (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Search Bar Dropdown ── */}
        {showSearch && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/90 border-b border-border animate-in slide-in-from-top-2 duration-150 shrink-0 light:bg-zinc-100">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter or search in file..."
              className="flex-1 bg-transparent border-0 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {searchTerm && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {highlightedLines.filter((l) => l.raw.toLowerCase().includes(searchTerm.toLowerCase())).length}{" "}
                matches
              </span>
            )}
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchTerm("");
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* ── Main Body: Sidebar File Explorer + Code Viewer ── */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* File Sidebar / Tab Strip (if multiple files) */}
          {files.length > 1 && (
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-muted/20 light:bg-zinc-50 flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto">
              <div className="hidden md:flex items-center gap-2 px-3 py-2.5 border-b border-border/60 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground light:text-zinc-600">
                <Folder className="h-3.5 w-3.5 text-accent-primary" />
                <span>Exploit Files ({files.length})</span>
              </div>
              <div className="flex md:flex-col p-1.5 md:p-2 gap-1 w-full">
                {files.map((file, idx) => {
                  const isActive = idx === activeIndex;
                  const fLang = detectLanguage(file.name, file.language);
                  const fStyle = getLanguageColor(fLang);
                  return (
                    <button
                      key={file.name}
                      onClick={() => {
                        setActiveIndex(idx);
                        setCopied(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer shrink-0 md:w-full ${
                        isActive
                          ? "bg-accent-primary/10 border border-accent-primary/40 text-foreground font-bold shadow-sm light:bg-emerald-50 light:border-emerald-300 light:text-emerald-950"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent light:text-zinc-600 light:hover:text-zinc-900 light:hover:bg-zinc-100"
                      }`}
                    >
                      <FileCode2 className={`h-3.5 w-3.5 shrink-0 ${isActive ? fStyle.text : "text-muted-foreground"}`} />
                      <span className="truncate flex-1">{file.name}</span>
                      <span
                        className={`hidden md:inline text-[9px] px-1.5 py-0.2 rounded uppercase font-bold border ${fStyle.border} ${fStyle.bg} ${fStyle.text}`}
                      >
                        {fLang}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Code Viewer Panel */}
          <div className="flex-1 min-w-0 flex flex-col bg-background/95 light:bg-[#fafafa]">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-border/60 bg-muted/10 light:bg-zinc-100/60 shrink-0 text-xs font-mono">
              <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${langStyle.border} ${langStyle.bg} ${langStyle.text}`}>
                  {lang}
                </span>
                <span className="text-foreground font-semibold truncate light:text-zinc-900">{activeFile.name}</span>
                {activeFile.description && (
                  <>
                    <span className="text-muted-foreground/30 hidden lg:inline">|</span>
                    <span className="text-muted-foreground/80 text-[11px] hidden lg:inline truncate max-w-[400px] light:text-zinc-600">
                      {activeFile.description}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0 light:text-zinc-500">
                <span>{highlightedLines.length} lines</span>
                <span>•</span>
                <span>{(new TextEncoder().encode(activeFile.code).length / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            {/* Code Content with Line Numbers */}
            <div className="flex-1 min-h-0 overflow-auto font-mono text-[13px] md:text-[13.5px] leading-relaxed p-2 md:p-4 select-text">
              <div className="table w-full border-collapse code-explorer-viewer">
                {highlightedLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isMatch = searchTerm && line.raw.toLowerCase().includes(searchTerm.toLowerCase());

                  return (
                    <div
                      key={idx}
                      className={`table-row transition-colors ${
                        isMatch
                          ? "bg-accent-primary/20 light:bg-emerald-100"
                          : "hover:bg-muted/30 light:hover:bg-zinc-100/80"
                      }`}
                    >
                      {/* Line Number */}
                      <span className="table-cell select-none text-right pr-4 pl-2 py-0.5 text-muted-foreground/40 text-[11px] font-mono w-12 align-top shrink-0 border-r border-border/40 light:text-zinc-400 light:border-zinc-200">
                        {lineNum}
                      </span>
                      {/* Line Content */}
                      <span
                        className={`table-cell pl-4 pr-2 py-0.5 align-top ${
                          wordWrap ? "whitespace-pre-wrap break-all" : "whitespace-pre"
                        }`}
                        dangerouslySetInnerHTML={{ __html: line.html }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/60 bg-muted/20 text-[10px] font-mono text-muted-foreground shrink-0 light:bg-zinc-100 light:text-zinc-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>READY</span>
                <span>•</span>
                <span>UTF-8</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">Press ESC to exit</span>
                <span className="hidden sm:inline">•</span>
                <span>{lang.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Script Vault / Attached Files Showcase Component ─── */

export function ScriptVault({
  title = "Exploit Artifacts & Automation Scripts",
  description = "Complete standalone exploitation, coercion, and pivoting scripts referenced in this writeup. Click any file to view full highlighted source code or download directly.",
  files = [],
  defaultOpenIndex = 0,
  className = "",
}: ScriptVaultProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultOpenIndex);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!files || files.length === 0) return null;

  const handleOpenFile = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  const handleCopySingle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const file = files[index];
    if (!file) return;
    navigator.clipboard.writeText(file.code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadSingle = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const file = files[index];
    if (!file) return;
    downloadCodeFile(file.name, file.code);
  };

  return (
    <>
      <div
        className={`my-8 rounded-xl border border-border/80 bg-card overflow-hidden shadow-lg font-sans max-w-[85ch] light:bg-white light:border-border light:shadow-md ${className}`}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border bg-muted/40 light:bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/10 border border-accent-primary/30 text-accent-primary light:bg-emerald-50 light:border-emerald-300 light:text-emerald-700">
              <Code2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono light:text-zinc-900">
                  {title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-accent-primary font-bold light:bg-emerald-50 light:border-emerald-300 light:text-emerald-700">
                  {files.length} {files.length === 1 ? "File" : "Files"}
                </span>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 font-sans leading-relaxed light:text-zinc-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => handleOpenFile(0)}
            className="px-3 py-1.5 rounded-lg border border-accent-primary/40 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 light:bg-emerald-600 light:border-emerald-600 light:text-white light:hover:bg-emerald-700 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Code Explorer</span>
          </button>
        </div>

        {/* Files Grid / List */}
        <div className="divide-y divide-border/40 bg-card/40 light:bg-white light:divide-zinc-200">
          {files.map((file, idx) => {
            const lang = detectLanguage(file.name, file.language);
            const style = getLanguageColor(lang);
            const lineCount = file.code.split("\n").length;
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={file.name}
                onClick={() => handleOpenFile(idx)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/30 light:hover:bg-zinc-50 transition-all cursor-pointer"
              >
                {/* File Details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${style.border} ${style.bg} ${style.text}`}>
                    <FileCode2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-foreground group-hover:text-accent-primary transition-colors light:text-zinc-900 light:group-hover:text-emerald-700">
                        {file.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold border ${style.border} ${style.bg} ${style.text}`}>
                        {lang}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground light:text-zinc-500">
                        {lineCount} lines
                      </span>
                    </div>
                    {file.description && (
                      <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed light:text-zinc-600">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={(e) => handleCopySingle(e, idx)}
                    className="p-2 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted light:bg-zinc-100 light:border-zinc-200 light:text-zinc-600 light:hover:text-zinc-900 transition-colors cursor-pointer text-xs"
                    title={`Copy ${file.name}`}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDownloadSingle(e, idx)}
                    className="p-2 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-accent-primary hover:bg-muted light:bg-zinc-100 light:border-zinc-200 light:text-zinc-600 light:hover:text-emerald-700 transition-colors cursor-pointer text-xs"
                    title={`Download ${file.name}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenFile(idx)}
                    className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted hover:border-accent-primary/40 light:bg-zinc-100 light:border-zinc-200 light:text-zinc-800 light:hover:bg-zinc-200 transition-colors cursor-pointer text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    <span>View</span>
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code Explorer Modal */}
      <CodeExplorerModal
        files={files}
        initialActiveIndex={selectedIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={title}
      />
    </>
  );
}

/* ── Single File Attachment Card Component ────────────── */

export function FileAttachment({
  name,
  description,
  language,
  code,
  className = "",
}: FileAttachmentProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const lang = detectLanguage(name, language);
  const style = getLanguageColor(lang);
  const lineCount = code ? code.split("\n").length : 0;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadCodeFile(name, code);
  };

  const files = useMemo(() => [{ name, description, language: lang, code }], [name, description, lang, code]);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className={`my-4 group rounded-xl border border-border/80 bg-card p-4 hover:border-accent-primary/40 hover:bg-muted/20 light:bg-white light:border-border light:hover:bg-zinc-50 light:hover:border-emerald-300 transition-all cursor-pointer shadow-sm font-sans max-w-[75ch] ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2.5 rounded-lg border shrink-0 ${style.border} ${style.bg} ${style.text}`}>
              <FileCode2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-foreground group-hover:text-accent-primary transition-colors light:text-zinc-900 light:group-hover:text-emerald-700">
                  {name}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold border ${style.border} ${style.bg} ${style.text}`}>
                  {lang}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground light:text-zinc-500">
                  {lineCount} lines
                </span>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1 font-sans leading-relaxed light:text-zinc-600">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted light:bg-zinc-100 light:border-zinc-200 light:text-zinc-600 light:hover:text-zinc-900 transition-colors cursor-pointer text-xs"
              title={`Copy ${name}`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400 light:text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-accent-primary hover:bg-muted light:bg-zinc-100 light:border-zinc-200 light:text-zinc-600 light:hover:text-emerald-700 transition-colors cursor-pointer text-xs"
              title={`Download ${name}`}
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-accent-primary/30 bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 light:bg-emerald-600 light:border-emerald-600 light:text-white light:hover:bg-emerald-700 transition-colors cursor-pointer text-xs font-mono font-bold flex items-center gap-1"
            >
              <span>Explore Code</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <CodeExplorerModal
        files={files}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={name}
      />
    </>
  );
}

/* ── Inline Clickable File Button / Pill ───────────────── */

export function FileButton({
  name,
  description,
  language,
  code,
  children,
  className = "",
}: FileButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const lang = detectLanguage(name, language);
  const style = getLanguageColor(lang);

  const files = useMemo(() => [{ name, description, language: lang, code }], [name, description, lang, code]);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono text-xs font-semibold transition-all cursor-pointer ${style.border} ${style.bg} ${style.text} hover:scale-[1.02] shadow-sm ${className}`}
        title={`Click to open and explore ${name}`}
      >
        <FileCode2 className="h-3.5 w-3.5 shrink-0" />
        <span>{children || name}</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-60 ml-0.5" />
      </button>

      <CodeExplorerModal
        files={files}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={name}
      />
    </>
  );
}
