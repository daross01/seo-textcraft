import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Check, Copy, RefreshCw, Sparkles } from "lucide-react";
import { UploadPanel } from "@/components/UploadPanel";
import { ProgressPanel } from "@/components/ProgressPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { setSharedWallpapers, useSharedMode, useSharedWallpapers } from "@/lib/images";
import { analyzeAll, api } from "@/lib/analyze";
import { PINTEREST_LIMITS } from "@/lib/pinterest-content";

export const Route = createFileRoute("/pinterest")({
  head: () => ({
    meta: [
      { title: "PinText Generator | SEO TextCraft" },
      {
        name: "description",
        content:
          "Generate one PinText title and description for a whole wallpaper collection, written from real visual analysis of your images.",
      },
      { property: "og:title", content: "PinText Generator" },
      {
        property: "og:description",
        content: "One title, one description, tuned for PinText — from your wallpaper folder.",
      },
    ],
  }),
  component: PinterestPage,
});

type Result = { title: string; description: string; keywords?: string[]; primary_keyword?: string };

function PinterestPage() {
  // Single source of truth: the shared collection (images + mode + analyses).
  const images = useSharedWallpapers();
  const mode = useSharedMode();
  const [phase, setPhase] = useState<"idle" | "analyzing" | "writing">("idle");
  const [progress, setProgress] = useState({ value: 0, current: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const busy = phase !== "idle";

  async function generate() {
    if (images.length === 0) return;
    setError(null);
    setWarnings([]);
    setResult(null);
    setPhase("analyzing");
    setProgress({ value: 0, current: 0 });
    try {
      const { analyses, failed } = await analyzeAll(
        images,
        (done, current) => setProgress({ value: done, current }),
        mode,
      );
      setWarnings(failed);
      setPhase("writing");
      const { content } = await api.postJson<{ content: Result }>("/api/generate-pinterest", {
        analyses,
        mode,
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
        <h1 className="text-3xl font-extrabold tracking-tight">PinText Generator</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          One title and one description for the entire collection — never per image. Reuses the
          folder you already loaded, or upload a new one.
        </p>
      </header>

      <ModeSelector disabled={busy} />

      <UploadPanel
        images={images}
        onChange={setSharedWallpapers}
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
            {busy ? "Working…" : "Generate PinText Content"}
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
          label={phase === "analyzing" ? "Analyzing your collection" : "Writing PinText content"}
          detail={
            phase === "analyzing"
              ? `Analyzing image ${progress.current}…`
              : "Finding the common thread…"
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

      {warnings.length > 0 && (
        <div className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Some images could not be analysed:</p>
          <ul className="list-inside list-disc">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="surface-card space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              PinText Title
            </h2>
            <p className="text-lg font-semibold leading-snug">{result.title}</p>
            <p className="text-xs text-muted-foreground">
              {result.title.length}/{PINTEREST_LIMITS.title} characters
              {result.primary_keyword ? ` · main keyword: ${result.primary_keyword}` : ""}
            </p>
            <button
              onClick={() => copy("title", result.title)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {copied === "title" ? <Check className="size-4" /> : <Copy className="size-4" />} Copy
              Title
            </button>
          </article>
          <article className="surface-card space-y-3 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              PinText Description
            </h2>
            <p className="leading-relaxed">{result.description}</p>
            {result.keywords && result.keywords.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {k}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => copy("keywords", result.keywords!.join(", "))}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  {copied === "keywords" ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}{" "}
                  Copy Keywords
                </button>
              </div>
            )}
            <button
              onClick={() => copy("description", result.description)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
            >
              {copied === "description" ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}{" "}
              Copy Description
            </button>
          </article>
        </section>
      )}
    </main>
  );
}
