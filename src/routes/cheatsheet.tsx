import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CyberLayout } from "@/components/cyber/Layout";

export type CheatsheetSearch = {
  q?: string;
  tag?: string;
  cat?: string;
  view?: "grid" | "table";
};

export const Route = createFileRoute("/cheatsheet")({
  validateSearch: (search: Record<string, unknown>): CheatsheetSearch => {
    return {
      q: typeof search.q === "string" ? search.q : undefined,
      tag: typeof search.tag === "string" ? search.tag : undefined,
      cat: typeof search.cat === "string" ? search.cat : undefined,
      view: search.view === "table" ? "table" : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Cheatsheets — Asbawy" },
      {
        name: "description",
        content: "Security cheatsheets, command references, and tactical field notes by Asbawy.",
      },
    ],
  }),
  component: CheatsheetLayout,
});

function CheatsheetLayout() {
  return (
    <CyberLayout>
      <div className="min-h-full bg-background text-foreground">
        <Outlet />
      </div>
    </CyberLayout>
  );
}
