import { CONTENT_MODES, MODE_IDS, type ModeId } from "@/lib/ai-config";
import { setSharedMode, useSharedMode } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Content-type selector. Reads and writes the shared collection mode, so
 * BlogText and PinText always agree on what the images contain.
 * Modes come from CONTENT_MODES — adding one needs no change here.
 */
export function ModeSelector({ disabled }: { disabled?: boolean }) {
  const mode = useSharedMode();

  return (
    <section className="surface-card space-y-3 p-5">
      <div>
        <h2 className="text-sm font-semibold">Content type</h2>
        <p className="text-sm text-muted-foreground">
          What kind of content do these images contain? The AI discovers the rest on its own.
        </p>
      </div>
      <div role="radiogroup" aria-label="Content type" className="flex flex-wrap gap-2">
        {MODE_IDS.map((id: ModeId) => {
          const selected = id === mode;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => setSharedMode(id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
                selected
                  ? "border-transparent btn-accent"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {CONTENT_MODES[id].label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
