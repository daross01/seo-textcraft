import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import { UploadPanel } from "@/components/UploadPanel";
import { ProgressPanel } from "@/components/ProgressPanel";
import { useSharedWallpapers, type Wallpaper } from "@/lib/images";
import { analyzeAll, api } from "@/lib/analyze";

export const Route = createFileRoute("/pinterest")({
  head: () => ({
    meta: [
      { title: "Pinterest Collection Generator | Wallcraft Studio" },
      {
        name: "description",
        content:
          "Generate one Pinterest title and description for a whole wallpaper collection, written from real visual analysis of your images.",
      },
      { property: "og:title", content: "Pinterest Collection Generator" },
      {
        property: "og:description",
        content: "One title, one description, tuned for Pinterest — from your wallpaper folder.",
      },
    ],
  }),
  component: PinterestPage,
});

type Result = { title: string; description: string; keywords?: string[] };

function PinterestPage() {
  const shared = useSharedWallpapers();
  const [images, setImages] = useState<Wallpaper[]>(shared);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "writing">("idle");
  const [progress, setProgress] = useState({ value: 0, current: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const busy = phase !== "idle";

  async function generate() {
    if (images.length === 0) return;
    setError(null);
    setResult(null);
    setPhase("analyzing");
    setProgress({ value: 0, current: 0 });
    try {
      const { analyses } = await analyzeAll(images, (done, current) =>
        setProgress({ value: done, current }),
      );
      setPhase("writing");
      const { content } = await api.postJson<{ content: Result }>("/api/generate-pinterest", {
        analyses,
      });
      setResult(content);
      setPhase("idle");
    } catch (err) {
      setError((err as Error).message);
      setPhase("idle");
    }
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Tool B</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Pinterest Collection Generator</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          One title and one description for the entire collection — never per image. Reuses the folder
          you already loaded, or upload a new one.
        </p>
      </header>

      <UploadPanel
        images={images}
        onChange={setImages}
        title="Upload your wallpaper collection"
        disabled={busy}
      />

      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={generate}
            disabled={busy}
            className="btn-accent inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="size-4" />
            {busy ? "Working…" : "Generate Pinterest Content"}
          </button>
          {result && (
            <button
              onClick={generate}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className="size-4" /> Generate Again
            </button>
          )}
        </div>
      )}

      {busy && (
        <ProgressPanel
          label={phase === "analyzing" ? "Analyzing your collection" : "Writing Pinterest content"}
          detail={
            phase === "analyzing" ? `Analyzing image ${progress.current}…` : "Finding the common thread…"
          }
          value={phase === "analyzing" ? progress.value : images.length}
          total={images.length}
        />
      )}

      {error && (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      {result && (
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="surface-card space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pinterest Title
            </h2>
            <p className="text-lg font-semibold leading-snug">{result.title}</p>
            <button
              onClick={() => copy("title", result.title)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {copied === "title" ? <Check className="size-4" /> : <Copy className="size-4" />} Copy Title
            </button>
          </article>
          <article className="surface-card space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Pinterest Description
            </h2>
            <p className="leading-relaxed">{result.description}</p>
            {result.keywords && result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                    {k}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => copy("description", result.description)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {copied === "description" ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
              Description
            </button>
          </article>
        </section>
      )}
    </main>
  );
}
