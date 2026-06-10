import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { CyberLayout } from "@/components/cyber/Layout";
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Terminal,
  TerminalSquare, AppWindow, Network, Globe, Lock, ShieldAlert, Database, FileCode 
} from "lucide-react";
import { useState } from "react";
import { getCheatsheetTree, type FileNode } from "@/data/cheatsheets";

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
    if (n.includes("linux"))   return <TerminalSquare className="h-4 w-4 shrink-0 text-yellow-400" />;
    if (n.includes("windows")) return <AppWindow className="h-4 w-4 shrink-0 text-blue-400" />;
    if (n.includes("network")) return <Network className="h-4 w-4 shrink-0 text-cyan-400" />;
    if (n.includes("web") || n.includes("http")) return <Globe className="h-4 w-4 shrink-0 text-purple-400" />;
    if (n.includes("privesc")) return <Lock className="h-4 w-4 shrink-0 text-red-400" />;
    return isOpen
      ? <FolderOpen className="h-4 w-4 shrink-0 text-neon-green" />
      : <Folder className="h-4 w-4 shrink-0 text-neon-green" />;
  }

  if (n.includes("linux") || n.includes("bash")) return <Terminal className="h-4 w-4 shrink-0 text-yellow-400" />;
  if (n.includes("windows") || n.includes("cmd"))  return <AppWindow className="h-4 w-4 shrink-0 text-blue-400" />;
  if (n.includes("sql") || n.includes("db"))        return <Database className="h-4 w-4 shrink-0 text-orange-400" />;
  if (n.includes("script") || n.includes("code"))   return <FileCode className="h-4 w-4 shrink-0 text-green-400" />;
  if (n.includes("exploit") || n.includes("cve"))   return <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />;
  return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
}

/* ── Tree item ───────────────────────────────────────── */

function TreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const isFile = node.type === "file";

  const router = useRouterState();
  const currentPath = router.location.pathname;
  const targetPath = node.path ? `/cheatsheet/${node.path}` : "";
  const isActive = isFile && currentPath === targetPath;

  const indent = depth * 12 + 8;

  return (
    <>
      {isFile ? (
        <Link
          to="/cheatsheet/$"
          params={{ _splat: node.path! }}
          className={`
            group flex items-center gap-2 py-[5px] pr-3 w-full
            font-mono text-[13px] leading-tight whitespace-nowrap
            transition-colors duration-150
            ${isActive
              ? "bg-neon-green/10 text-neon-green border-r-2 border-neon-green"
              : "text-[#8b949e] hover:text-foreground hover:bg-white/[0.04]"
            }
          `}
          style={{ paddingLeft: indent + 20 }}
        >
          {getIconForNode(node.name, true, false)}
          <span>{node.name}</span>
        </Link>
      ) : (
        <button
          className="
            group flex items-center gap-2 py-[5px] pr-3 w-full text-left
            font-mono text-[13px] leading-tight whitespace-nowrap
            text-foreground/90 hover:bg-white/[0.04] transition-colors duration-150
          "
          style={{ paddingLeft: indent }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen
            ? <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            : <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          }
          {getIconForNode(node.name, false, isOpen)}
          <span className="font-semibold">{node.name}</span>
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
            <TreeItem key={child.name + i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

/* ── Main layout ─────────────────────────────────────── */

function CheatsheetLayout() {
  const tree = getCheatsheetTree();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            /cheatsheet{" "}
            <span className="text-muted-foreground">— quick_ref</span>
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
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5 text-neon-green" />
                <span>cheatsheet_explorer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70 border border-red-500/30" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70 border border-yellow-500/30" />
                <div className="h-3 w-3 rounded-full bg-green-500/70 border border-green-500/30" />
              </div>
            </div>

            {/* Two-column content */}
            <div className="flex-1 min-h-0 flex">
              {/* Sidebar */}
              <div
                className={`
                  shrink-0 border-r border-panel-border bg-background/50
                  flex flex-col transition-all duration-200 overflow-hidden
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
                    className="text-muted-foreground hover:text-foreground text-xs font-mono"
                    title="Hide sidebar"
                  >
                    ✕
                  </button>
                </div>

                {/* Tree */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin">
                  {tree.map((node, i) => (
                    <TreeItem key={node.name + i} node={node} />
                  ))}
                </div>
              </div>

              {/* Toggle button when sidebar is collapsed */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="
                    shrink-0 w-8 flex items-center justify-center
                    border-r border-panel-border bg-panel/50
                    text-muted-foreground hover:text-neon-green hover:bg-neon-green/5
                    transition-colors
                  "
                  title="Show sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Content pane */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CyberLayout>
  );
}


