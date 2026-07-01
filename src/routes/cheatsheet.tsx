/* eslint-disable no-empty */
import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { CyberLayout } from "@/components/cyber/Layout";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  Terminal,
  TerminalSquare,
  AppWindow,
  Network,
  Globe,
  Lock,
  ShieldAlert,
  Database,
  FileCode,
  Search,
  FolderKey,
  KeyRound,
  Menu,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { getCheatsheetTree, type FileNode } from "@/data/cheatsheets";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ── Tree filtering helper ───────────────────────────── */

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  if (!query) return nodes;
  const q = query.toLowerCase();

  return nodes.reduce<FileNode[]>((acc, node) => {
    if (node.type === "file") {
      if (node.name.toLowerCase().includes(q) || node.meta?.title?.toLowerCase().includes(q)) {
        acc.push(node);
      }
    } else {
      // Folder — recursively filter children
      const filteredChildren = filterTree(node.children || [], q);
      if (filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      } else if (node.name.toLowerCase().includes(q)) {
        // Folder itself matches — include with all children
        acc.push(node);
      }
    }
    return acc;
  }, []);
}

/* ── Recurse file count helper ───────────────────────── */

function getFileCount(node: FileNode): number {
  if (node.type === "file") return 1;
  if (!node.children) return 0;
  return node.children.reduce((acc, child) => acc + getFileCount(child), 0);
}

export const Route = createFileRoute("/cheatsheet")({
  head: () => ({
    meta: [
      { title: "/cheatsheet — Asbawy Blog" },
      {
        name: "description",
        content: "Security cheatsheets, quick references, and field notes by Asbawy.",
      },
    ],
  }),
  component: CheatsheetLayout,
});

/* ── Icon mapper ─────────────────────────────────────── */

