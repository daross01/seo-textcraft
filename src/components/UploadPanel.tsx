import { useRef, useState } from "react";
import { Folder, ImageIcon, UploadCloud, X } from "lucide-react";
import { loadWallpapers, setSharedWallpapers, type Wallpaper } from "@/lib/images";

type Props = {
  images: Wallpaper[];
  onChange: (images: Wallpaper[]) => void;
  title?: string;
  disabled?: boolean;
};

export function UploadPanel({ images, onChange, title = "Upload your wallpaper folder", disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[]) {
    setMessage(null);
    setLoading(true);
    try {
      const { images: loaded, skipped } = await loadWallpapers(files);
      if (loaded.length === 0) {
        setMessage("No supported images found. Use JPG, JPEG, PNG or WEBP files.");
        onChange([]);
        setSharedWallpapers([]);
        return;
      }
      if (skipped.length > 0) {
        setMessage(`${skipped.length} unsupported file(s) skipped: ${skipped.slice(0, 3).join(", ")}`);
      }
      onChange(loaded);
      setSharedWallpapers(loaded);
    } catch (error) {
      setMessage((error as Error).message || "Could not read those files.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className={`surface-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center transition-colors ${
          dragging ? "border-accent bg-accent/5" : ""
        } ${disabled ? "opacity-60" : ""}`}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <UploadCloud className="size-6" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          Drop your wallpaper folder here — JPG, JPEG, PNG, WEBP
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={disabled || loading}
            onClick={() => inputRef.current?.click()}
            className="btn-accent inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Folder className="size-4" />
            {loading ? "Reading images…" : "Choose folder"}
          </button>
          {images.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                onChange([]);
                setSharedWallpapers([]);
                setMessage(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <X className="size-4" /> Clear
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          // @ts-expect-error non-standard folder picker attributes
          webkitdirectory=""
          directory=""
          className="hidden"
          onChange={(e) => e.target.files && void handleFiles(e.target.files)}
        />
      </div>

      {message && (
        <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
          {message}
        </p>
      )}

      {images.length > 0 && (
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="size-4 text-accent" />
            {images.length} images detected
            <span className="text-muted-foreground">— order below maps to image_1 … image_{images.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {images.map((image, i) => (
              <figure key={image.id} className="overflow-hidden rounded-lg border border-border bg-secondary">
                <div className="relative aspect-[3/4]">
                  <img
                    src={image.previewUrl}
                    alt={`Wallpaper ${i + 1}: ${image.name}`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-primary/85 px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    #{i + 1}
                  </span>
                </div>
                <figcaption className="truncate px-2 py-1.5 text-[11px] text-muted-foreground">
                  {image.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
