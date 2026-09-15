import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mb-4 flex-wrap"
    >
      <Link
        to="/"
        className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[340px]">
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