function getIconForNode(name: string, isFile: boolean, isOpen: boolean) {
  const n = name.toLowerCase();

  if (!isFile) {
    if (n.includes("linux")) return <TerminalSquare className="h-4 w-4 shrink-0 text-yellow-400" />;
    if (n.includes("windows")) return <AppWindow className="h-4 w-4 shrink-0 text-blue-400" />;
    if (n.includes("network")) return <Network className="h-4 w-4 shrink-0 text-cyan-400" />;
    if (n.includes("web") || n.includes("http"))
      return <Globe className="h-4 w-4 shrink-0 text-purple-400" />;
    if (n.includes("privesc")) return <Lock className="h-4 w-4 shrink-0 text-red-400" />;
    if (n.includes("active directory") || n.includes("active_directory") || n === "ad") {
      return <FolderKey className="h-4 w-4 shrink-0 text-sky-400" />;
    }
    return isOpen ? (
      <FolderOpen className="h-4 w-4 shrink-0 text-neon-green" />
    ) : (
      <Folder className="h-4 w-4 shrink-0 text-neon-green" />
    );
  }

  if (n.includes("linux") || n.includes("bash") || n.includes("shell") || n.includes("tty"))
    return <Terminal className="h-4 w-4 shrink-0 text-yellow-400" />;
  if (n.includes("windows") || n.includes("cmd"))
    return <AppWindow className="h-4 w-4 shrink-0 text-blue-400" />;
  if (n.includes("sql") || n.includes("db"))
    return <Database className="h-4 w-4 shrink-0 text-orange-400" />;
  if (n.includes("script") || n.includes("code"))
    return <FileCode className="h-4 w-4 shrink-0 text-green-400" />;
  if (
    n.includes("exploit") ||
    n.includes("cve") ||
    n.includes("msfvenom") ||
    n.includes("venom") ||
    n.includes("tool")
  ) {
    return <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />;
  }
  if (n.includes("privesc")) return <Lock className="h-4 w-4 shrink-0 text-red-400" />;
  if (
    n.includes("active directory") ||
    n.includes("active_directory") ||
    n.includes("ad_") ||
    n.includes("_ad") ||
    n === "ad"
  ) {
    return <KeyRound className="h-4 w-4 shrink-0 text-sky-400" />;
  }
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

/* ── Tree item ───────────────────────────────────────── */

interface TreeItemProps {
  node: FileNode;
  depth?: number;
  searchQuery?: string;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (path: string) => void;
  focusedId: string | null;
  currentFolderHash: string;
  onSelectFile?: () => void;
}

function TreeItem({
  node,
  depth = 0,
  searchQuery = "",
  expandedFolders,
  toggleFolder,
  focusedId,
  currentFolderHash,
  onSelectFile,
}: TreeItemProps) {
  const isFile = node.type === "file";
  const nodePath = isFile
    ? node.path!
    : currentFolderHash
      ? `${currentFolderHash}/${node.name}`
      : node.name;
  const itemId = `${node.type}:${nodePath}`;
  const isFocused = focusedId === itemId;

  // Auto-expand folders when searching
  const isOpen = searchQuery ? true : !!expandedFolders[nodePath];

  const router = useRouterState();
  const currentPath = router.location.pathname;
  const targetPath = node.path ? `/cheatsheet/${node.path}` : "";
  const isActive = isFile && currentPath === targetPath;

  const indent = depth * 12 + 8;

  useEffect(() => {
    if (isFocused) {
      const el = document.querySelector(`[data-id="${itemId}"]`);
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [isFocused, itemId]);

  return (
    <>
      {isFile ? (
        <Link
          to="/cheatsheet/$"
          params={{ _splat: node.path! }}
          preload="intent"
          data-id={itemId}
          onClick={onSelectFile}
          className={`
            group flex items-center gap-2 py-[5px] pr-3 w-full
            font-mono text-[13px] leading-tight whitespace-nowrap
            transition-colors duration-150 focus-visible:outline-none focus-visible:bg-white/[0.04]
            ${
              isActive
                ? "bg-neon-green/10 text-neon-green border-r-2 border-neon-green"
                : isFocused
                  ? "bg-white/[0.05] text-foreground border-r border-neon-green/30"
                  : "text-[#8b949e] hover:text-foreground hover:bg-white/[0.04]"
            }
          `}
          style={{ paddingLeft: indent + 20 }}
        >
          {getIconForNode(node.name, true, false)}
          <HighlightMatch text={node.name} query={searchQuery} />
        </Link>
      ) : (
        <button
          data-id={itemId}
          aria-expanded={isOpen}
          className={`
            group flex items-center gap-2 py-[5px] pr-3 w-full text-left
            font-mono text-[13px] leading-tight whitespace-nowrap focus-visible:outline-none
            text-foreground/90 hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer
            ${isFocused ? "bg-white/[0.05] ring-1 ring-neon-green/20" : ""}
          `}
          style={{ paddingLeft: indent }}
          onClick={() => toggleFolder(nodePath)}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          {getIconForNode(node.name, false, isOpen)}
          <span className="font-semibold">{node.name}</span>
          <span className="text-[10px] text-muted-foreground/60 ml-1.5 font-mono">
            ({getFileCount(node)})
          </span>
        </button>
      )}

      {!isFile && isOpen && node.children && (
        <div className="relative">
          {/* Indent guide line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-panel-border/50"
            style={{ left: indent + 7 }}
          />
          {node.children.map((child, i) => (
            <TreeItem
              key={child.name + i}
              node={child}
              depth={depth + 1}
              searchQuery={searchQuery}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              focusedId={focusedId}
              currentFolderHash={nodePath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Highlight matching text ─────────────────────────── */

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="bg-neon-green/20 text-neon-green rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  );
}

/* ── Flat nodes list constructor helper for keyboard nav ── */

function getFlatNodes(
  nodes: FileNode[],
  expandedFolders: Record<string, boolean>,
  searchQuery: string,
  currentPathStr = "",
): { id: string; node: FileNode }[] {
  const list: { id: string; node: FileNode }[] = [];
  for (const node of nodes) {
    const isFile = node.type === "file";
    const nodePath = isFile
      ? node.path!
      : currentPathStr
        ? `${currentPathStr}/${node.name}`
        : node.name;
    const id = `${node.type}:${nodePath}`;

    list.push({ id, node });

    if (!isFile) {
      const isOpen = searchQuery ? true : !!expandedFolders[nodePath];
      if (isOpen && node.children) {
        list.push(...getFlatNodes(node.children, expandedFolders, searchQuery, nodePath));
      }
    }
  }
  return list;
}

/* ── Main layout ─────────────────────────────────────── */

function CheatsheetLayout() {
  const tree = getCheatsheetTree();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    linux: true,
    "Active Directory": true,
  });

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<{ path: string; title: string }[]>([]);

  // LocalStorage Recently Viewed reader
  useEffect(() => {
    const handleUpdateRecent = () => {
      try {
        const stored = localStorage.getItem("cheatsheet_recent");
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (e) {}
    };

    handleUpdateRecent();
    window.addEventListener("storage", handleUpdateRecent);
    window.addEventListener("cheatsheet_recent_updated", handleUpdateRecent);

    return () => {
      window.removeEventListener("storage", handleUpdateRecent);
      window.removeEventListener("cheatsheet_recent_updated", handleUpdateRecent);
    };
  }, []);

  const filteredTree = useMemo(() => filterTree(tree, searchQuery), [tree, searchQuery]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const flatNodes = useMemo(
    () => getFlatNodes(filteredTree, expandedFolders, searchQuery),
    [filteredTree, expandedFolders, searchQuery],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!flatNodes.length) return;

    const isTyping = document.activeElement?.tagName === "INPUT";
    if (isTyping && !["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
      return;
    }

    if (["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Enter"].includes(e.key)) {
      e.preventDefault();
    } else {
      return;
    }

    const currentIndex = flatNodes.findIndex((n) => n.id === focusedId);

    if (e.key === "ArrowDown") {
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % flatNodes.length;
      setFocusedId(flatNodes[nextIndex].id);
    } else if (e.key === "ArrowUp") {
      const prevIndex =
        currentIndex === -1
          ? flatNodes.length - 1
          : (currentIndex - 1 + flatNodes.length) % flatNodes.length;
      setFocusedId(flatNodes[prevIndex].id);
    } else if (e.key === "ArrowRight") {
      if (currentIndex !== -1) {
        const item = flatNodes[currentIndex];
        if (item.node.type === "folder") {
          const folderPath = item.id.replace("folder:", "");
          if (!expandedFolders[folderPath]) {
            setExpandedFolders((prev) => ({ ...prev, [folderPath]: true }));
          }
        }
      }
    } else if (e.key === "ArrowLeft") {
      if (currentIndex !== -1) {
        const item = flatNodes[currentIndex];
        if (item.node.type === "folder") {
          const folderPath = item.id.replace("folder:", "");
          if (expandedFolders[folderPath]) {
            setExpandedFolders((prev) => ({ ...prev, [folderPath]: false }));
          }
        }
      }
    } else if (e.key === "Enter") {
      if (currentIndex !== -1) {
        const item = flatNodes[currentIndex];
        if (item.node.type === "folder") {
          const folderPath = item.id.replace("folder:", "");
          setExpandedFolders((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
        } else {
          const filePath = item.id.replace("file:", "");
          navigate({ to: "/cheatsheet/$", params: { _splat: filePath } });
          setMobileOpen(false);
        }
      }
    }
  };

  const renderTree = (onSelectFile?: () => void) => (
    <div className="h-full flex flex-col min-h-0 font-mono">
      {/* Search / Filter */}
      <div className="shrink-0 px-2.5 py-2 border-b border-panel-border/30">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="filter files…"
            className="w-full rounded border border-panel-border/50 bg-background/60 pl-7 pr-2 py-1.5 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-neon-green/40 transition-colors focus-visible:ring-1 focus-visible:ring-neon-green/30"
          />
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="shrink-0 px-3 py-2 border-b border-panel-border/30 bg-muted/10">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">
            Recently Viewed
          </span>
          <div className="space-y-1">
            {recentlyViewed.map((item) => (
              <Link
                key={item.path}
                to="/cheatsheet/$"
                params={{ _splat: item.path }}
                onClick={onSelectFile}
                className="flex items-center gap-2 py-1 px-1.5 rounded font-mono text-[11.5px] text-muted-foreground hover:text-neon-green hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/30"
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                <span className="truncate">{item.title || item.path.split("/").pop()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tree list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
        {filteredTree.length > 0 ? (
          filteredTree.map((node, i) => (
            <TreeItem
              key={node.name + i}
              node={node}
              searchQuery={searchQuery}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              focusedId={focusedId}
              currentFolderHash=""
              onSelectFile={onSelectFile}
            />
          ))
        ) : (
          <div className="px-4 py-6 text-center font-mono text-[11px] text-muted-foreground/60">
            No matching files
          </div>
        )}
      </div>
    </div>
  );

  return (
    <CyberLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* ── Header ───────────────────────────────── */}
        <div className="shrink-0 px-6 md:px-10 pt-8 pb-6">
          <div className="font-mono text-[11px] text-muted-foreground">
            <span className="text-neon-green">asbawy</span>:
            <span className="text-neon-green">~/cheatsheet</span>$ explorer .
          </div>
          <h1 className="mt-2 font-mono text-2xl md:text-3xl text-foreground">
            /cheatsheet <span className="text-muted-foreground">— quick_ref</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Field-tested commands, payloads, and shortcuts — all in one place.
          </p>
        </div>

        {/* ── Explorer window ──────────────────────── */}
        <div className="flex-1 min-h-0 px-4 md:px-8 pb-8">
          <div
            className="
              h-full rounded-lg border border-panel-border
              bg-background overflow-hidden flex flex-col
              shadow-[0_0_40px_rgba(0,255,170,0.03),inset_0_1px_0_rgba(255,255,255,0.03)]
            "
          >
            {/* Top Mac-style title bar */}
            <div className="shrink-0 flex items-center justify-between border-b border-panel-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5 text-neon-green shrink-0" />
                <span>cheatsheet_explorer</span>
                {currentPath.replace("/cheatsheet", "") && (
                  <>
                    <span className="text-muted-foreground/40 font-normal">/</span>
                    <span className="text-neon-green/95 font-semibold lowercase tracking-normal">
                      {decodeURIComponent(currentPath.replace("/cheatsheet/", ""))}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile tree trigger */}
                <div className="md:hidden">
                  <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-panel-border bg-panel text-xs text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/60">
                        <Menu className="h-3.5 w-3.5 text-neon-green" />
                        <span>Explorer</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[280px] p-0 pt-10 bg-background border-r border-panel-border text-foreground font-mono"
                    >
                      {renderTree(() => setMobileOpen(false))}
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="h-3 w-3 rounded-full bg-red-500/70 border border-red-500/30" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70 border border-yellow-500/30" />
                <div className="h-3 w-3 rounded-full bg-green-500/70 border border-green-500/30" />
              </div>
            </div>

            {/* Two-column content */}
            <div
              tabIndex={0}
              onKeyDown={handleKeyDown}
              className="flex-1 min-h-0 flex focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/20"
            >
              {/* Sidebar tree (hidden on mobile, visible on desktop) */}
              <div
                className={`
                  hidden md:flex shrink-0 border-r border-panel-border bg-sidebar
                  flex-col transition-all duration-200 overflow-hidden
                  ${sidebarOpen ? "w-[240px] md:w-[280px]" : "w-0 border-r-0"}
                `}
              >
                {/* Sidebar header */}
                <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-panel-border/50 bg-panel/50">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Explorer
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-muted-foreground hover:text-foreground text-xs font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/30 rounded px-1"
                    title="Hide sidebar"
                  >
                    ✕
                  </button>
                </div>
                {renderTree()}
              </div>

              {/* Toggle button when sidebar is collapsed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="
                    hidden md:flex shrink-0 w-8 items-center justify-center
                    border-r border-panel-border bg-panel/50
                    text-muted-foreground hover:text-neon-green hover:bg-neon-green/5
                    transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-green/60
                  "
                  title="Show sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Content pane */}
              <div className="flex-1 min-w-0 overflow-hidden bg-background">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}
