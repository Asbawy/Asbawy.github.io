import { Rss } from "lucide-react";

export function RssSubscribe() {
  return (
    <section className="mt-8 rounded-lg border border-panel-border bg-panel/80 overflow-hidden">
      <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon + glow */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-foreground/10 blur-xl scale-150" />
          <div className="relative rounded-md border border-foreground/30 bg-foreground/5 p-2.5">
            <Rss className="h-5 w-5 text-foreground" />
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-sm text-foreground">Stay in the loop</h3>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
            Subscribe via RSS to get new posts delivered to your reader. Works with Feedly,
            Inoreader, Newsblur, and any RSS client.
          </p>
        </div>

        {/* CTA */}
        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-md border border-foreground/40 bg-foreground/5 px-4 py-2 font-mono text-xs text-foreground  hover:border-foreground/70 hover:bg-foreground/10 transition-all"
        >
          <Rss className="h-3.5 w-3.5" />
          subscribe via rss
        </a>
      </div>
    </section>
  );
}
