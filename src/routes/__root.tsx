import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import hljsCss from "highlight.js/styles/github-dark.css?url";
import appCss from "../styles.css?url";
import { MatrixBackground } from "@/components/cyber/MatrixBackground";

import { Terminal, Home, AlertCircle } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-6 relative z-10">
      <div className="w-full max-w-lg border border-threat-high/30 bg-panel/80 backdrop-blur-md rounded-xl p-8 shadow-[0_0_50px_rgba(var(--threat-high),0.1)] font-mono text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-threat-high/10 mb-6 border border-threat-high/30">
          <AlertCircle className="h-10 w-10 text-threat-high animate-pulse" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-threat-high mb-2">404</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">CONNECTION REFUSED</h2>
        
        <div className="bg-background/50 border border-panel-border rounded-md p-4 text-left text-[13px] text-muted-foreground space-y-2 mb-8 font-mono">
          <div><span className="text-neon-green font-bold">$</span> <span className="opacity-80">curl -I /requested-path</span></div>
          <div className="text-threat-mid">HTTP/2 404 Not Found</div>
          <div className="text-threat-mid">X-Error: Resource permanently displaced or never existed</div>
          <div className="pt-2"><span className="text-neon-green font-bold">$</span> <span className="opacity-80">traceroute target</span></div>
          <div className="text-foreground/60">1  localhost (127.0.0.1)  0.032 ms</div>
          <div className="text-threat-mid">2  * * * (Destination Host Unreachable)</div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-neon-green/10 border border-neon-green text-neon-green px-6 py-3 text-sm font-semibold hover:bg-neon-green hover:text-black transition-all hover:shadow-[0_0_20px_rgba(var(--neon-green),0.4)]"
        >
          <Home className="h-4 w-4" />
          RETURN TO LOCALHOST
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Asbawy Blog" },
      { name: "description", content: "Asbawy's personal blog — security research, dev logs, and tools." },
      { name: "author", content: "Asbawy" },
      { property: "og:title", content: "Asbawy Blog" },
      { property: "og:description", content: "Asbawy's personal blog — security research, dev logs, and tools." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://asbawy.github.io/asbawy.jpg" },
      { property: "og:url", content: "https://asbawy.github.io" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Asbawy" },
      { name: "twitter:image", content: "https://asbawy.github.io/asbawy.jpg" },
      { name: "google-site-verification", content: "-wRV8UzJbo8W6toGN1s2sXQCwhjDhT_qUoeUTUCgt0g" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: hljsCss,
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "canonical", href: "https://asbawy.github.io" },
      { rel: "alternate", type: "application/rss+xml", title: "Asbawy Blog RSS Feed", href: "https://asbawy.github.io/feed.xml" },
    ],
    scripts: [
      {
        src: "https://cloud.umami.is/script.js",
        defer: true,
        "data-website-id": "735888cd-b21c-4c63-9b06-6b99d656846d",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <MatrixBackground />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
